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
    visitEndCmd: invalid('end'),
    visitExitCmd: invalid('exit'),
    visitLetCmd: invalid('let'),
    visitAssignCmd: invalid('assign'),
    visitShortIfCmd: invalid('if'),
    visitIfCmd: invalid('if'),
  };
}

export { CommandRunner, ReturnValue };
