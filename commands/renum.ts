//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif

import { Args, Context } from './base';

/**
 * List the current program.
 */
export default {
  async main(context: Context, _args: Args): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    return startSpan('renum', (_: Span) => {
      //#endif
      context.editor.renum();
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
