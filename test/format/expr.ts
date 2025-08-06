import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

import { Token, TokenKind } from '../../tokens';
import {
  Binary,
  Unary,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from '../../ast/expr';

export function exprSuite<F extends Formatter>(formatter: F): void {
  test('it formats an IntLiteral', () => {
    t.matchSnapshot(formatter.format(new IntLiteral(12)));
  });

  test('it formats a RealLiteral', () => {
    t.matchSnapshot(formatter.format(new RealLiteral(123.456)));
  });

  test('it formats a BoolLiteral', () => {
    t.matchSnapshot(formatter.format(new BoolLiteral(true)));
  });

  test('it formats a StringLiteral', () => {
    t.matchSnapshot(formatter.format(new StringLiteral('hello')));
  });

  test('it formats a PromptLiteral', () => {
    t.matchSnapshot(formatter.format(new PromptLiteral('\\u@\\h:\\w\\$')));
  });

  test('it formats a NilLiteral', () => {
    t.matchSnapshot(formatter.format(new NilLiteral()));
  });

  test('it formats a Unary expression', () => {
    t.matchSnapshot(
      formatter.format(new Unary(TokenKind.Minus, new IntLiteral(1))),
    );
  });

  test('it formats a Binary expression', () => {
    t.matchSnapshot(
      formatter.format(
        new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
      ),
    );
  });

  test.todo('it formats a Logical expression', () => {
    /*
      t.matchSnapshot(formatter.format(new Logical(
        new IntLiteral(1),
        TokenKind.And,
        new IntLiteral(1)
      )));
      */
  });

  test('it formats a Variable', () => {
    t.matchSnapshot(
      formatter.format(
        new Variable(
          new Token({
            kind: TokenKind.IntIdent,
            index: 0,
            row: 1,
            offsetStart: 5,
            offsetEnd: 6,
            text: 'i%',
            value: null,
          }),
        ),
      ),
    );
  });
}
