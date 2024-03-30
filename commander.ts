import * as readline from 'node:readline/promises';

import { Config } from './config';
import { Host } from './host';
import { renderPrompt } from './shell';

export class Commander {
  private _readline: readline.Interface | null;

  private ps1: string = '\\u@\\h:\\w\\$';

  constructor(
    private config: Config,
    private host: Host,
  ) {
    this._readline = null;
  }

  /**
   * Initialize the commander.
   */
  async init(): Promise<void> {
    await this.close();

    // TODO: Support for tab-completion and history. Note:
    // - Tab complete will only apply for source input.
    // - History will be different between user and source input.
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
  }

  /**
   * Close the commander.
   */
  async close(): Promise<void> {
    let p: Promise<void> = Promise.resolve();

    if (this._readline) {
      p = new Promise((resolve, reject) => {
        this._readline.once('close', () => resolve());
      });

      this._readline.close();
    }

    return p;
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
    });
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
  prompt(): Promise<string> {
    return this.readline.question(`${renderPrompt(this.ps1, this.host)} `);
  }
}
