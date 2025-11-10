import { NotImplementedError } from './exceptions';
import { Value } from './value';

export interface ParamsSpec {
  arguments?: string[];
  flags?: string[];
  options?: string[];
}

export interface Params {
  arguments: Value[];
  flags: Record<string, boolean>;
  options: Record<string, Value>;
}

export class ParamsParser {
  constructor(private spec: ParamsSpec) {}

  // TODO: This should take values, not exprs
  parse(params: Array<Value | null>): Params {
    throw new NotImplementedError('params');
  }
}
