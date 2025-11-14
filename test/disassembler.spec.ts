import { describe, expect, test } from 'vitest';

import { shortToBytes } from '../bytecode/short';
import { OpCode } from '../bytecode/opcodes';
import { disassemble } from '../bytecode/disassembler';

import { chunk } from './helpers/bytecode';

describe('expressions', () => {
  test('255', () => {
    expect(
      disassemble(
        chunk({
          constants: [255],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('123.456', () => {
    expect(
      disassemble(
        chunk({
          constants: [123.456],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  for (const bool of [true, false]) {
    test(`${bool}`, () => {
      expect(
        disassemble(
          chunk({
            constants: [bool],
            code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
            lines: [-1, -1, -1, -1, -1],
          }),
        ),
      ).toMatchSnapshot();
    });
  }

  test('nil', () => {
    expect(
      disassemble(
        chunk({
          constants: [],
          code: [OpCode.Nil, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('"hello world"', () => {
    expect(
      disassemble(
        chunk({
          constants: ['hello world'],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('(1)', () => {
    expect(
      disassemble(
        chunk({
          constants: [1],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('1 + 1', () => {
    expect(
      disassemble(
        chunk({
          constants: [1, 1],
          code: [
            OpCode.Constant,
            0,
            OpCode.Constant,
            1,
            OpCode.Add,
            OpCode.Pop,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [-1, -1, -1, -1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('-1', () => {
    expect(
      disassemble(
        chunk({
          constants: [1],
          code: [
            OpCode.Constant,
            0,
            OpCode.Neg,
            OpCode.Pop,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [-1, -1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('1 : 1', () => {
    expect(
      disassemble(
        chunk({
          constants: [1, 1],
          code: [
            OpCode.Constant,
            0,
            OpCode.Pop,
            OpCode.Constant,
            1,
            OpCode.Pop,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [-1, -1, -1, -1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('print', () => {
  test('print 255', () => {
    expect(
      disassemble(
        chunk({
          constants: [255],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('print 123.456', () => {
    expect(
      disassemble(
        chunk({
          constants: [123.456],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  for (const bool of [true, false]) {
    test(`print ${bool}`, () => {
      expect(
        disassemble(
          chunk({
            constants: [bool],
            code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
            lines: [-1, -1, -1, -1, -1],
          }),
        ),
      ).toMatchSnapshot();
    });
  }

  test('print nil', () => {
    expect(
      disassemble(
        chunk({
          constants: [],
          code: [OpCode.Nil, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('print "hello world"', () => {
    expect(
      disassemble(
        chunk({
          constants: ['hello world'],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('print (1)', () => {
    expect(
      disassemble(
        chunk({
          constants: [1],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('print 1 + 1', () => {
    expect(
      disassemble(
        chunk({
          constants: [1, 1],
          code: [
            OpCode.Constant,
            0,
            OpCode.Constant,
            1,
            OpCode.Add,
            OpCode.Print,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [-1, -1, -1, -1, -1, -1, -1, -1],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('print i% + 1', () => {
    expect(
      disassemble(
        chunk({
          constants: ['i%', 1],
          code: [
            OpCode.Constant,
            0,
            OpCode.GetGlobal,
            0,
            OpCode.Constant,
            1,
            OpCode.Add,
          ],
          lines: [100, 100, 100, 100, 100, 100, 100],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('let i% = 1', () => {
    expect(
      disassemble(
        chunk({
          constants: ['i%', 1],
          code: [
            OpCode.Constant,
            0,
            OpCode.Constant,
            1,
            OpCode.DefineGlobal,
            0,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [100, 100, 100, 100, 100, 100, 100, 100],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('i% = 1', () => {
    expect(
      disassemble(
        chunk({
          constants: ['i%', 1],
          code: [
            OpCode.Constant,
            0,
            OpCode.Constant,
            1,
            OpCode.SetGlobal,
            0,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [100, 100, 100, 100, 100, 100, 100, 100],
        }),
      ),
    ).toMatchSnapshot();
  });

  test('if true then print "true" else print "false" endif', () => {
    expect(
      disassemble(
        chunk({
          constants: [true, 'true', 'false'],
          code: [
            OpCode.Constant,
            0,
            // Jump to "else"
            OpCode.JumpIfFalse,
            ...shortToBytes(7),
            // "then" block
            OpCode.Pop,
            OpCode.Constant,
            1,
            OpCode.Print,
            // Jump to end
            OpCode.Jump,
            ...shortToBytes(4),
            // "else" block
            OpCode.Pop,
            OpCode.Constant,
            2,
            OpCode.Print,
            OpCode.Nil,
            OpCode.Return,
          ],
          lines: [
            100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
            100, 100, 100, 100, 100,
          ],
        }),
      ),
    ).toMatchSnapshot();
  });
});

test('simple program', () => {
  expect(
    disassemble(
      chunk({
        constants: ['hello world', 'goodbye'],
        code: [
          OpCode.Constant,
          0,
          OpCode.Print,
          OpCode.Constant,
          1,
          OpCode.Print,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [100, 100, 100, 200, 200, 200, 200, 200],
      }),
    ),
  ).toMatchSnapshot();
});

test('command', () => {
  expect(
    disassemble(
      chunk({
        constants: [],
        code: [OpCode.Command, 6],
        lines: [100],
      }),
    ),
  ).toMatchSnapshot();
});

test('malformed lines', () => {
  expect(
    disassemble(
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [],
      }),
    ),
  ).toMatchSnapshot();
});

test('missing constants', () => {
  expect(
    disassemble(
      chunk({
        constants: [],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    ),
  ).toMatchSnapshot();
});

test('unknown opcode', () => {
  expect(
    disassemble(
      chunk({
        constants: [],
        // It's over nine thousand!!!
        code: [9001 as OpCode],
        lines: [-1],
      }),
    ),
  ).toMatchSnapshot();
});
