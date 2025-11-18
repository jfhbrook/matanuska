import { describe, expect, test } from 'vitest';

import pathTool from '@matanuska/path';

import { run } from './helpers/cli';
import { EXAMPLES } from './helpers/files';

const PATH = pathTool(process);

describe('examples', () => {
  for (const p of Object.keys(EXAMPLES)) {
    const name = PATH.basename(p);
    switch (name) {
      // TODO: Some scripts will need mocked input
      default:
        test(name, async () => {
          const { exitCode, host } = await run([p], process.env);
          expect({
            exitCode,
            stdout: host.stdout.output,
            stderr: host.stderr.output,
          }).toMatchSnapshot();
        });
    }
  }
});
