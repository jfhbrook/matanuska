import { Args, InteractiveContext, ReturnValue } from '../base';

/**
 * List the current program.
 */
export default {
  interactive: true,

  async main(context: InteractiveContext, args: Args): Promise<ReturnValue> {
    const { executor } = context;
    const [lineStart, lineEnd] = args;
    executor.list(lineStart as number | null, lineEnd as number | null);
    return null;
  },
};
