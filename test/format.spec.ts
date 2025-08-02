import * as assert from 'assert';

import { describe, test } from 'vitest';
import { t } from './helpers/tap';

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
import { Source } from '../ast/source';
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
  Exit as ExitInstr,
  Rem,
  New,
  Load,
  List,
  Save,
  Run,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
  For,
  Next,
  EndFor,
  While,
  EndWhile,
  Repeat,
  Until,
  End,
} from '../ast/instr';
import { Line, Program } from '../ast';
import { FILENAME } from './helpers/files';
import { scrubNodeVersion } from './helpers/format';
import { TRACEBACK } from './helpers/traceback';

const LINE = '100 print someFn(ident';
const IS_LINE = [true, false];

describe('inspectString', () => {
  test('it inspects strings without quotes', () => {
    t.equal(inspectString('hello'), "'hello'");
  });
  test('it inspects strings with single quotes', () => {
    t.equal(inspectString("don't"), '"don\'t"');
  });

  test('it inspects strings with double quotes', () => {
    t.equal(inspectString('"time machine"'), '\'"time machine"\'');
  });

  test('it inspects strings with both kinds of quotes', () => {
    t.equal(
      inspectString('don\'t mess with my "time machine"'),
      "'don\\'t mess with my \"time machine\"'",
    );
  });
});

function formatTestSuite<F extends Formatter>(formatter: F): void {
  describe(`given a ${formatter.constructor.name}`, () => {
    test('it formats a string', () => {
      t.matchSnapshot(formatter.format('hello'));
    });

    test('it formats a number', () => {
      t.matchSnapshot(formatter.format(12345));
    });

    test('it formats a boolean', () => {
      t.matchSnapshot(formatter.format(true));
    });

    test('it formats a Traceback', () => {
      t.matchSnapshot(formatter.format(TRACEBACK));
    });

    for (const ctor of [
      BaseException,
      Exception,
      RuntimeError,
      NotImplementedError,
    ]) {
      test(`it formats a ${ctor.prototype.name}`, () => {
        t.matchSnapshot(formatter.format(new ctor('message', TRACEBACK)));
      });
    }

    test('it formats a BaseWarning', () => {
      t.matchSnapshot(formatter.format(new BaseWarning('message', TRACEBACK)));
    });

    test('it formats a BaseWarning without a traceback', () => {
      t.matchSnapshot(formatter.format(new BaseWarning('message', null)));
    });

    test('it formats an AssertionError', () => {
      t.matchSnapshot(
        formatter.format(new AssertionError('message', TRACEBACK)),
      );
    });

    test('it formats a TypeError', () => {
      t.matchSnapshot(
        formatter.format(
          new TypeError('message', 123, 'integer', 'nil', TRACEBACK),
        ),
      );
    });

    test('it formats a ZeroDivisionError', () => {
      t.matchSnapshot(
        formatter.format(
          new ZeroDivisionError(1, 'integer', 0, 'integer', TRACEBACK),
        ),
      );
    });

    test('it formats an OsError', () => {
      t.matchSnapshot(
        formatter.format(
          new OsError('message', ErrorCode.AddressInUse, null, TRACEBACK),
        ),
      );
    });

    test('it formats a FileError with one file', () => {
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

    test('it formats a FileError with two files', () => {
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
      describe(`when it ${isLine ? 'is' : 'is not'} a line`, () => {
        const line = isLine
          ? Source.command(LINE)
          : Source.command(LINE.replace(/^\d+ /, ''));
        test('it formats a SyntaxError', () => {
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

        test('it formats a ParseError', () => {
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

        test('it formats a SyntaxWarning', () => {
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

        test('it formats a ParseWarning', () => {
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

    test('it formats a BaseFault', () => {
      t.matchSnapshot(formatter.format(new BaseFault('message', TRACEBACK)));
    });

    test('it formats a RuntimeFault', () => {
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

    test('it formats a UsageFault', () => {
      t.matchSnapshot(formatter.format(new UsageFault('Usage: lol')));
    });

    test('it formats an Exit with a message', () => {
      t.matchSnapshot(formatter.format(new Exit(ExitCode.Success, 'message')));
    });

    test('it formats an Exit without message', () => {
      t.matchSnapshot(formatter.format(new Exit(ExitCode.Success)));
    });

    test('it formats a Token', () => {
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

    test('it formats a Unary expression', () => {
      t.matchSnapshot(
        formatter.format(new Unary(TokenKind.Minus, new IntLiteral(1))),
      );
    });

    test('it formats a Binary expression', () => {
      t.matchSnapshot(
        formatter.format(
          new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
        ),
      );
    });

    test.todo('it formats a Logical expression', () => {
      /*
      t.matchSnapshot(formatter.format(new Logical(
        new IntLiteral(1),
        TokenKind.And,
        new IntLiteral(1)
      )));
      */
    });

    test('it formats an IntLiteral', () => {
      t.matchSnapshot(formatter.format(new IntLiteral(12)));
    });

    test('it formats a RealLiteral', () => {
      t.matchSnapshot(formatter.format(new RealLiteral(123.456)));
    });

    test('it formats a BoolLiteral', () => {
      t.matchSnapshot(formatter.format(new BoolLiteral(true)));
    });

    test('it formats a StringLiteral', () => {
      t.matchSnapshot(formatter.format(new StringLiteral('hello')));
    });

    test('it formats a PromptLiteral', () => {
      t.matchSnapshot(formatter.format(new PromptLiteral('\\u@\\h:\\w\\$')));
    });

    test('it formats a NilLiteral', () => {
      t.matchSnapshot(formatter.format(new NilLiteral()));
    });

    test('it formats a Instr', () => {
      t.matchSnapshot(formatter.format(new Print(new StringLiteral('hello'))));
    });

    test('it formats a Line', () => {
      t.matchSnapshot(
        formatter.format(
          new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
            new Print(new StringLiteral('hello world')),
          ]),
        ),
      );
    });

    test('it formats a Program', () => {
      t.matchSnapshot(
        formatter.format(
          new Program(FILENAME, [
            new Line(
              100,
              1,
              new Source('', '100', ' ', 'print "hello world"'),
              [new Print(new StringLiteral('hello world'))],
            ),
          ]),
        ),
      );
    });

    test('instructions', () => {
      const INSTRUCTIONS = [
        new Print(new StringLiteral('hello')),
        new ExitInstr(new IntLiteral(0)),
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
        new Assign(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 0,
              row: 1,
              offsetStart: 0,
              offsetEnd: 1,
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
        new If(new BoolLiteral(true)),
        new Else(),
        new ElseIf(new BoolLiteral(true)),
        new EndIf(),
        new For(
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
        new Next(),
        new EndFor(),
        new While(new BoolLiteral(true)),
        new EndWhile(),
        new Repeat(),
        new Until(new BoolLiteral(false)),
        new End(),
      ];

      for (const instr of INSTRUCTIONS) {
        t.matchSnapshot(formatter.format(instr));
      }
    });

    test('it formats a native value', () => {
      t.matchSnapshot(formatter.format(new Set('abc')));
    });

    test('it formats a null value', () => {
      t.matchSnapshot(formatter.format(null));
    });

    test('it formats an undefined value', () => {
      t.matchSnapshot(formatter.format(undefined));
    });

    test('it formats an array of values', () => {
      t.matchSnapshot(formatter.format([1, 'two', true]));
    });
  });
}

for (const ctor of [DefaultFormatter, Inspector]) {
  formatTestSuite(new ctor());
}
