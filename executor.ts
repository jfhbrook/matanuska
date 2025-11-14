import * as readline from 'node:readline/promises';
import * as path from 'node:path';

import { Injectable, Inject } from '@nestjs/common';
//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';
//#endif

import { Chunk } from './bytecode/chunk';
import { BUILTINS, Command, CommandIndex, Context, Deferred } from './commands';
import { compileInstructions, compileProgram } from './compiler';
import { Config } from './config';
//#if _MATBAS_BUILD == 'debug'
import { startSpan } from './debug';
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
import { Prompt } from './shell';
import { Value } from './value';

import { Line, Cmd, Program } from './ast';

@Injectable()
export class Executor {
  public parser: Parser;
  public runtime: Runtime;
  private _readline: readline.Interface | null;
  private history: string[];

  private ps1: Prompt;
  // The number of commands which have been run in the current session.
  // In the PS1, \# shows the number of the not-yet-run command (so cmdNo + 1),
  // and \! shows the *history* number of the not-yet-run command. This is the
  // same as the command number + the size of the history file.
  private cmdNo: number = 0;

  public interactive: boolean;
  private commands: CommandIndex;
  private _deferred: Deferred[] = [];

  constructor(
    private config: Config,
    private editor: Editor,
    @Inject('Host') private host: Host,
  ) {
    this.parser = new Parser();
    this.runtime = new Runtime(host, this);
    this._readline = null;
    this.history = [];
    this.ps1 = new Prompt('\\u@\\h:\\w\\$', this.config.historyFileSize, host);
    this.interactive = false;
    this.commands = { ...BUILTINS };
  }

  /**
   * Initialize the commander.
   */
  async init(): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#init', async (_: Span) => {
      //#endif
      // Ensure the commander's state is clean before initializing.
      await this.close(false);

      await this.loadHistory();

      // TODO: Support for tab-completion
      this.readline = this.createInterface();

      // TODO: Node's behavior on first press is to print:
      //
      //     (To exit, press Ctrl+C again or Ctrl+D or type .exit)
      //
      // Python's behavior is to raise a KeyboardInterrupt, which the REPL logs
      // and otherwise ignores.
      //
      // Neither behavior is simple. Node's behavior requires tracking state
      // in the Translator - count sigints, reset to zero on any new input.
      // You'd have to expose this event to the Translator. Python's behavior
      // seems simpler - throw an Error - but any error thrown here is thrown
      // asynchronously and the context is lost. Again, you would need to emit
      // an event on the Host and handle it in the Translator.
      //
      // If there's no handler at *all*, the default behavior is ostensibly to
      // call readline.pause() - here, we're calling this.close() which also
      // calls readline.close(). The latter ostensibly causes readline.question
      // to throw an error. *Practically speaking* this causes the process to
      // quietly exit - I believe it *is* throwing an error, but that Node is
      // checking the type and deciding not to log it. That said, who knows.
      //
      // Either way, I should dig into this more.
      this.readline.on('SIGINT', () => {
        this.host.writeError('\n');
        this.host.writeDebug('Received SIGINT (ctrl-c)');
        this.close();
      });
      this.readline.on('history', (history) => {
        this.history = history;
      });
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Close the commander.
   */
  async close(saveHistory: boolean = true): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#close', async (_: Span) => {
      //#endif
      let p: Promise<void> = Promise.resolve();

      if (this._readline) {
        const rl = this._readline;
        p = new Promise((resolve, _reject) => {
          rl.once('close', () => {
            resolve();
          });
        });

        this._readline.close();
      }

      return Promise.all([
        p,
        saveHistory ? this.saveHistory() : Promise.resolve(),
      ]).then(() => {});
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Use the commander. Initializes the commander, runs the provided function,
   * and closes the commander afterwards.
   */
  async using(fn: () => Promise<void>): Promise<void> {
    await this.init();
    try {
      await fn();
    } finally {
      await this.close();
    }
  }

  private get readline(): readline.Interface {
    if (this._readline === null) {
      // If readline hasn't been initialized, create a default one.
      this._readline = this.createInterface();
    }

    return this._readline;
  }

  private set readline(rl: readline.Interface) {
    this._readline = rl;
  }

  private createInterface(): readline.Interface {
    return readline.createInterface({
      input: this.host.inputStream,
      output: this.host.outputStream,
      terminal: true,
      history: this.history,
      historySize: this.config.historySize,
    });
  }

  private get historyFile(): string {
    return path.join(this.host.homedir(), '.matbas_history');
  }

  /**
   * Load REPL history.
   */
  public async loadHistory(): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#loadHistory', async (_: Span) => {
      //#endif
      try {
        this.history = (await this.host.readFile(this.historyFile)).split('\n');
      } catch (err) {
        if (err.code !== 'ENOENT') {
          this.host.writeWarn(err);
        } else {
          this.host.writeDebug(err);
        }
      }
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  public async saveHistory(): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#saveHistory', async (_: Span) => {
      //#endif
      const sliceAt = Math.max(
        this.history.length - this.config.historyFileSize,
        0,
      );
      const history = this.history.slice(sliceAt);
      try {
        await this.host.writeFile(this.historyFile, history.join('\n'));
      } catch (err) {
        this.host.writeWarn(err);
      }
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Request input from the user.
   *
   * @param question A question to ask the user.
   * @returns A promise that resolves to the user input.
   */
  input(question: string): Promise<string> {
    /*
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent('Request input');
    }
    */
    return this.readline.question(`${question} > `);
  }

  /**
   * Prompt for a line of source.
   *
   * @param prompt The prompt to display.
   * @returns A promise that resolves to the source line.
   */
  async prompt(): Promise<string> {
    /*
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent('Prompt');
    }
    */

    const ans = await this.readline.question(`${this.ps1.render(this.cmdNo)} `);
    this.cmdNo++;
    return ans;
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
      const source = await this.host.readFile(filename);

      let result: ParseResult<Program>;

      try {
        result = this.parser.parseProgram(
          source,
          this.host.resolvePath(filename),
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
  async eval(input: string): Promise<void> {
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
        if (rv !== null) {
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

  public async command(name: string, args: Value[]): Promise<Value | null> {
    const cmd: Command | undefined = this.commands[name];

    if (!cmd) {
      throw new RuntimeError(`Unknown command ${cmd}`);
    }

    const context = new Context(
      name,
      this,
      this.host,
      this.interactive ? this.editor : null,
    );

    return await cmd.main(context, args);
  }
}
