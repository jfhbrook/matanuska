import { Attributes, context, Context, Span, SpanOptions, trace } from '@opentelemetry/api';

import { Chunk } from './bytecode/chunk';
import { Runtime } from './runtime';

//#if _MATBAS_BUILD == 'debug'
import { parseBoolEnv } from './env';
//#else
//#unset _DEBUG_SHOW_TREE
//#unset _DEBUG_SHOW_CHUNK
//#unset _DEBUG_TRACE_RUNTIME
//#endif

//#if _DEBUG_SHOW_TREE
import type { Tree } from './ast';
//#set _IMPORT_FORMATTER = 1
//#endif

//#if _DEBUG_SHOW_CHUNK
import { disassemble } from './bytecode/disassembler';
//#endif

//#if _DEBUG_TRACE_RUNTIME
//#set _IMPORT_FORMATTER = 1
import { disassembleInstruction } from './bytecode/disassembler';
//#endif

//#if _IMPORT_FORMATTER
import { formatter } from './format';
//#endif

let NO_TRACE = true;

//#if _MATBAS_BUILD == 'debug'
NO_TRACE = parseBoolEnv(process.env.NO_TRACE);
//#endif

/**
 * Show a parse tree.
 *
 * @param tree The tree to show.
 */
export function showTree(tree: Tree): void {
  //#if _DEBUG_SHOW_TREE
  if (!NO_TRACE) {
    console.log('=== Parse Tree: ===');
    console.log(formatter.format(tree));
  }
  //#endif
};

/**
 * Show a compiled chunk.
 *
 * @param chunk The chunk to show.
 */
export function showChunk(chunk: Chunk): void {
  //#if _DEBUG_SHOW_CHUNK
  if (!NO_TRACE) {
    console.log(disassemble(chunk));
  }
  //#endif
}

/**
 * Log the start of execution tracing.
 */
export function startTraceExec(): void {
  //#if _DEBUG_TRACE_RUNTIME
  if (!NO_TRACE) {
    console.log('=== Execution Trace: ===');
  }
  //#endif
};

/**
 * Trace a step in execution.
 * @param rt The runtime.
 */
export function traceExec(rt: Runtime): void {
  //#if _DEBUG_TRACE_RUNTIME
  if (!NO_TRACE) {
    console.log('> stack:', formatter.format(rt.stack));
    console.log('>', disassembleInstruction(rt.chunk, rt.pc));
  }
  //#endif
}

const tracer = trace.getTracer('main');

export { startSpan };

// Very similar to OpenTelemetry's implementation of startActiveSpan, except
// the callback function closes the span and attaches annotations in error
// cases.
//
// This is currently defined regardless of whether or not we're in debug
// mode, so that calling startSpan without a guard won't crash the program.
// In practice, guards are placed at the call site.
//
// See: https://github.com/open-telemetry/opentelemetry-js/blob/main/api/src/trace/NoopTracer.ts#L56-L100
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  fn: F
): ReturnType<F>;
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  opts: SpanOptions | undefined,
  fn: F
): ReturnType<F>;
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  opts: SpanOptions | undefined,
  ctx: Context | undefined,
  fn: F
): ReturnType<F>;
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  arg2?: F | SpanOptions,
  arg3?: F | Context,
  arg4?: F
): ReturnType<F> | undefined {
  let opts: SpanOptions | undefined;
  let ctx: Context | undefined;
  let fn: F;
  if (arguments.length < 2) {
    return;
  } else if (arguments.length === 2) {
    fn = arg2 as F;
  } else if (arguments.length === 3) {
    opts = arg2 as SpanOptions | undefined;
    fn = arg3 as F;
  } else {
    opts = arg2 as SpanOptions | undefined;
    ctx = arg3 as Context | undefined;
    fn = arg4 as F;
  }
  const wrapped = (span: Span) => {
    try {
      return fn(span);
    } catch (err) {
      span.recordException(err);
  throw err;
    } finally {
      span.end();
    }
  }

  const parentContext = ctx ?? context.active();
  const span = tracer.startSpan(name, opts, parentContext);
  const contextWithSpanSet = trace.setSpan(parentContext, span);
  return context.with(contextWithSpanSet, wrapped, undefined, span);
}

// A convenience function for adding events when you don't have the span
// immediately on-hand. Like startSpan, this is not hidden behind jscc and
// should instead be conditionally imported/called at the site of use.
export function addEvent(message: string, attributes: Attributes = {}): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(message, attributes);
  }
}
