import { basename, dirname, join, resolve } from 'path';

export function resolvePath(filename: string, path: string | null) {
  return resolve(join(dirname(filename), `${basename(path || filename)}.ts`));
}
