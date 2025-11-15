import { Args, Context } from './base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default {
  async main(context: Context, _args: Args): Promise<void> {
    context.interactive();

    await context.executor.run();
  },
};
