import { ParseWarning, mergeParseErrors } from '../exceptions';
import { Instr } from '../ast/instr';

import { Chunk } from '../bytecode/chunk';

import { CompileResult, CompilerOptions, compileInstruction } from './base';

/**
 * Compile a mixture of interactive instructions and commands.
 *
 * @param instrs The instructions to compile.
 * @param options Compiler options.
 * @returns The result of compiling each line, plus warnings.
 */
export function compileCommands(
  cmds: Instr[],
  options: CompilerOptions = {},
): CompileResult<Chunk[]> {
  const results: CompileResult<Chunk>[] = cmds.map((cmd) => {
    const [chunk, warning] = compileInstruction(cmd, options);
    return [chunk, warning];
  });

  const commands: Chunk[] = results.map(([chunk, _]) => chunk);
  const warnings: Array<ParseWarning | null> = results.reduce(
    (acc, [_, warns]) => (warns ? acc.concat(warns) : acc),
    [] as Array<ParseWarning | null>,
  );
  return [commands, mergeParseErrors(warnings)];
}
