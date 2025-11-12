import { ParamError } from './exceptions';
import { nil, Value } from './value';

export abstract class Param {
  public aliases: string[];

  constructor(
    public name: string,
    aliases?: string[],
  ) {
    this.aliases = aliases ? aliases : [];
  }
}

export class Arg extends Param {
  constructor(name: string) {
    super(name);
  }
}
export class Flag extends Param {}
export class Opt extends Param {}

export type ParamSpec = Param[];
export type Parameters = Record<string, Value>;

// export type Value = number | boolean | string | BaseException | Nil;

export class Params {
  args: string[];
  flags: Record<string, Flag>;
  opts: Record<string, Opt>;
  aliases: Record<string, string>;

  constructor(spec: ParamSpec) {
    this.args = [];
    this.opts = {};
    this.aliases = {};

    for (const param of spec) {
      if (param instanceof Arg) {
        this.args.push(param.name);
      } else {
        this.opts[param.name] = param;
      }

      for (const alias of param.aliases) {
        this.aliases[alias] = param.name;
      }
    }
  }

  parse(params: Array<Value | null>): Record<string, Value> {
    const args = this.args.slice();
    const parsed: Record<string, Value> = {};

    let i = 0;

    const advance = (n: number = 1) => {
      i += n;
    };

    const getValue = (n: number = 1): Value => {
      const v = params[i + n];
      if (v === null) {
        return nil;
      }
      return v;
    };

    while (i < params.length) {
      const param = params[i];
      if (typeof param === 'string') {
        if (param.match(/^--no-/)) {
          const p = this.getOpt(param.slice(5));
          if (p) {
            // TODO: Should we allow --no-x for non-flag parameters?
            parsed[p.name] = false;
            advance();
            continue;
          }
          throw new ParamError(`Unknown flag or option ${param}`);
        }

        if (param.match(/^--/)) {
          const p = this.getOpt(param.slice(2));
          if (p) {
            if (p instanceof Flag) {
              parsed[p.name] = true;
              advance();
              continue;
            }

            parsed[p.name] = getValue();
            advance(2);
            continue;
          }
          throw new ParamError(`Unknown flag or option ${param}`);
        }

        if (args.length) {
          parsed[args[0]] = getValue(0);
          args.shift();
          advance(1);
          continue;
        }

        throw new ParamError(`Unknown argument ${param}`);
      }
    }

    if (args.length) {
      throw new ParamError(`No argument for ${args[0]}`);
    }

    return parsed;
  }

  private getOpt(name: string): Param | null {
    name = this.aliases[name] ? this.aliases[name] : name;

    return this.opts[name] || null;
  }
}
