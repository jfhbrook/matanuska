import { readFile, writeFile } from 'fs/promises';

import minimist from 'minimist';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version: VERSION } = require('../package.json');

const EXIT_SOFTWARE = 70;
const EXIT_NOINPUT = 66;
const EXIT_CANTCREATE = 73;

const USAGE = `Usage: fireball

Options:
  -h, --help               print fireball command line options
  -v, --version            print fireball version
`;

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

function error(err: any, code: number): never {
  console.error(err);
  process.exit(code);
}

export function parseArgs(argv: typeof process.argv): void {
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
}

export default async function main(
  argv: typeof process.argv = process.argv.slice(2),
): Promise<void> {
  parseArgs(argv);

  console.log('hello world');
}
