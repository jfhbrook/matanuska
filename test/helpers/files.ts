import { join, resolve } from 'path';
import { readdirSync } from 'fs';

type Basename = string;
type FullPath = string;

export const EXAMPLES: Record<Basename, FullPath> = Object.fromEntries(
  readdirSync(join(__dirname, '../../examples'))
    .filter((entry) => entry.endsWith('.bas'))
    .map((entry) => [entry, resolve(join(__dirname, '../../examples', entry))]),
);
