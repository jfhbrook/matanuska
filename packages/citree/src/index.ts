import { readFile, writeFile } from 'node:fs/promises';

import minimist from 'minimist';

import { Spec } from './ast';
import { resolveImports, Imports } from './imports';
import { parseSpec } from './parser';
import { resolveTypes, Types } from './types';
import { renderAll, RenderedFiles } from './templates';
import { format } from './format';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version: VERSION } = require('../package.json');

const EXIT_SOFTWARE = 70;
const EXIT_NOINPUT = 66;
const EXIT_CANTCREATE = 73;

const USAGE = `Usage: citree [ spec.astree ]

Options:
  -h, --help               print citree command line options
  -v, --version            print citree version
`;

export interface Args {
  filename: string;
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

function error(err: any, code: number): never {
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
    usage('Missing filename');
  }

  if (args._.length > 1) {
    usage(`Unexpected argument: ${args._[1]}`);
  }

  const filename: string = args._[0];

  return { filename };
}

async function read(filename: string): Promise<string> {
  let contents: string;
  try {
    contents = await readFile(filename, 'utf8');
  } catch (err: any) {
    error(err, EXIT_NOINPUT);
  }
  return contents;
}

export default async function main(
  argv: typeof process.argv = process.argv.slice(2),
): Promise<void> {
  const { filename } = parseArgs(argv);

  const contents = await read(filename);

  let spec: Spec;
  let imports: Imports;
  let types: Types;

  try {
    spec = parseSpec(contents);
    imports = resolveImports(filename, spec);
    types = resolveTypes(filename, spec);
  } catch (err: any) {
    error(err, EXIT_SOFTWARE);
  }

  let rendered: RenderedFiles;

  try {
    rendered = renderAll(imports, types);
  } catch (err: any) {
    error(err, EXIT_SOFTWARE);
  }

  try {
    for (const [path, contents] of Object.entries(rendered)) {
      await writeFile(path, contents);
    }
  } catch (err: any) {
    error(err, EXIT_CANTCREATE);
  }

  try {
    await format(types);
  } catch (err) {
    error(err, EXIT_SOFTWARE);
  }

  console.log(`${Object.keys(rendered).length} files generated successfully.`);
}
