import { describe, expect, test } from 'vitest';

import { formatter } from '../format';

import { StringLiteral } from '../ast/expr';
import {
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
  If,
  ShortIf,
  Else,
  ElseIf,
  EndIf,
} from '../ast/instr';
import { Block } from '../compiler/block';
import { LineCompiler, RoutineType } from '../compiler/base';

import { FILENAME } from './helpers/files';

class TestBlock extends Block {
  constructor(public name: string) {
    super();
  }
}

const PRINT = new Print(new StringLiteral('hello world'));

function createCompiler(): LineCompiler {
  const compiler = new LineCompiler([], RoutineType.Program, {
    filename: FILENAME,
  });
  return compiler;
}

function createBlock(compiler: LineCompiler, name: string): TestBlock {
  const block = new TestBlock(name);
  block.init(compiler, null, null, null);
  return block;
}

const INVALID_INSTRS = [
  PRINT,
  new Expression(new StringLiteral('a')),
  new Rem('remark'),
  new New(null),
  new Load(new StringLiteral('file'), false),
  new List(null, null),
  new Renum(),
  new Save(new StringLiteral('file')),
  new Run(),
  new Exit(null),
  new End(),
  new If(new StringLiteral('foo')),
  new ShortIf(new StringLiteral('foo'), [], []),
];

const MISMATCHED_INSTRS = [
  new Else(),
  new ElseIf(new StringLiteral('bar')),
  new EndIf(),
];

describe('Block', () => {
  test('begin/end', () => {
    const compiler = createCompiler();
    const root = compiler.block;
    const block = createBlock(compiler, 'b');

    expect(compiler.block, 'Current block is root').toBe(root);

    compiler.block.begin(PRINT, block);

    expect(compiler.block, 'Current block is block').toBe(block);
    expect(block.instr, 'instr is set by begin').toBe(PRINT);
    expect(block.previous, 'b has no previous block').toBe(null);
    expect(block.parent, "b's parent block is root").toBe(root);

    block.end();

    expect(compiler.block, 'Current block is root').toBe(root);
  });

  test('next', () => {
    const compiler = createCompiler();
    const root = compiler.block;
    const a = createBlock(compiler, 'a');
    compiler.block.begin(PRINT, a);
    const b = createBlock(compiler, 'b');

    expect(compiler.block, 'Current block is a').toBe(a);

    a.next(PRINT, b);

    expect(compiler.block, 'Current block is b').toBe(b);
    expect(b.instr, 'instr is set by begin').toBe(PRINT);
    expect(b.previous, 'a is the previous block').toBe(a);
    expect(b.parent, "b's parent block is root").toBe(root);
  });

  // TODO: Assert the error messages...
  describe('handle', () => {
    for (const instr of INVALID_INSTRS) {
      test(`invalid instruction ${formatter.format(instr)}`, () => {
        const compiler = createCompiler();
        const block = createBlock(compiler, 'block');
        expect(() => {
          block.handle(instr);
        }).toThrow();
      });
    }

    for (const instr of MISMATCHED_INSTRS) {
      test(`mismatched instruction ${formatter.format(instr)}`, () => {
        const compiler = createCompiler();
        const block = createBlock(compiler, 'block');
        expect(() => {
          block.handle(instr);
        }).toThrow();
      });
    }
  });
});
