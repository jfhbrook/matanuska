import { describe, expect, test } from 'vitest';

import { basename } from '../vendor/path';
import { run } from './helpers/cli';
import { EXAMPLES } from './helpers/files';

describe('examples', () => {
  for (const path of Object.keys(EXAMPLES)) {
    const name = basename(path);
    switch (name) {
      // TODO: Some scripts will need mocked input
      default:
        test(name, async () => {
          const { exitCode, host } = await run([path], process.env);
          expect({
            exitCode,
            stdout: host.outputStream.output,
            stderr: host.errorStream.output,
          }).toMatchSnapshot();
        });
    }
  }
});
