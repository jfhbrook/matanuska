import type { Args, Command, Deferred, ReturnValue } from './base';
import { Context } from './base';

import new_ from './new';
import load from './load';
import list from './list';
import renum from './renum';
import save from './save';
import run from './run';

type CommandIndex = Record<string, Command>;

const BUILTINS: CommandIndex = {
  new: new_,
  load,
  list,
  renum,
  save,
  run,
};

export {
  BUILTINS,
  CommandIndex,
  Args,
  Command,
  Context,
  Deferred,
  ReturnValue,
};
