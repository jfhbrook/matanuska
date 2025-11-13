import { ParseWarning, mergeParseErrors } from '../exceptions';
import { Instr, Rem } from '../ast/instr';

import { Chunk } from '../bytecode/chunk';

import { CompileResult, CompilerOptions, compileInstruction } from './base';

export type CompiledCmd = Array<Chunk | null>;

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
): CompileResult<CompiledCmd[]> {
  // TODO: Collect ParseErrors
  const results: CompileResult<CompiledCmd>[] = cmds.map((cmd) => {
    const [chunk, warning] = compileInstruction(cmd, options);
    return [[chunk], warning];
  });

  const commands: CompiledCmd[] = results
    .map(([cmd, _]) => cmd)
    .filter(([c, _]) => !(c instanceof Rem));
  const warnings: Array<ParseWarning | null> = results.reduce(
    (acc, [_, warns]) => (warns ? acc.concat(warns) : acc),
    [] as Array<ParseWarning | null>,
  );
  return [commands, mergeParseErrors(warnings)];
}
