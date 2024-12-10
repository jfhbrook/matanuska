import { showTree } from './debug';
import { errorType } from './errors';
import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
  sortParseError,
} from './exceptions';
import { runtimeMethod } from './faults';
import { Scanner } from './scanner';
import { Token, TokenKind } from './tokens';

import { Source } from './ast/source';
import {
  Expr,
  Binary,
  Logical,
  Unary,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';
import {
  Instr,
  Assign,
  Print,
  Expression,
  Rem,
  New,
  Load,
  List,
  Renum,
  Save,
  Run,
  End,
  Exit,
  Let,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
} from './ast/instr';
import { Cmd, Line, Input, Program } from './ast';
import { sortLines } from './ast/util';

export interface Params {
  arguments: Expr[];
  flags: Record<string, boolean>;
  options: Record<string, Expr>;
}

export interface ParamsSpec {
  arguments?: string[];
  flags?: string[];
  options?: string[];
}

export type ParseResult<T> = [T, ParseWarning | null];
export type Row = Line | Cmd;

// The alternative to using exceptions is to set a panicMode flag to ignore
// emitted errors until we can synchronize. This might be worth trying out
// later.
@errorType('Synchronize')
class Synchronize extends Error {
  constructor() {
    super('Synchronize');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class Parser {
  private filename: string = '<unknown>';
  private scanner: Scanner;

  private previous: Token | null;
  private current: Token;
  private leadingWs: string = '';
  private next: Token;
  private trailingWs: string = '';

  private lineErrors: Array<SyntaxError | SyntaxWarning> = [];
  private errors: Array<SyntaxError | SyntaxWarning> = [];
  private isError: boolean = false;
  private isWarning: boolean = false;
  private isProgram: boolean = false;
  private isLine: boolean = false;
  private lineNo: number | null = null;
  private cmdNo: number = 0;
  private line: Source = Source.empty();
  private isShortIf: boolean = false;

  constructor() {}

  init(source: string, filename: string, isProgram: boolean) {
    this.filename = filename;
    this.scanner = new Scanner(source, filename);
    this.previous = null;
    const [ws1, current] = this.nextToken();
    this.current = current;
    const [ws2, next] = this.nextToken();
    this.leadingWs = ws1;
    this.next = next;
    this.trailingWs = ws2;
    this.lineErrors = [];
    this.errors = [];
    this.isError = false;
    this.isWarning = false;
    this.isProgram = isProgram;
    this.isLine = false;
    this.lineNo = null;
    this.line = new Source(ws1, '', '', this.current.text);
    this.isShortIf = false;
  }

  /**
   * Parse the source as input, returning a list of lines and commands.
   *
   * @param source The source code.
   * @returns A list of lines and commands.
   */
  @runtimeMethod
  public parseInput(source: string): ParseResult<Input> {
    this.init(source, '<input>', false);

    const result = new Input(this.rows());

    // NOTE: errors and warnings are *almost* sorted, but there are
    // certain cases where an error is only known after its expression is
    // parsed - for example, parameter length validation in params
    // parsing.
    let warning: ParseWarning | null = null;
    if (this.isError) {
      const err = new ParseError(this.errors);
      sortParseError(err, ['row', 'offsetStart']);
      throw err;
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      warning = new ParseWarning(warnings);
      sortParseError(warning, ['row', 'offsetStart']);
    }

    showTree(result);

    return [result, warning];
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @param source The source code.
   * @param filename The source filename.
   * @returns A Program.
   */
  @runtimeMethod
  public parseProgram(source: string, filename: string): ParseResult<Program> {
    this.init(source, filename, true);

    const result = this.rows();
    sortLines(result as Line[]);
    const program = new Program(this.filename, result as Line[]);

    let warning: ParseWarning | null = null;
    if (this.isError) {
      throw new ParseError(this.errors);
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      warning = new ParseWarning(warnings);
    }

    showTree(program);

    return [program, warning];
  }

  private match(...kinds: TokenKind[]): boolean {
    for (const kind of kinds) {
      if (this.check(kind)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(kind: TokenKind): boolean {
    if (this.done) {
      return kind === TokenKind.Eof;
    }
    return this.current.kind === kind;
  }

  private checkNext(kind: TokenKind): boolean {
    if (this.done) {
      return kind === TokenKind.Eof;
    }
    return this.next.kind === kind;
  }

  private nextToken(ws: string = ''): [string, Token] {
    const token = this.scanner.nextToken();

    if (token.kind === TokenKind.Whitespace) {
      return this.nextToken(ws + token.text);
    }

    return [ws, token];
  }

  private advance(): Token {
    this.previous = this.current;
    this.current = this.next;

    this.line.source += this.trailingWs + this.current.text;

    const [ws, next] = this.nextToken();
    this.leadingWs = this.trailingWs;
    this.trailingWs = ws;
    this.next = next;

    if (this.current.kind === TokenKind.Illegal) {
      this.syntaxError(this.current, `Illegal token ${this.current.text}`);
    }

    return this.previous as Token;
  }

  private get done(): boolean {
    return this.current.kind == TokenKind.Eof;
  }

  private consume(kind: TokenKind, message: string): Token {
    if (this.check(kind)) return this.advance() as Token;
    this.syntaxError(this.current, message);
  }

  private syntaxError(token: Token, message: string): never {
    const exc = new SyntaxError(message, {
      filename: this.filename,
      row: token.row,
      isLine: this.isLine,
      lineNo: this.lineNo,
      cmdNo: this.isLine ? null : this.cmdNo,
      offsetStart: token.offsetStart,
      offsetEnd: token.offsetEnd,
      source: Source.unknown(),
    });
    this.isError = true;
    this.lineErrors.push(exc);
    throw new Synchronize();
  }

  private syntaxWarning(token: Token, message: string): void {
    const exc = new SyntaxWarning(message, {
      filename: this.filename,
      row: token.row,
      isLine: this.isLine,
      lineNo: this.lineNo,
      cmdNo: this.isLine ? null : this.cmdNo,
      offsetStart: token.offsetStart,
      offsetEnd: token.offsetEnd,
      source: Source.unknown(),
    });
    this.isWarning = true;
    this.lineErrors.push(exc);
  }

  private rows(): Row[] {
    const rows: Row[] = [];
    while (!this.done) {
      const parsed = this.row();
      if (parsed) {
        rows.push(parsed);
      }
    }
    return rows;
  }

  private row(): Row | null {
    const rowNo = this.current.row;

    let cmds: Instr[];
    let source: Source;
    try {
      this.lineNumber();

      cmds = this.instructions();

      source = this.rowEnding();
    } catch (err) {
      if (err instanceof Synchronize) {
        this.syncNextRow();
        return null;
      }
      throw err;
    }

    if (this.lineNo !== null) {
      return new Line(this.lineNo, rowNo, source, cmds);
    }
    this.cmdNo += 10;
    return new Cmd(this.cmdNo, rowNo, source, cmds);
  }

  private lineNumber(): void {
    const prevLineNo = this.lineNo;
    if (this.match(TokenKind.DecimalLiteral)) {
      this.lineNo = this.previous!.value as number;
      this.line.lineNo = this.previous!.text;
      this.line.separatingWs = this.leadingWs;
      this.line.source = this.current.text;
      this.isLine = true;
    } else if (this.isProgram) {
      this.syntaxError(this.current, 'Expected line number');
    } else {
      this.lineNo = null;
      this.isLine = false;
    }

    if (this.lineNo !== null) {
      if (this.lineNo % 10) {
        this.syntaxWarning(
          this.previous!,
          'Line numbers should be in factors of 10',
        );
      }
      if (this.isProgram && prevLineNo !== null) {
        if (this.lineNo <= prevLineNo) {
          this.syntaxWarning(this.previous!, 'Line numbers should be in order');
        }
      }
    }
  }

  private rowEnding(): Source {
    const line = this.line.clone();
    if (line.source.endsWith('\n')) {
      line.source = line.source.slice(0, -1);
    }

    for (const error of this.lineErrors) {
      error.source = line;
      this.errors.push(error);
    }

    this.lineErrors = [];

    if (!this.match(TokenKind.LineEnding)) {
      const token = this.current;
      this.consume(
        TokenKind.Eof,
        `Unexpected token ${token.text.length ? token.text : token.kind}`,
      );
    }

    const nextLine = new Source(this.leadingWs, '', '', this.current.text);

    this.line = nextLine;
    this.isLine = false;

    return line;
  }

  private syncNextInstr() {
    // Remarks can be handled in the next attempt at parsing a command
    while (
      ![
        TokenKind.Colon,
        TokenKind.LineEnding,
        TokenKind.Eof,
        TokenKind.Rem,
      ].includes(this.current.kind)
    ) {
      // TODO: Illegal, UnterminatedString
      this.advance();
    }
  }

  private syncNextRow(): void {
    while (
      ![TokenKind.LineEnding, TokenKind.Eof, TokenKind.Rem].includes(
        this.current.kind,
      )
    ) {
      // TODO: Illegal, UnterminatedString
      this.advance();
    }

    this.rowEnding();
  }

  private get isLineEnding(): boolean {
    return this.done || this.current.kind === TokenKind.LineEnding;
  }

  private instructions(): Instr[] {
    if (this.isLineEnding) {
      return [];
    }

    let instr: Instr | null = this.instruction();
    const instrs: Instr[] = instr ? [instr] : [];

    // A remark doesn't need to be separated from a prior command by a
    // colon
    while (this.match(TokenKind.Colon) || this.check(TokenKind.Rem)) {
      try {
        instr = this.instruction();
        if (instr) {
          instrs.push(instr);
        }
      } catch (err) {
        if (err instanceof Synchronize) {
          this.syncNextInstr();
        }
        throw err;
      }
    }
    return instrs;
  }

  private instruction(): Instr | null {
    const { offsetStart } = this.current;

    let instr: Instr;

    // Remarks are treated like commands - the scanner handles the fact
    // that they include all text to the end of the line
    if (this.match(TokenKind.Rem)) {
      instr = new Rem(this.previous!.value as string);
    } else if (this.match(TokenKind.Semicolon)) {
      instr = new Rem('');
    } else if (this.match(TokenKind.Print)) {
      instr = this.print();
      // TODO: TokenKind.ShellToken (or TokenKind.StringLiteral)
    } else if (this.match(TokenKind.New)) {
      instr = this.new();
    } else if (this.match(TokenKind.Load)) {
      instr = this.load();
    } else if (this.match(TokenKind.List)) {
      instr = this.list();
    } else if (this.match(TokenKind.Renum)) {
      instr = this.renum();
    } else if (this.match(TokenKind.Save)) {
      instr = this.save();
    } else if (this.match(TokenKind.Run)) {
      instr = this.run();
    } else if (this.match(TokenKind.End)) {
      instr = this.end();
    } else if (this.match(TokenKind.Exit)) {
      instr = this.exit();
    } else if (this.match(TokenKind.Let)) {
      instr = this.let();
    } else if (this.match(TokenKind.If)) {
      instr = this.if_();
    } else if (this.match(TokenKind.Else)) {
      instr = this.else_();
    } else if (this.match(TokenKind.EndIf)) {
      instr = this.endIf();
    } else {
      const assign = this.assign();
      if (assign) {
        instr = assign;
      } else {
        instr = this.expressionStatement();
      }
    }

    const { offsetEnd } = this.previous!;

    instr.offsetStart = offsetStart;
    instr.offsetEnd = offsetEnd;

    return instr;
  }

  // TODO: What's the syntax of print? lol
  private print(): Instr {
    return new Print(this.expression());
  }

  private new(): Instr {
    return new New(this.optionalExpression());
  }

  private load(): Instr {
    const { arguments: args, flags } = this.params({
      arguments: ['filename'],
      flags: ['run'],
    });

    const filename = args[0];
    return new Load(filename, flags.run || false);
  }

  private list(): Instr {
    return new List();
  }

  private renum(): Instr {
    return new Renum();
  }

  private save(): Instr {
    return new Save(this.optionalExpression());
  }

  private run(): Instr {
    return new Run();
  }

  private end(): Instr {
    // TODO: Should end take an exit code?
    return new End();
  }

  private exit(): Instr {
    const expr = this.optionalExpression();
    if (expr) {
      return new Exit(expr);
    }
    return new Exit(null);
  }

  private expressionStatement(): Instr {
    return new Expression(this.expression());
  }

  private let(): Instr {
    let variable: Variable;
    if (
      this.match(
        TokenKind.IntIdent,
        TokenKind.RealIdent,
        TokenKind.BoolIdent,
        TokenKind.StringIdent,
      )
    ) {
      variable = this.variable();
    } else {
      this.syntaxError(this.current, 'Expected variable name');
    }

    let value: Expr | null = null;
    if (this.match(TokenKind.Eq)) {
      value = this.expression();
    }
    return new Let(variable, value);
  }

  private if_(): Instr {
    const condition = this.ifCondition();

    // A bare "if" with a multi-line block
    if (!this.isShortIf && this.isLineEnding) {
      const if_ = new If(condition);
      return if_;
    }

    return this.shortIf(condition);
  }

  private ifCondition(): Expr {
    const condition = this.expression();

    this.consume(TokenKind.Then, 'Expected then');

    return condition;
  }

  private shortIf(condition: Expr): Instr {
    const prevShortIf = this.isShortIf;
    this.isShortIf = true;

    const then: Instr[] = this.instructions();
    let else_: Instr[] = [];

    if (this.match(TokenKind.Else)) {
      else_ = this.instructions();
    }

    this.consume(TokenKind.EndIf, "Expected 'endif' after 'if' instruction");

    this.isShortIf = prevShortIf;

    return new ShortIf(condition, then, else_);
  }

  private else_(): Instr {
    if (this.isShortIf) {
      this.syntaxError(this.previous!, "Unexpected 'else'");
    }

    if (this.match(TokenKind.If)) {
      return this.elseIf();
    }

    return new Else();
  }

  private elseIf(): Instr {
    return new ElseIf(this.ifCondition());
  }

  private endIf(): Instr {
    if (this.isShortIf) {
      this.syntaxError(this.previous!, "Unexpected 'endif'");
    }
    return new EndIf();
  }

  private assign(): Instr | null {
    // We can't match here because we need to check the *next* token
    // before advancing...
    if (
      (this.check(TokenKind.IntIdent) ||
        this.check(TokenKind.RealIdent) ||
        this.check(TokenKind.BoolIdent) ||
        this.check(TokenKind.StringIdent)) &&
      this.checkNext(TokenKind.Eq)
    ) {
      // ...and so we advance here.
      this.advance();
      const variable = this.variable();
      this.consume(TokenKind.Eq, 'Expected =');
      const value = this.expression();
      return new Assign(variable, value);
    }

    return null;
  }

  private params(spec: ParamsSpec): Params {
    const args = spec.arguments || [];
    const argv: Params = { arguments: [], flags: {}, options: {} };
    const flagNames: Set<string> = new Set(spec.flags || []);
    const noFlagNames: Set<string> = new Set(
      (spec.flags || []).map((f) => `no-${f}`),
    );
    const optionNames: Set<string> = new Set(spec.options || []);

    let prevParamToken: Token = this.previous!;
    let currParamToken: Token = this.current;
    while (
      !this.check(TokenKind.Colon) &&
      !this.check(TokenKind.Rem) &&
      !this.check(TokenKind.LineEnding) &&
      !this.check(TokenKind.Eof)
    ) {
      if (this.match(TokenKind.LongFlag)) {
        const key = this.previous!.value as string;
        if (flagNames.has(key)) {
          argv.flags[key] = true;
        } else if (noFlagNames.has(key)) {
          argv.flags[key] = false;
        } else if (optionNames.has(key)) {
          argv.options[key] = this.expression();
        }
      } else {
        prevParamToken = currParamToken;
        currParamToken = this.current;
        argv.arguments.push(this.expression());
      }
    }

    if (argv.arguments.length < args.length) {
      this.syntaxError(
        currParamToken,
        `Missing argument '${args[argv.arguments.length]}'`,
      );
    } else if (argv.arguments.length > args.length) {
      this.syntaxError(prevParamToken, 'Unexpected argument');
    }

    return argv;
  }

  private optionalExpression(): Expr | null {
    for (const tok of [TokenKind.Colon, TokenKind.LineEnding, TokenKind.Eof]) {
      if (this.check(tok)) {
        return null;
      }
    }
    return this.expression();
  }

  private expression(): Expr {
    return this.or();
  }

  private operator<E extends Expr>(
    kinds: TokenKind[],
    operand: () => Expr,
    factory: (l: Expr, o: TokenKind, r: Expr) => E,
  ): Expr {
    let expr: Expr = operand();

    while (this.match(...kinds)) {
      const op = this.previous!.kind;
      const right = operand();

      expr = factory(expr, op, right);
    }

    return expr;
  }

  private or(): Expr {
    return this.operator(
      [TokenKind.Or],
      this.and.bind(this),
      (l, o, r) => new Logical(l, o, r),
    );
  }

  private and(): Expr {
    return this.operator(
      [TokenKind.And],
      this.equality.bind(this),
      (l, o, r) => new Logical(l, o, r),
    );
  }

  private equality(): Expr {
    return this.operator(
      [TokenKind.Eq, TokenKind.EqEq, TokenKind.BangEq, TokenKind.Ne],
      this.comparison.bind(this),
      (left, op, right) => {
        if (op == TokenKind.Eq) {
          this.syntaxWarning(
            this.previous!,
            'Use `==` instead of `==` for equality',
          );
          op = TokenKind.EqEq;
        } else if (op == TokenKind.BangEq) {
          this.syntaxWarning(
            this.previous!,
            'Use `<>` instead of `!=` for equality',
          );
          op = TokenKind.Ne;
        }

        return new Binary(left, op, right);
      },
    );
  }

  private comparison(): Expr {
    return this.operator(
      [TokenKind.Gt, TokenKind.Ge, TokenKind.Lt, TokenKind.Le],
      this.term.bind(this),
      (l, o, r) => new Binary(l, o, r),
    );
  }

  private term(): Expr {
    return this.operator(
      [TokenKind.Minus, TokenKind.Plus],
      this.factor.bind(this),
      (l, o, r) => new Binary(l, o, r),
    );
  }

  private factor(): Expr {
    return this.operator(
      [TokenKind.Slash, TokenKind.Star],
      this.unary.bind(this),
      (l, o, r) => new Binary(l, o, r),
    );
  }

  private unary(): Expr {
    if (this.match(TokenKind.Not, TokenKind.Minus)) {
      const op = this.previous!.kind;
      const right = this.unary();

      return new Unary(op, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (
      this.match(
        TokenKind.DecimalLiteral,
        TokenKind.HexLiteral,
        TokenKind.OctalLiteral,
        TokenKind.BinaryLiteral,
      )
    ) {
      return new IntLiteral(this.previous!.value as number);
    } else if (this.match(TokenKind.RealLiteral)) {
      return new RealLiteral(this.previous!.value as number);
    } else if (this.match(TokenKind.TrueLiteral)) {
      return new BoolLiteral(true);
    } else if (this.match(TokenKind.FalseLiteral)) {
      return new BoolLiteral(false);
    } else if (this.match(TokenKind.StringLiteral)) {
      return this.string();
    } else if (this.match(TokenKind.NilLiteral)) {
      return new NilLiteral();
    } else if (
      this.match(
        TokenKind.IntIdent,
        TokenKind.RealIdent,
        TokenKind.BoolIdent,
        TokenKind.StringIdent,
      )
    ) {
      return this.variable();
    } else if (this.match(TokenKind.LParen)) {
      return this.group();
    } else {
      const token = this.current;
      let msg = `Unexpected token ${token.text.length ? token.text : token.kind}`;

      if (token.kind == TokenKind.UnterminatedStringLiteral) {
        msg = `Unterminated string ${token.text}`;
      }

      this.syntaxError(token, msg);
    }
  }

  private variable(): Variable {
    return new Variable(this.previous!);
  }

  private group(): Expr {
    const expr: Expr = this.expression();
    this.consume(TokenKind.RParen, 'Expected `)` after expression');
    return new Group(expr);
  }

  private string(): StringLiteral {
    return new StringLiteral(this.parseStringEscapeCodes(false));
  }

  private prompt(): PromptLiteral {
    return new PromptLiteral(this.parseStringEscapeCodes(true));
  }

  private parseStringEscapeCodes(isPrompt: boolean): string {
    const warnings: SyntaxWarning[] = [];
    const text = this.previous!.text;
    const input = this.previous!.value as string;
    let value: string = '';

    // Skip the first quote character
    let i = 1;

    function advance(): string {
      i++;
      return input[i - 1];
    }

    function done(): boolean {
      // Skip the last quote character
      return i >= input.length - 1;
    }

    while (!done()) {
      const c: string = advance();

      if (c === '\\') {
        const e = advance();
        switch (e) {
          // ANSI bell character.
          case 'a':
            value += '\u{07}';
            break;
          // Backspace.
          case 'b':
            value += '\u{08}';
            break;
          // ANSI escape code.
          case 'e':
            value += '\u001b';
            break;
          case 't':
            // Prompt strings render \t as a time format, not a tab.
            if (isPrompt) {
              value += '\\t';
            } else {
              value += '\t';
            }
            break;
          case 'r':
            value += '\r';
            break;
          case 'v':
            value += '\u{0b}';
            break;
          case 'f':
            value += '\u{0c}';
            break;
          case 'n':
            value += '\n';
            break;
          case "'":
          case '"':
            value += e;
            break;
          case '\\':
            value += '\\';
            break;
          default:
            warnings.push(
              new SyntaxWarning(`Invalid escape sequence \`\\${e}\``, {
                filename: this.filename,
                row: this.current.row,
                isLine: this.isLine,
                lineNo: this.lineNo,
                cmdNo: this.isLine ? null : this.cmdNo,
                // We advanced twice, for the \\ and the character respectively
                offsetStart: this.previous!.offsetStart + i - 2,
                offsetEnd: this.previous!.offsetStart + i,
                source: Source.unknown(),
              }),
            );
            this.isWarning = true;
            value += '\\';
            value += e;
        }
      } else {
        value += c;
      }
    }

    for (const warn of warnings) {
      warn.message += ` in string ${text}`;
      this.lineErrors.push(warn);
      this.isWarning = true;
    }

    return value;
  }
}
