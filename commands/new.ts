import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { New } from '../ast/instr';

import { CommandRunner, ReturnValue } from './base';

/**
 * A new program.
 *
 * Create a new file, and open it in the editor. By default, the filename will
 * be 'untitled.bas'.
 */
export default async function new_(
  this: CommandRunner,
  _new: New,
): Promise<ReturnValue> {
  const { executor } = this;
  let [filename] = this.args;
  if (!filename) {
    filename = 'untitled.bas';
  } else if (typeof filename !== 'string') {
    throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
  }
  executor.new(filename);
  return null;
}
