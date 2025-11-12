import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { KEYWORDS } from '../scanner';
import { TokenKind } from '../tokens';

import { scanTokens } from './helpers/scanner';

//
// Single-token tests. This should at least show that covered tokens can
// be scanned at all.
//

const PUNCTUATION = [
  ['(', TokenKind.LParen],
  [')', TokenKind.RParen],
  [',', TokenKind.Comma],
  [';', TokenKind.Semicolon],
  [':', TokenKind.Colon],
  ['.', TokenKind.Dot],
  ['+', TokenKind.Plus],
  ['-', TokenKind.Minus],
  ['*', TokenKind.Star],
  ['%', TokenKind.Percent],
  ['$', TokenKind.Dollar],
  ['#', TokenKind.Hash],
  ['!', TokenKind.Bang],
  ['/', TokenKind.Slash],
  ['\\', TokenKind.BSlash],
  ['=', TokenKind.Eq],
  ['==', TokenKind.EqEq],
  ['>', TokenKind.Gt],
  ['>=', TokenKind.Ge],
  ['<', TokenKind.Lt],
  ['<=', TokenKind.Le],
  ['<>', TokenKind.Ne],
  ['!=', TokenKind.BangEq],
  ['+', TokenKind.Plus],
  ['-', TokenKind.Minus],
  ['*', TokenKind.Star],
  ['/', TokenKind.Slash],
  ['#', TokenKind.Hash],
];

describe('punctuation', () => {
  for (const [text, kind] of PUNCTUATION) {
    test(text, () => {
      const tokens = scanTokens(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
        text,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        index: text.length,
        row: 1,
        offsetStart: text.length,
        offsetEnd: text.length,
        text: '',
      });
    });
  }
});

describe('keywords', () => {
  for (const [text, kind] of Object.entries(KEYWORDS)) {
    test(`keyword ${text}`, () => {
      const tokens = scanTokens(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
        text,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        index: text.length,
        row: 1,
        offsetStart: text.length,
        offsetEnd: text.length,
        text: '',
      });
    });
  }
});

const STRINGS = [
  '"hello world"',
  "'hello world'",
  '"\\"time machine\\""',
  "'don\\'t'",
];

describe('strings', () => {
  for (const value of STRINGS) {
    test(`it tokenizes ${value}`, () => {
      const tokens = scanTokens(value);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind: TokenKind.StringLiteral,
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: value.length,
        text: value,
        value,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        index: value.length,
        row: 1,
        offsetStart: value.length,
        offsetEnd: value.length,
        text: '',
      });
    });
  }

  test('unterminated string', () => {
    const text = '"hello';
    const tokens = scanTokens(text);
    t.equal(tokens.length, 2);

    t.has(tokens[0], {
      kind: TokenKind.UnterminatedStringLiteral,
      index: 0,
      row: 1,
      offsetStart: 0,
      offsetEnd: text.length,
      text,
    });

    t.has(tokens[1], {
      kind: TokenKind.Eof,
      index: text.length,
      row: 1,
      offsetStart: text.length,
      offsetEnd: text.length,
      text: '',
    });
  });
});

const NUMBERS = [
  ['123', TokenKind.DecimalLiteral],
  ['123_000', TokenKind.DecimalLiteral],
  ['0xfF13', TokenKind.HexLiteral],
  ['0xfF_ab', TokenKind.HexLiteral],
  ['0o715', TokenKind.OctalLiteral],
  ['0o715_000', TokenKind.OctalLiteral],
  ['0b101', TokenKind.BinaryLiteral],
  ['123.456', TokenKind.RealLiteral],
  ['123_000.456', TokenKind.RealLiteral],
  ['123.456e10', TokenKind.RealLiteral],
];

describe('numbers', () => {
  for (const [text, kind] of NUMBERS) {
    test(`it tokenizes ${text}`, () => {
      const tokens = scanTokens(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
        text,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        index: text.length,
        row: 1,
        offsetStart: text.length,
        offsetEnd: text.length,
        text: '',
      });
    });
  }
});

const IDENT = [
  ['_', TokenKind.Ident],
  ['pony', TokenKind.Ident],
  ['_abc123', TokenKind.Ident],
  ['pony%', TokenKind.IntIdent],
  ['pony!', TokenKind.RealIdent],
  ['pony?', TokenKind.BoolIdent],
  ['pony$', TokenKind.StringIdent],
];

describe('identifiers', () => {
  for (const [text, kind] of IDENT) {
    test(`it tokenizes ${text}`, () => {
      const tokens = scanTokens(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
        text,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        index: text.length,
        row: 1,
        offsetStart: text.length,
        offsetEnd: text.length,
        text: '',
      });
    });
  }
});

const SHELL: Array<[string, TokenKind[]]> = [
  ['/', [TokenKind.Slash]],
  ['./', [TokenKind.Dot, TokenKind.Slash]],
  ['..', [TokenKind.Dot, TokenKind.Dot]],
  ['../', [TokenKind.Dot, TokenKind.Dot, TokenKind.Slash]],
  ['./', [TokenKind.Dot, TokenKind.Slash]],
  ['./pony', [TokenKind.Dot, TokenKind.Slash, TokenKind.Ident]],
  ['.\\pony', [TokenKind.Dot, TokenKind.BSlash, TokenKind.Ident]],
  [
    './*.txt',
    [
      TokenKind.Dot,
      TokenKind.Slash,
      TokenKind.Star,
      TokenKind.Dot,
      TokenKind.Ident,
    ],
  ],
  ['-o', [TokenKind.Minus, TokenKind.Ident]],
  [
    '--long-option',
    [
      TokenKind.Minus,
      TokenKind.Minus,
      TokenKind.Ident,
      TokenKind.Minus,
      TokenKind.Ident,
    ],
  ],
];

