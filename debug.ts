import { Span, startSpan, addEvent } from '@matanuska/debug';

export { startSpan, addEvent };
export type { Span };

import type { Chunk } from './bytecode/chunk';
import type { Runtime } from './runtime';

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
import { disassembleInstruction } from './bytecode/disassembler';
//#set _IMPORT_FORMATTER = 1
//#endif

//#if _IMPORT_FORMATTER
import { formatter } from './format';
//#endif

let NO_TRACE = true;
let SHOW_UNDEF = false;

//#if _MATBAS_BUILD == 'debug'
NO_TRACE = parseBoolEnv(process.env.NO_TRACE);
SHOW_UNDEF = parseBoolEnv(process.env.DEBUG_SHOW_UNDEF);
//#endif

export { NO_TRACE, SHOW_UNDEF }

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
 * Show the runtime's state. This is the stack, plus the locations of
 * relevant pointers.
 */
export function showStack(rt: Runtime): void {
  const { sp } = rt.registers;

  let stack = formatter.format(rt.stack).split('\n');
  const top = stack.shift();
  const bottom = stack.pop();
  stack = stack.map((line, i) => {
    if (i === sp) {
      return `->${line}`;
    }
    return `  ${line}`;
  });
  stack.unshift(top);
  stack.push(bottom);
  return stack.join('\n');
}

/**
 * Trace a step in execution.
 * @param rt The runtime.
 */
export function traceExec(rt: Runtime): void {
  //#if _DEBUG_TRACE_RUNTIME
  if (!NO_TRACE) {
    console.log('>', disassembleInstruction(rt.chunk, rt.frame.pc));
    console.log('>', showStack(rt));
    console.log('---');
  }
  //#endif
}
