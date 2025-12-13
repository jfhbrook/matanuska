import { readFileSync, readdirSync } from 'node:fs';
import * as path from 'node:path';

export const FILENAME = '/home/josh/script.bas';

type FullPath = string;
type Contents = string;

function loadFiles(dir: string): Record<FullPath, Contents> {
  return Object.fromEntries(
    readdirSync(path.join(__dirname, dir))
      .filter((entry) => entry.endsWith('.bas'))
      .map((entry) => [
        path.relative(
          path.resolve(path.join(__dirname, path.dirname(dir))),
          path.resolve(path.join(__dirname, dir, entry)),
        ),
        readFileSync(path.join(__dirname, dir, entry), 'utf8'),
      ]),
  );
}

export const EXAMPLES = loadFiles('../../examples');
export const FIXTURES = loadFiles('../fixtures');
