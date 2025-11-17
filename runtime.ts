import * as assert from 'node:assert';

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
import { BaseException, NameError, NotImplementedError } from './exceptions';
import type { Executor } from './executor';
import { Exit } from './exit';
import { RuntimeFault } from './faults';
import { Host } from './host';
import { Stack } from './stack';
import { Traceback } from './traceback';
import { Value, nil, undef } from './value';
import { falsey } from './value/truthiness';
import { nullish } from './value/nullness';

import { Byte } from './bytecode/byte';
import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';
import { Short, bytesToShort } from './bytecode/short';

import * as op from './operations';

export type Globals = Record<string, Value>;

export class Runtime {
  public stack: Stack<Value>;
  public pc: number = -1;
  public chunk: Chunk = new Chunk();
  public globals: Globals = {};

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

  public async interpret(chunk: Chunk): Promise<Value> {
    this.chunk = chunk;
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
    assert.equal(typeof value, 'string', 'Value is string');
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
      let a: Value | null = null;
      let b: Value | null = null;

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
              a = this.readByte();
              this.stack.push(this.stack.peek(a) as Value);
              break;
            case OpCode.SetLocal:
              a = this.readByte();
              this.stack.set(a, this.stack.peek() as Value);
              break;
            case OpCode.GetGlobal:
              // Reads the constant, does not operate on the stack
              a = this.readString();
              b = this.globals[a];
              if (typeof b === 'undefined') {
                throw new NameError(`Variable ${a} is undefined`);
              }
              this.stack.push(b);
              break;
            case OpCode.DefineGlobal:
              // Identifier from instruction
              a = this.readString();
              // Variable value from values stack
              // NOTE: Pops afterwards for garbage collection reasons
              b = this.stack.peek();
              if (typeof this.globals[a] !== 'undefined') {
                throw new NameError(`Cannot define variable ${a} twice`);
              }
              this.globals[a] = b as Value;
              // NOTE: Pop here
              this.stack.pop();
              break;
            case OpCode.SetGlobal:
              // Identifier from instruction
              a = this.readString();
              b = this.stack.peek();
              if (typeof this.globals[a] === 'undefined') {
                throw new NameError(`Cannot assign to undefined variable ${a}`);
              }
              this.globals[a] = b as Value;
              // TODO: We currently do not pop the value after setting a global
              // variable. This is because our reference vm, clox, treats
              // assignments as expressions with the assigned value as the
              // return value. Matanuska BASIC treats assignment as an
              // instruction, which does not need to return anything. But we
              // delegate this action to the compiler, for now, to avoid bugs
              // during implementation.
              break;
            case OpCode.Eq:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.eq(a, b));
              break;
            case OpCode.Gt:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.gt(a, b));
              break;
            case OpCode.Ge:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.ge(a, b));
              break;
            case OpCode.Lt:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.lt(a, b));
              break;
            case OpCode.Le:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.le(a, b));
              break;
            case OpCode.Ne:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.ne(a, b));
              break;
            case OpCode.Not:
              a = this.stack.pop();
              this.stack.push(op.not(a));
              break;
            case OpCode.Add:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.add(a, b));
              break;
            case OpCode.Sub:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.sub(a, b));
              break;
            case OpCode.Mul:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.mul(a, b));
              break;
            case OpCode.Div:
              b = this.stack.pop();
              a = this.stack.pop();
              this.stack.push(op.div(a, b));
              break;
            case OpCode.Neg:
              a = this.stack.pop();
              this.stack.push(op.neg(a));
              break;
            case OpCode.Print:
              this.host.writeLine(this.stack.pop());
              break;
            case OpCode.Exit:
              a = this.stack.pop();
              if (typeof a === 'number') {
                b = Math.floor(a);
              } else if (nullish(a)) {
                b = 0;
              } else if (a) {
                b = 1;
              } else {
                b = 0;
              }
              this.host.exit(b);
              return undef;
            case OpCode.Command:
              await this.command();
              break;
            case OpCode.Jump:
              // Note: readShort increments the pc. If we didn't assign before,
              // we would need to add extra to skip over those bytes!
              a = this.readShort();
              this.pc += a;
              break;
            case OpCode.JumpIfFalse:
              a = this.readShort();
              b = this.stack.peek();

              if (falsey(b!)) {
                this.pc += a;
              }
              break;
            case OpCode.Loop:
              // Note: Same caveat as Jump
              a = this.readShort();
              this.pc -= a;
              break;
            case OpCode.Return:
              a = this.stack.pop();
              // TODO: Clean up the current frame, and only return if we're
              // done with the main program.
              return a;
            default:
              assert.ok(
                this.pc < this.chunk.code.length,
                'Program counter out of bounds',
              );
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
