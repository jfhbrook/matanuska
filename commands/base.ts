//#if _MATBAS_BUILD == 'debug'
import { Span } from '@opentelemetry/api';

import { startSpan } from '../debug';
//#endif
import { Program } from '../ast';
import { Builtin, Instr, InstrVisitor } from '../ast/instr';
import { Editor } from '../editor';
import { errorType } from '../errors';
import { Executor } from '../executor';
import { RuntimeFault } from '../faults';
//#if _MATBAS_BUILD == 'debug'
import { formatter } from '../format';
//#endif
import { Host } from '../host';
import { Value } from '../value';

export interface CommandContext {
  executor: Executor;
  editor: Editor;
  program: Program;
  host: Host;
  args: Array<Value | null>;
}

/**
 * The return value of a command. Null is used to indicate no returned
 * value, not even nil.
 */
export type ReturnValue = Value | null;

/**
 * An interactive command.
 */
export type InteractiveCommand<C extends Instr> = (
  this: CommandRunner,
  cmd: C,
) => Promise<ReturnValue>;

export interface CommandRunner
  extends CommandContext,
    InstrVisitor<Promise<ReturnValue>> {}

@errorType('Invalid')
export class Invalid extends Error {
  constructor(name: string) {
    super(`Invalid command: ${name}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Create an invalid command. Invalid commands should never be executed
 * by the Executor, as they should be fully implemented in the runtime.
 *
 * @param name The name of the invalid command.
 * @returns An interactive command that will immediately throw a RuntimeFault
 */
export function invalid<C extends Instr>(name: string): InteractiveCommand<C> {
  return async function invalidCommand(_cmd: C): Promise<ReturnValue> {
    throw RuntimeFault.fromError(new Invalid(name));
  };
}

export function invalidBuiltin(cmd: Builtin): Promise<ReturnValue> {
  throw RuntimeFault.fromError(new Invalid(cmd.name));
}

/**
 * Create a no-op command. These commands won't throw, but don't do anything
 * either. The primary example of this is the Rem "command".
 *
 * @param cmd The no-op command
 * @returns null
 */
export async function noop<C extends Instr>(_cmd: C): Promise<ReturnValue> {
  return null;
}

/**
 * Wrap an interactive command in a telemetry span.
 */
export function trace<C extends Instr>(
  name: string,
  command: InteractiveCommand<C>,
): InteractiveCommand<C> {
  //#if _MATBAS_BUILD == 'debug'
  return async function traced(
    this: CommandRunner,
    cmd: C,
  ): Promise<ReturnValue> {
    return await startSpan(`Command: ${name}`, async (span: Span) => {
      for (let i = 0; i < this.args.length; i++) {
        span.setAttribute(`arg_${i}`, formatter.format(this.args[i]));
      }
      return await command.call(this, cmd);
    });
  };
  //#else
  return command;
  //#endif
}
