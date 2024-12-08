import { LoggerService, Injectable } from '@nestjs/common';

import { Tree } from './ast';
import { Chunk } from './bytecode/chunk';
import { Runtime } from './runtime';
import { addEvent } from './telemetry';

//#if _MATBAS_BUILD == 'debug'
import { parseBoolEnv } from './env';
import { formatter } from './format';
//#if _DEBUG_SHOW_CHUNK
import { disassemble } from './bytecode/disassembler';
//#endif
//#if _DEBUG_TRACE_RUNTIME
import { disassembleInstruction } from './bytecode/disassembler';
//#endif
//#endif

let NO_TRACE = true;

/**
 * Show a parse tree.
 *
 * @param tree The tree to show.
 */
let showTree = function showTree(_tree: Tree): void {
  return;
};

/**
 * Show a compiled chunk.
 *
 * @param chunk The chunk to show.
 */
let showChunk = function showChunk(_chunk: Chunk): void {
  return;
};

/**
 * Log the start of execution tracing.
 */
let startTraceExec = function startTraceExec(): void {};

/**
 * Trace a step in execution.
 * @param rt The runtime.
 */
let traceExec = function traceExec(_rt: Runtime): void {};

//#if _MATBAS_BUILD == 'debug'
NO_TRACE = parseBoolEnv(process.env.NO_TRACE);

//#if _DEBUG_SHOW_TREE
if (!NO_TRACE) {
  showTree = function showTree(tree: Tree): void {
    console.log('=== Parse Tree: ===');
    console.log(formatter.format(tree));
  };
}
//#endif

//#if _DEBUG_SHOW_CHUNK
if (!NO_TRACE) {
  showChunk = function showChunk(chunk: Chunk): void {
    console.log(disassemble(chunk));
  };
}
//#endif

//#if _DEBUG_TRACE_RUNTIME
if (!NO_TRACE) {
  startTraceExec = function startTraceExec(): void {
    console.log('=== Execution Trace: ===');
  };

  traceExec = function traceExec(rt: Runtime): void {
    console.log('> stack:', formatter.format(rt.stack));
    console.log('>', disassembleInstruction(rt.chunk, rt.pc));
  };
}
//#endif
//#endif

@Injectable()
class NestLogger implements LoggerService {
  log(message: any, ..._optionalParams: any[]) {
    // TODO: winston formatter
    addEvent(message, {});
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.log(`FATAL: ${message}`, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.log(`ERROR: ${message}`, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.log(`WARN: ${message}`, ...optionalParams);
  }
}

export {
  showTree,
  showChunk,
  startTraceExec,
  traceExec,
  NestLogger,
};
