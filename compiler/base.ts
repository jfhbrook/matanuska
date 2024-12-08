import { trace } from '@opentelemetry/api';

import { showChunk } from '../debug';
import { errorType } from '../errors';
import { SyntaxError, ParseError, ParseWarning } from '../exceptions';
import { RuntimeFault, runtimeMethod } from '../faults';
import { formatter } from '../format';
import { addEvent } from '../telemetry';
import { Token, TokenKind } from '../tokens';
import { Value } from '../value';
// import { Type } from './value/types';
// import { Stack } from './stack';
import { Line, Program } from '../ast';
import { Source } from '../ast/source';
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
} from '../ast/instr';
import {
  Expr,
  ExprVisitor,
  Unary,
  Binary,
  Logical,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from '../ast/expr';

import { Block } from './block';

import { Short, shortToBytes } from '../bytecode/short';
import { Chunk } from '../bytecode/chunk';
import { OpCode } from '../bytecode/opcodes';

const tracer = trace.getTracer('main');

export enum RoutineType {
  Command,
  Program,
}

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

class CommandBlock extends Block {
  kind = 'command';
}

export function isRootBlock(block: Block): boolean {
  return (
    block instanceof ProgramBlock ||
    block instanceof CommandBlock ||
    block instanceof GlobalBlock
  );
}

//
// if, else, else if and endif
//

class IfBlock extends Block {
  kind = 'if';

  constructor(public elseJump: Short) {
    super();
  }

  visitElseInstr(else_: Else): void {
    const endJump = this.compiler.else_(this.elseJump);
    this.next(else_, new ElseBlock(endJump));
  }

  visitElseIfInstr(elseIf: ElseIf): void {
    const endJump = this.compiler.else_(this.elseJump);
    const elseJump = this.compiler.if_(elseIf.condition);
    this.next(elseIf, new ElseIfBlock(elseJump, endJump));
  }

  visitEndIfInstr(_endIf: EndIf): void {
    // TODO: Optimize for no 'else'
    const endJump = this.compiler.else_(this.elseJump);
    this.compiler.endIf(endJump);
    this.end();
  }
}

class ElseBlock extends Block {
  kind = 'else';

  constructor(public endJump: Short) {
    super();
  }

  visitEndIfInstr(_endIf: EndIf): void {
    this.compiler.endIf(this.endJump);
    this.end();

    let block: Block | null = this.previous;
    while (block instanceof ElseIfBlock) {
      block.compiler.endIf(block.endJump);
      block.end();
      block = block.parent;
    }
  }
}

class ElseIfBlock extends IfBlock {
  kind = 'else if';

  constructor(
    elseJump: Short,
    public endJump: Short,
  ) {
    super(elseJump);
  }

  visitEndIfInstr(_endIf: EndIf): void {
    const endJump = this.compiler.else_(this.elseJump);
    this.compiler.endIf(endJump);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let block: Block | null = this;
    while (block instanceof ElseIfBlock) {
      block.compiler.endIf(block.endJump);
      block.end();
      block = block.previous;
    }
  }
}

//
// Compile a series of lines. These lines may be from an entire program,
// or a single line in the context of a compiled instruction.
//
export class LineCompiler implements InstrVisitor<void>, ExprVisitor<void> {
  private currentChunk: Chunk;
  private lines: Line[] = [];
  private currentInstrNo: number = -1;
  private currentLine: number = 0;

  private filename: string;
  private routineType: RoutineType = RoutineType.Command;

  // private stack: Stack<Type> = new Stack();

  // Set to true whenever an expression command is compiled. In the case of
  // Instrs, this will signal that the result of the single expression
  // should be returned. In Program cases, it's ignored.
  private isExpressionCmd: boolean = false;

  private isError: boolean = false;
  private errors: SyntaxError[] = [];

  public global: Block;
  public block: Block;

  constructor(
    lines: Line[],
    routineType: RoutineType,
    { filename }: CompilerOptions,
  ) {
    this.lines = lines;
    this.routineType = routineType;
    this.currentChunk = new Chunk();
    this.filename = filename || '<unknown>';
    this.currentChunk.filename = this.filename;
    this.routineType = routineType;
    this.isError = false;
    this.errors = [];

    this.global = new GlobalBlock();
    this.global.init(this, null, null, null);

    this.block =
      routineType === RoutineType.Program
        ? new ProgramBlock()
        : new CommandBlock();
    this.block.init(this, null, null, this.global);
  }

  /**
   * Compile a program.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  @runtimeMethod
  compile(): CompileResult<Chunk> {
    const span = tracer.startSpan('compile');
    try {
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

      showChunk(this.chunk);
      return [this.chunk, null];
    } finally {
      span.end();
    }
  }

  /**
   * Get the current chunk.
   **/
  get chunk(): Chunk {
    return this.currentChunk;
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

    addEvent('advance', {
      lineNo: this.lineNo,
      rowNo: this.rowNo,
      currentInstrNo: this.currentInstrNo,
    });

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

  private peek(): Instr | null {
    if (this.done) {
      return null;
    }
    return this.lines[this.currentLine].instructions[this.currentInstrNo];
  }

  private createSyntaxError(instr: Instr, message: string): SyntaxError {
    return new SyntaxError(message, {
      filename: this.filename,
      row: this.rowNo,
      isLine: this.routineType !== RoutineType.Command,
      lineNo: this.lineNo,
      cmdNo: this.routineType === RoutineType.Command ? null : this.lineNo,
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

  private interactive(name: string, instr: Instr): never {
    const span = tracer.startSpan(name);
    try {
      this.syntaxError(
        instr,
        `Cannot run interactive command in scripts: ${name}`,
      );
    } finally {
      span.end();
    }
  }

  private synchronize(): void {
    const span = tracer.startSpan('synchronize');
    this.currentLine++;
    this.currentInstrNo = 0;
    span.end();
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

  private emitByte(byte: number): void {
    addEvent('emitByte', {
      byte,
      lineNo: this.lineNo,
    });
    this.currentChunk.writeOp(byte, this.lineNo);
  }

  private emitBytes(...bytes: number[]): void {
    for (const byte of bytes) {
      this.emitByte(byte);
    }
  }

  private emitConstant(value: Value): void {
    const span = tracer.startSpan('emitConstant', {
      attributes: { value: formatter.format(value) },
    });
    this.emitBytes(OpCode.Constant, this.makeConstant(value));
    span.end();
  }

  private emitIdent(ident: Token): Short {
    const span = tracer.startSpan('emitIdent', {
      attributes: { ident: formatter.format(ident.value) },
    });
    try {
      const constant = this.makeConstant(ident.value as Value);
      this.emitBytes(OpCode.Constant, constant);
      return constant;
    } finally {
      span.end();
    }
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

  // NOTE: This is only used to emit implicit and bare returns. Valued
  // returns would be handled in visitReturnStmt.
  private emitReturn(): void {
    // NOTE: If/when implementing classes, I would need to detect when
    // compiling a constructor and return "this", not nil.

    if (this.routineType !== RoutineType.Command || !this.isExpressionCmd) {
      this.emitByte(OpCode.Nil);
    }
    this.emitByte(OpCode.Return);
  }

  private makeConstant(value: Value): number {
    // TODO: clox validates that the return value is byte sized.
    return this.currentChunk.addConstant(value);
  }

  //
  // Instructions
  //

  private instruction(instr: Instr): void {
    addEvent('instruction', {
      instr: formatter.format(instr),
    });
    instr.accept(this);
  }

  visitPrintInstr(print: Print): void {
    const span = tracer.startSpan('print');
    try {
      print.expression.accept(this);
      this.emitByte(OpCode.Print);
    } finally {
      span.end();
    }
  }

  visitExpressionInstr(expr: Expression): void {
    const span = tracer.startSpan('expression');
    try {
      this.isExpressionCmd = true;
      expr.expression.accept(this);

      // NOTE: In commands, save the result to return later.
      if (this.routineType === RoutineType.Program) {
        this.emitByte(OpCode.Pop);
      }
    } finally {
      span.end();
    }
  }

  visitRemInstr(_rem: Rem): void {}

  visitNewInstr(new_: New): void {
    return this.interactive('new', new_);
  }

  visitLoadInstr(load: Load): void {
    return this.interactive('load', load);
  }

  visitListInstr(list: List): void {
    return this.interactive('list', list);
  }

  visitRenumInstr(renum: Renum): void {
    return this.interactive('renum', renum);
  }

  visitSaveInstr(save: Save): void {
    return this.interactive('save', save);
  }

  visitRunInstr(run: Run): void {
    return this.interactive('run', run);
  }

  visitEndInstr(_end: End): void {
    const span = tracer.startSpan('end');
    try {
      // TODO: I'm currently treating 'end' as a synonym for 'return nil'.
      // But perhaps it should behave differently? In MSX it also cleans up
      // open file handles.
      this.emitByte(OpCode.Nil);
      this.emitByte(OpCode.Return);
    } finally {
      span.end();
    }
  }

  visitExitInstr(exit: Exit): void {
    const span = tracer.startSpan('exit');
    try {
      if (exit.expression) {
        exit.expression.accept(this);
      } else {
        this.emitConstant(0);
      }
      this.emitByte(OpCode.Exit);
    } finally {
      span.end();
    }
  }

  visitLetInstr(let_: Let): void {
    const span = tracer.startSpan('let');
    try {
      const target = this.emitIdent(let_.variable.ident);
      if (let_.value) {
        let_.value.accept(this);
      } else {
        this.emitByte(OpCode.Nil);
      }
      this.emitBytes(OpCode.DefineGlobal, target);
    } finally {
      span.end();
    }
  }

  visitAssignInstr(assign: Assign): void {
    const span = tracer.startSpan('assign');
    try {
      const target = this.emitIdent(assign.variable.ident);
      assign.value.accept(this);
      this.emitBytes(OpCode.SetGlobal, target);
    } finally {
      span.end();
    }
  }

  visitShortIfInstr(if_: ShortIf): void {
    const elseJump = this.if_(if_.condition);

    for (const instr of if_.then) {
      this.instruction(instr);
    }

    const endJump = this.else_(elseJump);

    for (const instr of if_.else_) {
      this.instruction(instr);
    }

    this.endIf(endJump);
  }

  visitIfInstr(if_: If): void {
    const elseJump = this.if_(if_.condition);
    this.block.begin(if_, new IfBlock(elseJump));
  }

  if_(cond: Expr): Short {
    cond.accept(this);
    const elseJump = this.emitJump(OpCode.JumpIfFalse);
    this.emitByte(OpCode.Pop);
    return elseJump;
  }

  visitElseInstr(else_: Else): void {
    this.block.handle(else_);
  }

  else_(elseJump: Short): Short {
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

  //
  // Expressions
  //

  visitUnaryExpr(unary: Unary): void {
    const span = tracer.startSpan('unary');
    try {
      unary.expr.accept(this);
      switch (unary.op) {
        case TokenKind.Minus:
          this.emitByte(OpCode.Neg);
          break;
        default:
          this.syntaxError(this.peek() as Instr, 'Invalid unary operator');
      }
    } finally {
      span.end();
    }
  }

  visitBinaryExpr(binary: Binary): void {
    const span = tracer.startSpan('binary');
    try {
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
    } finally {
      span.end();
    }
  }

  visitLogicalExpr(_logical: Logical): void {
    const span = tracer.startSpan('binary');
    try {
      return;
    } finally {
      span.end();
    }
  }

  visitGroupExpr(group: Group): void {
    const span = tracer.startSpan('group');
    try {
      group.expr.accept(this);
    } finally {
      span.end();
    }
  }

  visitVariableExpr(variable: Variable): void {
    const span = tracer.startSpan('group');
    try {
      const ident = this.emitIdent(variable.ident);
      this.emitBytes(OpCode.GetGlobal, ident);
    } finally {
      span.end();
    }
  }

  visitIntLiteralExpr(int: IntLiteral): void {
    const span = tracer.startSpan('int literal');
    try {
      this.emitConstant(int.value);
    } finally {
      span.end();
    }
  }

  visitRealLiteralExpr(real: RealLiteral): void {
    const span = tracer.startSpan('real literal');
    try {
      this.emitConstant(real.value);
    } finally {
      span.end();
    }
  }

  visitBoolLiteralExpr(bool: BoolLiteral): void {
    const span = tracer.startSpan('bool literal');
    try {
      this.emitConstant(bool.value);
    } finally {
      span.end();
    }
  }

  visitStringLiteralExpr(str: StringLiteral): void {
    const span = tracer.startSpan('string literal');
    try {
      this.emitConstant(str.value);
    } finally {
      span.end();
    }
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): void {}

  visitNilLiteralExpr(_: NilLiteral): void {
    const span = tracer.startSpan('nil literal');
    try {
      this.emitByte(OpCode.Nil);
    } finally {
      span.end();
    }
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
): CompileResult<Chunk> {
  const { cmdNo, cmdSource } = options;
  const lines = [
    new Line(cmdNo || 100, 1, cmdSource || Source.unknown(), [instr]),
  ];
  const compiler = new LineCompiler(lines, RoutineType.Command, options);
  return compiler.compile();
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
): CompileResult<Chunk> {
  const compiler = new LineCompiler(
    program.lines,
    RoutineType.Program,
    options,
  );
  return compiler.compile();
}
