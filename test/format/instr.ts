import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

import { Token, TokenKind } from '../../tokens';
import {
  Variable,
  IntLiteral,
  BoolLiteral,
  StringLiteral,
  ShellLiteral,
} from '../../ast/expr';
import {
  Print,
  Exit as ExitInstr,
  Rem,
  New,
  Load,
  List,
  Save,
  Run,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
  For,
  Onward,
  Next,
  While,
  EndWhile,
  Repeat,
  Until,
  End,
  Command,
} from '../../ast/instr';

const INSTRUCTIONS = [
  new Print(new StringLiteral('hello')),
  new ExitInstr(new IntLiteral(0)),
  new Rem('a witty remark'),
  new New(null),
  new Load([
    new StringLiteral('./examples/001-hello-world.bas'),
    new ShellLiteral('--run'),
  ]),
  new List(null, null),
  new List(10, null),
  new List(10, 20),
  new Save(null),
  new Run(),
  new Let(
    new Variable(
      new Token({
        kind: TokenKind.IntIdent,
        index: 0,
        row: 1,
        offsetStart: 5,
        offsetEnd: 6,
        text: 'i%',
        value: null,
      }),
    ),
    new IntLiteral(1),
  ),
  new Assign(
    new Variable(
      new Token({
        kind: TokenKind.IntIdent,
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: 1,
        text: 'i%',
        value: null,
      }),
    ),
    new IntLiteral(1),
  ),
  new ShortIf(
    new BoolLiteral(true),
    [new Print(new StringLiteral('true'))],
    [],
  ),
  new ShortIf(
    new BoolLiteral(true),
    [new Print(new StringLiteral('true'))],
    [new Print(new StringLiteral('false'))],
  ),
  new If(new BoolLiteral(true)),
  new Else(),
  new ElseIf(new BoolLiteral(true)),
  new EndIf(),
  new For(
    new Variable(
      new Token({
        kind: TokenKind.IntIdent,
        index: 0,
        row: 1,
        offsetStart: 5,
        offsetEnd: 6,
        text: 'i%',
        value: null,
      }),
    ),
    new IntLiteral(1),
    new IntLiteral(10),
    null,
  ),
  new Onward(),
  new Next(),
  new While(new BoolLiteral(true)),
  new EndWhile(),
  new Repeat(),
  new Until(new BoolLiteral(false)),
  new End(),
  new Command(new ShellLiteral('cd'), [new ShellLiteral('..')]),
  new Command(new ShellLiteral('cp'), [
    new ShellLiteral('foo.txt'),
    new ShellLiteral('bar.txt'),
  ]),
  new Command(new ShellLiteral('cp'), [
    new ShellLiteral('foo.txt'),
    new ShellLiteral('bar.txt'),
  ]),
  new Command(new ShellLiteral('rm'), [new ShellLiteral('bar.txt')]),
  new Command(new ShellLiteral('rm'), [
    new ShellLiteral('bar.txt'),
    new ShellLiteral('-rf'),
  ]),
  new Command(new ShellLiteral('touch'), [new ShellLiteral('foo.txt')]),
  new Command(new ShellLiteral('mv'), [
    new ShellLiteral('foo.txt'),
    new ShellLiteral('bar.txt'),
  ]),
  new Command(new ShellLiteral('mkdir'), [new ShellLiteral('dir')]),
  new Command(new ShellLiteral('mkdir'), [
    new ShellLiteral('dir'),
    new ShellLiteral('-p'),
    new IntLiteral(0o775),
  ]),
  new Command(new ShellLiteral('rmdir'), [new ShellLiteral('dir')]),
  new Command(new ShellLiteral('rmdir'), [
    new ShellLiteral('dir'),
    new ShellLiteral('-p'),
  ]),
  new Command(new ShellLiteral('pwd'), []),
  new Command(new ShellLiteral('pwd'), [new ShellLiteral('-L')]),
];

export function instructionSuite<F extends Formatter>(formatter: F): void {
  for (const instr of INSTRUCTIONS) {
    test(instr.constructor.name, () => {
      t.matchSnapshot(formatter.format(instr));
    });
  }
}
