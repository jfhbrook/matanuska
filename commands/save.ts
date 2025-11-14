//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { Args, Context, ReturnValue } from './base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default {
  async main(context: Context, args: Args): Promise<ReturnValue> {
    //#if _MATBAS_BUILD == 'debug'
    return await startSpan('save', async (_: Span) => {
      const { host, editor } = context;
      const [filename] = args;

      if (filename !== null && typeof filename !== 'string') {
        throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
      }

      //#endif
      if (filename) {
        editor.filename = filename;
      }

      await host.writeFile(editor.filename, editor.list() + '\n');

      return null;

      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
