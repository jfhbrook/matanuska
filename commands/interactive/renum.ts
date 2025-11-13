import { Args, InteractiveContext, ReturnValue } from '../base';

/**
 * List the current program.
 */
export default {
  interactive: true,

  async main(context: InteractiveContext, _args: Args): Promise<ReturnValue> {
    const { executor } = context;
    executor.renum();
    return null;
  },
};
