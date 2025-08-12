import { describe, test, expect } from 'vitest';

import { FILENAME } from '../helpers/files';
import { parseProgram } from '../helpers/parser';

// type PrefixOp = { prefix: string };
type InfixOp = { infix: string };
// type PostfixOp = { postfix: string };

// type Op = PrefixOp | InfixOp | PostfixOp;

const OR_OPS = infix(['or']);
const AND_OPS = infix(['and']);
// const NOT_OPS = prefix(['not']);
const EQUALITY_OPS = infix(['=', '==', '<>', '!=']);
const COMPARISON_OPS = infix(['>', '<', '>=', '>=']);
const TERM_OPS = infix(['+', '-']);
const FACTOR_OPS = infix(['*', '/']);
// const UNARY_OPS = prefix(['-']);

/*
function isPrefix(op: any): op is PrefixOp {
  return op.prefix;
}

function isInfix(op: any): op is InfixOp {
  return op.infix;
}

function isPostfix(op: any): op is PostfixOp {
  return op.postfix;
}
*/

/*
function prefix(ops: string[]): PrefixOp[] {
  return ops.map((o): PrefixOp => ({ prefix: o }));
}
*/

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

function infixTestCases(ops: Array<InfixOp[]>) {
  const cases: Array<[InfixOp[], InfixOp[]]> = [];

  for (let i = 0; i < ops.length - 1; i++) {
    for (let j = i + 1; j < ops.length; j++) {
      cases.push([ops[i], ops[j]]);
    }
  }

  return cases;
}

function infixTest(higher: InfixOp[], lower: InfixOp[]) {
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
  for (const [higher, lower] of infixTestCases([
    FACTOR_OPS,
    TERM_OPS,
    COMPARISON_OPS,
    EQUALITY_OPS,
    AND_OPS,
    OR_OPS,
  ])) {
    infixTest(higher, lower);
  }
});
