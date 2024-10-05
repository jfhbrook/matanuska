import * as assert from 'assert';

import { startTraceExec, traceExec } from './debug';

import { BaseException, NameError, NotImplementedError } from './exceptions';
import { Exit } from './exit';
import { RuntimeFault } from './faults';
import { Host } from './host';
import { Stack } from './stack';
import { Traceback } from './traceback';
import { Value, nil, Nil } from './value';
import { falsey } from './value/truthiness';

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

  constructor(private host: Host) {
    this.stack = new Stack();
  }

  public reset(): void {
    this.stack = new Stack();
    this.chunk = new Chunk();
    this.pc = 0;
  }

  public interpret(chunk: Chunk): Value | null {
    this.chunk = chunk;
    this.pc = 0;
    return this.run();
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

  private run(): Value | null {
    let a: Value | null = null;
    let b: Value | null = null;

    startTraceExec();

    try {
      while (true) {
        traceExec(this);
        const instruction = this.readCode();

        switch (instruction) {
          case OpCode.Constant:
            this.stack.push(this.readConstant());
            break;
          case OpCode.Nil:
            this.stack.push(nil);
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
          case OpCode.GetGlobal:
            a = this.readString();
            b = this.globals[a];
            if (typeof b === 'undefined') {
              throw new NameError(`Variable ${a} is undefined`);
            }
            this.stack.push(b);
            break;
          case OpCode.DefineGlobal:
            a = this.readString();
            // NOTE: Pops afterwards for garbage collection reasons
            b = this.stack.peek();
            if (typeof this.globals[a] !== 'undefined') {
              throw new NameError(`Cannot define variable ${a} twice`);
            }
            this.globals[a] = b as Value;
            this.stack.pop();
            break;
          case OpCode.SetGlobal:
            a = this.readString();
            // NOTE: Pops afterwards for garbage collection reasons
            b = this.stack.peek();
            if (typeof this.globals[a] === 'undefined') {
              throw new NameError(`Cannot assign to undefined variable ${a}`);
            }
            this.globals[a] = b as Value;
            // TODO: This is missing from my clox implementation. That's a
            // bug, right?
            this.stack.pop();
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
            } else if (a instanceof Nil) {
              b = 0;
            } else if (a) {
              b = 1;
            } else {
              b = 0;
            }
            this.host.exit(b);
            return null;
          case OpCode.Jump:
            // Note, readShort increments the pc. If we didn't assign before,
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
            this.notImplemented('Loop');
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
  }

  private notImplemented(message: string): Value {
    throw new NotImplementedError(message);
  }
}
