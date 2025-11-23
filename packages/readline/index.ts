import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { stdin, stdout } from 'node:process';
import { Interface, createInterface } from 'node:readline/promises';
import { Readable, Writable } from 'node:stream';

import type { Host } from '@matanuska/host';

export interface Prompt {
  render(cmdNo: number): string;
}

export interface Repl {
  evaluate(input: string): Promise<void>;
  error(err: any): void;
}

export class Readline {
  public stdin: Readable;
  public stdout: Writable;

  private _readline: Interface | null;
  private history: string[];

  // The number of commands which have been run in the current session.
  // In the PS1, \# shows the number of the not-yet-run command (so cmdNo + 1),
  // and \! shows the *history* number of the not-yet-run command. This is the
  // same as the command number + the size of the history file.
  private cmdNo: number = 0;

  constructor(
    private host: Host,
    private ps1: Prompt,
    private historySize: number,
    private historyFileSize: number,
  ) {
    this.stdin = stdin;
    this.stdout = stdout;

    this._readline = null;
    this.history = [];
    this.ps1 = ps1;
  }

  /**
   * Initialize readline.
   */
  async init(): Promise<void> {
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
      this.host.writeOut('\nReceived SIGINT (ctrl-c)\n');
      this.close();
    });
    this.readline.on('history', (history) => {
      this.history = history;
    });
  }

  /**
   * Close readline.
   */
  async close(saveHistory: boolean = true): Promise<void> {
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
  }

  /**
   * Use readline. Initializes it, runs the provided function, and closes it
   * afterwards.
   */
  async using(fn: () => Promise<void>): Promise<void> {
    await this.init();
    try {
      await fn();
    } finally {
      await this.close();
    }
  }

  private get readline(): Interface {
    if (this._readline === null) {
      // If readline hasn't been initialized, create a default one.
      this._readline = this.createInterface();
    }

    return this._readline;
  }

  private set readline(rl: Interface) {
    this._readline = rl;
  }

  private createInterface(): Interface {
    return createInterface({
      input: this.stdin,
      output: this.stdout,
      terminal: true,
      history: this.history,
      historySize: this.historySize,
    });
  }

  public get historyFile(): string {
    return path.join(homedir(), '.matbas_history');
  }

  /**
   * Load REPL history.
   */
  public async loadHistory(): Promise<void> {
    try {
      this.history = (await readFile(this.historyFile, 'utf8')).split('\n');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        this.host.writeWarn(err);
      } else {
        this.host.writeDebug(err);
      }
    }
  }

  public async saveHistory(): Promise<void> {
    const sliceAt = Math.max(this.history.length - this.historyFileSize, 0);
    const history = this.history.slice(sliceAt);
    try {
      await writeFile(this.historyFile, history.join('\n'));
    } catch (err) {
      this.host.writeWarn(err);
    }
  }

  /**
   * Request input from the user.
   *
   * @param question A question to ask the user.
   * @returns A promise that resolves to the user input.
   */
  input(question: string): Promise<string> {
    return this.readline.question(`${question} > `);
  }

  /**
   * Prompt for a line of source.
   *
   * @param prompt The prompt to display.
   * @returns A promise that resolves to the source line.
   */
  async prompt(): Promise<string> {
    const ans = await this.readline.question(`${this.ps1.render(this.cmdNo)} `);
    this.cmdNo++;
    return ans;
  }

  async repl(repl: Repl): Promise<void> {
    await this.using(async () => {
      while (true) {
        try {
          const input = await this.prompt();
          await repl.evaluate(input);
        } catch (err) {
          repl.error(err);
        }
      }
    });
  }
}
