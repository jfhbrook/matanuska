import * as assert from 'assert';

import t from 'tap';
import { Test } from 'tap';

import {
  Formatter,
  DefaultFormatter,
  Inspector,
  inspectString,
} from '../format';

import { ErrorCode } from '../errors';
import {
  BaseException,
  Exception,
  RuntimeError,
  TypeError,
  NotImplementedError,
  AssertionError,
  BaseWarning,
  ZeroDivisionError,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from '../exceptions';
import { Exit, ExitCode } from '../exit';
import { BaseFault, RuntimeFault, UsageFault } from '../faults';
import { Token, TokenKind } from '../tokens';
import {
  Binary,
  Unary,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from '../ast/expr';
import {
  Print,
  Exit as ExitCmd,
  Rem,
  New,
  Load,
  List,
  Save,
  Run,
  Let,
  ShortIf,
  If,
} from '../ast/cmd';
import { Line, Program } from '../ast';
import { FILENAME } from './helpers/files';
import { scrubNodeVersion } from './helpers/format';
import { TRACEBACK } from './helpers/traceback';

const LINE = '100 print someFn(ident';
const IS_LINE = [true, false];

t.test('inspectString', async (t: Test) => {
  t.test('it inspects strings without quotes', async (t: Test) => {
    t.equal(inspectString('hello'), "'hello'");
  });
  t.test('it inspects strings with single quotes', async (t: Test) => {
    t.equal(inspectString("don't"), '"don\'t"');
  });

  t.test('it inspects strings with double quotes', async (t: Test) => {
    t.equal(inspectString('"time machine"'), '\'"time machine"\'');
  });

  t.test('it inspects strings with both kinds of quotes', async (t: Test) => {
    t.equal(
      inspectString('don\'t mess with my "time machine"'),
      "'don\\'t mess with my \"time machine\"'",
    );
  });
});

function formatTestSuite<F extends Formatter>(formatter: F): void {
  t.test(`given a ${formatter.constructor.name}`, async (t: Test) => {
    t.test('it formats a string', async (t: Test) => {
      t.matchSnapshot(formatter.format('hello'));
    });

    t.test('it formats a number', async (t: Test) => {
      t.matchSnapshot(formatter.format(12345));
    });

    t.test('it formats a boolean', async (t: Test) => {
      t.matchSnapshot(formatter.format(true));
    });

    t.test('it formats a Traceback', async (t: Test) => {
      t.matchSnapshot(formatter.format(TRACEBACK));
    });

    for (const ctor of [
      BaseException,
      Exception,
      RuntimeError,
      NotImplementedError,
    ]) {
      t.test(`it formats a ${ctor.prototype.name}`, async (t: Test) => {
        t.matchSnapshot(formatter.format(new ctor('message', TRACEBACK)));
      });
    }

    t.test('it formats a BaseWarning', async (t: Test) => {
      t.matchSnapshot(formatter.format(new BaseWarning('message', TRACEBACK)));
    });

    t.test('it formats a BaseWarning without a traceback', async (t: Test) => {
      t.matchSnapshot(formatter.format(new BaseWarning('message', null)));
    });

    t.test('it formats an AssertionError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(new AssertionError('message', TRACEBACK)),
      );
    });

    t.test('it formats a TypeError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new TypeError('message', 123, 'integer', 'nil', TRACEBACK),
        ),
      );
    });

    t.test('it formats a ZeroDivisionError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new ZeroDivisionError(1, 'integer', 0, 'integer', TRACEBACK),
        ),
      );
    });

    t.test('it formats an OsError', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new OsError('message', ErrorCode.AddressInUse, null, TRACEBACK),
        ),
      );
    });

    t.test('it formats a FileError with one file', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new FileError(
            'message',
            ErrorCode.Access,
            ExitCode.NoInput,
            [FILENAME],
            TRACEBACK,
          ),
        ),
      );
    });

    t.test('it formats a FileError with two files', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new FileError(
            'message',
            ErrorCode.Access,
            ExitCode.NoInput,
            [FILENAME, 'another.bas'],
            TRACEBACK,
          ),
        ),
      );
    });

    for (const isLine of IS_LINE) {
      t.test(`when it ${isLine ? 'is' : 'is not'} a line`, async (t: Test) => {
        const line = isLine ? LINE : LINE.replace(/^\d+ /, '');
        t.test('it formats a SyntaxError', async (t: Test) => {
          t.matchSnapshot(
            formatter.format(
              new SyntaxError('expected )', {
                filename: FILENAME,
                row: 0,
                isLine,
                lineNo: 100,
                cmdNo: isLine ? 10 : null,
                offsetStart: 22,
                offsetEnd: 23,
                source: line,
              }),
            ),
          );
        });

        t.test('it formats a ParseError', async (t: Test) => {
          t.matchSnapshot(
            formatter.format(
              new ParseError([
                new SyntaxError('expected )', {
                  filename: FILENAME,
                  row: 0,
                  isLine,
                  lineNo: 100,
                  cmdNo: isLine ? 10 : null,
                  offsetStart: 22,
                  offsetEnd: 23,
                  source: line,
                }),
                new SyntaxWarning('identifier has no sigil', {
                  filename: FILENAME,
                  row: 0,
                  isLine,
                  lineNo: 100,
                  cmdNo: isLine ? 10 : null,
                  offsetStart: 17,
                  offsetEnd: 18,
                  source: line,
                }),
              ]),
            ),
          );
        });

        t.test('it formats a SyntaxWarning', async (t: Test) => {
          t.matchSnapshot(
            formatter.format(
              new SyntaxWarning('expected )', {
                filename: FILENAME,
                row: 0,
                isLine,
                lineNo: 100,
                cmdNo: isLine ? 10 : null,
                offsetStart: 22,
                offsetEnd: 23,
                source: line,
              }),
            ),
          );
        });

        t.test('it formats a ParseWarning', async (t: Test) => {
          t.matchSnapshot(
            formatter.format(
              new ParseWarning([
                new SyntaxWarning('identifier has no sigil', {
                  filename: FILENAME,
                  row: 0,
                  isLine,
                  lineNo: 100,
                  cmdNo: isLine ? 10 : null,
                  offsetStart: 17,
                  offsetEnd: 18,
                  source: line,
                }),
              ]),
            ),
          );
        });
      });
    }

    t.test('it formats a BaseFault', async (t: Test) => {
      t.matchSnapshot(formatter.format(new BaseFault('message', TRACEBACK)));
    });

    t.test('it formats a RuntimeFault', async (t: Test) => {
      const underlying = new assert.AssertionError({
        message: 'underlying assertion',
        actual: false,
        expected: true,
        operator: '===',
      });

      t.matchSnapshot(
        scrubNodeVersion(
          formatter.format(
            new RuntimeFault('Some runtime fault', underlying, TRACEBACK),
          ),
        ),
      );
    });

    t.test('it formats a UsageFault', async (t: Test) => {
      t.matchSnapshot(formatter.format(new UsageFault('Usage: lol')));
    });

    t.test('it formats an Exit with a message', async (t: Test) => {
      t.matchSnapshot(formatter.format(new Exit(ExitCode.Success, 'message')));
    });

    t.test('it formats an Exit without message', async (t: Test) => {
      t.matchSnapshot(formatter.format(new Exit(ExitCode.Success)));
    });

    t.test('it formats a Token', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new Token({
            kind: TokenKind.StringLiteral,
            index: 0,
            row: 0,
            offsetStart: 0,
            offsetEnd: 9,
            text: "'hello\\q'",
            value: 'hello\\q',
          }),
        ),
      );
    });

    t.test('it formats a Unary expression', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(new Unary(TokenKind.Minus, new IntLiteral(1))),
      );
    });

    t.test('it formats a Binary expression', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
        ),
      );
    });

    t.todo('it formats a Logical expression', async (_t: Test) => {
      /*
      t.matchSnapshot(formatter.format(new Logical(
        new IntLiteral(1),
        TokenKind.And,
        new IntLiteral(1)
      )));
      */
    });

    t.test('it formats an IntLiteral', async (t: Test) => {
      t.matchSnapshot(formatter.format(new IntLiteral(12)));
    });

    t.test('it formats a RealLiteral', async (t: Test) => {
      t.matchSnapshot(formatter.format(new RealLiteral(123.456)));
    });

    t.test('it formats a BoolLiteral', async (t: Test) => {
      t.matchSnapshot(formatter.format(new BoolLiteral(true)));
    });

    t.test('it formats a StringLiteral', async (t: Test) => {
      t.matchSnapshot(formatter.format(new StringLiteral('hello')));
    });

    t.test('it formats a PromptLiteral', async (t: Test) => {
      t.matchSnapshot(formatter.format(new PromptLiteral('\\u@\\h:\\w\\$')));
    });

    t.test('it formats a NilLiteral', async (t: Test) => {
      t.matchSnapshot(formatter.format(new NilLiteral()));
    });

    t.test('it formats a Line', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new Line(100, 1, '100 "hello world"', [
            new Print(new StringLiteral('hello world')),
          ]),
        ),
      );
    });

    t.test('it formats a Program', async (t: Test) => {
      t.matchSnapshot(
        formatter.format(
          new Program(FILENAME, [
            new Line(100, 1, '100 "hello world"', [
              new Print(new StringLiteral('hello world')),
            ]),
          ]),
        ),
      );
    });

    t.test('commands', async (t: Test) => {
      const COMMANDS = [
        new Print(new StringLiteral('hello')),
        new ExitCmd(new IntLiteral(0)),
        new Rem('a witty remark'),
        new New(null),
        new Load(new StringLiteral('./examples/001-hello-world.bas'), true),
        new List(),
        new Save(null),
        new Run(),
        new Let(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 0,
              row: 1,
              offsetStart: 5,
              offsetEnd: 6,
              text: 'i%',
              value: null,
            }),
          ),
          new IntLiteral(1),
        ),
        new ShortIf(
          new BoolLiteral(true),
          [new Print(new StringLiteral('true'))],
          [],
        ),
        new ShortIf(
          new BoolLiteral(true),
          [new Print(new StringLiteral('true'))],
          [new Print(new StringLiteral('false'))],
        ),
        new If(
          new BoolLiteral(true),
          [
            new Line(20, 1, '20   print "true"', [
              new Print(new StringLiteral('hello world')),
            ]),
          ],
          [],
        ),
        new If(
          new BoolLiteral(true),
          [
            new Line(20, 1, '20   print "true"', [
              new Print(new StringLiteral('hello world')),
            ]),
          ],
          [
            new Line(20, 1, '20   print "false"', [
              new Print(new StringLiteral('hello world')),
            ]),
          ],
        ),
        new If(
          new BoolLiteral(true),
          [
            new Line(20, 1, '20   print "true"', [
              new Print(new StringLiteral('true')),
            ]),
          ],
          new If(
            new BoolLiteral(true),
            [
              new Line(20, 1, '40   print "false, but true"', [
                new Print(new StringLiteral('false, but true')),
              ]),
            ],
            [],
          ),
        ),
      ];

      for (const cmd of COMMANDS) {
        t.matchSnapshot(formatter.format(cmd));
      }
    });

    t.test('it formats a native value', async (t: Test) => {
      t.matchSnapshot(formatter.format(new Set('abc')));
    });

    t.test('it formats a null value', async (t: Test) => {
      t.matchSnapshot(formatter.format(null));
    });

    t.test('it formats an undefined value', async (t: Test) => {
      t.matchSnapshot(formatter.format(undefined));
    });

    t.test('it formats an array of values', async (t: Test) => {
      t.matchSnapshot(formatter.format([1, 'two', true]));
    });
  });
}

for (const ctor of [DefaultFormatter, Inspector]) {
  formatTestSuite(new ctor());
}
