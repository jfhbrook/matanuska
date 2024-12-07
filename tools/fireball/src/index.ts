import { spawnSync } from 'node:child_process';
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
  -v, --version            print fireball version
`;

export interface Args {
  command: string;
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
    },
    boolean: ['help', 'version'],
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

  return { command };
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

export default async function main(
  argv: typeof process.argv = process.argv.slice(2),
): Promise<void> {
  const { command } = parseArgs(argv);

  switch (command) {
    case 'up':
      run('apply');
      break;
    case 'down':
      run('destroy');
      break;
    default:
      error(`Unknown command: ${command}`);
  }
}
