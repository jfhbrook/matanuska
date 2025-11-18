import { Container } from '../../index';

import { Config, Argv, Env } from '../../config';
import { ExitCode } from '../../exit';
import { Host } from '../../host';

import {
  mockConsoleHost,
  MockConsoleHost,
  MockConsoleHostOptions,
} from './host';

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

export async function run(
  argv: Argv,
  env: Env,
  options?: MockConsoleHostOptions,
): Promise<RunResult> {
  const host = mockConsoleHost(options);

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
