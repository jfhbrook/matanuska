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

import { parseProgram } from './parser';

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

export type TestCase = [string, Instr | Program | null, Routine | null];

function parse(source: string, filename: string): Program {
  const result = parseProgram(source, filename);
  expect(result[1]).toBe(null);
  return result[0];
}

export function runCompilerTest([source, ast, expected]: TestCase): void {
  test(source, () => {
    const filename = expected ? expected.filename : 'test.bas';
    const _ast = ast ? ast : parse(source, filename);
    const compiled = compile(_ast, { filename })[0];

    const actual = {
      filename: compiled.filename,
      name: compiled.name,
      chunk: {
        constants: compiled.chunk.constants,
        code: disassemble(compiled.chunk),
        lines: compiled.chunk.lines,
      },
    };

    if (!expected) {
      expect(actual).toMatchSnapshot();
      return;
    }

    expect(actual).toEqual({
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
