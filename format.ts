import VERSIONS from 'consts:versions';
import { inspect } from '@matanuska/host';

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
  ShellLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';
import {
  Instr,
  InstrVisitor,
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
  Exit as ExitInstr,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
  For,
  Onward,
  Next,
  While,
  EndWhile,
  Repeat,
  Until,
  Command,
} from './ast/instr';
import { Tree, TreeVisitor, Cmd, Line, Input, Program } from './ast';
import { Token } from './tokens';

function red(text: string): string {
  return `\x1b[31m${text}\x1b[39m`;
}

function green(text: string): string {
  return `\x1b[32m${text}\x1b[39m`;
}

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
  implements ExprVisitor<string>, InstrVisitor<string>, TreeVisitor<string>
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

    if (value instanceof Instr) {
      return this.formatInstr(value);
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
  abstract formatInstr(instr: Instr): string;
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
  abstract visitShellLiteralExpr(path: ShellLiteral): string;
  abstract visitPromptLiteralExpr(ps: PromptLiteral): string;
  abstract visitNilLiteralExpr(node: NilLiteral): string;

  abstract visitPrintInstr(node: Print): string;
  abstract visitExpressionInstr(node: Expression): string;
  abstract visitRemInstr(rem: Rem): string;
  abstract visitNewInstr(new_: New): string;
  abstract visitLoadInstr(load: Load): string;
  abstract visitListInstr(list: List): string;
  abstract visitRenumInstr(renum: Renum): string;
  abstract visitSaveInstr(save: Save): string;
  abstract visitRunInstr(run: Run): string;
  abstract visitLetInstr(let_: Let): string;
  abstract visitAssignInstr(assign: Assign): string;
  abstract visitEndInstr(end: End): string;
  abstract visitExitInstr(exit: ExitInstr): string;
  abstract visitShortIfInstr(if_: ShortIf): string;
  abstract visitIfInstr(if_: If): string;
  abstract visitElseInstr(else_: Else): string;
  abstract visitElseIfInstr(elseIf: ElseIf): string;
  abstract visitEndIfInstr(endif_: EndIf): string;
  abstract visitForInstr(for_: For): string;
  abstract visitOnwardInstr(onward: Onward): string;
  abstract visitNextInstr(next: Next): string;
  abstract visitWhileInstr(while_: While): string;
  abstract visitEndWhileInstr(endWhile: EndWhile): string;
  abstract visitRepeatInstr(repeat: Repeat): string;
  abstract visitUntilInstr(until: Until): string;

  abstract visitCommandInstr(node: Command): string;

  abstract visitCmdTree(node: Cmd): string;
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
    fmt = green(fmt);
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
 * The default formatter. We need to create a reference so DefaultFormatter's
 * definition is accepted by QJSEngine. We will initialize and export it later.
 */
let formatter: any = null;

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
    report += `Matanuska BASIC: v${VERSIONS.matbas}\n`;
    report += `swc: v${VERSIONS.swc}\n`;
    report += `vite: v${VERSIONS.swc}\n`;
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

  visitCmdTree(node: Cmd): string {
    return this.formatArray(node.instructions);
  }

  visitLineTree(line: Line): string {
    let formatted = `Line(${line.lineNo}) [\n`;
    const instrs: string[] = [];
    for (const instr of line.instructions) {
      instrs.push(this.format(instr));
    }
    for (const instr of instrs) {
      formatted += indent(1, `${instr},\n`);
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

  formatInstr(instr: Instr): string {
    return instr.accept(this);
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

  visitShellLiteralExpr(path: ShellLiteral): string {
    return path.value;
  }

  visitPromptLiteralExpr(str: PromptLiteral): string {
    return inspectString(str.value);
  }

  visitNilLiteralExpr(_node: NilLiteral): string {
    return 'nil';
  }

  visitExpressionInstr(node: Expression): string {
    return `Expression(${this.format(node.expression)})`;
  }

  visitPrintInstr(node: Print): string {
    return `Print(${this.format(node.expression)})`;
  }

  visitRemInstr(rem: Rem): string {
    return `Rem(${rem.remark})`;
  }

  visitNewInstr(new_: New): string {
    return `New(${this.format(new_.filename)})`;
  }

  visitLoadInstr(load: Load): string {
    return `Load (${this.formatArgv(load.params)})`;
  }

  visitListInstr(list: List): string {
    let repr = 'List(';

    if (list.lineStart) {
      repr += list.lineStart;
    }
    if (list.lineEnd) {
      repr += `, ${list.lineEnd}`;
    }

    repr += ')';

    return repr;
  }

  visitRenumInstr(_renum: Renum): string {
    return 'Renum';
  }

  visitSaveInstr(save: Save): string {
    return `New(${this.format(save.filename)})`;
  }

  visitRunInstr(_run: Run): string {
    return 'Run';
  }

  visitEndInstr(_end: End): string {
    return 'End';
  }

  visitExitInstr(exit: ExitInstr): string {
    return `Exit(${this.format(exit.expression)})`;
  }

  visitLetInstr(let_: Let): string {
    return `Let(${this.format(let_.variable)}, ${this.format(let_.value)})`;
  }

  visitAssignInstr(assign: Assign): string {
    return `Assign(${this.format(assign.variable)}, ${this.format(assign.value)})`;
  }

  visitShortIfInstr(if_: ShortIf): string {
    let formatted = `ShortIf (${this.format(if_.condition)}) { `;
    formatted += if_.then.map((c) => this.format(c)).join(' : ') + ' }';
    if (if_.else_.length) {
      formatted +=
        ' { ' + if_.else_.map((c) => this.format(c)).join(' : ') + ' }';
    }
    return formatted;
  }

  visitIfInstr(if_: If): string {
    return `If (${this.format(if_.condition)})`;
  }

  visitElseInstr(_else: Else): string {
    return `Else`;
  }

  visitElseIfInstr(elseIf: ElseIf): string {
    return `ElseIf (${this.format(elseIf.condition)})`;
  }

  visitEndIfInstr(_endif: EndIf): string {
    return 'EndIf';
  }

  visitForInstr(for_: For): string {
    return `For(${this.format(for_.variable)}, ${this.format(for_.value)})`;
  }

  visitOnwardInstr(_onward: Onward): string {
    return 'Onward';
  }

  visitNextInstr(_next: Next): string {
    return 'Next';
  }

  visitWhileInstr(while_: While): string {
    return `While (${this.format(while_.condition)})`;
  }

  visitEndWhileInstr(_endWhile: EndWhile): string {
    return `EndWhile`;
  }

  visitRepeatInstr(_repeat: Repeat): string {
    return `Repeat`;
  }

  visitUntilInstr(until: Until): string {
    return `Until (${this.format(until.condition)})`;
  }

  private formatArgv(params: Expr[], octal: boolean = false): string {
    return params
      .map((expr) => {
        if (octal && expr instanceof IntLiteral) {
          return '0' + expr.value.toString(8);
        }
        return this.format(expr);
      })
      .join(' ');
  }

  visitCommandInstr(command: Command): string {
    return `Command (${this.format(command.name)}, ${this.formatArgv(command.params)})`;
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

// Set and export the default formatter.
formatter = new DefaultFormatter();
export { formatter };

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
      exitCode = red(exitCode);
    } else {
      exitCode = green(exitCode);
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
