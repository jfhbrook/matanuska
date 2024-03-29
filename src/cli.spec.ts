import t from 'tap';
import { Test } from 'tap';

import { Argv, cli, Env, Run } from './cli';
import { errorType } from './errors';
import { Exit, ExitCode } from './exit';
import { RuntimeFault } from './faults';
import { Host, Level, LoggingOptions } from './host';
import { MockConsoleHost } from './test/host';

interface TestConfig extends LoggingOptions {
  level: Level;
}

function parseArgs(argv: Argv, env: Env): TestConfig {
  return { level: Level.Info };
}

@errorType('TestExit')
class TestExit extends Error {
  constructor() {
    super('test exit');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type TestCommand = () => Promise<void>;

type CliTest = (t: Test, command: TestCommand) => Promise<void>;

async function cliTest(
  run: Run<TestConfig>,
  test: CliTest,
  exitCode: number = 0,
): Promise<void> {
  const main = cli({
    parseArgs,
    run,
  });

  function command(): Promise<void> {
    return main({
      host: new MockConsoleHost(),
      exit: (code: number) => {
        t.equal(code, exitCode);
        throw new TestExit();
      },
      argv: [],
      env: {},
    });
  }

  await test(t, command);
}

t.test('when the command succeeds', async (t: Test) => {
  t.test("and it doesn't throw an Exit", async (t: Test) => {
    t.test('it exits with code 0', async (t: Test) => {
      async function run(_config: TestConfig, _host: Host): Promise<void> {
        // Nothing.
      }
      await cliTest(run, async (t: Test, command: TestCommand) => {
        t.rejects(command, TestExit);
      });
    });
  });

  t.test('and it throws an Exit', async (t: Test) => {
    t.test('it exits with code 0', async (t: Test) => {
      async function run(_config: TestConfig, _host: Host): Promise<void> {
        throw new Exit();
      }
      await cliTest(run, async (t: Test, command: TestCommand) => {
        t.rejects(command, TestExit);
      });
    });
  });
});

t.test('when the command fails with a RuntimeFault', async (t: Test) => {
  t.test('it exits with the expected code', async (t: Test) => {
    async function run(_config: TestConfig, _host: Host): Promise<void> {
      throw new RuntimeFault(
        'runtime fault',
        new Error('underlying error'),
        null,
      );
    }
    await cliTest(
      run,
      async (t: Test, command: TestCommand) => {
        t.rejects(command, TestExit);
      },
      ExitCode.Software,
    );
  });
});
