// import { trace } from '@opentelemetry/api';
import {
  SyntaxError,
  ParseError,
  ParseWarning,
  mergeParseErrors,
} from '../exceptions';
import { Source } from '../ast/source';
import {
  Instr,
  InstrVisitor,
  Print,
  Expression,
  Rem,
  New,
  Load,
  List,
  Renum,
  Save,
  Run,
  Exit,
  End,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
} from '../ast/instr';
import { Expr } from '../ast/expr';

import { Chunk } from '../bytecode/chunk';

import { CompileResult, CompilerOptions, compileInstruction } from './base';

// const tracer = trace.getTracer('main');

export type CompiledCmd = [Instr | null, Array<Chunk | null>];

//
// Compiler for both interactive and runtime commands. For more information,
// see the jsdoc for compileCommands.
//
export class CommandCompiler
  implements InstrVisitor<CompileResult<CompiledCmd>>
{
  constructor(private options: CompilerOptions) {}

  // A runtime command
  private runtime(instr: Instr): CompileResult<CompiledCmd> {
    const [chunk, warning] = compileInstruction(instr, this.options);
    return [[null, [chunk]], warning];
  }

  // An interactive command
  private command(
    cmd: Instr,
    exprs: Array<Expr | null>,
  ): CompileResult<CompiledCmd> {
    const results = exprs.map((exp) => {
      if (!exp) {
        return [null, null];
      }

      return compileInstruction(new Expression(exp), this.options);
    });
    const chunks = results.map(([c, _]) => c);
    const warnings: Array<ParseWarning | null> = results.map(([_, w]) => w);
    return [[cmd, chunks], mergeParseErrors(warnings)];
  }

  // An instruction which can *not* be executed as a command. This is distinct
  // from an invalid *interactive* command, which may be executed in the
  // runtime.
  private invalid(cmd: string, instr: Instr): never {
    const { filename, cmdNo, cmdSource } = this.options;

    const exc = new SyntaxError(`Invalid command: ${cmd}`, {
      filename: filename || '<unknown>',
      row: cmdNo || 100,
      isLine: false,
      lineNo: cmdNo || 100,
      cmdNo: cmdNo || 100,
      offsetStart: instr.offsetStart,
      offsetEnd: instr.offsetEnd,
      source: cmdSource || Source.unknown(),
    });

    throw new ParseError([exc]);
  }

  visitPrintInstr(print: Print): CompileResult<CompiledCmd> {
    return this.runtime(print);
  }

  visitExpressionInstr(expr: Expression): CompileResult<CompiledCmd> {
    return this.command(expr, [expr.expression]);
  }

  visitRemInstr(rem: Rem): CompileResult<CompiledCmd> {
    return [[rem, []], null];
  }

  visitNewInstr(new_: New): CompileResult<CompiledCmd> {
    return this.command(new_, [new_.filename]);
  }

  visitLoadInstr(load: Load): CompileResult<CompiledCmd> {
    return this.command(load, [load.filename]);
  }

  visitListInstr(list: List): CompileResult<CompiledCmd> {
    return this.command(list, []);
  }

  visitRenumInstr(renum: Renum): CompileResult<CompiledCmd> {
    return this.command(renum, []);
  }

  visitSaveInstr(save: Save): CompileResult<CompiledCmd> {
    return this.command(save, [save.filename]);
  }

  visitRunInstr(run: Run): CompileResult<CompiledCmd> {
    return this.command(run, []);
  }

  visitEndInstr(end: End): CompileResult<CompiledCmd> {
    return this.runtime(end);
  }

  visitExitInstr(exit: Exit): CompileResult<CompiledCmd> {
    return this.runtime(exit);
  }

  visitLetInstr(let_: Let): CompileResult<CompiledCmd> {
    return this.runtime(let_);
  }

  visitAssignInstr(assign: Assign): CompileResult<CompiledCmd> {
    return this.runtime(assign);
  }

  visitShortIfInstr(if_: ShortIf): CompileResult<CompiledCmd> {
    return this.runtime(if_);
  }

  visitIfInstr(if_: If): CompileResult<CompiledCmd> {
    return this.invalid('if', if_);
  }

  visitElseInstr(else_: Else): CompileResult<CompiledCmd> {
    return this.invalid('else', else_);
  }

  visitElseIfInstr(elseIf: ElseIf): CompileResult<CompiledCmd> {
    return this.invalid('else if', elseIf);
  }

  visitEndIfInstr(endif: EndIf): CompileResult<CompiledCmd> {
    return this.invalid('endif', endif);
  }
}

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
  const compiler = new CommandCompiler(options);
  const results: CompileResult<CompiledCmd>[] = cmds.map((cmd) =>
    cmd.accept(compiler),
  );
  const commands: CompiledCmd[] = results
    .map(([cmd, _]) => cmd)
    .filter(([c, _]) => !(c instanceof Rem));
  const warnings: Array<ParseWarning | null> = results.reduce(
    (acc, [_, warns]) => (warns ? acc.concat(warns) : acc),
    [] as Array<ParseWarning | null>,
  );
  return [commands, mergeParseErrors(warnings)];
}
