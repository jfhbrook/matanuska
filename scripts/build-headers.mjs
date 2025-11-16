#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import * as process from 'node:process';

let dist = readFileSync('./dist/main.js', 'utf8');

function encode(input) {
  let output = '';
  for (let char of input) {
    switch (char) {
      case '\\':
      case '"':
        output += '\\' + char;
        break;
      case '\n':
        output += '\\n';
        break;
      default:
        output += char;
        break;
    }
  }
  return output;
}

writeFileSync(
  './core/dist.h',
  `#ifndef matbas_dist_h
#define matbas_dist_h

#define DIST "${encode(dist)}"

#endif
`,
);

export function parseBoolEnv(value) {
  if (!value) {
    return false;
  }

  if (value.match(/^\W*$/)) {
    return false;
  }

  if (value.match(/^\W*0\W*$/)) {
    return false;
  }

  if (value.match(/^\W*false\W*$/i)) {
    return false;
  }

  return true;
}

const MATBAS_BUILD = process.env.MATBAS_BUILD || 'debug';
const DEBUG_TRACE = parseBoolEnv(process.env.DEBUG_TRACE);
const DEBUG_TRACE_PARSER = parseBoolEnv(process.env.DEBUG_TRACE_PARSER);
const DEBUG_SHOW_TREE = parseBoolEnv(process.env.DEBUG_SHOW_TREE);
const DEBUG_TRACE_COMPILER = parseBoolEnv(process.env.DEBUG_TRACE_COMPILER);
const DEBUG_SHOW_CHUNK = parseBoolEnv(process.env.DEBUG_SHOW_CHUNK);
const DEBUG_TRACE_RUNTIME = parseBoolEnv(process.env.DEBUG_TRACE_RUNTIME);
const DEBUG_TRACE_GC = parseBoolEnv(process.env.DEBUG_TRACE_GC);
const DEBUG_SHOW_UNDEF = parseBoolEnv(process.env.DEBUG_SHOW_UNDEF);

writeFileSync(
  './core/config.h',
  `#ifndef matbas_config_h
#define matbas_config_h

#define MATBAS_BUILD "${MATBAS_BUILD}"
#define DEBUG_TRACE ${DEBUG_TRACE}
#define DEBUG_TRACE_PARSER ${DEBUG_TRACE_PARSER}
#define DEBUG_SHOW_TREE ${DEBUG_SHOW_TREE}
#define DEBUG_TRACE_COMPILER ${DEBUG_TRACE_COMPILER}
#define DEBUG_SHOW_CHUNK ${DEBUG_SHOW_CHUNK}
#define DEBUG_TRACE_RUNTIME ${DEBUG_TRACE_RUNTIME}
#define DEBUG_TRACE_GC ${DEBUG_TRACE_GC}
#define DEBUG_SHOW_UNDEF ${DEBUG_SHOW_UNDEF}

#endif
`,
);
