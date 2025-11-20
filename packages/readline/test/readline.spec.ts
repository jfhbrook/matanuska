import { describe, expect, test } from 'vitest';
import { discuss } from '@jfhbrook/swears';

import { readFileSync } from 'node:fs';

import { Readline } from '../';

class MockReadline extends Readline {
  constructor() {
    super(
      {
        render() {
          return '> ';
        },
      },
      100,
      100,
    );
  }

  get historyFile(): string {
    return './.matbas_history';
  }
}

export const topic = discuss(
  async (): Promise<MockReadline> => {
    const readline = new MockReadline();
    await readline.init();
    return readline;
  },
  async (readline): Promise<void> => {
    readline.close();
  },
);

describe.skip('when prompted for a command', () => {
  test('it gets a command', async () => {
    await topic.swear(async (readline) => {
      const command = readline.prompt();
      expect(command).toEqual('print "hello world"');
    });
  });
});

describe.skip('when input is requested', () => {
  test('input is received?', async () => {
    await topic.swear(async (readline) => {
      const input = readline.input('what is your favorite color?');

      expect(input).toEqual('blue');
    });
  });
});

describe('when history is saved', () => {
  describe('and the history is long', () => {
    test('history is saved', async () => {
      await topic.swear(async (readline) => {
        (readline as any).history = [];
        for (let i = 0; i < 1000; i++) {
          (readline as any).history.push(`print ${i}`);
        }

        await readline.saveHistory();

        expect(readFileSync(readline.historyFile, 'utf8')).toMatchSnapshot();
      });
    });
  });
});
