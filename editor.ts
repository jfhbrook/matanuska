import {
  ParseWarning,
  mergeParseErrors,
  removeFromParseError,
} from './exceptions';
import type { Host } from './host';
import { Token } from './tokens';
import { Line, Program } from './ast';
import { Source } from './ast/source';
import {
  ExprVisitor,
  Unary,
  Binary,
  Logical,
  Call,
  Group,
  Variable,
  Lambda,
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
  Rem,
  Let,
  Assign,
  Expression,
  Print,
  Exit,
  End,
  New,
  Load,
  List,
  Renum,
  Run,
  Save,
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
  Def,
  ShortDef,
  Return,
  EndDef,
  Command,
} from './ast/instr';

type LineNo = number;

interface Index {
  i: number;
  lineNo: LineNo | null;
  match: boolean;
}

// An index corresponding to inserting the line at the very front
const HEAD: number = -1;

type Numbering = {
  to: number;
  toStr: string;
  shift: number;
  source: Source;
};

type Renumbering = Record<LineNo, Numbering>;

export enum Justify {
  Left,
  Right,
}

class InstrShifter implements InstrVisitor<void>, ExprVisitor<void> {
  constructor(public shift: number) {}

  private shiftInstr(instr: Instr): void {
    instr.offsetStart += this.shift;
    instr.offsetEnd += this.shift;
  }

  private shiftToken(tok: Token): void {
    tok.offsetStart += this.shift;
    tok.offsetEnd += this.shift;
  }

  visitRemInstr(rem: Rem): void {
    this.shiftInstr(rem);
  }

  visitLetInstr(let_: Let): void {
    this.shiftInstr(let_);
    let_.variable.accept(this);
  }

  visitAssignInstr(assign: Assign): void {
    this.shiftInstr(assign);
    assign.variable.accept(this);
  }

  visitExpressionInstr(expr: Expression): void {
    this.shiftInstr(expr);
    expr.expression.accept(this);
  }

  visitPrintInstr(print: Print): void {
    this.shiftInstr(print);
    print.expression.accept(this);
  }

  visitExitInstr(exit: Exit): void {
    this.shiftInstr(exit);
    if (exit.expression) {
      exit.expression.accept(this);
    }
  }

  visitEndInstr(end: End): void {
    this.shiftInstr(end);
  }

  visitNewInstr(new_: New): void {
    this.shiftInstr(new_);
    if (new_.filename) {
      new_.filename.accept(this);
    }
  }

  visitLoadInstr(load: Load): void {
    this.shiftInstr(load);
    for (const expr of load.params) {
      expr.accept(this);
    }
  }

  visitListInstr(list: List): void {
    this.shiftInstr(list);
  }

  visitRenumInstr(renum: Renum): void {
    this.shiftInstr(renum);
  }

  visitRunInstr(run: Run): void {
    this.shiftInstr(run);
  }

  visitSaveInstr(save: Save): void {
    this.shiftInstr(save);
    if (save.filename) {
      save.filename.accept(this);
    }
  }

  visitShortIfInstr(shortIf: ShortIf): void {
    this.shiftInstr(shortIf);
    shortIf.condition.accept(this);
    for (const instr of shortIf.then) {
      instr.accept(this);
    }
    for (const instr of shortIf.else_) {
      instr.accept(this);
    }
  }

  visitIfInstr(if_: If): void {
    this.shiftInstr(if_);
    if_.condition.accept(this);
  }

  visitElseInstr(else_: Else): void {
    this.shiftInstr(else_);
  }

  visitElseIfInstr(elseIf: ElseIf): void {
    this.shiftInstr(elseIf);
    elseIf.condition.accept(this);
  }

  visitEndIfInstr(endIf: EndIf): void {
    this.shiftInstr(endIf);
  }

  visitForInstr(for_: For): void {
    this.shiftInstr(for_);
    for_.variable.accept(this);
    for_.value.accept(this);
    for_.stop.accept(this);
    if (for_.step !== null) {
      for_.step.accept(this);
    }
  }

  visitOnwardInstr(onward: Onward): void {
    this.shiftInstr(onward);
  }

  visitNextInstr(next: Next): void {
    this.shiftInstr(next);
  }

  visitWhileInstr(while_: While): void {
    this.shiftInstr(while_);
    while_.condition.accept(this);
  }

