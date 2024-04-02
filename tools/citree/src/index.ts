import { readFile, writeFile } from 'fs/promises';

import minimist from 'minimist';

import { parseSpec, Spec } from './parser';
import { resolveImports, Imports } from './imports';
import { resolveTypes, Types } from './types';
import { renderAll, RenderedFiles } from './templates';
import { format } from './format';

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

export function parseArgs(argv: typeof process.argv): Args {
  const args = minimist(argv.slice(2), {
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

export default async function main() {
  const { filename } = parseArgs(process.argv);

  let contents: string;

  try {
    contents = await readFile(filename, 'utf8');
  } catch (err: any) {
    console.log(err.message);
    process.exit(EXIT_NOINPUT);
  }

  let spec: Spec;
  let imports: Imports;
  let types: Types;

  try {
    spec = parseSpec(contents);
    imports = resolveImports(filename, spec);
    types = resolveTypes(filename, spec);
  } catch (err: any) {
    console.log(err);
    process.exit(EXIT_SOFTWARE);
  }

  let rendered: RenderedFiles;

  try {
    rendered = renderAll(imports, types);
  } catch (err: any) {
    console.log(err.message);
    process.exit(EXIT_SOFTWARE);
  }

  try {
    for (const [path, contents] of Object.entries(rendered)) {
      await writeFile(path, contents);
    }
  } catch (err: any) {
    console.log(err);
    process.exit(EXIT_CANTCREATE);
  }

  try {
    await format(types);
  } catch (err) {
    console.log(err);
    process.exit(EXIT_SOFTWARE);
  }

  console.log(`${Object.keys(rendered).length} files generated successfully.`);
}