import { Token } from '../tokens';
import { OpCode } from '../bytecode/opcodes';
import { Instr } from '../ast/instr';

import type { LineCompiler } from './base';

const UNINITIALIZED = -1;
const UNRESOLVED = -1;

export interface Local {
  name: Token;
  depth: number;
}

export class Scope {
  public locals: Local[];
  public count: number;
  public depth: number;

  constructor(private compiler: LineCompiler) {
    this.locals = [];
    this.depth = 0;
  }

  public begin() {
    this.depth++;
  }

  public end() {
    this.depth--;

    while (
      this.locals.length > 0 &&
      this.locals[this.locals.length - 1].depth > this.depth
    ) {
      this.compiler.emitByte(OpCode.Pop);
      this.locals.pop();
    }
  }

  // NOTE: Corresponds to parseVariable in clox. This is called when defining
  // variables (ie. let), declaring functions, and setting up function
  // parameters.
  public ident(ident: Token): number {
    this.declare(ident);
    if (this.depth > 0) {
      return 0;
    }
    return this.compiler.makeIdent(ident);
  }

  // NOTE: Corresponds to defineVariable in clox
  public define(target: number): void {
    if (this.depth > 0) {
      // Variable should already be on the stack, by visiting the expression
      // that defines it beforehand in the base compiler
      this.initialize(this.locals.length - 1);
      return;
    }

    this.compiler.emitBytes(OpCode.DefineGlobal, target);
  }

  private initialize(index: number): void {
    this.locals[index].depth = this.depth;
  }

  // NOTE: Corresponds to declareVariable in clox
  public declare(ident: Token): void {
    if (!this.depth) {
      // TODO: Is there any special logic to declare a global that isn't
      // necessary in clox?
      return;
    }

    for (let i = this.locals.length - 1; i >= 0; i--) {
      const local = this.locals[i];
      if (local.depth !== UNINITIALIZED && local.depth < this.depth) {
        break;
      }

      if (ident.value === local.name.value) {
        this.compiler.syntaxError(
          this.compiler.peek() as Instr,
          `Already a variable named ${ident.value} in this scope.`,
        );
      }
    }

    this.addLocal(ident);
  }

  private addLocal(ident: Token): void {
    const local: Local = {
      name: ident,
      depth: UNINITIALIZED,
    };

    this.locals.push(local);
  }

  // NOTE: Corresponds to namedVariable when not assigning
  public get(name: Token) {
    let op: OpCode;
    let arg = this.resolveLocal(name);
    if (arg !== -1) {
      op = OpCode.GetLocal;
    } else {
      arg = this.compiler.makeIdent(name);
      op = OpCode.GetGlobal;
    }

    this.compiler.emitBytes(op, arg);
  }

  // NOTE: Corresponds to namedVariable when assigning
  public assign(name: Token): void {
    let op: OpCode;
    let arg: number = this.resolveLocal(name);
    if (arg !== UNRESOLVED) {
      op = OpCode.SetLocal;
    } else {
      arg = this.compiler.makeIdent(name);
      op = OpCode.SetGlobal;
    }
    this.compiler.emitBytes(op, arg);
  }

  private resolveLocal(name: Token): number {
    for (let i = this.locals.length - 1; i >= 0; i--) {
      const local = this.locals[i];
      if (name.value === local.name.value) {
        if (local.depth === UNINITIALIZED) {
          this.compiler.syntaxError(
            this.compiler.peek() as Instr,
            `Can not read ${name.value} in its own definition.`,
          );
        }
        return i;
      }
    }

    return UNRESOLVED;
  }
}
