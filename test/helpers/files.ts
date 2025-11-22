import { readFileSync, readdirSync } from 'node:fs';
import * as path from 'node:path';

export const FILENAME = '/home/josh/script.bas';

type FullPath = string;
type Contents = string;

export const EXAMPLES: Record<FullPath, Contents> = Object.fromEntries(
  readdirSync(path.join(__dirname, '../../examples'))
    .filter((entry) => entry.endsWith('.bas'))
    .map((entry) => [
      path.relative(
        path.resolve(path.join(__dirname, '../..')),
        path.resolve(path.join(__dirname, '../../examples', entry)),
      ),
      readFileSync(path.join(__dirname, '../../examples', entry), 'utf8'),
    ]),
);
