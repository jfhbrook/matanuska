import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { ParseWarning } from '../exceptions';
import { formatter } from '../format';
import { Source } from '../ast/source';
import {
  Binary,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../ast/expr';
import {
  Instr,
  Print,
  Exit,
  Expression,
  Rem,
  Load,
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
} from '../ast/instr';
import { Cmd, Line, Input, Program } from '../ast';
import { Token, TokenKind } from '../tokens';
import { throws } from './helpers/exceptions';
import { FILENAME } from './helpers/files';
import { parseInput, parseProgram } from './helpers/parser';

const EXPRESSIONS: Array<[string, Instr]> = [
  // NOTE: '1' parses as a line number.
  ['0xff', new Expression(new IntLiteral(255), 0, 4)],
  ['0o755', new Expression(new IntLiteral(493), 0, 5)],
  ['0b01', new Expression(new IntLiteral(1), 0, 4)],
  ['123.456', new Expression(new RealLiteral(123.456), 0, 7)],
  ['true', new Expression(new BoolLiteral(true), 0, 4)],
  ['false', new Expression(new BoolLiteral(false), 0, 5)],
  ['nil', new Expression(new NilLiteral(), 0, 3)],
  ['"hello world"', new Expression(new StringLiteral('hello world'), 0, 13)],
  ["'hello world'", new Expression(new StringLiteral('hello world'), 0, 13)],
  [
    '"\\"time machine\\""',
    new Expression(new StringLiteral('"time machine"'), 0, 18),
  ],
  ["'don\\'t'", new Expression(new StringLiteral("don't"), 0, 8)],
  ['(1)', new Expression(new Group(new IntLiteral(1)), 0, 3)],
  [
    '(1 == 1)',
    new Expression(
      new Group(
        new Binary(new IntLiteral(1), TokenKind.EqEq, new IntLiteral(1)),
      ),
      0,
      8,
    ),
  ],
  [
    '(1 <> 1)',
    new Expression(
      new Group(new Binary(new IntLiteral(1), TokenKind.Ne, new IntLiteral(1))),
      0,
      8,
    ),
  ],
];

const WARNED_EXPRESSIONS: Array<[string, Instr]> = [
  [
    '(1 = 1)',
    new Expression(
      new Group(
        new Binary(new IntLiteral(1), TokenKind.EqEq, new IntLiteral(1)),
      ),
      0,
      7,
    ),
  ],
  [
    '(1 != 1)',
    new Expression(
      new Group(new Binary(new IntLiteral(1), TokenKind.Ne, new IntLiteral(1))),
      0,
      8,
    ),
  ],
];

const IDENT_EXPRESSIONS: Array<[string, Expression]> = [
  [
    'i%',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.IntIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i%',
          value: 'i%',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i!',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.RealIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i!',
          value: 'i!',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i?',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.BoolIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i?',
          value: 'i?',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i$',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.StringIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i$',
          value: 'i$',
        }),
      ),
      0,
      2,
    ),
  ],
];

for (const [source, instr] of EXPRESSIONS) {
  test(`non-numbered expression ${source}`, () => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  test(`numbered expression ${source}`, () => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    instr.offsetStart += 4;
    instr.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
  });
}

for (const [source, instr] of WARNED_EXPRESSIONS) {
  test(`non-numbered expression ${source}`, () => {
    const result = parseInput(source);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  test(`numbered expression ${source}`, () => {
    const result = parseInput(`100 ${source}`);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    instr.offsetStart += 4;
    instr.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
  });
}

for (const [source, instr] of IDENT_EXPRESSIONS) {
  test(`non-numbered expression ${source}`, () => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  test(`numbered expression ${source}`, () => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    instr.offsetStart += 4;
    instr.offsetEnd += 4;
    (instr.expression as any).ident.index += 4;
    (instr.expression as any).ident.offsetStart += 4;
    (instr.expression as any).ident.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
    (instr.expression as any).ident.index -= 4;
    (instr.expression as any).ident.offsetStart -= 4;
    (instr.expression as any).ident.offsetEnd -= 4;
  });
}

test('non-numbered invalid string escape', () => {
  const source = "'\\q'";
  const result = parseInput(source);

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Expression(new StringLiteral('\\q'), 0, 4),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});

test('numbered invalid string escape', () => {
  const source = "100 '\\q'";
  const result = parseInput(source);

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([
      new Line(100, 1, new Source('', '100', ' ', "'\\q'"), [
        new Expression(new StringLiteral('\\q'), 4, 8),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});

describe('print instruction', () => {
  test('non-numbered', () => {
    const source = 'print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new StringLiteral('hello world'), 0, 19),
        ]),
      ]),
    );
  });

  test('numbered', () => {
    const source = '100 print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 4, 23),
        ]),
      ]),
    );
  });

  test('non-numbered, without arguments', () => {
    throws(() => {
      parseInput('print');
    });
  });

  test('numbered, without arguments', () => {
    throws(() => {
      parseInput('100 print');
    });
  });
});

