import * as path from 'node:path';

import parseArgs from 'minimist';

export interface Config {
  directory: string;
  precedenceCount: number;
  activate: boolean;
}

export function loadConfig(
  argv: typeof process.argv = process.argv.slice(2),
  env: typeof process.env = process.env,
): Config {
  const args = parseArgs(argv, {
    string: ['precedence-count'],
    boolean: ['activate'],
    default: {
      'precedence-count': env.TEST_GENERATOR_PRECEDENCE_COUNT || '1',
      activate: false,
    },
  });

  const [directory] = args._;

  return {
    directory: path.resolve(directory || './test'),
    precedenceCount: parseInt(args['precedence-count'], 10),
    activate: args.activate,
  };
}
