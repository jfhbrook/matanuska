import { Injectable, Inject } from '@nestjs/common';
import { Span, trace, context } from '@opentelemetry/api';

import { Config } from './config';
import { BaseException } from './exceptions';
import { Exit, ExitCode } from './exit';
import type { ExitFn } from './exit';
import { Executor } from './executor';
import { BaseFault, RuntimeFault, UsageFault } from './faults';
import type { Host } from './host';

const tracer = trace.getTracer('main');

//
// Run the REPL.
//
async function repl(executor: Executor, host: Host) {
  while (true) {
    const span = tracer.startSpan('read-eval-print');
    const ctx = trace.setSpan(context.active(), span);
    try {
      await context.with(ctx, async () => {
        try {
          const input = await executor.prompt();
          await executor.eval(input);
        } catch (err) {
          if (err instanceof BaseFault || err instanceof Exit) {
            throw err;
          }

          if (err instanceof BaseException) {
            host.writeException(err);
            return;
          }

          throw RuntimeFault.fromError(err, null);
        }
      });
    } finally {
      span.end();
    }
  }
}

@Injectable()
export class Translator {
  /**
   * The main entry point for the application.
   */
  constructor(
    @Inject('Host') private host: Host,
    @Inject('exitFn') private exit: ExitFn,
    private config: Config,
    private executor: Executor,
  ) {}

  public async start(): Promise<void> {
    const { host, exit, config, executor } = this;
    let error: any = null;

    host.setLevel(config.level);

    function errorExit(error: any): void {
      exit(
        typeof error.exitCode === 'number' ? error.exitCode : ExitCode.Software,
      );
    }

    function errorHandler(error: any): void {
      reportError(error, host);
      errorExit(error);
    }

    //
    // Errors in the main coroutine should be correctly handled. However,
    // we also need to handle errors thrown by unmanaged EventEmitters and/or
    // Promises that aren't awaited in the main coroutine.
    //
    process.on('uncaughtException', errorHandler);
    process.on('unhandledRejection', errorHandler);

    try {
      await executor.using(async () => {
        if (config.script) {
          const span = tracer.startSpan('script');
          try {
            await executor.load(config.script as string);
            await executor.run();
          } finally {
            span.end();
          }
        } else {
          await repl(executor, host);
        }
      });
    } catch (err) {
      reportError(err, host);
      error = err;
    }

    process.removeListener('uncaughtException', errorHandler);
    process.removeListener('unhandledRejection', errorHandler);

    if (error) {
      errorExit(error);
      return;
    }

    // For consistency, explicitly exit instead of allowing Node to run the
    // command to completion.
    exit(0);
  }
}

/**
 * Report an error.
 *
 * @param err The object to report as an error.
 * @param host A Host instance.
 */
export function reportError(err: any, host: Host): void {
  if (err instanceof UsageFault) {
    host.writeLine(err);
  }

  // Handle intentional exits.
  if (err instanceof Exit) {
    // TODO: Should the user be able to access this log in a release build?
    if (err.message.length) {
      host.writeLine(err.message);
    }
    return;
  }

  if (err.format) {
    try {
      host.writeException(err);
    } catch (_) {
      const fault = RuntimeFault.fromError(err, null);
      host.writeException(fault);
    }
  } else {
    const fault = RuntimeFault.fromError(err, null);
    host.writeException(fault);
  }
}
