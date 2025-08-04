import { describe, expect, test } from 'vitest';

import { Instr } from '../../ast/instr';
import { Program } from '../../ast';
import { Chunk } from '../../bytecode/chunk';
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

export function runCompilerTest([source, ast, ch]: TestCase): void {
  test(source, () => {
    expect(compile(ast)[0]).toEqual(ch);
  });
}

export function runCompilerSuite(name: string, tests: TestCase[]): void {
  describe(name, () => {
    for (const test of tests) {
      runCompilerTest(test);
    }
  });
}