describe('exit instruction', () => {
  test('non-numbered', () => {
    const source = 'exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Exit(new IntLiteral(0), 0, 6),
        ]),
      ]),
    );
  });

  test('numbered', () => {
    const source = '100 exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'exit 0'), [
          new Exit(new IntLiteral(0), 4, 10),
        ]),
      ]),
    );
  });

  test('non-numbered, without arguments', () => {
    const source = 'exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new Exit(null, 0, 4)]),
      ]),
    );
  });

  test('numbered, without arguments', () => {
    const source = '100 exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'exit'), [
          new Exit(null, 4, 8),
        ]),
      ]),
    );
  });
});

describe('remarks', () => {
  test('bare remark', () => {
    const source = 'rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Rem('this is a comment', 0, 21),
        ]),
      ]),
    );
  });

  test('bare, empty remark', () => {
    const source = 'rem';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [new Rem('', 0, 3)])]),
    );
  });

  test('bare semicolong', () => {
    const source = ';';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [new Rem('', 0, 1)])]),
    );
  });

  test('remark following a instruction', () => {
    const source = 'print 1 rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 8, 29),
        ]),
      ]),
    );
  });

  test('remark as a second instruction', () => {
    const source = 'print 1 : rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 10, 31),
        ]),
      ]),
    );
  });
});

describe('load', () => {
  test('load with filename', () => {
    const source = 'load "./examples/001-hello-world.bas"';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            new StringLiteral('./examples/001-hello-world.bas'),
            false,
            0,
            37,
          ),
        ]),
      ]),
    );
  });

  test('load with filename and --run', () => {
    const source = 'load "./examples/001-hello-world.bas" --run';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            new StringLiteral('./examples/001-hello-world.bas'),
            true,
            0,
            43,
          ),
        ]),
      ]),
    );
  });

  test('load with filename and --no-run', () => {
    const source = 'load "./examples/001-hello-world.bas" --no-run';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            new StringLiteral('./examples/001-hello-world.bas'),
            false,
            0,
            46,
          ),
        ]),
      ]),
    );
  });

  test('load with no filename', () => {
    const source = 'load';
    throws(() => {
      parseInput(source);
    });
  });

  test('load with two positional arguments', () => {
    const source = 'load "./examples/001-hello-world.bas" "extra"';
    throws(() => {
      parseInput(source);
    });
  });
});

test('let', () => {
  const source = 'let i% = 1';
  const result = parseInput(source);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Let(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 4,
              row: 1,
              offsetStart: 4,
              offsetEnd: 6,
              text: 'i%',
              value: 'i%',
            }),
          ),
          new IntLiteral(1),
          0,
          10,
        ),
      ]),
    ]),
  );
});

test('assign', () => {
  const source = 'i% = 1';
  const result = parseInput(source);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Assign(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 0,
              row: 1,
              offsetStart: 0,
              offsetEnd: 2,
              text: 'i%',
              value: 'i%',
            }),
          ),
          new IntLiteral(1),
          0,
          6,
        ),
      ]),
    ]),
  );
});

describe('short if', () => {
  test('full short if', () => {
    const source = 'if true then print "true" else print "false" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [new Print(new StringLiteral('false'), 31, 44)],
            0,
            50,
          ),
        ]),
      ]),
    );
  });

  test('no-else short if', () => {
    const source = 'if true then print "true" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [],
            0,
            31,
          ),
        ]),
      ]),
    );
  });

  test('nested then/if in short if', () => {
    const source =
      'if true then if false then print "true and false" endif else print "false" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [
              new ShortIf(
                new BoolLiteral(false),
                [new Print(new StringLiteral('true and false'), 27, 49)],
                [],
                13,
                55,
              ),
            ],
            [new Print(new StringLiteral('false'), 61, 74)],
            0,
            80,
          ),
        ]),
      ]),
    );
  });

  test('nested else/if in short if', () => {
    const source =
      'if true then print "true" else if false then print "false and false" endif endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [
              new ShortIf(
                new BoolLiteral(false),
                [new Print(new StringLiteral('false and false'), 45, 68)],
                [],
                31,
                74,
              ),
            ],
            0,
            80,
          ),
        ]),
      ]),
    );
  });
});

