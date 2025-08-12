import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

import { Config, loadConfig } from './config';
import { formatFile } from './format';
// import { generatePrecedenceTest } from './precedence';
import { activate } from './activate';

export const GENERATORS: Array<[string, (c: Config) => string]> = [
  // ['precedence.spec.ts', generatePrecedenceTest],
];

export async function main(
  argv: typeof process.argv = process.argv.slice(2),
  env: typeof process.env = process.env,
): Promise<void> {
  const config = loadConfig(argv, env);

  for (const [name, generator] of GENERATORS) {
    const scriptPath = path.resolve(path.join(config.directory, name));

    let script: string;
    if (config.activate) {
      console.log(`Activating ${scriptPath}...`);
      const inactive: string = readFileSync(scriptPath, { encoding: 'utf8' });
      script = activate(inactive);
    } else {
      console.log(`Generating ${scriptPath}...`);
      script = generator(config);
    }
    writeFileSync(scriptPath, script, { encoding: 'utf8' });
    await formatFile(scriptPath);
  }

  console.log('Done.');
}
