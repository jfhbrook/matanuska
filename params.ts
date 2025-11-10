import { NotImplementedError } from './exceptions';
import { Expr } from './ast/expr';

export interface ParamsSpec {
  arguments?: string[];
  flags?: string[];
  options?: string[];
}

export interface Params {
  arguments: Expr[];
  flags: Record<string, boolean>;
  options: Record<string, Expr>;
}

export class ParamsParser {
  constructor(private spec: ParamsSpec) {}

  parse(params: Expr[]) {
    throw new NotImplementedError('params');
  }
}
