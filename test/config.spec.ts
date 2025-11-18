import { describe, expect, test } from 'vitest';

import { Level } from '@matanuska/host';

import { Exit } from '../exit';
import { Config } from '../config';
import { UsageFault } from '../faults';

function expectExit(err: any, message: string | RegExp): void {
  expect(err).toBeInstanceOf(Exit);
  expect(err.message).toMatch(message);
}

function expectUsage(err: any): void {
  expect(err).toBeInstanceOf(UsageFault);
  expect(err.message).toMatch(/Usage:/);
}

describe('help', () => {
  describe('when the -h flag is passed', () => {
    test('it shows help text', () => {
      expect.assertions(2);
      try {
        Config.load(['-h'], {});
      } catch (err) {
        expectExit(err, /Usage:/);
      }
    });
  });

  describe('when the --help flag is passed', () => {
    test('it shows help text', () => {
      expect.assertions(2);
      try {
        Config.load(['--help'], {});
      } catch (err) {
        expectExit(err, /Usage:/);
      }
    });
  });
});

describe('version', () => {
  describe('when the -v flag is passed', () => {
    test('it shows the version', () => {
      expect.assertions(2);
      try {
        Config.load(['-v'], {});
      } catch (err) {
        expectExit(err, /^v\d+\.\d+\.\d+/);
      }
    });
  });

  describe('when the --version flag is passed', () => {
    test('it shows the version', () => {
      expect.assertions(2);
      try {
        Config.load(['--version'], {});
      } catch (err) {
        expectExit(err, /^v\d+\.\d+\.\d+/);
      }
    });
  });
});

describe('command', () => {
  describe('when the -c option is passed', () => {
    test('it sets a command', () => {
      const config = Config.load(['-c', 'print "hello world"'], {});
      expect(config.command).toBe('print "hello world"');
      expect(config.eval).toBe(null);
      expect(config.script).toBe(null);
    });
  });

  describe('when the --command option is passed', () => {
    test('it sets a command', () => {
      const config = Config.load(['--command', 'print "hello world"'], {});
      expect(config.command).toBe('print "hello world"');
      expect(config.eval).toBe(null);
      expect(config.script).toBe(null);
    });
  });
});

describe('eval', () => {
  describe('when the -e option is passed', () => {
    test('it sets source to eval', () => {
      const config = Config.load(['-e', '100 print "hello world"'], {});
      expect(config.eval).toBe('100 print "hello world"');
      expect(config.command).toBe(null);
      expect(config.script).toBe(null);
    });
  });

  describe('when the --eval option is passed', () => {
    test('it sets source to eval', () => {
      const config = Config.load(['--eval', '100 print "hello world"'], {});
      expect(config.eval).toBe('100 print "hello world"');
      expect(config.command).toBe(null);
      expect(config.script).toBe(null);
    });
  });
});

describe('script', () => {
  describe('when a script is passed', () => {
    describe('and there are no other arguments', () => {
      test('it sets the path to a script', () => {
        const config = Config.load(['./script.bas'], {});
        expect(config.script).toBe('./script.bas');
        expect(config.command).toBe(null);
        expect(config.eval).toBe(null);
      });
    });

    describe('and there is another argument', () => {
      test('it sets the path to a script', () => {
        const config = Config.load(['./script.bas', 'arg'], {});
        expect(config.script).toBe('./script.bas');
        expect(config.command).toBe(null);
        expect(config.eval).toBe(null);
        expect(config.argv).toEqual(['matbas', './script.bas', 'arg']);
      });
    });

    describe('and there is a valid option prior', () => {
      test('it sets the path to a script and respects the option', () => {
        const config = Config.load(
          ['-c', 'print "hello world"', './script.bas'],
          {},
        );
        expect(config.command).toBe('print "hello world"');
        expect(config.script).toBe('./script.bas');
        expect(config.eval).toBe(null);
        expect(config.argv).toEqual(['matbas', './script.bas']);
      });
    });

    describe('and there is an invalid option prior', () => {
      test('it exits with a usage fault', () => {
        expect.assertions(3);
        try {
          Config.load(['--invalid', './script.bas'], {});
        } catch (err) {
          expectUsage(err);
          expect(err.message).toMatch(/^Invalid option: --invalid/);
        }
      });
    });
  });
});

