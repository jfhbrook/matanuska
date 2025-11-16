import { join, relative, resolve } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';

export const FILENAME = '/home/josh/script.bas';

type FullPath = string;
type Contents = string;

export const EXAMPLES: Record<FullPath, Contents> = Object.fromEntries(
  readdirSync(join(__dirname, '../../examples'))
    .filter((entry) => entry.endsWith('.bas'))
    .map((entry) => [
      relative(
        resolve(join(__dirname, '../..')),
        resolve(join(__dirname, '../../examples', entry)),
      ),
      readFileSync(join(__dirname, '../../examples', entry), 'utf8'),
    ]),
);
