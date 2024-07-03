import { inspect } from 'util';

import c from 'ansi-colors';

import { MATBAS_VERSION, TYPESCRIPT_VERSION, NODE_VERSION } from './constants';
import {
  BaseException,
  AssertionError,
  BaseWarning,
  TypeError,
  ZeroDivisionError,
  OsError,
  FileError,
  SourceLocation,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { Exit } from './exit';
import { BaseFault, RuntimeFault, UsageFault } from './faults';
import { Stack } from './stack';
import { Traceback } from './traceback';
import {
  Expr,
  ExprVisitor,
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
  Cmd,
  CmdVisitor,
  Print,
  Expression,
  Rem,
  New,
  Load,
  List,
  Renum,
  Save,
  Run,
  Exit as ExitCmd,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  End,
} from './ast/cmd';
import { Tree, TreeVisitor, CommandGroup, Line, Input, Program } from './ast';
import { Token } from './tokens';

/**
 * Objects implementing this interface can be formatted.
 */
export interface Formattable {
  format(formatter: Formatter): string;
}

export function indent(indent: number, value: string): string {
  let tab = '';
  for (let i = 0; i < indent; i++) {
    tab += '  ';
  }
  return value
    .split('\n')
    .map((line) => (line.length ? `${tab}${line}` : ''))
    .join('\n');
}

/**
 * A formatter. This is an abstract class and should not be used directly.
 */
export abstract class Formatter
  implements ExprVisitor<string>, CmdVisitor<string>, TreeVisitor<string>
{
  /**
   * Format a value.
   *
   * @param value A formattable value.
   */
  format(value: any): string {
    if (typeof value === 'string') {
      return this.formatString(value);
    }

    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    if (typeof value == 'boolean') {
      return this.formatBoolean(value);
    }

    if (value instanceof Expr) {
      return this.formatExpr(value);
    }

    if (value instanceof Cmd) {
      return this.formatCmd(value);
    }

    if (value instanceof Tree) {
      return this.formatTree(value);
    }

    if (value && value.format) {
      return value.format(this);
    }

    if (Array.isArray(value)) {
      return this.formatArray(value);
    }

    return this.formatAny(value);
  }

  //
  // This class implements a visitor pattern - all of these methods are
  // visitor methods for particular value types.
  //

  abstract formatString(value: string): string;
  abstract formatNumber(value: number): string;
  abstract formatBoolean(value: boolean): string;

  abstract formatTraceback(traceback: Traceback | null): string;

  abstract formatBaseException(exc: BaseException): string;
  abstract formatBaseWarning(warn: BaseWarning): string;
  abstract formatAssertionError(exc: AssertionError): string;
  abstract formatTypeError(exc: TypeError): string;
  abstract formatZeroDivisionError(exc: ZeroDivisionError): string;
  abstract formatOsError(exc: OsError): string;
  abstract formatFileError(exc: FileError): string;
  abstract formatSyntaxError(exc: SyntaxError): string;
  abstract formatParseError(exc: ParseError): string;
  abstract formatSyntaxWarning(warn: SyntaxWarning): string;
  abstract formatParseWarning(warn: ParseWarning): string;

  abstract formatBaseFault(fault: BaseFault): string;
  abstract formatRuntimeFault(fault: RuntimeFault): string;
  abstract formatUsageFault(fault: UsageFault): string;

  abstract formatExit(exit: Exit): string;

  abstract formatExpr(expr: Expr): string;
  abstract formatCmd(cmd: Cmd): string;
  abstract formatTree(ast: Tree): string;
  abstract formatToken(token: Token): string;

  abstract visitBinaryExpr(binary: Binary): string;
  abstract visitLogicalExpr(logical: Logical): string;
  abstract visitUnaryExpr(unary: Unary): string;
  abstract visitGroupExpr(group: Group): string;
  abstract visitVariableExpr(variable: Variable): string;
  abstract visitIntLiteralExpr(int: IntLiteral): string;
  abstract visitRealLiteralExpr(real: RealLiteral): string;
  abstract visitBoolLiteralExpr(bool: BoolLiteral): string;
  abstract visitStringLiteralExpr(str: StringLiteral): string;
  abstract visitPromptLiteralExpr(ps: PromptLiteral): string;
  abstract visitNilLiteralExpr(node: NilLiteral): string;

  abstract visitPrintCmd(node: Print): string;
  abstract visitExpressionCmd(node: Expression): string;
  abstract visitRemCmd(rem: Rem): string;
  abstract visitNewCmd(new_: New): string;
  abstract visitLoadCmd(load: Load): string;
  abstract visitListCmd(list: List): string;
  abstract visitRenumCmd(renum: Renum): string;
  abstract visitSaveCmd(save: Save): string;
  abstract visitRunCmd(run: Run): string;
  abstract visitLetCmd(let_: Let): string;
  abstract visitAssignCmd(assign: Assign): string;
  abstract visitExitCmd(exit: ExitCmd): string;
  abstract visitShortIfCmd(if_: ShortIf): string;
  abstract visitIfCmd(if_: If): string;
  abstract visitElseCmd(else_: Else): string;
  abstract visitElseIfCmd(elseIf: ElseIf): string;
  abstract visitEndCmd(end: End): string;

  abstract visitCommandGroupTree(node: CommandGroup): string;
  abstract visitLineTree(node: Line): string;
  abstract visitInputTree(node: Input): string;
  abstract visitProgramTree(node: Program): string;

  abstract formatStack<V>(stack: Stack<V>): string;

  abstract formatArray(array: any[]): string;

  abstract formatAny(value: any): string;
}

interface InspectOptions {
  colors?: boolean;
}

/**
 * Inspect a string. Includes the quotes and does escaping appropriately.
 */
export function inspectString(
  str: string,
  options: InspectOptions = { colors: false },
): string {
  // TODO: Node splits multi line strings. That would be a cool feature to
  // add.
  let fmt: string;

  if (str.includes("'")) {
    if (str.includes('"')) {
      fmt = `'${str.replace(/'/g, "\\'")}'`;
    } else {
      fmt = `"${str}"`;
    }
  } else {
    fmt = `'${str}'`;
  }

  if (options.colors) {
    fmt = c.green(fmt);
  }

  return fmt;
}

/**
 * Inspect an array with the supplied formatter.
 */
function inspectArray(
  array: any[],
  formatter: Formatter,
  options: InspectOptions = { colors: false },
): string {
  // NOTE: I can't cheese this with Node's inspector because Node will render
  // formatted entities as inspected strings.
  //
  // TODO: Format arrays on a single line when they're short.
  let formatted = '[\n';
  for (let i = 0; i < array.length; i++) {
    if (typeof array[i] === 'string') {
      formatted += indent(1, inspectString(array[i], options));
    } else {
      formatted += indent(1, formatter.format(array[i]));
    }
    formatted += ',\n';
  }
  formatted += ']';
  return formatted;
}

/**
 * A default, standard formatter.
 */
export class DefaultFormatter extends Formatter {
  constructor() {
    super();
  }

  formatString(str: string): string {
    return str;
  }

  formatNumber(num: number): string {
    return String(num);
  }

  formatBoolean(bool: boolean): string {
    return String(bool);
  }

  formatTraceback(traceback: Traceback | null): string {
    let report = '';
    let tb = traceback;
    if (tb) {
      report += 'Traceback:\n';
    }
    // TODO: Python also prints the module name
    while (tb) {
      // TODO: inspect string, quotes etc
      report += `  File ${inspectString(tb.filename)}, line ${tb.lineNo}`;
      tb = tb.next;
    }
    return report;
  }

  formatBaseException(exc: BaseException): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name}: ${exc.message}`;
    return report;
  }

  formatBaseWarning(warn: BaseWarning): string {
    let report = '';
    if (warn.traceback) {
      report += `${warn.traceback.filename}:${warn.traceback.lineNo}`;
    } else {
      report += '<unknown>:<?>';
    }

    report += `: ${warn.constructor.name}: ${warn.message}`;
    // TODO: Python also prints the line like so:
    //
    //  100 print someFn(ident);

    return report;
  }

  formatAssertionError(exc: AssertionError): string {
    return this.formatBaseException(exc);
  }

  formatTypeError(exc: TypeError): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name}: ${exc.message}\n`;
    report += `  Value: ${this.format(exc.value)}\n`;
    report += `  From: ${exc.from}\n`;
    report += `  To: ${exc.to}`;

    return report;
  }

  formatZeroDivisionError(exc: ZeroDivisionError): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report +=
      `${exc.constructor.name}: Cannot divide ` +
      formatter.format(exc.a) +
      ' by ' +
      formatter.format(exc.b);

    return report;
  }

  formatOsError(exc: OsError): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name} ${exc.code}: ${exc.message}`;
    return report;
  }

  formatFileError(exc: FileError): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name} ${exc.code}: ${exc.message}\n`;

    if (exc.paths.length == 2) {
      report += `  Source File: ${exc.paths[0]}\n`;
      report += `  Destination File: ${exc.paths[1]}`;
    } else {
      report += `  Input File: ${exc.paths[0]}`;
    }

    return report;
  }

  private formatSyntaxIssue(
    level: string,
    message: string,
    loc: SourceLocation,
  ): string {
    let lineNo: string;
    let lineNote: string = '';
    if (loc.isLine) {
      lineNo = String(loc.lineNo);
    } else {
      if (loc.cmdNo) {
        lineNo = `command ${loc.cmdNo}`;
      } else {
        lineNo = `<R${loc.row}>`;
      }

      if (loc.lineNo && loc.lineNo > 0) {
        lineNote = ` (after line ${loc.lineNo})`;
      } else {
        lineNote = ` (at the beginning)`;
      }
    }
    let report = `${loc.filename}:${lineNo}:${loc.offsetStart}${lineNote}: ${level}: ${message}\n`;
    report += `  ${loc.source}\n`;
    for (let i = 0; i <= loc.offsetStart + 1; i++) {
      report += ' ';
    }
    report += '^';
    return report;
  }

  formatSyntaxError(exc: SyntaxError): string {
    return this.formatSyntaxIssue('error', this.format(exc.message), exc);
  }

  formatParseError(exc: ParseError): string {
    return exc.errors
      .map((err: SyntaxError | SyntaxWarning) => this.format(err))
      .join('\n');
  }

  formatSyntaxWarning(warn: SyntaxWarning): string {
    return this.formatSyntaxIssue('warning', this.format(warn.message), warn);
  }

  formatParseWarning(warn: ParseWarning): string {
    return warn.warnings.map((w: SyntaxWarning) => this.format(w)).join('\n');
  }

  formatBaseFault(fault: BaseFault): string {
    let report = '=== INTERNAL FAULT ===\n\n';
    report += '--- Internal Stack Trace ---\n';
    report += fault.stack;
    return report;
  }

  formatRuntimeFault(fault: RuntimeFault): string {
    let report = '=== RUNTIME FAULT ===\n\n';
    report += '--- Internal Stack Trace ---\n';
    report += fault.error.stack;

    if (fault.traceback) {
      report += '\n\n--- Traceback ---\n';
      report += this.format(fault.traceback);
    }
    report += '\n\n--- Versions ---\n';
    report += `Matanuska BASIC: v${MATBAS_VERSION}\n`;
    report += `TypeScript: v${TYPESCRIPT_VERSION}\n`;
    report += `Node.js: v${NODE_VERSION}\n\n`;
    report +=
      'This is a bug in Matanuska BASIC. If you copy this entire message and post it\n';
    report += 'to the issues tracker:\n\n';
    report += '    https://github.com/jfhbrook/matanuska/issues\n\n';
    report +=
      'the developers will do their best to fix it - and more importantly, they will\n';
    report += 'owe you a beer, coffee or beverage of your choice. 🍻\n\n';

    return report;
  }

  formatUsageFault(fault: UsageFault): string {
    return fault.message;
  }

  formatExit(exit: Exit): string {
    return `Exit ${exit.exitCode}${exit.message.length ? ': ' + exit.message : ''}`;
  }

  visitCommandGroupTree(node: CommandGroup): string {
    return this.formatArray(node.commands);
  }

  visitLineTree(line: Line): string {
    let formatted = `Line(${line.lineNo}) [\n`;
    const cmds: string[] = [];
    for (const cmd of line.commands) {
      cmds.push(this.format(cmd));
    }
    for (const cmd of cmds) {
      formatted += indent(1, `${cmd},\n`);
    }
    formatted += ']';

    return formatted;
  }

  visitInputTree(input: Input): string {
    let formatted = 'Input(\n';
    formatted += indent(1, this.format(input.input));
    formatted += '\n)';
    return formatted;
  }

  visitProgramTree(program: Program): string {
    let formatted = 'Program(\n';
    const lines: string[] = [];
    for (const line of program.lines) {
      lines.push(indent(1, this.format(line)));
    }
    for (const line of lines) {
      formatted += `${line},\n`;
    }
    formatted += ')';
    return formatted;
  }

  formatExpr(expr: Expr): string {
    return expr.accept(this);
  }

  formatCmd(cmd: Cmd): string {
    return cmd.accept(this);
  }

  formatTree(ast: Tree): string {
    return ast.accept(this);
  }

  formatToken(token: Token): string {
    let formatted = `Token(${token.kind}) {\n`;
    formatted += `  index: ${token.index},\n`;
    formatted += `  row: ${token.row},\n`;
    formatted += `  offsetStart: ${token.offsetStart},\n`;
    formatted += `  offsetEnd: ${token.offsetEnd},\n`;
    formatted += `  text: ${inspectString(token.text)},\n`;
    if (token.value) {
      const value =
        typeof token.value === 'string'
          ? inspectString(token.value)
          : token.value;
      formatted += `  value: ${value},\n`;
    }
    formatted += '}';
    return formatted;
  }

  visitBinaryExpr(binary: Binary): string {
    let formatted = `Binary(${binary.op}) {\n`;
    formatted += indent(1, `${this.format(binary.left)},\n`);
    formatted += indent(1, `${this.format(binary.right)},\n`);
    formatted += '}';
    return formatted;
  }

  visitLogicalExpr(logical: Logical): string {
    let formatted = `Logical(${logical.op} {\n`;
    formatted += indent(1, `${this.format(logical.left)},\n`);
    formatted += indent(1, `${this.format(logical.right)},\n`);
    formatted += '}';
    return formatted;
  }

  visitUnaryExpr(unary: Unary): string {
    let formatted = `Unary(${unary.op}) {\n`;
    formatted += indent(1, `${this.format(unary.expr)},\n`);
    formatted += '}';
    return formatted;
  }

  visitGroupExpr(group: Group): string {
    return `(${this.format(group.expr)})`;
  }

  visitVariableExpr(variable: Variable): string {
    return variable.ident.text;
  }

  visitIntLiteralExpr(int: IntLiteral): string {
    return String(int.value);
  }

  visitRealLiteralExpr(real: RealLiteral): string {
    return String(real.value);
  }

  visitBoolLiteralExpr(bool: BoolLiteral): string {
    return String(bool.value);
  }

  visitStringLiteralExpr(str: StringLiteral): string {
    return inspectString(str.value);
  }

  visitPromptLiteralExpr(str: PromptLiteral): string {
    return inspectString(str.value);
  }

  visitNilLiteralExpr(_node: NilLiteral): string {
    return 'nil';
  }

  visitExpressionCmd(node: Expression): string {
    return `Expression(${this.format(node.expression)})`;
  }

  visitPrintCmd(node: Print): string {
    return `Print(${this.format(node.expression)})`;
  }

  visitRemCmd(rem: Rem): string {
    return `Rem(${rem.remark})`;
  }

  visitNewCmd(new_: New): string {
    return `New(${this.format(new_.filename)})`;
  }

  visitLoadCmd(load: Load): string {
    return `Load(${this.format(load.filename)}, run=${load.run ? 'true' : 'false'})`;
  }

  visitListCmd(_list: List): string {
    return 'List';
  }

  visitRenumCmd(_renum: Renum): string {
    return 'Renum';
  }

  visitSaveCmd(save: Save): string {
    return `New(${this.format(save.filename)})`;
  }

  visitRunCmd(_run: Run): string {
    return 'Run';
  }

  visitExitCmd(exit: ExitCmd): string {
    return `Exit(${this.format(exit.expression)})`;
  }

  visitLetCmd(let_: Let): string {
    return `Let(${this.format(let_.variable)}, ${this.format(let_.value)})`;
  }

  visitAssignCmd(assign: Assign): string {
    return `Assign(${this.format(assign.variable)}, ${this.format(assign.value)})`;
  }

  visitShortIfCmd(if_: ShortIf): string {
    let formatted = `ShortIf (${this.format(if_.condition)}) { `;
    formatted += if_.then.map((c) => this.format(c)).join(' : ') + ' }';
    if (if_.else_.length) {
      formatted +=
        ' { ' + if_.else_.map((c) => this.format(c)).join(' : ') + ' }';
    }
    return formatted;
  }

  visitIfCmd(if_: If): string {
    return `If (${this.format(if_.condition)})`;
  }

  visitElseCmd(_else: Else): string {
    return `Else`;
  }

  visitElseIfCmd(elseIf: ElseIf): string {
    return `ElseIf (${this.format(elseIf.condition)})`;
  }

  visitEndCmd(_end: End): string {
    return 'End';
  }

  formatStack<V>(stack: Stack<V>): string {
    let formatted = '{ ';
    for (const v of stack.stack) {
      formatted += this.format(v);
      formatted += ', ';
    }
    return formatted + '}';
  }

  formatArray(array: any[]): string {
    return inspectArray(array, this);
  }

  formatAny(value: any): string {
    return inspect(value);
  }
}

