//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { ValueError } from '../exceptions';
import { formatter } from '../format';

import { Args, Context } from './base';

/**
 * A new program.
 *
 * Create a new file, and open it in the editor. By default, the filename will
 * be 'untitled.bas'.
 */
export default {
  async main(context: Context, args: Args): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('new', (_: Span): void => {
      //#endif
      const { executor, editor } = context;
      let [filename] = args;

      if (!filename) {
        filename = 'untitled.bas';
      } else if (typeof filename !== 'string') {
        throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
      }

      executor.defer(async () => {
        executor.runtime.reset();
      });

      editor.reset();
      editor.filename = filename;
      // TODO: Close open file handles on this.host
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
