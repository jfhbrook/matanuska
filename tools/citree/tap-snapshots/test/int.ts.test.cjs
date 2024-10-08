/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/int.ts > TAP > integration > must match snapshot 1`] = `
import { Expr, Variable } from './expr';

export interface InstrVisitor<R> {
  visitLetInstr(node: Let): R;
  visitAssignInstr(node: Assign): R;
  visitExpressionInstr(node: Expression): R;
  visitPrintInstr(node: Print): R;
  visitExitInstr(node: Exit): R;
  visitEndInstr(node: End): R;
  visitNewInstr(node: New): R;
  visitLoadInstr(node: Load): R;
  visitListInstr(node: List): R;
  visitRenumInstr(node: Renum): R;
  visitRunInstr(node: Run): R;
  visitSaveInstr(node: Save): R;
  visitRemInstr(node: Rem): R;
}

export abstract class Instr {
  constructor(
    public offsetStart: number = -1,
    public offsetEnd: number = -1,
  ) {}

  abstract accept<R>(visitor: InstrVisitor<R>): R;
}

export class Let extends Instr {
  constructor(
    public variable: Variable,
    public value: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitLetInstr(this);
  }
}

export class Assign extends Instr {
  constructor(
    public variable: Variable,
    public value: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitAssignInstr(this);
  }
}

export class Expression extends Instr {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitExpressionInstr(this);
  }
}

export class Print extends Instr {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitPrintInstr(this);
  }
}

export class Exit extends Instr {
  constructor(
    public expression: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitExitInstr(this);
  }
}

export class End extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitEndInstr(this);
  }
}

export class New extends Instr {
  constructor(
    public filename: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitNewInstr(this);
  }
}

export class Load extends Instr {
  constructor(
    public filename: Expr,
    public run: boolean,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitLoadInstr(this);
  }
}

export class List extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitListInstr(this);
  }
}

export class Renum extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitRenumInstr(this);
  }
}

export class Run extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitRunInstr(this);
  }
}

export class Save extends Instr {
  constructor(
    public filename: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitSaveInstr(this);
  }
}

export class Rem extends Instr {
  constructor(
    public remark: string,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitRemInstr(this);
  }
}

`

exports[`test/int.ts > TAP > integration > must match snapshot 2`] = `
import { Token, TokenKind } from '../tokens';

export interface ExprVisitor<R> {
  visitUnaryExpr(node: Unary): R;
  visitBinaryExpr(node: Binary): R;
  visitLogicalExpr(node: Logical): R;
  visitGroupExpr(node: Group): R;
  visitVariableExpr(node: Variable): R;
  visitIntLiteralExpr(node: IntLiteral): R;
  visitRealLiteralExpr(node: RealLiteral): R;
  visitBoolLiteralExpr(node: BoolLiteral): R;
  visitStringLiteralExpr(node: StringLiteral): R;
  visitPromptLiteralExpr(node: PromptLiteral): R;
  visitNilLiteralExpr(node: NilLiteral): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class Unary extends Expr {
  constructor(
    public op: TokenKind,
    public expr: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Binary extends Expr {
  constructor(
    public left: Expr,
    public op: TokenKind,
    public right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Logical extends Expr {
  constructor(
    public left: Expr,
    public op: TokenKind,
    public right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

export class Group extends Expr {
  constructor(public expr: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupExpr(this);
  }
}

export class Variable extends Expr {
  constructor(public ident: Token) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}

export class IntLiteral extends Expr {
  constructor(public value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitIntLiteralExpr(this);
  }
}

export class RealLiteral extends Expr {
  constructor(public value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitRealLiteralExpr(this);
  }
}

export class BoolLiteral extends Expr {
  constructor(public value: boolean) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBoolLiteralExpr(this);
  }
}

export class StringLiteral extends Expr {
  constructor(public value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitStringLiteralExpr(this);
  }
}

export class PromptLiteral extends Expr {
  constructor(public value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitPromptLiteralExpr(this);
  }
}

export class NilLiteral extends Expr {
  constructor() {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitNilLiteralExpr(this);
  }
}

`

exports[`test/int.ts > TAP > integration > must match snapshot 3`] = `
import { Instr } from './instr';

export interface TreeVisitor<R> {
  visitCmdTree(node: Cmd): R;
  visitLineTree(node: Line): R;
  visitInputTree(node: Input): R;
  visitProgramTree(node: Program): R;
}

export abstract class Tree {
  abstract accept<R>(visitor: TreeVisitor<R>): R;
}

export class Cmd extends Tree {
  constructor(
    public cmdNo: number,
    public row: number,
    public source: string,
    public instructions: Instr[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitCmdTree(this);
  }
}

export class Line extends Tree {
  constructor(
    public lineNo: number,
    public row: number,
    public source: string,
    public instructions: Instr[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitLineTree(this);
  }
}

export class Input extends Tree {
  constructor(public input: Array<Cmd | Line>) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitInputTree(this);
  }
}

export class Program extends Tree {
  constructor(
    public filename: string,
    public lines: Line[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitProgramTree(this);
  }
}

`
