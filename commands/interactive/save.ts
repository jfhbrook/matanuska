import { ValueError } from '../../exceptions';
import { formatter } from '../../format';
import { Args, InteractiveContext, ReturnValue } from '../base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default {
  interactive: true,

  async main(context: InteractiveContext, args: Args): Promise<ReturnValue> {
    const { executor } = context;
    const [filename] = args;
    if (filename !== null && typeof filename !== 'string') {
      throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
    }
    await executor.save(filename);
    return null;
  },
};
