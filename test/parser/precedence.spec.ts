import { describe, test, expect } from 'vitest';

import { FILENAME } from '../helpers/files';
import { parseProgram } from '../helpers/parser';

type PrefixOp = { prefix: string };
type InfixOp = { infix: string };
// type PostfixOp = { postfix: string };

const OR_OPS = infix(['or']);
const AND_OPS = infix(['and']);
const NOT_OPS = prefix(['not']);
const EQUALITY_OPS = infix(['=', '==', '<>', '!=']);
const COMPARISON_OPS = infix(['>', '<', '>=', '>=']);
const TERM_OPS = infix(['+', '-']);
const FACTOR_OPS = infix(['*', '/']);
const UNARY_OPS = prefix(['+', '-']);

function prefix(ops: string[]): PrefixOp[] {
  return ops.map((o): PrefixOp => ({ prefix: o }));
}

function infix(ops: string[]): InfixOp[] {
  return ops.map((o): InfixOp => ({ infix: o }));
}

/*
function postfix(ops: string[]): PostfixOp[]  {
  return ops.map((o): PostfixOp => ({ postfix: o }));
}
*/

function testExpr(name: string, expr: string): void {
  test(name, () => {
    const [ast, warning] = parseProgram(`10 ${expr}`, FILENAME);

    expect((ast.lines[0].instructions[0] as any).expression).toMatchSnapshot();
    expect(warning).toMatchSnapshot();
  });
}

function infixPrecedenceTestCases(
  ops: Array<InfixOp[]>,
): Array<[InfixOp[], InfixOp[]]> {
  const cases: Array<[InfixOp[], InfixOp[]]> = [];

  for (let i = 0; i < ops.length - 1; i++) {
    for (let j = i + 1; j < ops.length; j++) {
      cases.push([ops[i], ops[j]]);
    }
  }

  return cases;
}

function infixPrecedenceTest(higher: InfixOp[], lower: InfixOp[]): void {
  const higherName = higher.map((o) => o.infix).join(', ');
  const lowerName = lower.map((o) => o.infix).join(', ');

  describe(`${higherName} vs. ${lowerName}`, () => {
    for (const high of higher) {
      for (const low of lower) {
        const leftExpr = `1 ${high.infix} 2 ${low.infix} 3`;
        const rightExpr = `1 ${low.infix} 2 ${high.infix} 3`;

        testExpr(`${leftExpr} binds to the left`, leftExpr);
        testExpr(`${rightExpr} binds to the right`, rightExpr);
      }
    }
  });
}

describe('infix precedence', () => {
  for (const [higher, lower] of infixPrecedenceTestCases([
    FACTOR_OPS,
    TERM_OPS,
    COMPARISON_OPS,
    EQUALITY_OPS,
    AND_OPS,
    OR_OPS,
  ])) {
    infixPrecedenceTest(higher, lower);
  }
});

function infixLeftAssociativeTest(ops: InfixOp[]): void {
  const name = ops.map((o) => o.infix).join(', ');
  let i = 2;
  const expr = ops.reduce((e, op) => {
    e += ` ${op.infix} ${i}`;
    i++;
    return e;
  }, '1');

  describe(`${name} are left associative`, () => {
    testExpr(expr, expr);
  });
}

describe('infix left-associativity', () => {
  for (const cases of [FACTOR_OPS, TERM_OPS, COMPARISON_OPS, EQUALITY_OPS]) {
    infixLeftAssociativeTest(cases);
  }
});

function prefixInfixPrecedenceTest(op: string): void {
  const a = `1 ${op} ${op} 1`;
  const b = `${op} 1 ${op} 1`;
  testExpr(a, a);
  testExpr(b, b);
}

describe('prefix/infix precedence', () => {
  for (const op of ['+', '-']) {
    prefixInfixPrecedenceTest(op);
  }
});

function prefixTwiceTest(op: PrefixOp): void {
  const expr = `${op.prefix} ${op.prefix} 1`;
  testExpr(expr, expr);
}

describe('prefix twice', () => {
  for (const op of NOT_OPS.concat(UNARY_OPS)) {
    prefixTwiceTest(op);
  }
});

describe('logical', () => {
  for (const expr of [
    'not 1 + 2 * 3 / 4',
    'not a? and not b?',
    'not a? or not b?',
  ]) {
    testExpr(expr, expr);
  }
});
