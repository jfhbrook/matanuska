import { Container } from '../../index';

import { Config, Argv, Env } from '../../config';
import { ExitCode } from '../../exit';
import { Host } from '../../host';

import { MockConsoleHost, MockConsoleHostOptions } from './host';

export interface RunResult {
  exitCode: ExitCode;
  host: MockConsoleHost;
}

class MockContainer extends Container {
  constructor(argv: Argv, env: Env, exitFn: any, host: Host) {
    super(argv, env, exitFn, host);
  }

  public config(): Config {
    return Config.load(this.argv, this.env);
  }
}

/*
class Container {
  public argv: string[];
  public env: Record<string, string | undefined>;
  public exitFn: (code: number) => Promise<any>;
  public config: Config;
  public host: Host;
  public editor: Editor;
  public executor: Executor;
  public translator: Translator;

  constructor(argv: any, env: any, exitFn: any, host: Host) {
    this.argv = argv;
    this.env = env;
    this.exitFn = exitFn;
    this.config = Config.load(argv, env);
    this.host = host;
    this.editor = new Editor(this.host);
    this.executor = new Executor(this.config, this.editor, this.host);
    this.translator = new Translator(
      this.host,
      this.exitFn,
      this.config,
      this.executor,
    );
  }
}*/

export async function run(
  argv: Argv,
  env: Env,
  options?: MockConsoleHostOptions,
): Promise<RunResult> {
  const host = new MockConsoleHost(options);

  return await new Promise((resolve, reject) => {
    const exitFn = async (exitCode: number): Promise<void> => {
      resolve({
        exitCode,
        host,
      });
    };

    const container = new MockContainer(argv, env, exitFn, host);
    const main = container.translator();
    return main.start().catch((err) => reject(err));
  });
}
