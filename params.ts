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

    const getOpt = (name: string): Param | null => {
      name = this.aliases[name] ? this.aliases[name] : name;

      return this.opts[name] || null;
    };

    const getValue = (n: number = 1): Value => {
      const v = params[i + n];
      if (v === null) {
        return nil;
      }
      return v;
    };

    const setOpt = (name: string, flagValue: boolean = true): void => {
      const p = getOpt(name);
      if (p) {
        if (p instanceof Flag) {
          parsed[p.name] = flagValue;
          advance();
          return;
        }
        parsed[p.name] = getValue();
        advance(2);
        return;
      }

      throw new ParamError(`Unknown flag or option --${name}`);
    };

    const setNoOpt = (name: string): void => {
      try {
        setOpt(name, true);
      } catch (err) {
        if (!(err instanceof ParamError)) {
          throw err;
        }
        setOpt(name.slice(3), false);
      }
    };

    const setShortOpts = (opts: string) => {
      let n = 1;
      for (let i = 0; i < opts.length; i++) {
        const name = opts[i];
        const p = getOpt(name);
        if (p) {
          if (p instanceof Flag) {
            parsed[p.name] = true;
            continue;
          }
          if (i !== opts.length - 1) {
            throw new ParamError(
              `Option flag -${name} must be followed by a value`,
            );
          }
          parsed[p.name] = getValue();
          n = 2;
          break;
        }
      }
      advance(n);
    };

    const setArg = () => {
      const value = getValue(0);
      if (args.length) {
        parsed[args[0]] = value;
        args.shift();
        advance(1);
        return;
      }

      throw new ParamError(`Unknown argument ${value}`);
    };

    while (i < params.length) {
      const param = params[i];
      if (typeof param === 'string') {
        if (param.match(/^--no-/)) {
          setNoOpt(param.slice(2));
          continue;
        }

        if (param.match(/^--/)) {
          setOpt(param.slice(2), true);
          continue;
        }

        if (param.match(/^-/)) {
          setShortOpts(param.slice(1));
        }
      }
      setArg();
    }

    if (args.length) {
      throw new ParamError(`No argument for ${args[0]}`);
    }

    return parsed;
  }
}
