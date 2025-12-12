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
  RuntimeError,
  NotImplementedError,
} from './exceptions';
import type { Executor } from './executor';
import { Exit } from './exit';
import { RuntimeFault } from './faults';
import { Host } from './host';
import { Stack } from './stack';
import { Traceback } from './traceback';
import {
  BaseRoutine,
  NativeRoutine,
  Routine,
  RoutineType,
  Value,
  nil,
  undef,
} from './value';
import { falsey } from './value/truthiness';
import { nullish } from './value/nullness';

import { Byte } from './bytecode/byte';
import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';
import { Short, bytesToShort } from './bytecode/short';

import * as op from './operations';

export type Globals = Record<string, Value>;
export type RegisterName = string;

export class Frame {
  constructor(
    public routine: Routine,
    public pc: number,
    public slot: number,
    public argCount: number,
  ) {}
}

export class Runtime {
  public stack: Stack<Value>;
  public frames: Stack<Frame>;
  public acc: Record<RegisterName, Value> = {
    a: undef,
    b: undef,
  };

  constructor(
    private host: Host,
    private executor: Executor,
    private globals: Globals = {},
  ) {
    this.stack = new Stack();
    this.frames = new Stack();

    this.reset();
  }

  public reset(): void {
    this.stack = new Stack();
    this.frames = new Stack();
  }

  public get frame(): Frame {
    return this.frames.peek(0)!;
  }

  public get routine(): Routine {
    return this.frame.routine;
  }

  public get chunk(): Chunk {
    return this.routine.chunk;
  }

  public get registers(): Record<RegisterName, Value> {
    return {
      pc: this.frame.pc,
      sp: this.frame.slot,
      a: this.acc.a,
      b: this.acc.b,
    };
  }

  private slot(n: number): number {
    return this.frame.slot + n;
  }

  public async interpret(routine: Routine): Promise<Value> {
    // "this"
    this.stack.push(routine);

    this.call(routine, 0);

    const rv = await this.run();
    return rv;
  }

  // TODO: Using templates can help decrease boilerplate while increasing the
  // amount of inlining. But if I'm going down that road, I might want to
  // consider porting this to C++ anyway.

  private readByte(): Byte {
    const byte = this.chunk.code[this.frame.pc];
    this.frame.pc++;
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

  private createTraceback(): Traceback {
    let traceback: Traceback | null = null;
    for (let i = 0; i < this.frames.size - 1; i++) {
      const { pc, routine } = this.frames.get(i)!;
      const chunk = routine.chunk;

      traceback = new Traceback(
        traceback,
        chunk.filename,
        chunk.routine,
        chunk.lines[pc - 1],
      );
    }

    return traceback!;
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

  private async call(callee: Value, argCount: number): Promise<void> {
    if (callee instanceof NativeRoutine) {
      await this._callNative(callee, argCount);
    } else if (callee instanceof Routine) {
      this._call(callee, argCount);
    } else {
      throw new RuntimeError('Value is not callable');
    }
  }

  private _call(callee: Routine, argCount: number): void {
    this._checkArity(callee, argCount);
    this.frames.push(
      new Frame(callee, 0, this.stack.size - argCount - 1, argCount),
    );
  }

  private async _callNative(
    callee: NativeRoutine,
    argCount: number,
  ): Promise<void> {
    this._checkArity(callee, argCount);

    const args: Value[] = this.stack.take(argCount);
    const rv = await callee.call(...args);

    this.stack.pop();
    this.stack.push(rv);
  }

  private _checkArity(callee: BaseRoutine, argCount: number): void {
    // TODO: How do I want to handle arity? This is copied from lox
    if (argCount !== callee.arity) {
      throw new RuntimeError(
        `Expected ${callee.arity} arguments, received ${argCount}`,
      );
    }
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
              this.stack.push(this.stack.get(this.slot(this.acc.a)) || undef);
              break;
            case OpCode.SetLocal:
              this.acc.a = this.readByte();
              this.stack.set(this.slot(this.acc.a), this.stack.peek() || undef);
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
              this.frame.pc += this.acc.a;
              break;
            case OpCode.JumpIfFalse:
              this.acc.a = this.readShort();
              this.acc.b = this.stack.peek() || undef;

              if (falsey(this.acc.b!)) {
                this.frame.pc += this.acc.a;
              }
              break;
            case OpCode.Loop:
              // Note: Same caveat as Jump
              this.acc.a = this.readShort();
              this.frame.pc -= this.acc.a;
              break;
            case OpCode.Call:
              // arg count
              this.acc.a = this.readByte();
              await this.call(this.stack.peek(this.acc.a)!, this.acc.a);
              break;
            case OpCode.Return:
              this.acc.a = this.stack.pop();
              if (this.routine.type === RoutineType.Function) {
                const frame = this.frames.pop();

                // Clean up the call args from the frame
                this.stack.take(frame.argCount + 1);

                this.stack.push(this.acc.a);
              } else {
                this.frames.pop();
                return this.acc.a;
              }
              break;
            default:
              if (this.frame.pc >= this.chunk.code.length) {
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
