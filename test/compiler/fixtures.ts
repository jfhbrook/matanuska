import type { TestCase } from '../helpers/compiler';

import { FIXTURES } from '../helpers/files';

export const FIXTURE_PROGRAMS: TestCase[] = Object.values(FIXTURES).map(
  (script) => {
    return [script, null, null];
  },
);
