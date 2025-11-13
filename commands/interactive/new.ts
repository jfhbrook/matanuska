import { ValueError } from '../../exceptions';
import { formatter } from '../../format';

import { Args, InteractiveContext, ReturnValue } from '../base';

/**
 * A new program.
 *
 * Create a new file, and open it in the editor. By default, the filename will
 * be 'untitled.bas'.
 */
export default {
  interactive: true,

  async main(context: InteractiveContext, _args: Args): Promise<ReturnValue> {
    const { executor } = context;
    let [filename] = this.args;
    if (!filename) {
      filename = 'untitled.bas';
    } else if (typeof filename !== 'string') {
      throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
    }
    executor.new(filename);
    return null;
  },
};
