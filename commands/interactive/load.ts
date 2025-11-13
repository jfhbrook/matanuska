import { Arg, Flag, Params } from '../../params';
import { Args, InteractiveContext, ReturnValue } from '../base';

/**
 * Load a script, and optionally run it.
 */
export default {
  interactive: true,
  params: new Params([new Arg('filename'), new Flag('run')]),

  async main(context: InteractiveContext, args: Args): Promise<ReturnValue> {
    const { executor, editor, host } = context;
    const { filename, run } = this.params.parse(args);
    await executor.load(String(filename));
    if (run) {
      await executor.run();
    } else if (editor.warning) {
      host.writeWarn(editor.warning);
    }
    return null;
  },
};
