//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { Arg, Params } from '../params';

import { Args, Context } from './base';

/**
 * Change the current working directory.
 */
export default {
  params: new Params([new Arg('path')]),

  async main(context: Context, args: Args): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('cd', (_: Span): void => {
      const { host } = context;
      //#endif
      const { path } = this.params.parse(args);
      host.cd(path);
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
