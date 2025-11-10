import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { ParamsParser } from '../params';
import { Load } from '../ast/instr';
import { CommandRunner, ReturnValue } from './base';

const PARAMS = new ParamsParser({
  arguments: ['filename'],
  flags: ['run'],
});

/**
 * Load a script, and optionally run it.
 */
export default async function load(
  this: CommandRunner,
  _load: Load,
): Promise<ReturnValue> {
  const { executor, editor, host } = this;
  const { arguments: args, flags } = PARAMS.parse(this.args);
  const [filename] = args;
  if (typeof filename !== 'string') {
    throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
  }
  await executor.load(filename);
  if (flags.run) {
    await executor.run();
  } else if (editor.warning) {
    host.writeWarn(editor.warning);
  }
  return null;
}
