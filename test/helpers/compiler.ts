import { describe, expect, test } from 'vitest';

import { Instr } from '../../ast/instr';
import { Program } from '../../ast';
import { Chunk } from '../../bytecode/chunk';
import { disassemble } from '../../bytecode/disassembler';
import {
  compileInstruction,
  compileProgram,
  CompilerOptions,
  CompileResult,
} from '../../compiler';

export function compile(
  ast: Program | Instr,
  options: CompilerOptions = {},
): CompileResult<Chunk> {
  if (ast instanceof Program) {
    return compileProgram(ast, options);
  } else {
    return compileInstruction(ast, options);
  }
}

export type TestCase = [string, Instr | Program, Chunk];

export function runCompilerTest([source, ast, expected]: TestCase): void {
  test(source, () => {
    const actual = compile(ast)[0];

    expect({
      constants: actual.constants,
      code: disassemble(actual),
      lines: actual.lines,
    }).toEqual({
      constants: expected.constants,
      code: disassemble(expected),
      lines: expected.lines,
    });
  });
}

export function runCompilerSuite(name: string, tests: TestCase[]): void {
  describe(name, () => {
    for (const test of tests) {
      runCompilerTest(test);
    }
  });
}
