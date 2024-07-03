import { CommandRunner, ReturnValue, invalid, noop } from './base';
import { Editor } from '../editor';
import { Executor } from '../executor';
import { Host } from '../host';
import { Value } from '../value';

import visitExpressionCmd from './expression';
import visitNewCmd from './new';
import visitLoadCmd from './load';
import visitListCmd from './list';
import visitRenumCmd from './renum';
import visitSaveCmd from './save';
import visitRunCmd from './run';

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
    visitExpressionCmd,
    visitPrintCmd: invalid('print'),
    visitRemCmd: noop,
    visitNewCmd,
    visitLoadCmd,
    visitListCmd,
    visitRenumCmd,
    visitSaveCmd,
    visitRunCmd,
    visitExitCmd: invalid('exit'),
    visitLetCmd: invalid('let'),
    visitAssignCmd: invalid('assign'),
    visitShortIfCmd: invalid('if'),
    visitIfCmd: invalid('if'),
    visitElseCmd: invalid('else'),
    visitElseIfCmd: invalid('else if'),
    visitEndCmd: invalid('end'),
  };
}

export { CommandRunner, ReturnValue };
