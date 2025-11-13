import * as readline from 'node:readline/promises';
import * as path from 'node:path';

import { Injectable, Inject } from '@nestjs/common';
//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';
//#endif

import { Chunk } from './bytecode/chunk';
import { ReturnValue } from './commands';
import { compileCommands, compileProgram, CompiledCmd } from './compiler';
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
} from './exceptions';
import { RuntimeFault } from './faults';
import { inspector } from './format';
import type { Host } from './host';
import { Parser, ParseResult } from './parser';
import { Runtime } from './runtime';
import { Prompt } from './shell';

import { Line, Cmd, Program } from './ast';

@Injectable()
export class Executor {
  private parser: Parser;
  private runtime: Runtime;
  private _readline: readline.Interface | null;
  private history: string[];

  private ps1: Prompt;
  // The number of commands which have been run in the current session.
  // In the PS1, \# shows the number of the not-yet-run command (so cmdNo + 1),
  // and \! shows the *history* number of the not-yet-run command. This is the
  // same as the command number + the size of the history file.
  private cmdNo: number = 0;

  constructor(
    private config: Config,
    private editor: Editor,
    @Inject('Host') private host: Host,
  ) {
    this.parser = new Parser();
    this.runtime = new Runtime(host);
    this._readline = null;
    this.history = [];
    this.ps1 = new Prompt('\\u@\\h:\\w\\$', this.config.historyFileSize, host);
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
   * Start a new program and reset the runtime.
   */
  new(filename: string): void {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('Executor#new', (_: Span) => {
      //#endif
      this.runtime.reset();
      this.editor.reset();
      this.editor.filename = filename;
      // TODO: Close open file handles on this.host
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
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
   * Save a program.
   *
   * @Returns A promise.
   */
  async save(filename: string | null): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    await startSpan('Executor#save', async (_: Span) => {
      //#endif
      if (filename) {
        this.editor.filename = filename;
      }

      await this.host.writeFile(
        this.editor.filename,
        this.editor.list() + '\n',
      );

      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Retrieve listings from the current program.
   *
   * @returns The recreated source of the current program.
   */
  list(lineStart: number | null = null, lineEnd: number | null = null): void {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('Executor#list', (_: Span) => {
      //#endif
      if (this.editor.warning) {
        this.host.writeWarn(this.editor.warning);
      }

      this.host.writeLine(
        `${this.editor.filename}\n${'-'.repeat(this.editor.filename.length)}`,
      );
      const listings = this.editor.list(lineStart, lineEnd);
      this.host.writeLine(listings);
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Renumber the current program.
   */
  renum(): void {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('Executor#list', (_: Span) => {
      //#endif
      this.editor.renum();
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

      this.runtime.interpret(chunk);
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
          await this.evalParsedCommands([row, warning as ParseWarning]);
        }
      }
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  /**
   * Evaluate a group of commands.
   *
   * @param instrs A group of instructions to evaluate.
   */
  private async evalParsedCommands([
    cmds,
    parseWarning,
  ]: ParseResult<Cmd>): Promise<void> {
    let warning: ParseWarning | null = null;
    try {
      const result = compileCommands(cmds.instructions, {
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
        await this.runCompiledCommand(cmd);
      }

      if (lastCmd) {
        const rv = await this.runCompiledCommand(lastCmd);
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

  //
  // Run a compiled command.
  //
  private async runCompiledCommand(chunks: CompiledCmd): Promise<ReturnValue> {
    const results = chunks.map((c) => {
      return c ? this.runtime.interpret(c) : null;
    });

    return results[results.length - 1];
  }
}
