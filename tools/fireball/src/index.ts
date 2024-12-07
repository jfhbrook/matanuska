import { spawn, spawnSync } from 'node:child_process';
import * as path from 'node:path';

import minimist from 'minimist';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version: VERSION } = require('../package.json');

// const EXIT_SOFTWARE = 70;
// const EXIT_NOINPUT = 66;
// const EXIT_CANTCREATE = 73;

const USAGE = `Usage: fireball COMMAND

Commands:
  up                       stand up Jaeger
  down                     tear down Jaeger

Options:
  -h, --help               print fireball command line options
  -d, --detach             detach after standing up Jaeger
  -v, --version            print fireball version
`;

export interface Args {
  command: string;
  detach: boolean;
}

function help() {
  console.log(USAGE);
  process.exit(0);
}

function version() {
  console.log(`v${VERSION}`);
  process.exit(0);
}

function usage(message: string) {
  console.error(message + '\n');
  console.error(USAGE);
  process.exit(70);
}

function error(err: any, code: number = 1): never {
  console.error(err);
  process.exit(code);
}

export function parseArgs(argv: typeof process.argv): Args {
  const args = minimist(argv, {
    alias: {
      h: 'help',
      v: 'version',
      d: 'detach',
    },
    boolean: ['help', 'version', 'detach'],
    unknown(opt: string): boolean {
      if (opt.startsWith('-')) {
        usage(`Unknown option: ${opt}`);
        return false;
      }
      return true;
    },
  });

  if (args.help) {
    help();
  }

  if (args.version) {
    version();
  }

  if (args._.length < 1) {
    help();
  }

  if (args._.length > 1) {
    usage(`Unexpected argument: ${args._[1]}`);
  }

  const command: string = args._[0];

  return { command, detach: args.detach || false };
}

function run(command: string): void {
  const { status } = spawnSync(
    'terraform',
    [
      `-chdir=${path.join(__dirname, '..', 'modules', 'fireball')}`,
      command,
      '-auto-approve',
    ],
    { stdio: 'inherit' },
  );
  if (status) {
    error('', status);
  }
}

function getName(): string {
  const { status, stdout } = spawnSync(
    'terraform',
    [
      `-chdir=${path.join(__dirname, '..', 'modules', 'fireball')}`,
      'output',
      '-raw',
      'name',
    ],
    { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' },
  );
  if (status) {
    error('', status);
  }
  return stdout;
}

function tail(name: string): void {
  const child = spawn('docker', ['logs', '-f', '--tail', '10', name], {
    stdio: ['inherit', 'inherit', 'inherit'],
  });
  child.on('exit', (status) => {
    if (status) {
      error('', status);
    }
  });
}

export default async function main(
  argv: typeof process.argv = process.argv.slice(2),
): Promise<void> {
  const { command, detach } = parseArgs(argv);

  switch (command) {
    case 'up':
      run('apply');
      if (!detach) {
        process.once('SIGINT', () => {
          run('destroy');
        });
        tail(getName());
      }
      break;
    case 'down':
      run('destroy');
      break;
    default:
      error(`Unknown command: ${command}`);
  }
}
