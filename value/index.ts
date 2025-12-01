import { Chunk } from '../bytecode/chunk';
import { SHOW_UNDEF } from '../debug';
import { BaseException } from '../exceptions';
import { Formattable, Formatter } from '../format';
import { Token } from '../tokens';

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

export interface BaseRoutine extends Formattable {
  type: RoutineType;
  arity: number;
}

export class Routine implements BaseRoutine {
  public filename: string;
  public chunk: Chunk;

  constructor(
    public type: RoutineType,
    filename: string | null = null,
    public name: Token | null = null,
    public arity: number = 0,
  ) {
    if (filename) {
      this.filename = filename;
    } else if (type === RoutineType.Input) {
      this.filename = '<input>';
    } else if (type === RoutineType.Program) {
      this.filename = '<main>';
    } else {
      this.filename = '<none>';
    }

    let chunkName = '<anonymous>';
    if (name) {
      chunkName = name.text;
    } else if (type === RoutineType.Input) {
      chunkName = '<input>';
    } else if (type === RoutineType.Program) {
      chunkName = '<main>';
    }

    this.chunk = new Chunk();
    this.chunk.filename = this.filename;
    this.chunk.routine = chunkName;
  }

  format(_formatter: Formatter): string {
    let type = 'Routine';
    switch (this.type) {
      case RoutineType.Input:
        type = 'Input';
        break;
      case RoutineType.Program:
        type = 'Program';
        break;
      case RoutineType.Function:
        type = 'Function';
        break;
    }
    return `${type}(${this.chunk.routine}, ${this.arity})`;
  }
}

export abstract class NativeRoutine implements BaseRoutine {
  type: RoutineType = RoutineType.Function;
  name: string;
  arity: number;

  public abstract call(...args: Value[]): Promise<Value>;

  format(_formatter: Formatter): string {
    return `NativeFunction(${this.name}, ${this.arity})`;
  }
}

export type Value =
  | number
  | boolean
  | string
  | BaseException
  | Routine
  | NativeRoutine
  | Nil
  | Undef;
