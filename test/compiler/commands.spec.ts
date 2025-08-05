import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Print, Exit, Expression, Rem } from '../../ast/instr';
import { StringLiteral } from '../../ast/expr';
import { compileCommands, CompiledCmd } from '../../compiler';

function isCompiled(name: string, [cmd, chunks]: CompiledCmd): void {
  test(name, () => {
    t.equal(cmd, null, 'is a runtime instruction');
    t.equal(chunks.length, 1, 'chunk is compiled');
  });
}

function isInteractive(name: string, cmd: CompiledCmd): void {
  test(name, () => {
    t.ok(cmd, 'is an interactive command');
    t.matchSnapshot(cmd, 'has the expected arguments');
  });
}

describe('interactive compiler', () => {
  const [cmds, warning] = compileCommands([
    new Print(new StringLiteral('Hello')),
    new Exit(null),
    new Rem('A witty remark.'),
    new Expression(new StringLiteral('Hello')),
  ]);

  t.equal(cmds.length, 3, 'rem is filtered out');

  const [print, exit, expr] = cmds;

  t.equal(warning, null, 'has no warnings');

  isCompiled('print', print);
  isCompiled('exit', exit);
  isInteractive('expression', expr);
});
