import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { discuss } from '@jfhbrook/swears';

import { Level, Channel } from '@matanuska/host';
import { mockConsoleHost, MockConsoleHost } from './helpers/host';

const topic = discuss(async (): Promise<MockConsoleHost> => {
  return mockConsoleHost();
});

const STREAM = {
  writeOut: 'stdout',
  writeError: 'stderr',
};

function outputTest(method: 'writeOut' | 'writeError'): () => void {
  return (): void => {
    test('it writes to the stream', async () => {
      await topic.swear(async (host) => {
        host[method]('test');

        t.equal(host[STREAM[method]].output, 'test');
      });
    });
  };
}

describe('when calling writeOut', outputTest('writeOut'));
describe('when calling writeError', outputTest('writeError'));

const LOG_PREFIX = {
  writeDebug: 'DEBUG',
  writeInfo: 'INFO',
  writeWarn: 'WARN',
};

function logTest(
  method: 'writeDebug' | 'writeInfo' | 'writeWarn',
  level: Level,
): () => void {
  return (): void => {
    for (const setLevel of [0, 1, 2, 3]) {
      describe(`at level ${setLevel}`, async () => {
        await topic.swear(async (host) => {
          host.level = setLevel;
          host[method]('test');

          if (level >= setLevel) {
            test('it writes a message', () => {
              t.equal(host.stderr.output, `${LOG_PREFIX[method]}: test\n`);
            });
          } else {
            test('it suppresses the message', () => {
              t.equal(host.stderr.output, '');
            });
          }
        });
      });
    }
  };
}

describe('when calling writeDebug', logTest('writeDebug', Level.Debug));
describe('when calling writeInfo', logTest('writeInfo', Level.Info));
describe('when calling writeWarn', logTest('writeWarn', Level.Warn));

function channelTest(
  channel: Channel,
  stream: 'stdout' | 'stderr',
  expected: string,
): () => void {
  return async (): Promise<void> => {
    await topic.swear(async (host) => {
      host.level = Level.Debug;
      host.writeChannel(channel, 'test');

      test('it writes to that stream', () => {
        t.equal(host[stream].output, expected);
      });
    });
  };
}

describe('when writing to channel 1', channelTest(1, 'stdout', 'test'));
describe('when writing to channel 2', channelTest(2, 'stderr', 'test'));
describe('when writing to channel 3', channelTest(3, 'stderr', 'WARN: test\n'));
describe('when writing to channel 4', channelTest(4, 'stderr', 'INFO: test\n'));
describe(
  'when writing to channel 5',
  channelTest(5, 'stderr', 'DEBUG: test\n'),
);

type RelativePath = string;
type AbsolutePath = string;

const RELATIVE_PATH_CASES: Array<[RelativePath, RelativePath, RelativePath]> = [
  ['.', './examples/001-hello-world.bas', 'examples/001-hello-world.bas'],
  ['/home/josh/matanuska', '/home/josh/autoexec.bas', '../autoexec.bas'],
  ['/home/josh/matanuska', '~/autoexec.bas', '../autoexec.bas'],
];

const RESOLVE_PATH_CASES: Array<[RelativePath, AbsolutePath]> = [
  [
    './examples/001-hello-world.bas',
    '/home/josh/matanuska/examples/001-hello-world.bas',
  ],
  ['/usr/bin/vim', '/usr/bin/vim'],
  [
    '~/matanuska/examples/001-hello-world.bas',
    '/home/josh/matanuska/examples/001-hello-world.bas',
  ],
];

test('relativePath', async () => {
  await topic.swear(async (host) => {
    for (const [from, to, expected] of RELATIVE_PATH_CASES) {
      t.equal(host.relativePath(from, to), expected);
    }
  });
});

test('resolvePath', async () => {
  await topic.swear(async (host) => {
    for (const [relative, expected] of RESOLVE_PATH_CASES) {
      t.equal(host.resolvePath(relative), expected);
    }
  });
});
