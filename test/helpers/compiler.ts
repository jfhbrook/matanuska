import { describe, expect, test } from 'vitest';

import { Instr } from '../../ast/instr';
import { Program } from '../../ast';
import { disassemble } from '../../bytecode/disassembler';
import {
  compileInstruction,
  compileProgram,
  CompilerOptions,
  CompileResult,
} from '../../compiler';
import { Routine } from '../../value';

export function compile(
  ast: Program | Instr,
  options: CompilerOptions = {},
): CompileResult<Routine> {
  if (ast instanceof Program) {
    return compileProgram(ast, options);
  } else {
    return compileInstruction(ast, options);
  }
}

export type TestCase = [string, Instr | Program, Routine];

export function runCompilerTest([source, ast, expected]: TestCase): void {
  test(source, () => {
    const actual = compile(ast, { filename: expected.filename })[0];

    /*
    // NOTE: Test chunks typically do not have an initialized filename or routine
    expected.filename = actual.filename;
    expected.routine = actual.routine;
    */

    expect({
      filename: actual.filename,
      name: actual.name,
      chunk: {
        constants: actual.chunk.constants,
        code: disassemble(actual.chunk),
        lines: actual.chunk.lines,
      },
    }).toEqual({
      filename: expected.filename,
      name: expected.name,
      chunk: {
        constants: expected.chunk.constants,
        code: disassemble(expected.chunk),
        lines: expected.chunk.lines,
      },
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
