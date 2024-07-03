import { Expr, Variable } from './expr';

export interface CmdVisitor<R> {
  visitRemCmd(node: Rem): R;
  visitLetCmd(node: Let): R;
  visitAssignCmd(node: Assign): R;
  visitExpressionCmd(node: Expression): R;
  visitPrintCmd(node: Print): R;
  visitExitCmd(node: Exit): R;
  visitNewCmd(node: New): R;
  visitLoadCmd(node: Load): R;
  visitListCmd(node: List): R;
  visitRenumCmd(node: Renum): R;
  visitRunCmd(node: Run): R;
  visitSaveCmd(node: Save): R;
  visitEndCmd(node: End): R;
  visitShortIfCmd(node: ShortIf): R;
  visitIfCmd(node: If): R;
  visitElseCmd(node: Else): R;
  visitElseIfCmd(node: ElseIf): R;
}

export abstract class Cmd {
  constructor(
    public offsetStart: number = -1,
    public offsetEnd: number = -1,
  ) {}

  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Rem extends Cmd {
  constructor(
    public remark: string,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitRemCmd(this);
  }
}

export class Let extends Cmd {
  constructor(
    public variable: Variable,
    public value: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitLetCmd(this);
  }
}

export class Assign extends Cmd {
  constructor(
    public variable: Variable,
    public value: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitAssignCmd(this);
  }
}

export class Expression extends Cmd {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExpressionCmd(this);
  }
}

export class Print extends Cmd {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitPrintCmd(this);
  }
}

export class Exit extends Cmd {
  constructor(
    public expression: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExitCmd(this);
  }
}

export class New extends Cmd {
  constructor(
    public filename: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitNewCmd(this);
  }
}

export class Load extends Cmd {
  constructor(
    public filename: Expr,
    public run: boolean,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitLoadCmd(this);
  }
}

export class List extends Cmd {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitListCmd(this);
  }
}

export class Renum extends Cmd {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitRenumCmd(this);
  }
}

export class Run extends Cmd {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitRunCmd(this);
  }
}

export class Save extends Cmd {
  constructor(
    public filename: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitSaveCmd(this);
  }
}

export class End extends Cmd {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitEndCmd(this);
  }
}

export class ShortIf extends Cmd {
  constructor(
    public condition: Expr,
    public then: Cmd[],
    public else_: Cmd[],
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitShortIfCmd(this);
  }
}

export class If extends Cmd {
  constructor(
    public condition: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitIfCmd(this);
  }
}

export class Else extends Cmd {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitElseCmd(this);
  }
}

export class ElseIf extends Cmd {
  constructor(
    public condition: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitElseIfCmd(this);
  }
}
