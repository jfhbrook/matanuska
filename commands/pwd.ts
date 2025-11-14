//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { Flag, Params } from '../params';

import { Args, Context, ReturnValue } from './base';

/**
 * Display the current working directory.
 *
 */
export default {
  params: new Params([new Flag('P'), new Flag('L')]),

  async main(context: Context, args: Args): Promise<ReturnValue> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('pwd', (_: Span): ReturnValue => {
      //#endif
      const { host } = context;
      const params = this.params.parse(args);

      let follow = true;
      if (params.P) {
        follow = false;
      }

      host.writeLine(host.pwd(follow));

      return null;
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
