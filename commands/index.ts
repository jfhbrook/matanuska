import { invalid, noop, trace } from './base';
import type { CommandRunner, ReturnValue } from './base';
import { Editor } from '../editor';
import { Executor } from '../executor';
import { Host } from '../host';
import { Value } from '../value';

import visitExpressionInstr from './expression';
import visitNewInstr from './new';
import visitLoadInstr from './load';
import visitListInstr from './list';
import visitRenumInstr from './renum';
import visitSaveInstr from './save';
import visitRunInstr from './run';

export function commandRunner(
  executor: Executor,
  editor: Editor,
  host: Host,
  args: Array<Value | null>,
): CommandRunner {
  return {
    executor,
    editor,
    program: editor.program,
    host,
    args,
    visitExpressionInstr: trace('<expr>', visitExpressionInstr),
    visitPrintInstr: invalid('print'),
    visitRemInstr: noop,
    visitNewInstr: trace('new', visitNewInstr),
    visitLoadInstr: trace('load', visitLoadInstr),
    visitListInstr: trace('list', visitListInstr),
    visitRenumInstr: trace('renum', visitRenumInstr),
    visitSaveInstr: trace('save', visitSaveInstr),
    visitRunInstr: trace('run', visitRunInstr),
    visitEndInstr: invalid('end'),
    visitExitInstr: invalid('exit'),
    visitLetInstr: invalid('let'),
    visitAssignInstr: invalid('assign'),
    visitShortIfInstr: invalid('if'),
    visitIfInstr: invalid('if'),
    visitElseInstr: invalid('else'),
    visitElseIfInstr: invalid('else if'),
    visitEndIfInstr: invalid('endif'),
    visitForInstr: invalid('for'),
    visitNextInstr: invalid('next'),
    visitEndForInstr: invalid('endfor'),
    visitWhileInstr: invalid('while'),
    visitEndWhileInstr: invalid('endwhile'),
    visitRepeatInstr: invalid('repeat'),
    visitUntilInstr: invalid('until'),
  };
}

export { CommandRunner, ReturnValue };
