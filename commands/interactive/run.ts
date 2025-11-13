import { Args, InteractiveContext, ReturnValue } from '../base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default {
  interactive: true,

  async main(context: InteractiveContext, _args: Args): Promise<ReturnValue> {
    const { executor } = context;
    await executor.run();
    return null;
  },
};
