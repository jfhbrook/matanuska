import process from 'node:process';

import { describe } from 'vitest';

import { Formatter, DefaultFormatter, Inspector } from '../../format';

export function scrubNodeVersion(snap: string): string {
  return snap.replace(`Node.js: ${process.version}`, 'Node.js: NODE_VERSION');
}

export type TestSuite<F extends Formatter> = (formatter: F) => void;

export function runFormatSuite(
  name: string,
  suite: TestSuite<Formatter>,
): void {
  describe(name, () => {
    for (const ctor of [DefaultFormatter, Inspector]) {
      const formatter = new ctor();
      describe(`given a ${formatter.constructor.name}`, () => {
        suite(formatter);
      });
    }
  });
}
