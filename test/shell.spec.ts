import { describe, expect, test } from 'vitest';

import { Host } from '../host';
import { abbreviateHome, Prompt } from '../shell';

import { mockConsoleHost } from './helpers/host';

function renderer(host: Host) {
  return function renderPrompt(ps1: string): string {
    const prompt = new Prompt(ps1, 500, host);
    return prompt.render(0);
  };
}

async function promptConsoleHost(
  fn: (render: (ps1: string) => string) => Promise<void>,
): Promise<void> {
  await mockConsoleHost(undefined, async (host) => {
    fn(renderer(host));
    (host as any).uid = () => 0;
  });
}

async function rootPromptConsoleHost(
  fn: (render: (ps1: string) => string) => Promise<void>,
): Promise<void> {
  await mockConsoleHost(undefined, async (host) => {
    (host as any).uid = () => 0;
    fn(renderer(host));
  });
}

describe('abbreviateHome', async () => {
  await mockConsoleHost(undefined, async (host) => {
    test("when it's in the home directory", () => {
      expect(abbreviateHome('/home/josh/matanuska', host)).toBe('~/matanuska');
    });

    test('when it IS the home directory', () => {
      expect(abbreviateHome('/home/josh', host)).toBe('~');
    });

    test("when it's outside the home directory", () => {
      expect(abbreviateHome('/usr/share', host)).toBe('/usr/share');
    });
  });
});

describe('renderPrompt', async () => {
  await promptConsoleHost(async (renderPrompt) => {
    test('empty prompt', () => {
      expect(renderPrompt('')).toBe('');
    });

    test('escape with no following', () => {
      expect(renderPrompt('\\')).toBe('\\');
    });

    test('weekday month date', () => {
      expect(renderPrompt('\\d')).toBe('Sun Jun 23');
    });

    test('strftime format', () => {
      expect(renderPrompt('\\D{%o of %B}')).toBe('23rd of June');
    });

    test('non-terminated strftime format', () => {
      expect(renderPrompt('\\D{%o of %B')).toBe('23rd of June');
    });

    test('non-initialized strftime format', () => {
      expect(renderPrompt('\\D%o of %B')).toBe('\\D%o of %B');
    });

    test('short hostname', () => {
      expect(renderPrompt('\\h')).toBe('gibson');
    });

    test('long hostname', () => {
      expect(renderPrompt('\\H')).toBe('gibson.local');
    });

    test.todo('jobs', () => {
      expect(renderPrompt('\\j')).toBe('1');
    });

    test('tty', () => {
      expect(renderPrompt('\\l')).toBe('tty0');
    });

    test('shell', () => {
      expect(renderPrompt('\\s')).toBe('matbas');
    });

    test('24 hr HH:MM:SS', () => {
      expect(renderPrompt('\\t')).toBe('13:00:00');
    });

    test('12 hr HH:MM:SS', () => {
      expect(renderPrompt('\\T')).toBe('01:00:00');
    });

    test('12 hr AM/PM', () => {
      expect(renderPrompt('\\@')).toBe('01:00 PM');
    });

    test('24 hr HH:MM', () => {
      expect(renderPrompt('\\A')).toBe('13:00');
    });

    test('username', () => {
      expect(renderPrompt('\\u')).toBe('josh');
    });

    test('short version', () => {
      expect(renderPrompt('\\v')).toMatch(/^\d+\.\d+$/);
    });

    test('full version', () => {
      expect(renderPrompt('\\V')).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('pwd', () => {
      expect(renderPrompt('\\w')).toBe('~/matanuska');
    });

    test('history number', () => {
      expect(renderPrompt('\\!')).toBe('501');
    });

    test('command number', () => {
      expect(renderPrompt('\\#')).toBe('1');
    });

    test('$ normally', () => {
      expect(renderPrompt('\\$')).toBe('$');
    });

    test('$ for root', async () => {
      await rootPromptConsoleHost(async (renderPrompt) => {
        expect(renderPrompt('\\$')).toBe('#');
      });
    });

    test('plain octal ascii character', () => {
      expect(renderPrompt('\\141')).toBe('a');
    });

    // Google says this character is Korean. I picked it randomly
    // as something that was high enough to go beyond three digits, but
    // small enough to not trigger triple-byte unicode barfing
    // a la emojis.

    test('plain octal high-point unicode character', () => {
      expect(renderPrompt('\\533161')).toBe('뙱');
    });

    test('octal high-point unicode character with trailing octal digits', () => {
      expect(renderPrompt('\\53316143')).toBe('뙱43');
    });

    test('octal ascii character with trailing decimal digits', () => {
      expect(renderPrompt('\\14199')).toBe('a99');
    });

    test('too short octal ascii character', () => {
      expect(renderPrompt('\\14')).toBe('\\14');
    });

    test('cheeky little backslash', () => {
      expect(renderPrompt('\\\\')).toBe('\\');
    });

    test('stop counting characters', () => {
      expect(renderPrompt('\\[')).toBe('');
    });

    test('start counting characters', () => {
      expect(renderPrompt('\\]')).toBe('');
    });

    test('unknown escape code', () => {
      expect(renderPrompt('\\q')).toBe('\\q');
    });
  });
});
