//#if _MATBAS_BUILD == 'debug'
import { Span } from './debug';
//#else
//#unset _DEBUG_TRACE_RUNTIME
//#endif
//#if _MATBAS_BUILD == 'debug'
import { startSpan } from './debug';
//#endif
//#if _DEBUG_TRACE_RUNTIME
import { startTraceExec, traceExec } from './debug';
//#endif
import {
  BaseException,
  AssertionError,
  NameError,
  NotImplementedError,
} from './exceptions';
import type { Executor } from './executor';
import { Exit } from './exit';
import { RuntimeFault } from './faults';
import { Host } from './host';
import { Stack } from './stack';
import { Traceback } from './traceback';
import { Routine, Value, nil, undef } from './value';
import { falsey } from './value/truthiness';
import { nullish } from './value/nullness';

import { Byte } from './bytecode/byte';
import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';
import { Short, bytesToShort } from './bytecode/short';

import * as op from './operations';

export type Globals = Record<string, Value>;
export type RegisterName = string;

export class Runtime {
  public stack: Stack<Value>;
  public pc: number = -1;
  public chunk: Chunk = new Chunk();
  public globals: Globals = {};
  public acc: Record<RegisterName, Value> = {
    a: undef,
    b: undef,
  };

  constructor(
    private host: Host,
    private executor: Executor,
  ) {
    this.stack = new Stack();
  }

  public reset(): void {
    this.stack = new Stack();
    this.chunk = new Chunk();
    this.pc = 0;
  }

  public get registers(): Record<RegisterName, Value> {
    return {
      PC: this.pc,
      SP: -1,
      A: this.acc.a,
      B: this.acc.b,
    };
  }

  /**
   * Create a context under which it is safe to interpret a new chunk while
   * another program is executing.
   *
   * TODO: I'm not satisfied with this naming...
   */
  public async using<R>(fn: () => Promise<R>): Promise<R> {
    const chunk = this.chunk;
    const pc = this.pc;
    const ret = await fn();
    this.chunk = chunk;
    this.pc = pc;
    return ret;
  }

  public async interpret(routine: Routine): Promise<Value> {
    this.chunk = routine.chunk;
    this.pc = 0;
    return await this.run();
  }

  // TODO: Using templates can help decrease boilerplate while increasing the
  // amount of inlining. But if I'm going down that road, I might want to
  // consider porting this to C++ anyway.

  private readByte(): Byte {
    const byte = this.chunk.code[this.pc];
    this.pc++;
    return byte;
  }

  private readCode(): OpCode {
    return this.readByte();
  }

  private readConstant(): Value {
    return this.chunk.constants[this.readByte()];
  }

  private readShort(): Short {
    return bytesToShort([this.readByte(), this.readByte()]);
  }

  private readString(): string {
    const value = this.readConstant();
    if (typeof value !== 'string') {
      throw new AssertionError('Value must be a string');
    }
    return value as string;
  }

  private createTraceback(): Traceback | null {
    return new Traceback(
      null,
      this.chunk.filename,
      this.chunk.lines[this.pc - 1],
    );
  }

  private async command(): Promise<void> {
    const args: Array<Value> = [];
    let n = this.readByte();
    while (n > 1) {
      args.unshift(this.stack.pop());
      n--;
    }
    const name = this.stack.pop();

    await this.executor.command(name as string, args);
  }