  visitEndWhileInstr(endWhile: EndWhile): void {
    this.shiftInstr(endWhile);
  }

  visitRepeatInstr(repeat: Repeat): void {
    this.shiftInstr(repeat);
  }

  visitUntilInstr(until: Until): void {
    this.shiftInstr(until);
    until.condition.accept(this);
  }

  visitDefInstr(fn: Def): void {
    this.shiftInstr(fn);
    this.shiftToken(fn.name);
    for (const param of fn.params) {
      this.shiftToken(param);
    }
  }

  visitShortDefInstr(fn: ShortDef): void {
    this.shiftInstr(fn);
    this.shiftToken(fn.name);
    for (const param of fn.params) {
      this.shiftToken(param);
    }
    fn.body.accept(this);
  }

  visitReturnInstr(ret: Return): void {
    this.shiftInstr(ret);
  }

  visitEndDefInstr(endDef: EndDef): void {
    this.shiftInstr(endDef);
  }

  visitCommandInstr(command: Command): void {
    this.shiftInstr(command);
    for (const expr of command.params) {
      expr.accept(this);
    }
  }

  visitUnaryExpr(unary: Unary): void {
    unary.expr.accept(this);
  }

  visitBinaryExpr(binary: Binary): void {
    binary.left.accept(this);
    binary.right.accept(this);
  }

  visitLogicalExpr(logical: Logical): void {
    logical.left.accept(this);
    logical.right.accept(this);
  }

  visitCallExpr(call: Call): void {
    call.callee.accept(this);
    for (const arg of call.args) {
      arg.accept(this);
    }
  }

  visitGroupExpr(group: Group): void {
    group.expr.accept(this);
  }

  visitVariableExpr(variable: Variable): void {
    this.shiftToken(variable.ident);
  }

  visitLambdaExpr(lambda: Lambda): void {
    for (const param of lambda.params) {
      this.shiftToken(param);
    }
    lambda.body.accept(this);
  }

  visitIntLiteralExpr(_int: IntLiteral): void {}
  visitRealLiteralExpr(_real: RealLiteral): void {}
  visitBoolLiteralExpr(_bool: BoolLiteral): void {}
  visitStringLiteralExpr(_str: StringLiteral): void {}
  visitShellLiteralExpr(_path: ShellLiteral): void {}
  visitPromptLiteralExpr(_prompt: PromptLiteral): void {}
  visitNilLiteralExpr(_nil: NilLiteral): void {}
}

export class Editor {
  public program: Program;
  public warning: ParseWarning | null;
  public justify: Justify = Justify.Left;

  constructor(public host: Host) {
    this.program = new Program('untitled.bas', []);
    this.warning = null;
  }

  get filename(): string {
    return this.host.path.relative('.', this.program.filename);
  }

  set filename(filename: string) {
    this.program.filename = this.host.path.resolve(filename);
  }

  /**
   * Initialize editor state.
   *
   * @param program A program.
   * @param warning An associated warning, if any.
   */
  init(program: Program, warning: ParseWarning | null): void {
    this.program = program;
    this.warning = warning;
  }

  /**
   * Reset the editor.
   */
  reset(): void {
    this.program = new Program('untitled.bas', []);
    this.warning = null;
  }

  /**
   * List the current program.
   *
   * @returns The source code for the program.
   */
  list(lineStart: number | null = null, lineEnd: number | null = null): string {
    let start = 0;
    let end = this.program.lines[this.program.lines.length - 1].lineNo;

    if (lineStart) {
      start = lineStart;
      if (!lineEnd) {
        end = lineStart;
      }
    }

    if (lineEnd) {
      end = lineEnd;
    } else if (lineStart) {
      end = lineStart;
    }

    return this.program.lines
      .filter((l) => l.lineNo >= start && l.lineNo <= end)
      .map((l) => {
        if (
          l.instructions.length === 1 &&
          l.instructions[0] instanceof Rem &&
          l.instructions[0].remark === ''
        ) {
          return `${l.lineNo}`;
        }
        return l.source;
      })
      .join('\n');
  }

