import { Exit } from './exit';
import { Translator } from './translator';
import { Config, Argv, Env } from './config';
import { Host } from './host';
import { ConsoleHost } from './console';
import { Editor } from './editor';
import { Executor } from './executor';

type ExitFn = (code: number) => Promise<any>;

async function exit(code: number): Promise<any> {
  process.exit(code);
}

export class Container {
  public argv: Argv;
  public env: Env;
  public exitFn: (code: number) => Promise<any>;
  public host: Host;
  private _config: Config | null = null;
  private _editor: Editor | null = null;
  private _executor: Executor | null = null;
  private _translator: Translator | null = null;

  constructor(
    argv: string[] = process.argv.slice(2),
    env: Record<string, string | undefined> = process.env,
    exitFn: ExitFn = exit,
    host: Host = new ConsoleHost(),
  ) {
    this.argv = argv;
    this.env = env;
    this.exitFn = exitFn;
    this.host = host;
  }

  public config(): Config {
    if (this._config) {
      return this._config;
    }

    try {
      const config = Config.load(this.argv, this.env);
      this._config = config;
      return config;
    } catch (err) {
      // Normally we would count on the Translator to handle these sorts of
      // errors. In this case, the error is thrown before the Translator is
      // stood up, so we have to special case it here.
      if (err instanceof Exit) {
        if (err.message.length) {
          console.log(err.message);
        }
        this.exitFn(err.exitCode);
      }
      throw err;
    }
  }

  public editor(): Editor {
    if (this._editor) {
      return this._editor;
    }
    const editor = new Editor(this.host);
    this._editor = editor;
    return editor;
  }

  public executor(): Executor {
    if (this._executor) {
      return this._executor;
    }
    const executor = new Executor(this.config(), this.editor(), this.host);
    this._executor = executor;
    return executor;
  }

  public translator(): Translator {
    if (this._translator) {
      return this._translator;
    }
    const translator = new Translator(
      this.host,
      this.exitFn,
      this.config(),
      this.executor(),
    );
    this._translator = translator;
    return translator;
  }
}

export async function main(): Promise<void> {
  const container = new Container();
  const translator = container.translator();
  await translator.start();
}
