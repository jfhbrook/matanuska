import type { Value } from '../value';

import { Byte } from './byte';
import { OpCode } from './opcodes';

export class Chunk {
  public filename: string = '<unknown>';
  public constants: Value[] = [];
  // TODO: In a C implementation, this would be an array of bytes. In clox,
  // the values are either opcodes, indexes to constants, or 16 byte offsets.
  //
  // In theory, I should be able to use an UInt8Array and do the same bit
  // shifting shenanigans as clox to handle 16 bit values. Using them is a
  // little challenging, though, and will require more research.
  //
  // For now, I'm using an Array to prototype.
  public code: Byte[] = [];

  // The index is the same as the bytecode's. The value is the lineNo. Runtime
  // error reporting doesn't include the source line, just the line number
  // (and perhaps the name of the function).
  public lines: number[] = [];

  // Write an opcode, including its corresponding line number.
  public writeOp(op: OpCode, lineNo: number): void {
    this.code.push(op);
    this.lines.push(lineNo);
  }

  // Returns the index of the constant. I believe clox uses this number to
  // immediately write the ADD_CONSTANT op.
  public addConstant(value: Value): number {
    this.constants.push(value);
    return this.constants.length - 1;
  }
}
