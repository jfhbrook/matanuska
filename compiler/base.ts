//#if _MATBAS_BUILD == 'debug'
import { Span } from '../debug';
//#else
//#unset _DEBUG_SHOW_CHUNK
//#endif

//#if _MATBAS_BUILD == 'debug'
import { startSpan } from '../debug';
//#endif
//#if _DEBUG_SHOW_CHUNK
import { showChunk } from '../debug';
//#endif
import { errorType } from '../errors';
import {
  SyntaxError,
  ParseError,
  ParseWarning,
  mergeParseErrors,
} from '../exceptions';
import { RuntimeFault, runtimeMethod } from '../faults';
import { emptyToken, Token, TokenKind } from '../tokens';
import { nil, Routine, RoutineType, Value } from '../value';
// import { Type } from './value/types';
// import { Stack } from './stack';
import { Line, Program } from '../ast';
import { Source } from '../ast/source';
import {
  Expr,
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
} from '../ast/expr';
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
  Exit,
  End,
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
  Def,
  ShortDef,
  Return,
  EndDef,
  Command,
} from '../ast/instr';

import { Block } from './block';
import { Scope } from './scope';

import { Short, shortToBytes } from '../bytecode/short';
import { Chunk } from '../bytecode/chunk';
import { OpCode } from '../bytecode/opcodes';

