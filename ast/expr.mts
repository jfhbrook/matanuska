import { Token, TokenKind } from '../tokens.mjs';

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
