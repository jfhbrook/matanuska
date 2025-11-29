import { Chunk } from '../bytecode/chunk';
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

export enum RoutineType {
  Input,
  Program,
  Function,
}

export class Routine implements Formattable {
  public filename: string;
  public name: string;
  public chunk: Chunk;

  constructor(
    public type: RoutineType,
    filename: string | null = null,
    name: string | null = null,
    public arity: number = 0,
    public definition: Instr[] = [],
  ) {
    if (typeof filename === 'string') {
      this.filename = filename;
    } else if (type === RoutineType.Input) {
      this.filename = '<input>';
    } else if (type === RoutineType.Program) {
      this.filename = '<main>';
    } else {
      this.filename = '<none>';
    }

    if (typeof name === 'string') {
      this.name = name;
    } else if (type == RoutineType.Input) {
      this.name = '<input>';
    } else if (type === RoutineType.Program) {
      this.name = '<main>';
    } else {
      this.name = '<anonymous>';
    }

    this.chunk = new Chunk();
    this.chunk.filename = this.filename;
    this.chunk.routine = this.name;
  }

  format(formatter: Formatter): string {
    return formatter.format(this.definition);
  }
}

export type Value =
  | number
  | boolean
  | string
  | BaseException
  | Routine
  | Nil
  | Undef;
