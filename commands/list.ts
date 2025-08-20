import { List } from '../ast/instr';
import { CommandRunner, ReturnValue } from './base';

/**
 * List the current program.
 */
export default async function list(
  this: CommandRunner,
  list: List,
): Promise<ReturnValue> {
  const { executor } = this;
  executor.list(list.lineStart, list.lineEnd);
  return null;
}
