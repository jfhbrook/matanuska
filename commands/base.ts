//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { Program } from '../ast';
import { Editor } from '../editor';
import { RuntimeError } from '../exceptions';
import { Executor } from '../executor';
//#if _MATBAS_BUILD == 'debug'
import { formatter } from '../format';
//#endif
import { Host } from '../host';
import { Value } from '../value';

/*
 * A command context.
 */
export class Context {
  _editor: Editor | null;

  constructor(
    public name: string,
    public executor: Executor,
    public host: Host,
    editor?: Editor | null,
  ) {
    this._editor = editor || null;
  }

  public interactive(): void {
    if (!this._editor) {
      throw new RuntimeError(
        `Command ${this.name} must be run in an interactive context`,
      );
    }
  }

  public get editor(): Editor {
    this.interactive();

    return this._editor as Editor;
  }

  public get program(): Program {
    return this.editor.program;
  }
}

/**
 * The argument values for a command.
 */
export type Args = Value[];

/**
 * A command.
 */
export interface Command {
  main: (context: Context, args: Args) => Promise<void>;
}

export type Deferred = () => Promise<void>;

/**
 * Wrap a command in a telemetry span.
 */
export function trace(command: Command): Command {
  return {
    ...command,
    async main(context: Context, args: Args): Promise<void> {
      //#if _MATBAS_BUILD == 'debug'
      return await startSpan(
        `Command: ${context.name}`,
        async (span: Span): Promise<void> => {
          for (let i = 0; i < this.args.length; i++) {
            span.setAttribute(`arg_${i}`, formatter.format(this.args[i]));
          }
          return await command.main(context, args);
        },
      );
      //#else
      return command.main(context, args);
      //#endif
    },
  };
}
