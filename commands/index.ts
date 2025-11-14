import {
  Args,
  Command,
  Context,
  InteractiveContext,
  ReturnValue,
} from './base';

import new_ from './interactive/new';
import load from './interactive/load';
import list from './interactive/list';
import renum from './interactive/renum';
import save from './interactive/save';
import run from './interactive/run';

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
  InteractiveContext,
  ReturnValue,
};