  private async run(): Promise<Value> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('Runtime#run', async (_: Span): Promise<Value> => {
      //#endif

      //#if _DEBUG_TRACE_RUNTIME
      startTraceExec();
      //#endif

      try {
        while (true) {
          //#if _DEBUG_TRACE_RUNTIME
          traceExec(this);
          //#endif
          const instruction = this.readCode();

          switch (instruction) {
            case OpCode.Constant:
              this.stack.push(this.readConstant());
              break;
            case OpCode.Nil:
              this.stack.push(nil);
              break;
            case OpCode.Undef:
              this.stack.push(undef);
              break;
            case OpCode.True:
              this.stack.push(true);
              break;
            case OpCode.False:
              this.stack.push(false);
              break;
            case OpCode.Pop:
              this.stack.pop();
              break;
            case OpCode.GetLocal:
              this.acc.a = this.readByte();
              this.stack.push(this.stack.peek(this.acc.a) || undef);
              break;
            case OpCode.SetLocal:
              this.acc.a = this.readByte();
              this.stack.set(this.acc.a, this.stack.peek() || undef);
              break;
            case OpCode.GetGlobal:
              // Reads the constant, does not operate on the stack
              this.acc.a = this.readString();
              this.acc.b = this.globals[this.acc.a];
              if (typeof this.acc.b === 'undefined') {
                throw new NameError(`Variable ${this.acc.a} is undefined`);
              }
              this.stack.push(this.acc.b);
              break;
            case OpCode.DefineGlobal:
              // Identifier from instruction
              this.acc.a = this.readString();
              // Variable value from values stack
              // NOTE: Pops afterwards for garbage collection reasons
              this.acc.b = this.stack.peek() || undef;
              if (typeof this.globals[this.acc.a] !== 'undefined') {
                throw new NameError(
                  `Cannot define variable ${this.acc.a} twice`,
                );
              }
              this.globals[this.acc.a] = this.acc.b;
              // NOTE: Pop here
              this.stack.pop();
              break;
            case OpCode.SetGlobal:
              // Identifier from instruction
              this.acc.a = this.readString();
              this.acc.b = this.stack.peek() || undef;
              if (typeof this.globals[this.acc.a] === 'undefined') {
                throw new NameError(
                  `Cannot assign to undefined variable ${this.acc.a}`,
                );
              }
              this.globals[this.acc.a] = this.acc.b;
              // TODO: We currently do not pop the value after setting a global
              // variable. This is because our reference vm, clox, treats
              // assignments as expressions with the assigned value as the
              // return value. Matanuska BASIC treats assignment as an
              // instruction, which does not need to return anything. But we
              // delegate this action to the compiler, for now, to avoid bugs
              // during implementation.
              break;
            case OpCode.Eq:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.eq(this.acc.a, this.acc.b));
              break;
            case OpCode.Gt:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.gt(this.acc.a, this.acc.b));
              break;
            case OpCode.Ge:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.ge(this.acc.a, this.acc.b));
              break;
            case OpCode.Lt:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.lt(this.acc.a, this.acc.b));
              break;
            case OpCode.Le:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.le(this.acc.a, this.acc.b));
              break;
            case OpCode.Ne:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.ne(this.acc.a, this.acc.b));
              break;
            case OpCode.Not:
              this.acc.a = this.stack.pop();
              this.stack.push(op.not(this.acc.a));
              break;
            case OpCode.Add:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.add(this.acc.a, this.acc.b));
              break;
            case OpCode.Sub:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.sub(this.acc.a, this.acc.b));
              break;
            case OpCode.Mul:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.mul(this.acc.a, this.acc.b));
              break;
            case OpCode.Div:
              this.acc.b = this.stack.pop();
              this.acc.a = this.stack.pop();
              this.stack.push(op.div(this.acc.a, this.acc.b));
              break;
            case OpCode.Neg:
              this.acc.a = this.stack.pop();
              this.stack.push(op.neg(this.acc.a));
              break;
            case OpCode.Print:
              this.host.writeLine(this.stack.pop());
              break;
            case OpCode.Exit:
              this.acc.a = this.stack.pop();
              if (typeof this.acc.a === 'number') {
                this.acc.b = Math.floor(this.acc.a);
              } else if (nullish(this.acc.a)) {
                this.acc.b = 0;
              } else if (this.acc.a) {
                this.acc.b = 1;
              } else {
                this.acc.b = 0;
              }
              this.host.exit(this.acc.b);
              return undef;
            case OpCode.Command:
              await this.command();
              break;
            case OpCode.Jump:
              // Note: readShort increments the pc. If we didn't assign before,
              // we would need to add extra to skip over those bytes!
              this.acc.a = this.readShort();
              this.pc += this.acc.a;
              break;
            case OpCode.JumpIfFalse:
              this.acc.a = this.readShort();
              this.acc.b = this.stack.peek() || undef;

              if (falsey(this.acc.b!)) {
                this.pc += this.acc.a;
              }
              break;
            case OpCode.Loop:
              // Note: Same caveat as Jump
              this.acc.a = this.readShort();
              this.pc -= this.acc.a;
              break;
            case OpCode.Return:
              this.acc.a = this.stack.pop();
              // TODO: Clean up the current frame, and only return if we're
              // done with the main program.
              return this.acc.a;
            default:
              if (this.pc >= this.chunk.code.length) {
                throw new AssertionError('Program counter out of bounds');
              }
              this.notImplemented(`Unknown opcode: ${instruction}`);
          }
        }
      } catch (err) {
        let exc = err;
        if (err instanceof Exit) {
          throw err;
        }

        if (!(err instanceof BaseException)) {
          exc = RuntimeFault.fromError(err);
        }

        exc.traceback = this.createTraceback();
        throw exc;
      }

      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  }

  private notImplemented(message: string): Value {
    throw new NotImplementedError(message);
  }
}
