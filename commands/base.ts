import { trace as _trace, Span } from '@opentelemetry/api';

import { Editor } from '../editor';
import { Executor } from '../executor';
import { errorType } from '../errors';
import { RuntimeFault } from '../faults';
import { formatter } from '../format';
import { Host } from '../host';
import { Value } from '../value';
import { Program } from '../ast';
import { Instr, InstrVisitor } from '../ast/instr';

const tracer = _trace.getTracer('main');

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

export interface CommandRunner extends InstrVisitor<Promise<ReturnValue>> {
  executor: Executor;
  editor: Editor;
  program: Program;
  host: Host;
  args: Array<Value | null>;
}

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

export function trace<C extends Instr>(
  name: string,
  command: InteractiveCommand<C>,
): InteractiveCommand<C> {
  return async function traced(
    this: CommandRunner,
    cmd: C,
  ): Promise<ReturnValue> {
    return tracer.startActiveSpan(`Evaluating ${name}`, async (span: Span) => {
      for (let i = 0; i < this.args.length; i++) {
        span.setAttribute(`arg_${i}`, formatter.format(this.args[i]));
      }
      return await command.call(this, cmd);
    });
  };
}
