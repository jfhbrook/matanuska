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

export type Value = number | boolean | string | BaseException | Nil | Undef;
