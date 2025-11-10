import { RuntimeFault } from './faults';
import { Token, TokenKind } from './tokens';
import { Value } from './value';

export const KEYWORDS: Record<string, TokenKind> = {
  true: TokenKind.TrueLiteral,
  false: TokenKind.FalseLiteral,
  nil: TokenKind.NilLiteral,

  and: TokenKind.And,
  or: TokenKind.Or,
  not: TokenKind.Not,

  // loading, saving, running etc
  new: TokenKind.New,
  load: TokenKind.Load,
  save: TokenKind.Save,
  list: TokenKind.List,
  renum: TokenKind.Renum,
  run: TokenKind.Run,
  end: TokenKind.End,
  exit: TokenKind.Exit,
  // bload: TokenKind.BLoad,
  // bsave: TokenKind.BSave,
  // resume execution of a paused program
  // cont: TokenKind.Cont,
  // delete: TokenKind.Delete,
  // merge: TokenKind.Merge,
  // restore: TokenKind.Restore,
  // renum: TokenKind.Renum,

  // variable definitions
  let: TokenKind.Let,

  // conditionals
  if: TokenKind.If,
  then: TokenKind.Then,
  else: TokenKind.Else,
  endif: TokenKind.EndIf,

  // looping
  for: TokenKind.For,
  to: TokenKind.To,
  step: TokenKind.Step,
  onward: TokenKind.Onward,
  next: TokenKind.Next,
  while: TokenKind.While,
  endwhile: TokenKind.EndWhile,
  repeat: TokenKind.Repeat,
  until: TokenKind.Until,

  // shell operations
  cd: TokenKind.Cd,
  cp: TokenKind.Cp,
  rm: TokenKind.Rm,
  touch: TokenKind.Touch,
  mv: TokenKind.Mv,
  mkdir: TokenKind.MkDir,
  rmdir: TokenKind.RmDir,
  pwd: TokenKind.Pwd,

  // TODO: error handling
  // TODO: datetime
  // TODO: array operations
  // TODO: file operations, i/o
  print: TokenKind.Print,
  // TODO: internals
  // TODO: clear screen
  // cls: TokenKind.Cls,
  // TODO: prompt, as in SET PROMPT
  // TODO: shell stuff
  // TODO:  events and lifecycle
  // TODO: modules
  // TODO: contexts (with, using)
};

export const EOF = '\0';

const WHITESPACE = /[\r\t ]/;

function isWhitespace(c: string): boolean {
  return c.match(WHITESPACE) !== null;
}

const DECIMAL_DIGITS = /[0123456789]/;

function isDecimalDigit(c: string): boolean {
  return c.match(DECIMAL_DIGITS) !== null;
}

const HEX_DIGITS = /[0123456789abcdef]/i;

function isHexDigit(c: string): boolean {
  return c.match(HEX_DIGITS) !== null;
}

const OCTAL_DIGITS = /[012345678]/;

function isOctalDigit(c: string): boolean {
  return c.match(OCTAL_DIGITS) != null;
}

const BINARY_DIGITS = /[01]/;

function isBinaryDigit(c: string): boolean {
  return c.match(BINARY_DIGITS) != null;
}

const ALPHA = /[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]/;

function isAlpha(c: string): boolean {
  return c.match(ALPHA) != null;
}

function isAlphaNumeric(c: string): boolean {
  return isAlpha(c) || isDecimalDigit(c);
}

