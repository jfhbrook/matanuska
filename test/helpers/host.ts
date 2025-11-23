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
  return mockHost(host, files);
}
