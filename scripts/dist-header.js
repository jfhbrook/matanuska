#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';

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

writeFileSync('./src/dist.h', `#define DIST "${encode(dist)}"`);