const ILLEGAL_SHELL_CHARS = /[`#$&*()|[\]{}:\\'"<>?!]/;

function isIllegalShellChar(c: string): boolean {
  return c.match(ILLEGAL_SHELL_CHARS) != null;
}

const ILLEGAL_TOKEN_BOUNDARY = /\r\t\n /;

function isIllegalTokenBoundary(c: string): boolean {
  return c.match(ILLEGAL_TOKEN_BOUNDARY) != null;
}

/**
 * A scanner. Takes a source string and incrementally provides tokens until
 * the source is exhausted.
 */
export class Scanner {
  readonly filename: string;

  private start: number;
  private current: number;
  private row: number;
  private offset: number;

  /**
   * @param source The source string.
   */
  constructor(
    private source: string,
    filename?: string,
  ) {
    this.filename = filename ? filename : '<unknown>';
    this.start = 0;
    this.current = 0;
    this.row = 1;
    this.offset = 0;
  }

  get done(): boolean {
    return this.current >= this.source.length;
  }

  private match(expected: string): boolean {
    if (this.done) return false;
    if (this.source[this.current] != expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    if (this.done) return EOF;
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return EOF;
    return this.source[this.current + 1];
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private emitToken(kind: TokenKind, value: Value | null = null): Token {
    const text = this.source.slice(this.start, this.current);
    const row = this.row;
    const offsetStart = this.offset;
    const offsetEnd = this.offset + (this.current - this.start);

    if (kind === TokenKind.LineEnding) {
      this.offset = 0;
      this.row++;
    } else {
      this.offset += this.current - this.start;
    }

    return new Token({
      kind,
      index: this.start,
      row,
      offsetStart,
      offsetEnd,
      text,
      value,
    });
  }

  nextToken(): Token {
    this.start = this.current;

    if (this.done) {
      return this.emitToken(TokenKind.Eof);
    }

    const c: string = this.advance();
    switch (c) {
      case '\r':
      case '\t':
      case ' ':
        return this.whitespace();
      case '(':
        return this.emitToken(TokenKind.LParen);
      case ')':
        return this.emitToken(TokenKind.RParen);
      case ',':
        return this.emitToken(TokenKind.Comma);
      case ';':
        return this.emitToken(TokenKind.Semicolon);
      case ':':
        return this.emitToken(TokenKind.Colon);
      case '.':
        return this.emitToken(TokenKind.Dot);
      case '+':
        return this.emitToken(TokenKind.Plus);
      case '-':
        return this.emitToken(TokenKind.Minus);
      case '*':
        return this.emitToken(TokenKind.Star);
      case '%':
        return this.emitToken(TokenKind.Percent);
      case '$':
        return this.emitToken(TokenKind.Dollar);
      case '!':
        if (this.match('=')) {
          return this.emitToken(TokenKind.BangEq);
        }
        return this.emitToken(TokenKind.Bang);
      case '/':
        return this.emitToken(TokenKind.Slash);
      case '\\':
        return this.emitToken(TokenKind.BSlash);
      case '=':
        if (this.match('=')) {
          return this.emitToken(TokenKind.EqEq);
        }
        return this.emitToken(TokenKind.Eq);
      case '>':
        if (this.match('=')) {
          return this.emitToken(TokenKind.Ge);
        }
        return this.emitToken(TokenKind.Gt);
      case '<':
        if (this.match('>')) {
          return this.emitToken(TokenKind.Ne);
        } else if (this.match('=')) {
          return this.emitToken(TokenKind.Le);
        }
        return this.emitToken(TokenKind.Lt);
      case '#':
        return this.emitToken(TokenKind.Hash);
      case '"':
        return this.string('"');
      case "'":
        return this.string("'");
      case '\n':
        return this.emitToken(TokenKind.LineEnding);
      case '0':
        if (this.match('x')) {
          return this.hex();
        } else if (this.match('o')) {
          return this.octal();
        } else if (this.match('b')) {
          return this.binary();
        }
        return this.decimal();
      case 'r':
        // Remarks
        if (this.peek() === 'e' && this.peekNext() === 'm') {
          return this.rem();
        }
      // Fall through to default handling
      default:
        if (isDecimalDigit(c)) {
          return this.decimal();
        } else if (isAlpha(c) || c === '_') {
          return this.identifier();
        } else if (isIllegalShellChar(c)) {
          return this.illegal();
        } else {
          return this.shell();
        }
    }
  }

  private whitespace(): Token {
    while (isWhitespace(this.peek())) {
      this.advance();
    }
    const value = this.source.slice(this.start, this.current);
    return this.emitToken(TokenKind.Whitespace, value);
  }

  //
  // Various value scanners.
  //

  private string(quoteChar: '"' | "'"): Token {
    let value: string = quoteChar;
    while (![quoteChar, '\n', '\r'].includes(this.peek()) && !this.done) {
      const c: string = this.advance();
      value += c;

      if (c === '\\') {
        value += this.advance();
      }
    }

    if (this.peek() !== quoteChar) {
      return this.emitToken(TokenKind.UnterminatedStringLiteral, value);
    }

    value += quoteChar;

    this.advance();

    return this.emitToken(TokenKind.StringLiteral, value);
  }

  private hex(): Token {
    while ((this.peek() === '_' || isHexDigit(this.peek())) && !this.done) {
      this.advance();
    }
    let value: number;
    try {
      value = parseInt(this.source.slice(this.start + 2, this.current), 16);
    } catch (err) {
      throw new RuntimeFault('Invalid hex literal', err);
    }
    return this.emitToken(TokenKind.HexLiteral, value);
  }

  private octal(): Token {
    while ((this.peek() === '_' || isOctalDigit(this.peek())) && !this.done) {
      this.advance();
    }
    let value: number;
    try {
      value = parseInt(this.source.slice(this.start + 2, this.current), 8);
    } catch (err) {
      throw new RuntimeFault('Invalid octal literal', err);
    }
    return this.emitToken(TokenKind.OctalLiteral, value);
  }

  private binary(): Token {
    while ((this.peek() === '_' || isBinaryDigit(this.peek())) && !this.done) {
      this.advance();
    }
    let value: number;
    try {
      value = parseInt(this.source.slice(this.start + 2, this.current), 16);
    } catch (err) {
      throw new RuntimeFault('Invalid binary literal', err);
    }
    return this.emitToken(TokenKind.BinaryLiteral, value);
  }

  private decimal(): Token {
    let isReal = false;
    while ((this.peek() === '_' || isDecimalDigit(this.peek())) && !this.done) {
      this.advance();
    }

    if (
      this.peek() === '.' &&
      (this.peekNext() === '_' || isDecimalDigit(this.peekNext()))
    ) {
      isReal = true;
      this.advance();
    }

    while ((this.peek() === '_' || isDecimalDigit(this.peek())) && !this.done) {
      this.advance();
    }

    if (
      this.peek() === 'e' &&
      (this.peek() === '_' || isDecimalDigit(this.peekNext()))
    ) {
      isReal = true;
      this.advance();
    }

    while ((this.peek() === '_' || isDecimalDigit(this.peek())) && !this.done) {
      this.advance();
    }

    let value: number;
    try {
      if (isReal) {
        value = parseFloat(this.source.slice(this.start, this.current));
        return this.emitToken(TokenKind.RealLiteral, value);
      }
      value = parseInt(this.source.slice(this.start, this.current), 10);
      return this.emitToken(TokenKind.DecimalLiteral, value);
    } catch (err) {
      throw new RuntimeFault('Invalid decimal literal', err);
    }
  }

  // If a token is a valid identifier, we parse it as such. However, if it
  // isn't a valid identifier but doesn't contain illegal characters, we
  // scan it as a shell token.
  //

  private identifier(): Token {
    while (true) {
      const c = this.peek();
      if (isAlphaNumeric(c) || c === '_') {
        this.advance();
      } else {
        break;
      }
    }

    let kind: TokenKind;
    let value = this.source.slice(this.start, this.current);
    switch (this.peek()) {
      case '%':
        kind = TokenKind.IntIdent;
        value += this.advance();
        break;
      case '!':
        kind = TokenKind.RealIdent;
        value += this.advance();
        break;
      case '?':
        kind = TokenKind.BoolIdent;
        value += this.advance();
        break;
      case '$':
        kind = TokenKind.StringIdent;
        value += this.advance();
        break;
      default:
        if (KEYWORDS[value]) {
          kind = KEYWORDS[value];
        } else {
          kind = TokenKind.Ident;
        }
        break;
    }

    return this.emitToken(kind, value);
  }

  private rem(): Token {
    this.advance();
    this.advance();
    if (
      this.match(' ') ||
      this.match('\t') ||
      this.peek() === '\n' ||
      this.peek() === EOF
    ) {
      while (this.peek() !== '\n' && !this.done) {
        this.advance();
      }

      // The contents of the remark
      const value = this.source.slice(this.start + 3, this.current).trim();

      return this.emitToken(TokenKind.Rem, value);
    } else {
      return this.identifier();
    }
  }

  private shell(): Token {
    while (!this.done) {
      const c = this.peek();
      if (isIllegalShellChar(c) || isWhitespace(c)) {
        break;
      }
      this.advance();
    }

    const value = this.source.slice(this.start, this.current);
    return this.emitToken(TokenKind.ShellToken, value);
  }

  private illegal(): Token {
    while (!isIllegalTokenBoundary(this.peek()) && !this.done) {
      this.advance();
    }
    const value = this.source.slice(this.start, this.current);
    return this.emitToken(TokenKind.Illegal, value);
  }
}
