import type { Assert } from '@matanuska/test';
import { test } from '@matanuska/vitest';

import {
  mockHost,
  MockConsoleHost,
  mockReadline,
  MockReadline,
} from '@matanuska/mock';

async function topic(
  t: Assert,
  fn: (host: MockConsoleHost, readline: MockReadline) => Promise<void>,
): Promise<void> {
  const host = mockHost(t);
  await mockReadline(host, async (readline) => {
    await fn(host, readline);
  });
}

test('when prompted for a command', async (t: Assert) => {
  await t.test('it gets a command', async (t: Assert) => {
    await topic(t, async (host, readline) => {
      const command = await host.expect(
        readline.prompt(),
        'print "hello world"',
        'print "hello world"',
      );
      t.equal(command, 'print "hello world"');
    });
  });
});

test('when input is requested', async (t: Assert) => {
  await t.test('input is received?', async (t: Assert) => {
    await topic(t, async (host, readline) => {
      const input = await host.expect(
        readline.input('what is your favorite color?'),
        'blue',
        'blue',
      );

      t.equal(input, 'blue');
    });
  });
});

test('when history is saved', async (t: Assert) => {
  await t.test('and the history is long', async (t: Assert) => {
    await t.test('history is saved', async (t: Assert) => {
      await topic(t, async (host, readline) => {
        (readline as any).history = [];
        for (let i = 0; i < 1000; i++) {
          (readline as any).history.push(`print ${i}`);
        }

        await readline.saveHistory();

        t.snapshot(host.files['/home/josh/.matbas_history']);
      });
    });
  });
});
