import { Test as Testing } from '@nestjs/testing';

import { Translator } from '../../translator';
import { Config, Argv, Env } from '../../config';
import { Editor } from '../../editor';
import { Executor } from '../../executor';
import { ExitCode } from '../../exit';

import { MockConsoleHost, MockConsoleHostOptions } from './host';

export interface RunResult {
  exitCode: ExitCode;
  host: MockConsoleHost;
}

export async function run(
  argv: Argv,
  env: Env,
  options?: MockConsoleHostOptions,
): Promise<RunResult> {
  const host = new MockConsoleHost(options);

  return await new Promise((resolve, reject) => {
    Testing.createTestingModule({
      providers: [
        {
          provide: 'Host',
          useValue: host,
        },
        {
          provide: 'argv',
          useValue: argv,
        },
        {
          provide: 'env',
          useValue: env,
        },
        {
          provide: Config,
          useValue: Config.load(argv, env),
        },
        {
          provide: 'exitFn',
          useValue: async (exitCode: number): Promise<void> => {
            resolve({
              exitCode,
              host,
            });
          },
        },
        Editor,
        Executor,
        Translator,
      ],
    })
      .compile()
      .then((deps) => {
        const main = deps.get(Translator);
        return main.start();
      })
      .catch(reject);
  });
}
