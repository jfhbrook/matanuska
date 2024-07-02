import { Injectable, Inject } from '@nestjs/common';

import { MATBAS_BUILD, MATBAS_VERSION } from './constants';
import { UsageFault } from './faults';
import { Level } from './host';
import { Exit, ExitCode } from './exit';

let TRACE_USAGE = '';

if (MATBAS_BUILD === 'debug') {
  TRACE_USAGE = `
DEBUG_TRACE           enable main debug tracing
DEBUG_TRACE_PARSER    enable parser debug tracing
DEBUG_SHOW_TREE       log resulting parse trees
DEBUG_TRACE_COMPILER  enable compiler debug tracing
DEBUG_SHOW_CHUNK      log compiled chunks
DEBUG_TRACE_RUNTIME   enable runtime execution tracing
DEBUG_TRACE_GC        enable tracing garbage collection`;
}

const USAGE = `Usage: matbas [options] [ script.bas ] [arguments]

Options:
  -h, --help               print matbas command line options
  -c, --command <command>  evaluate command
  -e, --eval <script>      evaluate script
  -v, --version            print matbas version
  --log-level <level>      set log level (debug, info, warn, error)
  
Environment variables:
MATBAS_LOG_LEVEL      set log level (debug, info, warn, error)${TRACE_USAGE}
`;

/**
 * Command line arguments.
 */
export type Argv = typeof process.argv;

/**
 * Command line environment.
 */
export type Env = typeof process.env;

function help(): Exit {
  return new Exit(ExitCode.Success, USAGE);
}

function version(): Exit {
  return new Exit(ExitCode.Success, `v${MATBAS_VERSION}`);
}

function usage(message: string): UsageFault {
  return new UsageFault(`${message}\n${USAGE}`);
}

const LEVELS = {
  debug: Level.Debug,
  info: Level.Info,
  warn: Level.Warn,
  error: Level.Error,
};

function parseLevel(arg: string): Level {
  const level: Level | undefined = LEVELS[arg];

  if (typeof level === 'undefined') {
    throw usage(
      `Invalid log level: ${arg} ` +
        '(must be one of: debug, info, warn, error)',
    );
  }

  return level;
}

/**
 * Basic configuration for Matanuska BASIC.
 */
@Injectable()
export class Config {
  public readonly command: string | null;
  public readonly eval: string | null;
  public readonly script: string | null;
  public readonly level: Level;
  public readonly argv: Argv;
  public readonly env: Env;

  /**
   * Load configuration from command line arguments and environment variables.
   *
   * @param argv Node's command line arguments, without the executable or
   *        script name. In practice, this is `process.argv.slice(2)`.
   * @param env Environment variables. In practice, this is `process.env`.
   */
  constructor(@Inject('argv') argv: Argv, @Inject('env') env: Env) {
    let command: string | null = null;
    let eval_: string | null = null;
    let script: string | null = null;
    let level = Level.Info;
    const scriptArgv: string[] = [process.env.__MATBAS_DOLLAR_ZERO || 'matbas'];

    if (env.MATBAS_LOG_LEVEL) {
      level = parseLevel(env.MATBAS_LOG_LEVEL);
    }

    const args = Array.from(argv);

    while (args.length) {
      switch (args[0]) {
        case '-h':
        case '--help':
          throw help();
        case '-c':
        case '--command':
          args.shift();
          if (!args.length) {
            throw usage('no command provided');
          }
          command = args.shift() as string;
          break;
        case '-e':
        case '--eval':
          args.shift();
          if (!args.length) {
            throw usage('No source to eval provided');
          }
          eval_ = args.shift() as string;
          break;
        case '--log-level':
          args.shift();
          if (!args.length) {
            throw usage('No log level provided');
          }
          level = parseLevel(args.shift() as string);
          break;
        case '-v':
        case '--version':
          throw version();
        default:
          if (!script && !args[0].startsWith('-')) {
            const scr = args.shift() as string;
            script = scr;
            scriptArgv.push(scr);
            break;
          }

          if (script || command || eval_) {
            scriptArgv.push(args.shift() as string);
            break;
          }

          throw usage(`Invalid option: ${args.shift()}`);
      }
    }

    this.command = command;
    this.eval = eval_;
    this.script = script;
    this.level = level;
    this.argv = scriptArgv;
    this.env = env;
  }

  /**
   * Serialize the config to a string. Elides environment variables.
   */
  toString() {
    return JSON.stringify(
      {
        command: this.command,
        eval: this.eval,
        script: this.script,
        logLevel: this.level,
        argv: this.argv,
      },
      null,
      2,
    );
  }
}
