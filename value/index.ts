import type { Chunk } from '../bytecode/chunk';
import type { Instr } from '../ast/instr';
import { SHOW_UNDEF } from '../debug';
import { BaseException } from '../exceptions';
import { Formattable, Formatter } from '../format';

export class Nil implements Formattable {
  format(_formatter: Formatter): string {
    return 'nil';
  }
}

export class Undef implements Formattable {
  format(_formatter: Formatter): string {
    return SHOW_UNDEF ? 'undef' : 'nil';
  }
}

export const nil = new Nil();
export const undef = new Undef();

export class Fn implements Formattable {
  constructor(
    public name: string,
    public arity: number,
    public chunk: Chunk,
    public definition: Instr[],
  ) {}

  format(formatter: Formatter): string {
    return formatter.format(this.definition);
  }
}

export type Value =
  | number
  | boolean
  | string
  | BaseException
  | Function
  | Nil
  | Undef;