  /**
   * Renumber the current program.
   */
  renum(): void {
    const renumbering: Renumbering = {};

    // Used to calculate padding
    let maxToLength: number = 0;

    for (let i = 0; i < this.program.lines.length; i++) {
      const line = this.program.lines[i];

      // Calculate new line number
      const from = line.lineNo;
      const to = (i + 1) * 10;
      const toStr = String(to);
      renumbering[from] = {
        to,
        toStr,
        shift: 0,
        source: line.source,
      };

      // Track max length
      maxToLength = Math.max(maxToLength, toStr.length);
    }

    for (const line of this.program.lines) {
      const from = line.lineNo;
      const { to, toStr } = renumbering[from];

      // Justification
      const leftPadding =
        this.justify === Justify.Left
          ? ''
          : ' '.repeat(maxToLength - toStr.length);
      const rightPadding =
        this.justify === Justify.Left
          ? ' '.repeat(maxToLength - toStr.length + 1)
          : ' ';
      const fromWidth = line.source.prefix.length;
      const toWidth = leftPadding.length + toStr.length + rightPadding.length;
      const shift = toWidth - fromWidth;

      // Renumber the line
      line.lineNo = to;
      line.source.leadingWs = leftPadding;
      line.source.lineNo = toStr;
      line.source.separatingWs = rightPadding;

      // Shift the instructions
      for (const instr of line.instructions) {
        instr.accept(new InstrShifter(shift));
      }

      // Store for shifting the warnings
      renumbering[from].shift = shift;
    }

    // Renumber/format warnings
    if (this.warning) {
      for (let i = 0; i < this.warning.warnings.length; i++) {
        const warning = this.warning.warnings[i];
        const { to, shift, source } = renumbering[warning.lineNo];
        if (to) {
          warning.lineNo = to;
          // TODO: If the warning's source is known to be the same object
          // as line.source, this assignment is unnecessary. But I'd need to
          // look and confirm.
          warning.source = source;
          warning.offsetStart += shift;
          warning.offsetEnd += shift;
        }
      }
    }
  }

  // A binary search to find the index containing a lineNo. If there's no
  // exact match, return the index just prior.
  private findLineIndex(lineNo: number): Index {
    let lower = 0;
    let upper = this.program.lines.length - 1;

    if (!this.program.lines.length) {
      return { i: HEAD, lineNo: null, match: false };
    }

    let lowerLine = this.program.lines[lower];
    let upperLine = this.program.lines[upper];

    if (lowerLine.lineNo > lineNo) {
      return {
        i: HEAD,
        lineNo: null,
        match: false,
      };
    }

    if (lowerLine.lineNo === lineNo) {
      return {
        i: lower,
        lineNo: lowerLine.lineNo,
        match: true,
      };
    }

    if (upperLine.lineNo <= lineNo) {
      return {
        i: upper,
        lineNo: upperLine.lineNo,
        match: upperLine.lineNo === lineNo,
      };
    }

    // At this point, we know that the line, if defined, *must* exist
    // *between* lower and upper.

    while (true) {
      // We've exhausted our options and don't have a match. Since lower and
      // upper are guaranteed to be below and above our line respectively,
      // we can just return lower as the prior line.
      if (upper - lower <= 1) {
        return {
          i: lower,
          lineNo: lowerLine.lineNo,
          match: false,
        };
      }

      const middle = Math.floor((lower + upper) / 2);
      const middleLine = this.program.lines[middle];

      // Exact match!
      if (middleLine.lineNo === lineNo) {
        return {
          i: middle,
          lineNo: middleLine.lineNo,
          match: true,
        };
      }

      // middle is a new bound, either lower or upper
      if (middleLine.lineNo > lineNo) {
        upper = middle;
        upperLine = middleLine;
      } else if (middleLine.lineNo < lineNo) {
        lower = middle;
        lowerLine = middleLine;
      }
    }
  }

  /**
   * Set a line and its corresponding warnings.
   *
   * If a line has no instructions, delete the corresponding line. Otherwise,
   * insert or update the line based on lineNo.
   */
  setLine(line: Line, warning: ParseWarning | null): void {
    const { i, match } = this.findLineIndex(line.lineNo);

    if (!line.instructions.length) {
      if (match) {
        this.program.lines.splice(i, 1);
        this.warning = removeFromParseError(
          this.warning,
          'lineNo',
          line.lineNo,
        );
      }
      return;
    }

    if (match) {
      this.program.lines[i] = line;
      if (warning) {
        this.warning = mergeParseErrors([this.warning, warning]);
      }
      return;
    }

    this.program.lines.splice(i + 1, 0, line);
  }
}
