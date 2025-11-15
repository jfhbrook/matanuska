//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif

import { Nil } from '../value';

import { Args, Context } from './base';

/**
 * List the current program.
 */
export default {
  async main(context: Context, args: Args): Promise<void> {
    //#if _MATBAS_BUILD == 'debug'
    startSpan('list', (_: Span) => {
      //#endif
      const { host, editor } = context;
      const [lineStart, lineEnd] = args;

      const start = lineStart instanceof Nil ? null : (lineStart as number);
      const end = lineEnd instanceof Nil ? null : (lineEnd as number);

      if (editor.warning) {
        host.writeWarn(this.editor.warning);
      }

      host.writeLine(
        `${editor.filename}\n${'-'.repeat(editor.filename.length)}`,
      );

      const listings = editor.list(start, end);

      host.writeLine(listings);
      //#if _MATBAS_BUILD == 'debug'
    });
    //#endif
  },
};
