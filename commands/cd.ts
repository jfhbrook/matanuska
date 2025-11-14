//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { NotImplementedError } from '../exceptions';
import { Arg, Params } from '../params';

import { Args, Context, ReturnValue } from './base';

/**
 * A new program.
 *
 * Create a new file, and open it in the editor. By default, the filename will
 * be 'untitled.bas'.
 */
export default {
  params: new Params([new Arg('path')]),

  async main(_context: Context, args: Args): Promise<ReturnValue> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('cd', (_: Span): ReturnValue => {
      //#endif
      const { path } = this.params.parse(args);
      console.log({ path });
      throw new NotImplementedError('cd');
      // TODO: Close open file handles on this.host
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
