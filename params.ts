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
export class OptionalArg extends Arg {}
export class Argv extends Arg {}
export class Flag extends Param {}
export class Opt extends Param {}

export type ParamSpec = Param[];
export type Parameters = Record<string, Value>;

// export type Value = number | boolean | string | BaseException | Nil;

export class Params {
  args: Arg[];
  argv: string[];
  opts: Record<string, Opt>;
  aliases: Record<string, string>;

  constructor(spec: ParamSpec) {
    this.args = [];
    this.argv = [];
    this.opts = {};
    this.aliases = {};

    for (const param of spec) {
      if (param instanceof Argv) {
        this.argv.push(param.name);
      } else if (param instanceof Arg) {
        this.args.push(param);
      } else {
        this.opts[param.name] = param;
      }

      for (const alias of param.aliases) {
        this.aliases[alias] = param.name;
      }
    }
  }

  parse(params: Value[]): Record<string, any> {
    const argv: Value[] = [];
    // Result can be either a value or, in the case of argv, an array of
    // values. Rather than forcing the user to check the type, we assume they
    // are adults - lol
    const parsed: Record<string, any> = {};

    for (const name of this.argv) {
      parsed[name] = [];
    }

    for (const arg of this.args) {
      parsed[arg.name] = null;
    }

    for (const name of Object.keys(this.opts)) {
      parsed[name] = null;
    }

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
        }
      }
      advance(n);
    };

    const collectArg = () => {
      argv.push(getValue(0));
      advance();
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
          continue;
        }
      }
      collectArg();
    }

    let j = 0;

    for (const arg of this.args) {
      // Additional arguments were not provided
      if (j >= argv.length) {
        if (arg instanceof OptionalArg) {
          parsed[arg.name] = null;
          j++;
          continue;
        }
        throw new ParamError(`Expected argument ${arg.name}`);
      }

      // Absorb additional argv
      if (arg instanceof Argv) {
        parsed[arg.name] = argv.slice(j);
        j = argv.length;
        continue;
      }

      // Save the arg as normal and continue
      parsed[arg.name] = argv[j];
      j++;
    }

    // Unconsumed arguments
    if (j < argv.length) {
      throw new ParamError(`Unexpected argument ${argv[j]}`);
    }

    return parsed;
  }
}
