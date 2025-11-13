import { Arg, Flag, Params } from '../params';
import { Load } from '../ast/instr';
import { CommandRunner, ReturnValue } from './base';

const PARAMS = new Params([new Arg('filename'), new Flag('run')]);

/**
 * Load a script, and optionally run it.
 */
export default async function load(
  this: CommandRunner,
  _load: Load,
): Promise<ReturnValue> {
  const { executor, editor, host } = this;
  const { filename, run } = PARAMS.parse(this.args);
  await executor.load(String(filename));
  if (run) {
    await executor.run();
  } else if (editor.warning) {
    host.writeWarn(editor.warning);
  }
  return null;
}
