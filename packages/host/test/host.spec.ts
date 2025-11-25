import { Assert, Suite } from '@matanuska/test';
import { test } from '@matanuska/vitest';

import { mockHost } from '@matanuska/mock';
import { Level, Channel } from '@matanuska/output';

const STREAM = {
  writeOut: 'stdout',
  writeError: 'stderr',
};

function outputTest(method: 'writeOut' | 'writeError'): Suite {
  return async (t: Assert): Promise<void> => {
    await t.test('it writes to the stream', async (t: Assert) => {
      const host = mockHost();
      host[method]('test');

      t.equal(host[STREAM[method]].output, "'test'");
    });
  };
}

test('when calling writeOut', outputTest('writeOut'));
test('when calling writeOut', outputTest('writeError'));

const LOG_PREFIX = {
  writeDebug: 'DEBUG',
  writeInfo: 'INFO',
  writeWarn: 'WARN',
};

function logTest(
  method: 'writeDebug' | 'writeInfo' | 'writeWarn',
  level: Level,
): Suite {
  return async (t: Assert): Promise<void> => {
    for (const setLevel of [0, 1, 2, 3]) {
      await t.test(`at level ${setLevel}`, async (t: Assert) => {
        const host = mockHost();
        host.level = setLevel;
        host[method]('test');

        if (level >= setLevel) {
          await t.test('it writes a message', async (t: Assert) => {
            t.equal(host.stderr.output, `${LOG_PREFIX[method]}: 'test'\n`);
          });
        } else {
          await t.test('it suppresses the message', async (t: Assert) => {
            t.equal(host.stderr.output, '');
          });
        }
      });
    }
  };
}

test('when calling writeDebug', logTest('writeDebug', Level.Debug));
test('when calling writeInfo', logTest('writeInfo', Level.Info));
test('when calling writeWarn', logTest('writeWarn', Level.Warn));

function channelTest(
  channel: Channel,
  stream: 'stdout' | 'stderr',
  expected: string,
): Suite {
  return async (t: Assert): Promise<void> => {
    const host = mockHost();
    host.level = Level.Debug;
    host.writeChannel(channel, 'test');

    await t.test('it writes to that stream', async (t: Assert) => {
      t.equal(host[stream].output, expected);
    });
  };
}

test('when writing to channel 1', channelTest(1, 'stdout', "'test'"));
test('when writing to channel 2', channelTest(2, 'stderr', "'test'"));
test('when writing to channel 3', channelTest(3, 'stderr', "WARN: 'test'\n"));
test('when writing to channel 4', channelTest(4, 'stderr', "INFO: 'test'\n"));
test('when writing to channel 5', channelTest(5, 'stderr', "DEBUG: 'test'\n"));

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

test('path.relative', async (t: Assert) => {
  const host = mockHost();
  for (const [from, to, expected] of RELATIVE_PATH_CASES) {
    t.equal(host.path.relative(from, to), expected);
  }
});

test('path.resolve', async (t: Assert) => {
  const host = mockHost();
  for (const [relative, expected] of RESOLVE_PATH_CASES) {
    t.equal(host.path.resolve(relative), expected);
  }
});

test('cd', async (t: Assert) => {
  const host = mockHost();
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska',
    'start at /home/josh/matanuska',
  );

  host.cd('.');
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska',
    'cd . -> /home/josh/matanuska',
  );

  host.cd('..');
  t.equal(host.pwd(true), '/home/josh', 'cd .. -> /home/josh');

  host.cd('matanuska');
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska',
    'cd matanuska -> /home/josh/matanuska',
  );

  host.cd('./packages');
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska/packages',
    'cd ./packages -> /home/josh/matanuska/packages',
  );

  host.cd('..');
  host.cd('packages');
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska/packages',
    'cd packages -> /home/josh/matanuska/packages',
  );

  host.cd('-');
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska',
    'cd - -> /home/josh/matanuska',
  );

  host.cd('~');
  t.equal(host.pwd(true), '/home/josh', 'cd ~ -> /home/josh');

  host.cd('~/matanuska');
  t.equal(
    host.pwd(true),
    '/home/josh/matanuska',
    'cd ~/matanuska -> /home/josh/matanuska',
  );

  // TODO: Implement in C with <unisttd.h> and getpwuid()
  // host.cd('~kenz');
  // t.equal(host.pwd(true), '/home/kenz');
});
