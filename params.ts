import { type Parser } from './parser';
import { Token, TokenKind } from './tokens';
import { Expr } from './ast/expr';

export interface Params {
  arguments: Expr[];
  flags: Record<string, boolean>;
  options: Record<string, Expr>;
}

export interface ParamsSpec {
  arguments?: string[];
  flags?: string[];
  options?: string[];
}

export class ParamsParser {
  constructor(private parser: Parser) {}

  parse(spec: ParamsSpec) {
    const args = spec.arguments || [];
    const argv: Params = { arguments: [], flags: {}, options: {} };
    const flagNames: Set<string> = new Set(spec.flags || []);
    const noFlagNames: Set<string> = new Set(
      (spec.flags || []).map((f) => `no-${f}`),
    );
    const optionNames: Set<string> = new Set(spec.options || []);

    let prevParamToken: Token = this.parser.previous!;
    let currParamToken: Token = this.parser.current;
    while (
      !this.parser.check(TokenKind.Colon) &&
      !this.parser.check(TokenKind.Rem) &&
      !this.parser.check(TokenKind.LineEnding) &&
      !this.parser.check(TokenKind.Eof)
    ) {
      if (this.parser.match(TokenKind.LongFlag)) {
        const key = this.parser.previous!.value as string;
        if (flagNames.has(key)) {
          argv.flags[key] = true;
        } else if (noFlagNames.has(key)) {
          argv.flags[key] = false;
        } else if (optionNames.has(key)) {
          argv.options[key] = this.parser.expression();
        }
      } else {
        prevParamToken = currParamToken;
        currParamToken = this.parser.current;
        argv.arguments.push(this.parser.expression());
      }
    }

    if (argv.arguments.length < args.length) {
      this.parser.syntaxError(
        currParamToken,
        `Missing argument '${args[argv.arguments.length]}'`,
      );
    } else if (argv.arguments.length > args.length) {
      this.parser.syntaxError(prevParamToken, 'Unexpected argument');
    }

    return argv;
  }
}
