import * as assert from 'node:assert';

import { Scanner } from '../../scanner';
import { Token, TokenKind } from '../../tokens';

import { FILENAME } from './files';

export function scanTokens(source: string): Token[] {
  const scanner = new Scanner(source, FILENAME);
  const tokens: Token[] = [];
  let token = scanner.nextToken();

  while (token.kind !== TokenKind.Eof) {
    if (token.kind !== TokenKind.Whitespace) {
      tokens.push(token);
    }
    token = scanner.nextToken();
  }

  tokens.push(token);

  return tokens;
}

export class MockScanner extends Scanner {
  constructor(private tokens: Token[]) {
    super('', FILENAME);

    assert.equal(
      tokens[tokens.length - 1].kind,
      TokenKind.Eof,
      'Last token must be EOF',
    );
  }

  get done(): boolean {
    return this.tokens.length === 1;
  }

  nextToken(): Token {
    if (this.done) {
      return this.tokens[0];
    }
    return this.tokens.shift()!;
  }
}
