//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../../debug';
//#endif
import { ValueError } from '../../exceptions';
import { formatter } from '../../format';

import { Args, Context, ReturnValue } from '../base';

/**
 * A new program.
 *
 * Create a new file, and open it in the editor. By default, the filename will
 * be 'untitled.bas'.
 */
export default {
  async main(context: Context, _args: Args): Promise<ReturnValue> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('Executor#new', (_: Span): ReturnValue => {
      //#endif
      const { executor, editor } = context;
      let [filename] = this.args;

      if (!filename) {
        filename = 'untitled.bas';
      } else if (typeof filename !== 'string') {
        throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
      }

      executor.runtime.reset();
      editor.reset();
      editor.filename = filename;
      return null;
      // TODO: Close open file handles on this.host
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
