import { describe, expect, test } from 'vitest';

import { mockExecutor } from './helpers/executor';

describe('when prompted for a command', () => {
  test('it gets a command', async () => {
    await mockExecutor(async (executor, host, _editor) => {
      const command = await host.expect(
        executor.prompt(),
        'print "hello world"',
        'print "hello world"',
      );
      expect(command).toEqual('print "hello world"');
    });
  });
});

describe('when input is requested', () => {
  test('input is received?', async () => {
    await mockExecutor(async (executor, host, _editor) => {
      const input = await host.expect(
        executor.input('what is your favorite color?'),
        'blue',
        'blue',
      );

      expect(input).toEqual('blue');
    });
  });
});

describe('when history is saved', () => {
  describe('and the history is long', () => {
    test('history is saved', async () => {
      await mockExecutor(async (executor, host, _editor) => {
        (executor as any).history = [];
        for (let i = 0; i < 1000; i++) {
          (executor as any).history.push(`print ${i}`);
        }

        await executor.saveHistory();

        expect(host.files['/home/josh/.matbas_history']).toMatchSnapshot();
      });
    });
  });
});
