import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { hostname, userInfo, homedir } from 'node:os';
import { stdin, stdout, stderr, platform, cwd, env } from 'node:process';
import { Readable, Writable } from 'node:stream';
import * as util from 'node:util';
declare const inspect: typeof util.inspect;
export { spawnSync, readFile, writeFile, hostname, userInfo, homedir, stdin, stdout, stderr, platform, cwd, env, Readable, Writable, inspect, };
