import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { discuss } from '@jfhbrook/swears';

import { Level } from '../host';
import { MockConsoleHost } from './helpers/host';

const topic = discuss(async () => {
  return new MockConsoleHost();
});

const STREAM = {
  writeOut: 'outputStream',
  writeError: 'errorStream',
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
          host.setLevel(setLevel);
          host[method]('test');

          if (level >= setLevel) {
            test('it writes a message', () => {
              t.equal(host.errorStream.output, `${LOG_PREFIX[method]}: test\n`);
            });
          } else {
            test('it suppresses the message', () => {
              t.equal(host.errorStream.output, '');
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
  channel: number,
  stream: 'outputStream' | 'errorStream',
  expected: string,
): () => void {
  return async (): Promise<void> => {
    await topic.swear(async (host) => {
      host.setLevel(Level.Debug);
      host.writeChannel(channel, 'test');

      test('it writes to that stream', () => {
        t.equal(host[stream].output, expected);
      });
    });
  };
}

describe('when writing to channel 1', channelTest(1, 'outputStream', 'test'));
describe('when writing to channel 2', channelTest(2, 'errorStream', 'test'));
describe(
  'when writing to channel 3',
  channelTest(3, 'errorStream', 'WARN: test\n'),
);
describe(
  'when writing to channel 4',
  channelTest(4, 'errorStream', 'INFO: test\n'),
);
describe(
  'when writing to channel 5',
  channelTest(5, 'errorStream', 'DEBUG: test\n'),
);

type RelativePath = string;
type AbsolutePath = string;

const RELATIVE_PATH_CASES: Array<[RelativePath, RelativePath, RelativePath]> = [
  ['.', './examples/001-hello-world.bas', 'examples/001-hello-world.bas'],
  ['/home/josh/matanuska', '/home/josh/autoexec.bas', '../autoexec.bas'],
];

const RESOLVE_PATH_CASES: Array<[RelativePath, AbsolutePath]> = [
  [
    './examples/001-hello-world.bas',
    '/home/josh/matanuska/examples/001-hello-world.bas',
  ],
  ['/usr/bin/vim', '/usr/bin/vim'],
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
