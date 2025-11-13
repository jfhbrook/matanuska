import { Program } from '../ast';
import { Editor } from '../editor';
import { NotImplementedError } from '../exceptions';
import { Executor } from '../executor';
import { Host } from '../host';
import { Value } from '../value';

export interface Context {
  executor: Executor;
  editor: Editor;
  program: Program;
  host: Host;
  args: Array<Value | null>;
}

export const BUILTINS: Record<string, Builtin> = {};

class Builtin {
  constructor() {}
}

BUILTINS.cd = function (_params: Value[]): void {
  throw new NotImplementedError('cd');
};

// rm
// touch
// mv
// mkdir
// rmdir
// pwd