@errorType('Synchronize')
class Synchronize extends Error {
  constructor() {
    super('Synchronize');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type CompilerOptions = {
  filename?: string;
  cmdNo?: number;
  cmdSource?: Source;
};

export type CompileResult<T> = [T, ParseWarning | null];

class GlobalBlock extends Block {
  kind = 'global';
}

class ProgramBlock extends Block {
  kind = 'program';
}

class InputBlock extends Block {
  kind = 'command';
}

export function isRootBlock(block: Block): boolean {
  return (
    block instanceof ProgramBlock ||
    block instanceof InputBlock ||
    block instanceof GlobalBlock
  );
}

//
// if, else, else if and endif
//

// QJSEngine does not allow circular references. We work around this by
// stubbing out the references ahead of time, then setting them after the
// relevant blocks are defined.
let ElseBlock: any = null;
let ElseIfBlock: any = null;

class IfBlock extends Block {
  kind = 'if';

  constructor(public elseJump: Short) {
    super();
  }

  visitElseInstr(else_: Else): void {
    const endJump = this.compiler.beginElse(this.elseJump);
    this.next(else_, new ElseBlock(endJump));
  }

  visitElseIfInstr(elseIf: ElseIf): void {
    const endJump = this.compiler.beginElse(this.elseJump);
    const elseJump = this.compiler.beginIf(elseIf.condition);
    this.next(elseIf, new ElseIfBlock(elseJump, endJump));
  }

  visitEndIfInstr(_endIf: EndIf): void {
    // TODO: Optimize for no 'else'
    const endJump = this.compiler.beginElse(this.elseJump);
    this.compiler.endIf(endJump);
    this.end();
  }
}

class _ElseBlock extends Block {
  kind = 'else';

  constructor(public endJump: Short) {
    super();
  }

  visitEndIfInstr(_endIf: EndIf): void {
    this.compiler.endIf(this.endJump);
    this.end();

    let block: any = this.previous;
    while (block instanceof ElseIfBlock) {
      block.compiler.endIf(block.endJump);
      block.end();
      block = block.parent;
    }
  }
}

class _ElseIfBlock extends IfBlock {
  kind = 'else if';

  constructor(
    elseJump: Short,
    public endJump: Short,
  ) {
    super(elseJump);
  }

  visitEndIfInstr(_endIf: EndIf): void {
    const endJump = this.compiler.beginElse(this.elseJump);
    this.compiler.endIf(endJump);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let block: any = this;
    while (block instanceof ElseIfBlock) {
      block.compiler.endIf(block.endJump);
      block.end();
      block = block.previous;
    }
  }
}

// Update the references here
ElseBlock = _ElseBlock;
ElseIfBlock = _ElseIfBlock;

//
// For, while, and repeat/until
//

class ForBlock extends Block {
  kind = 'for';

  constructor(
    public incrStart: Short,
    public exitJump: Short,
  ) {
    super();
  }

  // TODO
  visitOnwardInstr(onward: Onward): void {
    super.visitOnwardInstr(onward);
  }

  visitNextInstr(_next: Next): void {
    this.compiler.endFor(this.incrStart, this.exitJump);
    this.end();
  }
}

class WhileBlock extends Block {
  kind = 'while';

  constructor(
    public loopStart: Short,
    public exitJump: Short,
  ) {
    super();
  }

  // TODO
  visitOnwardInstr(onward: Onward): void {
    super.visitOnwardInstr(onward);
  }

  visitEndWhileInstr(_endWhile: EndWhile): void {
    this.compiler.endWhile(this.loopStart, this.exitJump);
    this.end();
  }
}

class RepeatBlock extends Block {
  kind = 'repeat';

  constructor(public startJump: Short) {
    super();
  }

  // TODO
  visitOnwardInstr(onward: Onward): void {
    super.visitOnwardInstr(onward);
  }

  visitUntilInstr(until: Until): void {
    this.compiler.endRepeat(until, this.startJump);
    this.end();
  }
}

//
// Functions
//

class FunctionBlock extends Block {
  kind = 'def';

  _parentRoutine: Routine;

  constructor() {
    super();
  }

  visitReturnInstr(ret: Return): void {
    super.visitReturnInstr(ret);
    this.compiler.endFunction();
  }

  visitEndDefInstr(_endDef: EndDef): void {
    this.compiler.emitReturn();
    this.compiler.endFunction();
  }
}

//
// Compile a series of lines. These lines may be from an entire program,
// or a single line in the context of a compiled instruction.
//
export class LineCompiler implements InstrVisitor<void>, ExprVisitor<void> {
  public routine: Routine;
  private parents: Routine[];
  private lines: Line[] = [];
  private currentInstrNo: number = -1;
  private currentLine: number = 0;

  // private stack: Stack<Type> = new Stack();

  // Set to true whenever an expression command is compiled. In the case of
  // Instrs, this will signal that the result of the single expression
  // should be returned. In Program cases, it's ignored.
  private _isReturningInstruction: boolean = false;

  private isError: boolean = false;
  private errors: SyntaxError[] = [];

  public global: Block;
  public block: Block;
  public scope: Scope;

  constructor(
    lines: Line[],
    routineType: RoutineType,
    { filename }: CompilerOptions,
  ) {
    this.routine = new Routine(routineType, filename || null);
    this.parents = [];
    this.lines = lines;
    this.isError = false;
    this.errors = [];

    this.global = new GlobalBlock();
    this.global.init(this, null, null, null);

    this.block = new GlobalBlock();

    if (routineType === RoutineType.Program) {
      this.block = new ProgramBlock();
    } else if (routineType === RoutineType.Input) {
      this.block = new InputBlock();
    } else {
      this.block = new FunctionBlock();
    }

    this.block.init(this, null, null, this.global);

    this.scope = new Scope(this);

    // Add local for executing routine
    this.scope.addLocal(emptyToken());
  }

  /**
   * Compile a program.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  @runtimeMethod
  compile(): CompileResult<Routine> {
    let instr: Instr | null = this.advance();
    while (instr) {
      try {
        this.instruction(instr);
        instr = this.advance();
      } catch (err) {
        if (err instanceof Synchronize) {
          this.synchronize();
          instr = this.peek();
          continue;
        }
        throw err;
      }
    }

    try {
      this.checkBlocksClosed();
    } catch (err) {
      if (!(err instanceof Synchronize)) {
        throw err;
      }
    }

    if (this.isError) {
      throw new ParseError(this.errors);
    }

    this.emitReturn();
    this.showChunk();

    return [this.routine, null];
  }

  private showChunk(): void {
    //#if _DEBUG_SHOW_CHUNK
    showChunk(this.routine.chunk);
    //#endif
  }

  private get routineType(): RoutineType {
    return this.routine.type;
  }

  private get filename(): string {
    return this.routine.filename;
  }

  get chunk(): Chunk {
    return this.routine.chunk;
  }

  // Parsing navigation methods. These are only used when compiling a full
  // program that includes loops.

  private match(...types: (typeof Instr)[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: typeof Instr): boolean {
    if (this.done) return false;
    return this.peek() instanceof type;
  }

  private advance(): Instr | null {
    if (this.done) {
      return null;
    }
    this.currentInstrNo++;
    // Move to the next non-empty line if current line has no instructions
    while (
      !this.done &&
      this.currentInstrNo >= this.lines[this.currentLine].instructions.length
    ) {
      this.currentLine++;
      this.currentInstrNo = 0;
    }

    if (this.done) {
      return null;
    }
    return this.peek();
  }

  private get done(): boolean {
    if (this.currentLine >= this.lines.length) {
      return true;
    } else {
      return false;
    }
  }

  public peek(): Instr | null {
    if (this.done) {
      return null;
    }
    return this.lines[this.currentLine].instructions[this.currentInstrNo];
  }

  private createSyntaxError(instr: Instr, message: string): SyntaxError {
    return new SyntaxError(message, {
      filename: this.filename,
      row: this.rowNo,
      isLine: this.routineType !== RoutineType.Input,
      lineNo: this.lineNo,
      cmdNo: this.routineType === RoutineType.Input ? null : this.lineNo,
      offsetStart: instr.offsetStart,
      offsetEnd: instr.offsetEnd,
      source: this.lineSource,
    });
  }

  public syntaxError(instr: Instr, message: string): never {
    const exc = this.createSyntaxError(instr, message);
    this.isError = true;
    this.errors.push(exc);
    throw new Synchronize();
  }

  public syntaxFault(instr: Instr, message: string): never {
    const exc = this.createSyntaxError(instr, message);
    throw RuntimeFault.fromError(exc);
  }

  private synchronize(): void {
    this.currentLine++;
    this.currentInstrNo = 0;
  }

  private get lineNo(): number {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].lineNo;
    }

    return this.lines[this.currentLine].lineNo;
  }

  private get rowNo(): number {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].row;
    }

    return this.lines[this.currentLine].row;
  }

  private get lineSource(): Source {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].source;
    }

    return this.lines[this.currentLine].source;
  }

  private checkBlocksClosed(): void {
    if (!isRootBlock(this.block)) {
      this.syntaxError(
        this.block.instr!,
        `${this.block.kind} has not been closed`,
      );
    }
  }

  public emitByte(byte: number): void {
    this.chunk.writeOp(byte, this.lineNo);
  }

  public emitBytes(...bytes: number[]): void {
    for (const byte of bytes) {
      this.emitByte(byte);
    }
  }

  private emitConstant(value: Value): void {
    this.emitBytes(OpCode.Constant, this.makeConstant(value));
  }

  private emitJump(code: OpCode): Short {
    this.emitByte(code);
    // Emit jump address as two bytes
    this.emitBytes(0xff, 0xff);
    // Address of first byte of jump (?)
    return this.chunk.code.length - 2;
  }

  private patchJump(jumpAddr: Short): void {
    // Amount of instructions to jump over
    const jump = this.chunk.code.length - jumpAddr - 2;
    const [first, second] = shortToBytes(jump);
    this.chunk.code[jumpAddr] = first;
    this.chunk.code[jumpAddr + 1] = second;
  }

  private emitLoop(start: number): void {
    this.emitByte(OpCode.Loop);
    // +2 to account for the bytes we just added
    const offset = this.chunk.code.length - start + 2;
    const [first, second] = shortToBytes(offset);
    this.emitBytes(first, second);
  }

  private get isReturningInstruction(): boolean {
    return (
      this.routineType === RoutineType.Input && this._isReturningInstruction
    );
  }

  // NOTE: This is only used to emit implicit and bare returns. Valued
  // returns would be handled in visitReturnStmt.
  public emitReturn(): void {
    // NOTE: If/when implementing classes, I would need to detect when
    // compiling a constructor and return "this", not nil.

    if (!this.isReturningInstruction) {
      if (this.routineType === RoutineType.Function) {
        this.emitByte(OpCode.Nil);
      } else {
        this.emitByte(OpCode.Undef);
      }
    }

    this.emitByte(OpCode.Return);
  }

  private makeConstant(value: Value): number {
    // TODO: clox validates that the return value is byte sized.
    return this.chunk.addConstant(value);
  }

  public makeIdent(ident: Token): Short {
    // NOTE: Called "identifierConstant" in clox
    return this.makeConstant(ident.value as Value);
  }

  //
  // Instructions
  //

  private instruction(instr: Instr): void {
    instr.accept(this);
  }

  visitPrintInstr(print: Print): void {
    print.expression.accept(this);
    this.emitByte(OpCode.Print);
  }

  visitExpressionInstr(expr: Expression): void {
    this._isReturningInstruction = true;
    expr.expression.accept(this);

    // NOTE: In commands, save the result to return later.
    if (this.routineType === RoutineType.Program) {
      this.emitByte(OpCode.Pop);
    }
  }

  visitRemInstr(_rem: Rem): void {}

  visitNewInstr(new_: New): void {
    let n = 1;
    this.emitConstant('new');
    if (new_.filename) {
      new_.filename.accept(this);
      n = 2;
    }
    this.emitBytes(OpCode.Command, n);
  }

  visitLoadInstr(load: Load): void {
    this.emitConstant('load');
    for (const expr of load.params) {
      expr.accept(this);
    }
    this.emitBytes(OpCode.Command, 1 + load.params.length);
  }

  visitListInstr(list: List): void {
    this.emitConstant('list');
    this.emitConstant(list.lineStart || nil);
    this.emitConstant(list.lineEnd || nil);
    this.emitBytes(OpCode.Command, 3);
  }

  visitRenumInstr(_renum: Renum): void {
    this.emitConstant('renum');
    this.emitBytes(OpCode.Command, 1);
  }

  visitSaveInstr(save: Save): void {
    this.emitConstant('save');
    if (save.filename) {
      save.filename.accept(this);
    } else {
      this.emitConstant(nil);
    }
    this.emitBytes(OpCode.Command, 2);
  }

  visitRunInstr(_run: Run): void {
    this.emitConstant('run');
    this.emitBytes(OpCode.Command, 1);
  }

  visitEndInstr(_end: End): void {
    // TODO: I'm currently treating 'end' as a synonym for 'return nil'.
    // But perhaps it should behave differently? In MSX it also cleans up
    // open file handles.
    this.emitReturn();
  }

  visitExitInstr(exit: Exit): void {
    if (exit.expression) {
      exit.expression.accept(this);
    } else {
      this.emitConstant(0);
    }
    this.emitByte(OpCode.Exit);
  }

  visitLetInstr(let_: Let): void {
    this.let_(let_.variable.ident, let_.value);
  }

  // NOTE: Corresponds to varDeclaration() in clox
  private let_(ident: Token, value: Expr | null): void {
    const target = this.scope.ident(ident);
    if (value) {
      value.accept(this);
    } else {
      this.emitByte(OpCode.Undef);
    }
    this.scope.define(target);
  }

  visitAssignInstr(assign: Assign): void {
    this.assign(assign.variable, assign.value);
  }

  private assign(variable: Variable, value: Expr) {
    value.accept(this);
    this.scope.assign(variable.ident);
  }

  visitShortIfInstr(if_: ShortIf): void {
    const elseJump = this.beginIf(if_.condition);

    for (const instr of if_.then) {
      this.instruction(instr);
    }

    const endJump = this.beginElse(elseJump);

    for (const instr of if_.else_) {
      this.instruction(instr);
    }

    this.endIf(endJump);
  }

  visitIfInstr(if_: If): void {
    const elseJump = this.beginIf(if_.condition);
    this.block.begin(if_, new IfBlock(elseJump));
  }

  beginIf(cond: Expr): Short {
    cond.accept(this);
    const elseJump = this.emitJump(OpCode.JumpIfFalse);
    this.emitByte(OpCode.Pop);
    return elseJump;
  }

  visitElseInstr(else_: Else): void {
    this.block.handle(else_);
  }

  beginElse(elseJump: Short): Short {
    const endJump = this.emitJump(OpCode.Jump);
    this.patchJump(elseJump);
    this.emitByte(OpCode.Pop);
    return endJump;
  }

  visitElseIfInstr(elseIf: ElseIf): void {
    this.block.handle(elseIf);
  }

  visitEndIfInstr(endIf: EndIf): void {
    this.block.handle(endIf);
  }

  endIf(endJump: Short): void {
    this.patchJump(endJump);
  }

  visitForInstr(for_: For): void {
    const { variable, value, stop } = for_;
    const step = for_.step || new IntLiteral(1);
    const [incrStart, exitJump] = this.beginFor(variable, value!, stop, step);
    this.block.begin(for_, new ForBlock(incrStart, exitJump));
  }

  beginFor(
    variable: Variable,
    value: Expr,
    stop: Expr,
    step: Expr,
  ): [Short, Short] {
    // i% <= stop
    const cond = new Binary(variable, TokenKind.Le, stop);
    // i% + step
    const incr = new Binary(variable, TokenKind.Plus, step);

    // Begin scope
    this.scope.begin();

    // Define the variable
    this.let_(variable.ident, value);

    // Loop starts here
    const loopStart = this.chunk.code.length;

    // Evaluate the condition
    cond.accept(this);

    // Jump to the exit if condition false
    const exitJump = this.emitJump(OpCode.JumpIfFalse);

    // Pop the evaluated condition
    this.emitByte(OpCode.Pop);

    // Jump to the body
    const bodyJump = this.emitJump(OpCode.Jump);

    // We'll jump back to this increment later
    const incrStart = this.chunk.code.length;
    // Increment the variable
    this.assign(variable, incr);
    // Remove the assigned value from the stack
    this.emitByte(OpCode.Pop);
    // Go back to the start of the loop, where we eval
    this.emitLoop(loopStart);

    // Body starts here
    this.patchJump(bodyJump);

    return [incrStart, exitJump];
  }

  visitNextInstr(next: Next): void {
    this.block.handle(next);
  }

  endFor(incrStart: Short, exitJump: Short): void {
    this.emitLoop(incrStart);
    this.scope.end();
    this.patchJump(exitJump);
  }

  visitWhileInstr(while_: While): void {
    const [loopStart, exitJump] = this.beginWhile(while_.condition);
    this.block.begin(while_, new WhileBlock(loopStart, exitJump));
  }

  beginWhile(cond: Expr): [Short, Short] {
    const loopStart = this.chunk.code.length;
    cond.accept(this);

    const exitJump = this.emitJump(OpCode.JumpIfFalse);

    this.emitByte(OpCode.Pop);

    return [loopStart, exitJump];
  }

  visitEndWhileInstr(endWhile: EndWhile): void {
    this.block.handle(endWhile);
  }

  endWhile(loopStart: Short, exitJump: Short): void {
    this.emitLoop(loopStart);
    this.patchJump(exitJump);
  }

  visitRepeatInstr(repeat: Repeat): void {
    const loopStart = this.chunk.code.length;
    this.block.begin(repeat, new RepeatBlock(loopStart));
  }

  visitUntilInstr(until: Until): void {
    this.block.handle(until);
  }

  endRepeat(until: Until, start: Short): void {
    until.condition.accept(this);

    const exitJump = this.emitJump(OpCode.JumpIfFalse);

    this.emitByte(OpCode.Pop);
    this.emitLoop(start);

    this.patchJump(exitJump);
  }

  visitOnwardInstr(onward: Onward): void {
    this.block.handle(onward);
  }

  visitDefInstr(def: Def): void {
    this.beginFunction(def);
    this.block.begin(def, new FunctionBlock());
  }

  visitShortDefInstr(def: ShortDef): void {
    this.beginFunction(def);
    def.body.accept(this);
    this.emitByte(OpCode.Return);
    this.endFunction();
  }

  public beginFunction(def: Def | ShortDef | Lambda): void {
    const routine = new Routine(
      RoutineType.Function,
      this.filename,
      def.name ? def.name.text : null,
      def.params.length,
    );

    this.parents.push(this.routine);
    this.routine = routine;

    this.scope.begin();

    // These variables are initialized to null, and will get filled in later.
    for (const param of def.params) {
      this.let_(param, null);
    }
  }

  public endFunction(): void {
    this.showChunk();

    this.scope.end();

    const routine = this.routine;
    this.routine = this.parents.pop()!;
    this.emitConstant(routine);
  }

  visitReturnInstr(ret: Return): void {
    this.block.handle(ret);
  }

  visitEndDefInstr(endDef: EndDef): void {
    this.block.handle(endDef);
  }

  visitCommandInstr(command: Command): void {
    command.name.accept(this);
    for (const expr of command.params) {
      expr.accept(this);
    }
    this.emitBytes(OpCode.Command, 1 + command.params.length);
  }

  //
  // Expressions
  //

  visitUnaryExpr(unary: Unary): void {
    unary.expr.accept(this);
    switch (unary.op) {
      case TokenKind.Plus:
        // No-op
        break;
      case TokenKind.Minus:
        this.emitByte(OpCode.Neg);
        break;
      case TokenKind.Not:
        this.emitByte(OpCode.Not);
        break;
      default:
        this.syntaxError(this.peek() as Instr, 'Invalid unary operator');
    }
  }

  visitBinaryExpr(binary: Binary): void {
    binary.left.accept(this);
    binary.right.accept(this);
    switch (binary.op) {
      case TokenKind.Plus:
        this.emitByte(OpCode.Add);
        break;
      case TokenKind.Minus:
        this.emitByte(OpCode.Sub);
        break;
      case TokenKind.Star:
        this.emitByte(OpCode.Mul);
        break;
      case TokenKind.Slash:
        this.emitByte(OpCode.Div);
        break;
      case TokenKind.EqEq:
        this.emitByte(OpCode.Eq);
        break;
      case TokenKind.Gt:
        this.emitByte(OpCode.Gt);
        break;
      case TokenKind.Ge:
        this.emitByte(OpCode.Ge);
        break;
      case TokenKind.Lt:
        this.emitByte(OpCode.Lt);
        break;
      case TokenKind.Le:
        this.emitByte(OpCode.Le);
        break;
      case TokenKind.Ne:
        this.emitByte(OpCode.Ne);
        break;
      default:
        this.syntaxError(this.peek() as Instr, 'Invalid binary operator');
    }
  }

  visitLogicalExpr(logical: Logical): void {
    switch (logical.op) {
      case TokenKind.And:
        this.emitAnd(logical);
        break;
      case TokenKind.Or:
        this.emitOr(logical);
        break;
      default:
        this.syntaxError(this.peek() as Instr, 'Invalid logical operator');
    }
  }

  private emitAnd(logical: Logical): void {
    logical.left.accept(this);
    const endJump = this.emitJump(OpCode.JumpIfFalse);
    this.emitByte(OpCode.Pop);
    logical.right.accept(this);
    this.patchJump(endJump);
  }

  private emitOr(logical: Logical): void {
    logical.left.accept(this);
    const elseJump = this.emitJump(OpCode.JumpIfFalse);
    const endJump = this.emitJump(OpCode.Jump);
    this.patchJump(elseJump);
    this.emitByte(OpCode.Pop);
    logical.right.accept(this);
    this.patchJump(endJump);
  }

  visitCallExpr(call: Call): void {
    for (const arg of call.args) {
      arg.accept(this);
    }
    this.emitBytes(OpCode.Call, call.args.length);
  }

  visitGroupExpr(group: Group): void {
    group.expr.accept(this);
  }

  visitVariableExpr(variable: Variable): void {
    this.scope.get(variable.ident);
  }

  visitLambdaExpr(lambda: Lambda): void {
    this.beginFunction(lambda);
    lambda.body.accept(this);
    this.emitByte(OpCode.Return);
    this.endFunction();
  }

  visitIntLiteralExpr(int: IntLiteral): void {
    this.emitConstant(int.value);
  }

  visitRealLiteralExpr(real: RealLiteral): void {
    this.emitConstant(real.value);
  }

  visitBoolLiteralExpr(bool: BoolLiteral): void {
    this.emitConstant(bool.value);
  }

  visitStringLiteralExpr(str: StringLiteral): void {
    this.emitConstant(str.value);
  }

  visitShellLiteralExpr(shell: ShellLiteral): void {
    this.emitConstant(shell.value);
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): void {}

  visitNilLiteralExpr(_: NilLiteral): void {
    this.emitByte(OpCode.Nil);
  }
}

/**
 * Compile an individual runtime instruction.
 *
 * @param instr An individual runtime instruction to compile.
 * @param options Compiler options.
 * @returns The result of compiling the instruction, plus warnings.
 */
export function compileInstruction(
  instr: Instr,
  options: CompilerOptions = {},
): CompileResult<Routine> {
  //#if _MATBAS_BUILD == 'debug'
  return startSpan('compileInstruction', (_: Span): CompileResult<Routine> => {
    //#endif
    const { cmdNo, cmdSource } = options;
    const lines = [
      new Line(cmdNo || 100, 1, cmdSource || Source.unknown(), [instr]),
    ];
    const compiler = new LineCompiler(lines, RoutineType.Input, options);
    return compiler.compile();

    //#if _MATBAS_BUILD == 'debug'
  });
  //#endif
}

/**
 * Compile a series of instructions.
 *
 * @param instrs The instructions to compile.
 * @param options Compiler options.
 * @returns The result of compiling each line, plus warnings.
 */
export function compileInstructions(
  cmds: Instr[],
  options: CompilerOptions = {},
): CompileResult<Routine[]> {
  const results: CompileResult<Routine>[] = cmds.map((cmd) => {
    const [routine, warning] = compileInstruction(cmd, options);
    return [routine, warning];
  });

  const commands: Routine[] = results.map(([routine, _]) => routine);
  const warnings: Array<ParseWarning | null> = results.reduce(
    (acc, [_, warns]) => (warns ? acc.concat(warns) : acc),
    [] as Array<ParseWarning | null>,
  );
  return [commands, mergeParseErrors(warnings)];
}

/**
 * Compile an entire program.
 *
 * @param program An entire program to compile.
 * @param options Compiler options.
 * @returns The result of compiling the program, plus warnings.
 */
export function compileProgram(
  program: Program,
  options: CompilerOptions = {},
): CompileResult<Routine> {
  //#if _MATBAS_BUILD == 'debug'
  return startSpan('compileProgram', (_: Span): CompileResult<Routine> => {
    //#endif
    const compiler = new LineCompiler(
      program.lines,
      RoutineType.Program,
      options,
    );
    return compiler.compile();

    //#if _MATBAS_BUILD == 'debug'
  });
  //#endif
}