/**
 * The default formatter, initialized for your convenience.
 */
export const formatter = new DefaultFormatter();

export class Inspector extends DefaultFormatter {
  public colors: boolean = true;

  // TODO: I'm using the Node.js inspector here. That's fine for now, but
  // ideally I'd write my own inspector that encodes my personal opinions.
  formatString(str: string): string {
    return inspectString(str, this);
  }

  formatNumber(num: number): string {
    return inspect(num, this);
  }

  formatBoolean(bool: boolean): string {
    return inspect(bool, this);
  }

  // TODO: Node colors errors by greying out all tracebacks but the
  // nearest frame (which is at the top in JavaScript)
  formatTraceback(traceback: Traceback | null): string {
    return formatter.format(traceback);
  }

  private inspectException(exc: BaseException): string {
    return formatter.format(exc);
  }

  private inspectFault(fault: BaseFault): string {
    return formatter.format(fault);
  }

  formatBaseException(exc: BaseException): string {
    return this.inspectException(exc);
  }

  formatBaseWarning(warn: BaseWarning): string {
    return this.inspectException(warn);
  }

  formatOsError(exc: OsError): string {
    return this.inspectException(exc);
  }

  formatFileError(exc: FileError): string {
    return this.inspectException(exc);
  }

  formatSyntaxError(exc: SyntaxError): string {
    return this.inspectException(exc);
  }

  formatParseError(exc: ParseError): string {
    return this.inspectException(exc);
  }

  formatSyntaxWarning(warn: SyntaxWarning): string {
    return this.inspectException(warn);
  }

  formatParseWarning(warn: ParseWarning): string {
    return this.inspectException(warn);
  }

  formatBaseFault(fault: BaseFault): string {
    return this.inspectFault(fault);
  }

  formatRuntimeFault(fault: RuntimeFault): string {
    return this.inspectFault(fault);
  }

  formatUsageFault(fault: UsageFault): string {
    return this.inspectFault(fault);
  }

  formatExit(exit: Exit): string {
    let exitCode: string = String(exit.exitCode);

    if (exit.exitCode) {
      exitCode = c.red(exitCode);
    } else {
      exitCode = c.green(exitCode);
    }
    return `Exit ${exitCode}${exit.message.length ? ': ' + exit.message : ''}`;
  }

  // TODO: I'm currently formatting AST nodes and stacks identically in the
  // inspector as I am the formatter. Do I want to do anything different?

  formatArray(array: any[]): string {
    return inspectArray(array, this, this);
  }

  formatAny(value: any): string {
    return inspect(value, this);
  }
}

export const inspector = new Inspector();
