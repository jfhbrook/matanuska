import * as assert from 'node:assert';

import { RuntimeError } from '../exceptions';
import { RuntimeFault } from '../faults';
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
  For,
  EndFor,
  While,
  EndWhile,
  Repeat,
  Until,
} from '../ast/instr';

import { LineCompiler } from './base';

//
// A class to manage blocks in the LineCompiler. Subclassed for particular
// kinds of blocks in the base, next to the LineCompiler.
//

// NOTE: Conceptually, BlockKind is enumerable. However, as the kinds are
// for the most part defined in the base, setting this to a string allows us
// to avoid a generic type. In practice, block kinds are only used for error
// reporting.
export type BlockKind = string;

export abstract class Block implements InstrVisitor<void> {
  public kind: BlockKind = '<unknown>';
  private _compiler: LineCompiler | null = null;
  public instr: Instr | null = null;
  public previous: Block | null = null;
  public parent: Block | null = null;

  public init(
    compiler: LineCompiler,
    instr: Instr | null,
    previous: Block | null,
    parent: Block | null,
  ) {
    this._compiler = compiler;
    this.instr = instr;
    this.previous = previous;
    this.parent = parent;
  }

  public get compiler(): LineCompiler {
    if (!this._compiler) {
      throw RuntimeFault.fromError(
        new RuntimeError(`Block ${this.kind} not initialized`),
      );
    }
    return this._compiler;
  }

  // Open a new block, maintaining a reference to the parent block.
  public begin(instr: Instr, block: Block): void {
    block.init(this.compiler, instr, null, this.compiler.block);
    this.compiler.block = block;
  }

  // Go to the next block in a chain of blocks
  public next(instr: Instr, block: Block): void {
    block.init(
      this.compiler,
      instr,
      this.compiler.block,
      this.compiler.block.parent,
    );
    this.compiler.block = block;
  }

  // End the current block.
  public end(): void {
    assert.ok(this.parent);
    this.compiler.block = this.parent;
  }

  public handle(instr: Instr): void {
    instr.accept(this);
  }

  // Most instructions do not end any kind of block. This code should never
  // be called by the compiler.
  // TODO: Shouldn't "never" work for the return type, since syntaxFault has
  // a return type of never?
  private invalid(instr: Instr, name: string): void {
    this.compiler.syntaxFault(instr, `${name} can not end blocks`);
  }

  // Some instructions end specific kinds of blocks. By default, such an
  // instruction does not close *this* kind of block.
  public mismatched(instr: Instr, kind: string): void {
    this.compiler.syntaxFault(instr, `${kind} can not end ${this.kind}`);
  }

  visitPrintInstr(print: Print): void {
    this.invalid(print, 'print');
  }

  visitExpressionInstr(expr: Expression): void {
    this.invalid(expr, 'expr');
  }

  visitRemInstr(rem: Rem): void {
    this.invalid(rem, 'rem');
  }

  visitNewInstr(new_: New): void {
    this.invalid(new_, 'new');
  }

  visitLoadInstr(load: Load): void {
    this.invalid(load, 'load');
  }

  visitListInstr(list: List): void {
    this.invalid(list, 'list');
  }

  visitRenumInstr(renum: Renum): void {
    this.invalid(renum, 'renum');
  }

  visitSaveInstr(save: Save): void {
    this.invalid(save, 'save');
  }

  visitRunInstr(run: Run): void {
    this.invalid(run, 'run');
  }

  visitExitInstr(exit: Exit): void {
    this.invalid(exit, 'exit');
  }

  visitEndInstr(end: End): void {
    this.invalid(end, 'end');
  }

  visitLetInstr(let_: Let): void {
    this.invalid(let_, 'let');
  }

  visitAssignInstr(assign: Assign): void {
    this.invalid(assign, 'assign');
  }

  visitShortIfInstr(shortIf: ShortIf): void {
    this.invalid(shortIf, 'if');
  }

  visitIfInstr(if_: If): void {
    this.invalid(if_, 'if');
  }

  visitElseInstr(else_: Else): void {
    this.mismatched(else_, 'else');
  }

  visitElseIfInstr(elseIf: ElseIf): void {
    this.mismatched(elseIf, 'else if');
  }

  visitEndIfInstr(endIf: EndIf): void {
    this.mismatched(endIf, 'endif');
  }

  visitForInstr(for_: For): void {
    this.invalid(for_, 'for');
  }

  visitEndForInstr(endFor: EndFor): void {
    this.mismatched(endFor, 'endfor');
  }

  visitWhileInstr(while_: While): void {
    this.invalid(while_, 'while');
  }

  visitEndWhileInstr(endWhile: EndWhile): void {
    this.mismatched(endWhile, 'endwhile');
  }

  visitRepeatInstr(repeat: Repeat): void {
    this.invalid(repeat, 'repeat');
  }

  visitUntilInstr(until: Until): void {
    this.mismatched(until, 'until');
  }
}
