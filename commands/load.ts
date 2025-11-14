//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif

import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { Arg, Flag, Params } from '../params';

import { Args, Context, ReturnValue } from './base';

/**
 * Load a script, and optionally run it.
 */
export default {
  params: new Params([new Arg('filename'), new Flag('run')]),

  async main(context: Context, args: Args): Promise<ReturnValue> {
    //#if _MATBAS_BUILD == 'debug'
    return await startSpan('load', async (_: Span) => {
      //#endif

      const { executor, editor, host } = context;
      const { filename, run } = this.params.parse(args);

      if (typeof filename !== 'string') {
        throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
      }

      await executor.load(filename);

      if (run) {
        await executor.run();
      } else if (editor.warning) {
        host.writeWarn(editor.warning);
      }
      return null;
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
