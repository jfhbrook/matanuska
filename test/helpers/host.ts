import { expect } from 'vitest';

import { host } from '../../host';
import { mockHost, MockConsoleHost } from '@matanuska/mock';

import { EXAMPLES } from './files';

export interface MockConsoleHostOptions {
  files?: Record<string, string>;
}

const FILES: Record<string, string> = Object.assign(
  {
    '/home/josh/.matbas_history': '',
  },
  EXAMPLES,
);

export function mockConsoleHost(
  files: Record<string, string> = FILES,
): MockConsoleHost {
  return mockHost(
    {
      ok(value: unknown, message?: string): void {
        expect(value, message).toBeTruthy();
      },
      match(value: unknown, regexp: RegExp | string, message?: string): void {
        expect(value, message).toMatch(regexp);
      },
    },
    host,
    files,
  );
}
