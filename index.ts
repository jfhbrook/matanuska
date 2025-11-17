import { Exit } from './exit';
import { Translator } from './translator';
import { Config, Argv, Env } from './config';
import { Host, ConsoleHost } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

async function exit(code: number): Promise<any> {
  process.exit(code);
}

function configFactory(argv: Argv, env: Env) {
  try {
    return Config.load(argv, env);
  } catch (err) {
    // Normally we would count on the Translator to handle these sorts of
    // errors. In this case, the error is thrown before the Translator is
    // stood up, so we have to special case it here.
    if (err instanceof Exit) {
      if (err.message.length) {
        console.log(err.message);
      }
      process.exit(err.exitCode);
    }
    throw err;
  }
}

class Container {
  public argv: string[];
  public env: Record<string, string | undefined>;
  public exitFn: (code: number) => Promise<any>;
  public config: Config;
  public host: Host;
  public editor: Editor;
  public executor: Executor;
  public translator: Translator;

  constructor() {
    this.argv = process.argv.slice(2);
    this.env = process.env;
    this.exitFn = exit;
    this.config = configFactory(this.argv, this.env);
    this.host = new ConsoleHost();
    this.editor = new Editor(this.host);
    this.executor = new Executor(this.config, this.editor, this.host);
    this.translator = new Translator(
      this.host,
      this.exitFn,
      this.config,
      this.executor,
    );
  }
}

export async function main(): Promise<void> {
  const container = new Container();
  const translator = container.translator;
  await translator.start();
}
