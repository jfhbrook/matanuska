import type {
  Args,
  BaseCommand,
  Command,
  InteractiveCommand,
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

const BUILTINS: Record<string, BaseCommand> = {
  new: new_,
  load,
  list,
  renum,
  save,
  run,
};

export {
  BUILTINS,
  Args,
  BaseCommand,
  Command,
  InteractiveCommand,
  Context,
  InteractiveContext,
  ReturnValue,
};
