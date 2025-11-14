//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { Program } from '../ast';
import { Editor } from '../editor';
import { Executor } from '../executor';
//#if _MATBAS_BUILD == 'debug'
import { formatter } from '../format';
//#endif
import { Host } from '../host';
import { Value } from '../value';

/*
 * A command context.
 */
export interface Context {
  executor: Executor;
  host: Host;
}

/*
 * An interactive command context.
 */
export interface InteractiveContext extends Context {
  editor: Editor;
  program: Program;
}

/**
 * The argument values for a command.
 */
export type Args = Value[];

/**
 * The return value of a command. Null is used to indicate no returned
 * value, not even nil.
 */
export type ReturnValue = Value | null;

export interface BaseCommand {
  interactive: boolean | undefined;
  main: (context: any, args: Args) => Promise<ReturnValue>;
}

/**
 * A command.
 */
export interface Command extends BaseCommand {
  interactive: false | undefined;
  main: (context: Context, args: Args) => Promise<ReturnValue>;
}

/**
 * An interactive command.
 */
export interface InteractiveCommand extends BaseCommand {
  interactive: true;
  main: (context: InteractiveContext, args: Args) => Promise<ReturnValue>;
}

/**
 * Wrap a command in a telemetry span.
 */
export function trace<C extends BaseCommand>(name: string, command: C): C {
  return {
    ...command,
    async run(context: any, args: Args): Promise<ReturnValue> {
      //#if _MATBAS_BUILD == 'debug'
      return await startSpan(`Command: ${name}`, async (span: Span) => {
        for (let i = 0; i < this.args.length; i++) {
          span.setAttribute(`arg_${i}`, formatter.format(this.args[i]));
        }
        return await command.main(context, args);
      });
      //#else
      return command.main(context, args);
      //#endif
    },
  };
}
