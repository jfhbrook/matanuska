import MATBAS from 'consts:matbas';
import { UsageFault } from './faults';
import { Level } from './host';
import { Exit, ExitCode } from './exit';

let TRACE_USAGE = '';

//#if _MATBAS_BUILD == 'debug'
TRACE_USAGE = `
DEBUG_TRACE           enable debug tracing
DEBUG_SHOW_TREE       log resulting parse trees
DEBUG_SHOW_CHUNK      log compiled chunks
DEBUG_TRACE_RUNTIME   enable runtime execution tracing`;
//#endif

const USAGE = `Usage: matbas [options] [ script.bas ] [arguments]

Options:
  -h, --help                  print matbas command line options
  -c, --command <command>     evaluate command
  -e, --eval <script>         evaluate script
  -v, --version               print matbas version
  --log-level <level>         set log level (debug, info, warn, error)
  --history-size <size>       set the in-memory history size. defaults to 500.
                              set to -1 for an unlimited history size
  --history-file-size <size>  set the size of the history file. defaults to
                              history size.
  
Environment variables:
MATBAS_LOG_LEVEL      set log level (debug, info, warn, error)
HISTSIZE              set the in-memory history size. defaults to 500. set to
                      -1 for an unlimited history size.
HISTFILESIZE          set the maximum size of the history file. defaults to
                      history size.${TRACE_USAGE}
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
  return new Exit(ExitCode.Success, `v${MATBAS.version}`);
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

function parseSize(arg: string): number {
  let size = parseInt(arg);
  if (Number.isNaN(size)) {
    throw usage('Invalid size (must be an integer)');
  }
  if (size < 1) {
    size = Number.MAX_SAFE_INTEGER;
  }
  return size;
}

/**
 * Basic configuration for Matanuska BASIC.
 */
export class Config {
  public readonly eval: string | null;

  /**
   * @param command A command to run.
   * @param eval_ The source of a script to evaluate.
   * @param script The path to a script to run.
   * @param logLevel The log level.
   * @param argv Command line arguments passed to the runtime.
   * @param env Environment variables.
   */
  constructor(
    public readonly command: string | null,
    eval_: string | null,
    public readonly script: string | null,
    public readonly level: Level,
    public readonly historySize: number,
    public readonly historyFileSize: number,
    public readonly argv: Argv,
    public readonly env: Env,
  ) {
    this.eval = eval_;
  }

  /**
   * Load configuration from command line arguments and environment variables.
   *
   * @param argv Node's command line arguments, without the executable or
   *        script name. In practice, this is `process.argv.slice(2)`.
   * @param env Environment variables. In practice, this is `process.env`.
   */
  static load(argv: Argv, env: Env) {
    let command: string | null = null;
    let eval_: string | null = null;
    let script: string | null = null;
    let level = Level.Info;
    let historySize: number = 500;
    let historyFileSize: number = 500;
    const scriptArgv: string[] = [process.env.__MATBAS_DOLLAR_ZERO || 'matbas'];

    if (env.MATBAS_LOG_LEVEL) {
      level = parseLevel(env.MATBAS_LOG_LEVEL);
    }

    if (env.HISTSIZE) {
      historySize = parseSize(env.HISTSIZE);
    }

    if (env.HISTFILESIZE) {
      historyFileSize = parseSize(env.HISTFILESIZE);
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
        case '--history-size':
          args.shift();
          if (!args.length) {
            throw usage('No history size provided');
          }
          historySize = parseSize(args.shift() as string);
          break;
        case '--history-file-size':
          args.shift();
          if (!args.length) {
            throw usage('No history file size provided');
          }
          historyFileSize = parseSize(args.shift() as string);
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

    return new Config(
      command,
      eval_,
      script,
      level,
      historySize,
      Math.min(historySize, historyFileSize),
      scriptArgv,
      env,
    );
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
        historySize: this.historySize,
        historyFileSize: this.historyFileSize,
        argv: this.argv,
      },
      null,
      2,
    );
  }
}
