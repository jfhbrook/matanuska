import { Formatter, Formattable } from './format';
import { Value } from './value';

export enum TokenKind {
  LParen = '(',
  RParen = ')',
  Comma = ',',
  Semicolon = ';',
  Colon = ':',
  Dot = '.',

  Plus = '+',
  Minus = '-',
  Star = '*',
  Percent = '%',
  Dollar = '$',
  Hash = '#',
  Bang = '!',
  Slash = '/',
  BSlash = '\\',

  Eq = '=',
  EqEq = '==',
  Gt = '>',
  Lt = '<',
  Ge = '>=',
  Le = '<=',
  Ne = '<>',
  BangEq = '!=',

  And = 'and',
  Or = 'or',
  Not = 'not',

  DecimalLiteral = '<decimal>',
  HexLiteral = '<hex>',
  OctalLiteral = '<octal>',
  BinaryLiteral = '<binary>',

  RealLiteral = '<real>',

  TrueLiteral = 'true',
  FalseLiteral = 'false',

  StringLiteral = '<string>',

  NilLiteral = 'nil',

  Ident = '<ident>',

  IntIdent = '<ident%>',
  RealIdent = '<ident!>',
  BoolIdent = '<ident?>',
  StringIdent = '<ident$>',

  LongFlag = '--<flag>',
  ShellToken = '<shell>',

  New = 'new',
  Load = 'load',
  Save = 'save',
  List = 'list',
  Renum = 'renum',
  Run = 'run',
  End = 'end',
  Exit = 'exit',

  Let = 'let',

  If = 'if',
  Then = 'then',
  Else = 'else',
  EndIf = 'endif',

  For = 'for',
  To = 'to',
  Step = 'step',
  Onward = 'onward',
  Next = 'next',
  While = 'while',
  EndWhile = 'endwhile',
  Repeat = 'repeat',
  Until = 'until',

  Def = 'def',
  Return = 'return',
  EndDef = 'enddef',

  /*
  GoSub = 'gosub',
  GoTo = 'goto',

  Erl = 'erl',
  Err = 'err',
  Error = 'error',
  Resume = 'resume',

  Date = 'date',
  Time = 'time',
  */

  Print = 'print',

  /*
  Cls = 'cls',
  Export = 'export',
  Provide = 'provide',
  */

  Rem = '<rem>',
  LineEnding = '\\n',
  Whitespace = '<whitespace>',

  Eof = '<EOF>',
  Illegal = '<illegal>',
  UnterminatedStringLiteral = '<unterminated-string>',
}

/**
 * A token.
 */
export interface TokenOptions {
  /**
   * The kind of token.
   */
  kind: TokenKind;

  /**
   * The index of the token in the source string.
   */
  index: number;

  /**
   * The row on which the token resides. This is not the same as the line
   * number, which is handled in the parser.
   */
  row: number;

  /**
   * The column offset on which the token starts.
   */
  offsetStart: number;

  /**
   * The column offset at which the token ends.
   */
  offsetEnd: number;

  /**
   * The original text making up the token.
   */
  text: string;

  /**
   * If applicable, the literal value corresponding to the token.
   */
  value: Value | null;
}

export class Token implements Formattable {
  readonly kind: TokenKind;
  readonly index: number;
  readonly row: number;
  public offsetStart: number;
  public offsetEnd: number;
  readonly text: string;
  readonly value: Value | null;

  constructor(options: TokenOptions) {
    this.kind = options.kind;
    this.index = options.index;
    this.row = options.row;
    this.offsetStart = options.offsetStart;
    this.offsetEnd = options.offsetEnd;
    this.text = options.text;
    this.value = options.value;
  }

  format(formatter: Formatter): string {
    return formatter.formatToken(this);
  }
}
