import type { Readline } from '@matanuska/readline';

import { Chunk } from './bytecode/chunk';
import { BUILTINS, Command, CommandIndex, Context, Deferred } from './commands';
import { compileInstructions, compileProgram } from './compiler';
//#if _MATBAS_BUILD == 'debug'
import { Span, startSpan } from './debug';
//#endif
import { Editor } from './editor';
import {
  Exception,
  ParseError,
  ParseWarning,
  mergeParseErrors,
  splitParseError,
  RuntimeError,
} from './exceptions';
import { RuntimeFault } from './faults';
import { inspector } from './format';
import type { Host } from './host';
import { Parser, ParseResult } from './parser';
import { Runtime } from './runtime';
import { Value, Undef } from './value';

import { Line, Cmd, Program } from './ast';

export class Executor {
  public parser: Parser;
  public runtime: Runtime;

  public interactive: boolean;
  private commands: CommandIndex;
  private _deferred: Deferred[] = [];

  constructor(
    private editor: Editor,
    private host: Host,
    public readline: Readline,
  ) {
    this.parser = new Parser();
    this.runtime = new Runtime(host, this);
    this.interactive = false;
    this.commands = { ...BUILTINS };
  }

  /**
   * Defer an action until after runtime execution.
   */
  public defer(fn: Deferred): void {
    this._deferred.push(fn);
  }

  /**
   * Load a script into the editor.
   *
   * @param filename The file path to the script.
   * @returns A promise.
   */
  async load(filename: string): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#load', async (_: Span) => {
      //#endif
      const source = await this.host.readTextFile(filename);

      let result: ParseResult<Program>;

      try {
        result = this.parser.parseProgram(
          source,
          this.host.path.resolve(filename),
        );
      } catch (err) {
        if (err instanceof Exception) {
          throw err;
        }

        throw RuntimeFault.fromException(err);
      }

      const [program, warning] = result;

      this.editor.program = program;
      this.editor.warning = warning;
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Run the script in the editor.
   *
   * @returns A promise.
   */
  async run(): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#run', async (_: Span) => {
      //#endif

      const program = this.editor.program;
      const parseWarning = this.editor.warning;
      const filename = program.filename;

      let chunk: Chunk;
      let warning: ParseWarning | null;

      try {
        const result = compileProgram(program, { filename });
        chunk = result[0];
        warning = result[1];
      } catch (err) {
        let exc = err;
        if (err instanceof ParseError) {
          exc = mergeParseErrors([parseWarning, err]);
        }

        if (exc instanceof Exception) {
          this.host.writeException(err);
          return;
        }
        throw exc;
      }

      warning = mergeParseErrors([parseWarning, warning]);

      if (warning) {
        this.host.writeWarn(warning);
      }

      await this.runtime.using(async () => {
        const interactive = this.interactive;
        this.interactive = false;
        await this.runtime.interpret(chunk);
        this.interactive = interactive;
      });

      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Evaluate input.
   *
   * @param input Source code to eval.
   * @returns A promise.
   */
  async evaluate(input: string): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#eval', async (_: Span) => {
      //#endif
      const [result, warning] = this.parser.parseInput(input);

      const splitWarning = splitParseError(warning, 'row');

      for (const row of result.input) {
        const warning = splitWarning[row.row] || null;
        if (row instanceof Line) {
          if (warning) {
            this.host.writeWarn(warning);
          }
          this.editor.setLine(row, warning as ParseWarning);
        } else {
          await this._eval([row, warning as ParseWarning]);
        }
      }

      this.runDeferred();
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  private async _eval([cmds, parseWarning]: ParseResult<Cmd>): Promise<void> {
    let warning: ParseWarning | null = null;
    try {
      const result = compileInstructions(cmds.instructions, {
        filename: '<input>',
        cmdNo: cmds.cmdNo,
        cmdSource: cmds.source,
      });
      const commands = result[0];
      warning = result[1];

      warning = mergeParseErrors([parseWarning, warning]);

      if (warning) {
        this.host.writeWarn(warning);
      }

      const lastCmd = commands.pop();

      for (const cmd of commands) {
        await this.runtime.interpret(cmd);
      }

      if (lastCmd) {
        const rv = await this.runtime.interpret(lastCmd);
        if (!(rv instanceof Undef)) {
          this.host.writeLine(inspector.format(rv));
        }
      }
    } catch (err) {
      let exc = err;
      if (err instanceof ParseError) {
        exc = mergeParseErrors([parseWarning, err]);
      }

      throw exc;
    }
  }

  private async runDeferred(): Promise<void> {
    for (const deferred of this._deferred) {
      await deferred();
    }
    this._deferred = [];
  }

  public async command(name: string, args: Value[]): Promise<void> {
    const cmd: Command | undefined = this.commands[name];

    if (!cmd) {
      throw new RuntimeError(`Unknown command ${name}`);
    }

    const context = new Context(
      name,
      this,
      this.host,
      this.interactive ? this.editor : null,
    );

    await cmd.main(context, args);
  }
}
