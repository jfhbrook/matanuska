import t from 'tap';
import { Test } from 'tap';

import { Exit } from '../exit';
import { Config } from '../config';
import { UsageFault } from '../faults';
import { Level } from '../host';

t.test('help', async (t: Test) => {
  t.test('when the -h flag is passed', async (t: Test) => {
    t.test('it shows help text', async (t: Test) => {
      t.plan(2);
      try {
        new Config(['-h'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^Usage:/);
      }
    });
  });

  t.test('when the --help flag is passed', async (t: Test) => {
    t.test('it shows help text', async (t: Test) => {
      t.plan(2);
      try {
        new Config(['--help'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^Usage:/);
      }
    });
  });
});

t.test('version', async (t: Test) => {
  t.test('when the -v flag is passed', async (t: Test) => {
    t.test('it shows the version', async (t: Test) => {
      t.plan(2);
      try {
        new Config(['-v'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^v\d+\.\d+\.\d+/);
      }
    });
  });

  t.test('when the --version flag is passed', async (t: Test) => {
    t.test('it shows the version', async (t: Test) => {
      t.plan(2);
      try {
        new Config(['--version'], {});
      } catch (err) {
        t.type(err, Exit);
        t.match(err.message, /^v\d+\.\d+\.\d+/);
      }
    });
  });
});

t.test('command', async (t: Test) => {
  t.test('when the -c option is passed', async (t: Test) => {
    t.test('it sets a command', async (t: Test) => {
      const config = new Config(['-c', 'print "hello world"'], {});
      t.equal(config.command, 'print "hello world"');
      t.equal(config.eval, null);
      t.equal(config.script, null);
    });
  });

  t.test('when the --command option is passed', async (t: Test) => {
    t.test('it sets a command', async (t: Test) => {
      const config = new Config(['--command', 'print "hello world"'], {});
      t.equal(config.command, 'print "hello world"');
      t.equal(config.eval, null);
      t.equal(config.script, null);
    });
  });
});

t.test('eval', async (t: Test) => {
  t.test('when the -e option is passed', async (t: Test) => {
    t.test('it sets source to eval', async (t: Test) => {
      const config = new Config(['-e', '100 print "hello world"'], {});
      t.equal(config.eval, '100 print "hello world"');
      t.equal(config.command, null);
      t.equal(config.script, null);
    });
  });

  t.test('when the --eval option is passed', async (t: Test) => {
    t.test('it sets source to eval', async (t: Test) => {
      const config = new Config(['--eval', '100 print "hello world"'], {});
      t.equal(config.eval, '100 print "hello world"');
      t.equal(config.command, null);
      t.equal(config.script, null);
    });
  });
});

t.test('script', async (t: Test) => {
  t.test('when a script is passed', async (t: Test) => {
    t.test('and there are no other arguments', async (t: Test) => {
      t.test('it sets the path to a script', async (t: Test) => {
        const config = new Config(['./script.bas'], {});
        t.equal(config.script, './script.bas');
        t.equal(config.command, null);
        t.equal(config.eval, null);
      });
    });

    t.test('and there is another argument', async (t: Test) => {
      t.test('it sets the path to a script', async (t: Test) => {
        const config = new Config(['./script.bas', 'arg'], {});
        t.equal(config.script, './script.bas');
        t.equal(config.command, null);
        t.equal(config.eval, null);
        t.same(config.argv, ['matbas', './script.bas', 'arg']);
      });
    });

    t.test('and there is a valid option prior', async (t: Test) => {
      t.test(
        'it sets the path to a script and respects the option',
        async (t: Test) => {
          const config = new Config(
            ['-c', 'print "hello world"', './script.bas'],
            {},
          );
          t.equal(config.command, 'print "hello world"');
          t.equal(config.script, './script.bas');
          t.equal(config.eval, null);
          t.same(config.argv, ['matbas', './script.bas']);
        },
      );
    });

    t.test('and there is an invalid option prior', async (t: Test) => {
      t.test('it exits with a usage fault', async (t: Test) => {
        t.plan(3);
        try {
          new Config(['--invalid', './script.bas'], {});
        } catch (err) {
          t.type(err, UsageFault);
          t.match(err.message, /^Invalid option: --invalid/);
          t.match(err.message, /Usage:/);
        }
      });
    });
  });
});

t.test('level', async (t: Test) => {
  t.test('when no level is passed', async (t: Test) => {
    t.test('and there is no environment variable', async (t: Test) => {
      t.test('the level is set to info', async (t: Test) => {
        const config = new Config([], {});
        t.equal(config.level, Level.Info);
      });
    });

    t.test('but there is a valid environment variable', async (t: Test) => {
      t.test('the level is set to that level', async (t: Test) => {
        const config = new Config([], { MATBAS_LOG_LEVEL: 'debug' });
        t.equal(config.level, Level.Debug);
      });
    });

    t.test('but there is an invalid environment variable', async (t: Test) => {
      t.test('it exits with a usage fault', async (t: Test) => {
        t.plan(3);
        try {
          new Config([], { MATBAS_LOG_LEVEL: 'fatal' });
        } catch (err) {
          t.type(err, UsageFault);
          t.match(err.message, /^Invalid log level: fatal/);
          t.match(err.message, /Usage:/);
        }
      });
    });
  });

  t.test('when a valid level is passed', async (t: Test) => {
    t.test('the level is set to that level', async (t: Test) => {
      const config = new Config(['--log-level', 'debug'], {});
      t.equal(config.level, Level.Debug);
    });
  });

  t.test('when an invalid level is passed', async (t: Test) => {
    t.test('it exits with a usage fault', async (t: Test) => {
      t.plan(3);
      try {
        new Config(['--log-level', 'fatal'], {});
      } catch (err) {
        t.type(err, UsageFault);
        t.match(err.message, /^Invalid log level: fatal/);
        t.match(err.message, /Usage:/);
      }
    });
  });
});