describe('shell tokens', () => {
  for (const [text, kinds] of SHELL) {
    kinds.push(TokenKind.Eof);
    test(`it tokenizes ${text}`, () => {
      const tokens = scanTokens(text);

      t.same(
        tokens.map((t) => t.kind),
        kinds,
      );

      t.equal(tokens.length, kinds.length);
    });
  }
});

//
// Multi-token tests. These are to show that more interesting scenarios are
// tokenized *as expected* (the prior tests should show they tokenize at all).
//

test('hello world', () => {
  const text = 'print "hello world"';
  const tokens = scanTokens(text);
  t.equal(tokens.length, 3);

  t.has(tokens[0], {
    kind: TokenKind.Print,
    index: 0,
    row: 1,
    offsetStart: 0,
    offsetEnd: 5,
    text: 'print',
  });

  t.has(tokens[1], {
    kind: TokenKind.StringLiteral,
    index: 6,
    row: 1,
    offsetStart: 6,
    offsetEnd: 19,
    text: '"hello world"',
    value: '"hello world"',
  });

  t.has(tokens[2], {
    kind: TokenKind.Eof,
    index: 19,
    row: 1,
    offsetStart: 19,
    offsetEnd: 19,
    text: '',
  });
});

test('function call', () => {
  const text = 'pony(u$, v$)';
  const tokens = scanTokens(text);
  t.equal(tokens.length, 7);

  t.has(tokens[0], {
    kind: TokenKind.Ident,
    text: 'pony',
  });

  t.has(tokens[1], {
    kind: TokenKind.LParen,
    text: '(',
  });

  t.has(tokens[2], {
    kind: TokenKind.StringIdent,
    text: 'u$',
  });

  t.has(tokens[3], {
    kind: TokenKind.Comma,
    text: ',',
  });

  t.has(tokens[4], {
    kind: TokenKind.StringIdent,
    text: 'v$',
  });

  t.has(tokens[5], {
    kind: TokenKind.RParen,
    text: ')',
  });

  t.has(tokens[6], {
    kind: TokenKind.Eof,
    text: '',
  });
});

test('line endings', () => {
  const tokens = scanTokens('\n\n');
  t.equal(tokens.length, 3);

  t.has(tokens[0], {
    kind: TokenKind.LineEnding,
    index: 0,
    row: 1,
    offsetStart: 0,
    offsetEnd: 1,
    text: '\n',
  });

  t.has(tokens[1], {
    kind: TokenKind.LineEnding,
    index: 1,
    row: 2,
    offsetStart: 0,
    offsetEnd: 1,
    text: '\n',
  });

  t.has(tokens[2], {
    kind: TokenKind.Eof,
    index: 2,
    row: 3,
    offsetStart: 0,
    offsetEnd: 0,
    text: '',
  });
});

test('line endings with whitespace', () => {
  const tokens = scanTokens('    \n\n    ');
  t.equal(tokens.length, 3);

  t.has(tokens[0], {
    kind: TokenKind.LineEnding,
    index: 4,
    row: 1,
    offsetStart: 4,
    offsetEnd: 5,
    text: '\n',
  });

  t.has(tokens[1], {
    kind: TokenKind.LineEnding,
    index: 5,
    row: 2,
    offsetStart: 0,
    offsetEnd: 1,
    text: '\n',
  });

  t.has(tokens[2], {
    kind: TokenKind.Eof,
    index: 10,
    row: 3,
    offsetStart: 4,
    offsetEnd: 4,
    text: '',
  });
});

describe('remarks', () => {
  test('bare remark', () => {
    const source = 'rem this is a comment';
    const tokens = scanTokens(source);

    t.equal(tokens.length, 2);

    t.has(tokens[0], {
      kind: TokenKind.Rem,
      index: 0,
      row: 1,
      offsetStart: 0,
      offsetEnd: 21,
      text: 'rem this is a comment',
      value: 'this is a comment',
    });

    t.has(tokens[1], {
      kind: TokenKind.Eof,
      index: 21,
      row: 1,
      offsetStart: 21,
      offsetEnd: 21,
      text: '',
    });
  });

  test('bare, empty remark', () => {
    const source = 'rem';
    const tokens = scanTokens(source);

    t.equal(tokens.length, 2);

    t.has(tokens[0], {
      kind: TokenKind.Rem,
      index: 0,
      row: 1,
      offsetStart: 0,
      offsetEnd: 3,
      text: 'rem',
      value: '',
    });

    t.has(tokens[1], {
      kind: TokenKind.Eof,
      index: 3,
      row: 1,
      offsetStart: 3,
      offsetEnd: 3,
      text: '',
    });
  });

  test('remark following a command', () => {
    const source = 'print 1 rem this is a comment';
    const tokens = scanTokens(source);

    t.equal(tokens.length, 4);

    t.has(tokens[0], {
      kind: TokenKind.Print,
      index: 0,
      row: 1,
      offsetStart: 0,
      offsetEnd: 5,
      text: 'print',
    });

    t.has(tokens[1], {
      kind: TokenKind.DecimalLiteral,
      index: 6,
      row: 1,
      offsetStart: 6,
      offsetEnd: 7,
      text: '1',
      value: 1,
    });

    t.has(tokens[2], {
      kind: TokenKind.Rem,
      index: 8,
      row: 1,
      offsetStart: 8,
      offsetEnd: 29,
      text: 'rem this is a comment',
      value: 'this is a comment',
    });

    t.has(tokens[3], {
      kind: TokenKind.Eof,
      index: 29,
      row: 1,
      offsetStart: 29,
      offsetEnd: 29,
      text: '',
    });
  });
});