describe('level', () => {
  describe('when no level is passed', () => {
    describe('and there is no environment variable', () => {
      test('the level is set to info', () => {
        const config = Config.load([], {});
        expect(config.level).toBe(Level.Info);
      });
    });

    describe('but there is a valid environment variable', () => {
      test('the level is set to that level', () => {
        const config = Config.load([], { MATBAS_LOG_LEVEL: 'debug' });
        expect(config.level).toBe(Level.Debug);
      });
    });

    describe('but there is an invalid environment variable', () => {
      test('it exits with a usage fault', () => {
        expect.assertions(3);
        try {
          Config.load([], { MATBAS_LOG_LEVEL: 'fatal' });
        } catch (err) {
          expectUsage(err);
          expect(err.message).toMatch(/^Invalid log level: fatal/);
        }
      });
    });
  });

  describe('when a valid level is passed', () => {
    test('the level is set to that level', () => {
      const config = Config.load(['--log-level', 'debug'], {});
      expect(config.level).toBe(Level.Debug);
    });
  });

  describe('when an invalid level is passed', () => {
    test('it exits with a usage fault', () => {
      expect.assertions(3);
      try {
        Config.load(['--log-level', 'fatal'], {});
      } catch (err) {
        expectUsage(err);
        expect(err.message).toMatch(/^Invalid log level: fatal/);
      }
    });
  });
});

describe('historySize', () => {
  describe('when no history size is passed', () => {
    describe('and there is no environment variable', () => {
      test('the size is set to 500', () => {
        const config = Config.load([], {});
        expect(config.historySize).toBe(500);
        expect(config.historyFileSize).toBe(500);
      });
    });

    describe('but there is a valid HISTSIZE environment variable', () => {
      test('the history size gets set', () => {
        const config = Config.load([], { HISTSIZE: '1000' });
        expect(config.historySize).toBe(1000);
        expect(config.historyFileSize).toBe(500);
      });
    });

    describe('but there is an invalid HISTSIZE environment variable', () => {
      test('it exits with a usage fault', () => {
        expect.assertions(2);
        try {
          Config.load([], { HISTSIZE: 'pony' });
        } catch (err) {
          expectUsage(err);
        }
      });
    });
  });

  describe('when a valid history size is passed', () => {
    test('the history size gets set', () => {
      const config = Config.load(['--history-size', '1000'], {});
      expect(config.historySize).toBe(1000);
      expect(config.historyFileSize).toBe(500);
    });
  });

  describe('when an invalid history size is passed', () => {
    test('it exits with a usage fault', () => {
      expect.assertions(2);
      try {
        Config.load(['--history-size', 'pony'], {});
      } catch (err) {
        expectUsage(err);
      }
    });
  });
});

describe('historyFileSize', () => {
  describe('when no history file size is passed', () => {
    describe('but there is a valid HISTFILESIZE environment variable', () => {
      describe("that's less than the history size", () => {
        test('the history size gets set', () => {
          const config = Config.load([], { HISTFILESIZE: '100' });
          expect(config.historySize).toBe(500);
          expect(config.historyFileSize).toBe(100);
        });
      });

      describe("that's greater than the history size", () => {
        test('the history size defaults to history size', () => {
          const config = Config.load([], { HISTFILESIZE: '1000' });
          expect(config.historySize).toBe(500);
          expect(config.historyFileSize).toBe(500);
        });
      });
    });

    describe('but there is an invalid HISTFILESIZE environment variable', () => {
      test('it exits with a usage fault', () => {
        expect.assertions(2);
        try {
          Config.load([], { HISTFILESIZE: 'pony' });
        } catch (err) {
          expectUsage(err);
        }
      });
    });
  });

  describe('when a valid history file size is passed', () => {
    describe("that's less than the history size", () => {
      test('the history size gets set', () => {
        const config = Config.load(['--history-file-size', '100'], {});
        expect(config.historySize).toBe(500);
        expect(config.historyFileSize).toBe(100);
      });
    });

    describe("that's greater than the history size", () => {
      test('the history size defaults to history size', () => {
        const config = Config.load(['--history-file-size', '1000'], {});
        expect(config.historySize).toBe(500);
        expect(config.historyFileSize).toBe(500);
      });
    });
  });

  describe('when an invalid history size is passed', () => {
    test('it exits with a usage fault', () => {
      expect.assertions(2);
      try {
        Config.load(['--history-size', 'pony'], {});
      } catch (err) {
        expectUsage(err);
      }
    });
  });
});
