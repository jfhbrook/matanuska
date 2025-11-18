import { describe, expect, test } from 'vitest';

import pathModule from '@matanuska/path';
import { run } from './helpers/cli';
import { EXAMPLES } from './helpers/files';

const path = pathModule(process);

describe('examples', () => {
  for (const p of Object.keys(EXAMPLES)) {
    const name = path.basename(p);
    switch (name) {
      // TODO: Some scripts will need mocked input
      default:
        test(name, async () => {
          const { exitCode, host } = await run([p], process.env);
          expect({
            exitCode,
            stdout: host.outputStream.output,
            stderr: host.errorStream.output,
          }).toMatchSnapshot();
        });
    }
  }
});