describe('long if', () => {
  test('if/endif', () => {
    const source = ['10 if true then', '20   print "true"', '30 endif'];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });

  test('if/else/endif', () => {
    const source = [
      '10 if true then',
      '20   print "true"',
      '30 else',
      '40   print "false"',
      '50 endif',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'else'), [new Else(3, 7)]),
        new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
          new Print(new StringLiteral('false'), 5, 18),
        ]),
        new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });

  test('if/elseif/endif', () => {
    const source = [
      '10 if true then',
      '20   print "true"',
      '30 else if false then',
      '40   print "false"',
      '50 endif',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'else if false then'), [
          new ElseIf(new BoolLiteral(false), 3, 21),
        ]),
        new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
          new Print(new StringLiteral('false'), 5, 18),
        ]),
        new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });
});

describe('for', () => {
  test('without step', () => {
    const source = [
      '10 for i% = 0 to 9',
      '20   print "hello world"',
      '30   next',
      '40 endfor',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'for i% = 0 to 9'), [
          new For(
            new Variable(
              new Token({
                kind: TokenKind.IntIdent,
                index: 7,
                row: 1,
                offsetStart: 7,
                offsetEnd: 9,
                text: 'i%',
                value: 'i%',
              }),
            ),
            new IntLiteral(0),
            new IntLiteral(9),
            null,
            3,
            18,
          ),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 5, 24),
        ]),
        new Line(30, 3, new Source('', '30', '   ', 'next'), [new Next(5, 9)]),
        new Line(40, 4, new Source('', '40', ' ', 'endfor'), [
          new EndFor(3, 9),
        ]),
      ]),
    );
  });

  test('with step', () => {
    const source = [
      '10 for i% = 0 to 9 step 2',
      '20   print "hello world"',
      '30 endfor',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'for i% = 0 to 9 step 2'), [
          new For(
            new Variable(
              new Token({
                kind: TokenKind.IntIdent,
                index: 7,
                row: 1,
                offsetStart: 7,
                offsetEnd: 9,
                text: 'i%',
                value: 'i%',
              }),
            ),
            new IntLiteral(0),
            new IntLiteral(9),
            new IntLiteral(2),
            3,
            25,
          ),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 5, 24),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'endfor'), [
          new EndFor(3, 9),
        ]),
      ]),
    );
  });
});

test('while', () => {
  const source = ['10 while true', '20   print "true"', '30 endwhile'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'while true'), [
        new While(new BoolLiteral(true), 3, 13),
      ]),
      new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
        new Print(new StringLiteral('true'), 5, 17),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'endwhile'), [
        new EndWhile(3, 11),
      ]),
    ]),
  );
});

test('repeat/until', () => {
  const source = ['10 repeat', '20   print "true"', '30 until false'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'repeat'), [new Repeat(3, 9)]),
      new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
        new Print(new StringLiteral('true'), 5, 17),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'until false'), [
        new Until(new BoolLiteral(false), 3, 14),
      ]),
    ]),
  );
});

test('empty input', () => {
  const result = parseInput('');

  t.equal(result[1], null);

  t.same(result[0], new Input([]));
});

test('empty line', () => {
  const source = '100';
  const result = parseInput(source);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([new Line(100, 1, new Source('', '100', '', ''), [])]),
  );
});

test('multiple inputs', () => {
  const source = ['100 print "hello world"', '"foo"', '200 print "goodbye"'];
  const result = parseInput(source.join('\n'));

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([
      new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Cmd(10, 2, Source.command('"foo"'), [
        new Expression(new StringLiteral('foo'), 0, 5),
      ]),
      new Line(200, 3, new Source('', '200', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
    ]),
  );
});

// TODO: This error just says "unexpected token". If we can detect when a
// failed expression is immediately following a line number, we should be able
// to show a better error. The trace is basically:
//
// - successfully parse line number
// - attempt to parse instructions
// - parse the *first* instruction
// - fall through to an expression statement
// - fail to parse a valid expression statement
//
// We would need to track that we just parsed a line number (isLine), that
// we're parsing the very first instruction, and that we're parsing an expression
// statement. That's a boatload of state, but I think it's doable.
test('bare expression starting with an integer', () => {
  throws(() => {
    parseInput('1 + 1');
  });
});

test('simple program', () => {
  const source = ['100 print "hello world"', '200 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Line(200, 2, new Source('', '200', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
    ]),
  );
});

test('out of order program', () => {
  const source = ['200 print "hello world"', '100 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.matchSnapshot(formatter.format(result[1]));

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 2, new Source('', '100', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
      new Line(200, 1, new Source('', '200', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
    ]),
  );
});

test('program with non-numbered input', () => {
  throws(() => {
    parseProgram(
      '100 print "hello world"\n"foo"\n200 print "goodbye"',
      FILENAME,
    );
  });
});

test('program with a negative line number', () => {
  throws(() => {
    parseProgram(
      '100 print "hello world"\n-100 "foo"\n200 print "goodbye"',
      FILENAME,
    );
  });
});

test('accidentally an entire semicolon', () => {
  throws(() => {
    parseInput('print 1 + 1;');
  });
});
