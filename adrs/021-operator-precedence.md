# ADR 021 - Operator Precedence

### Status: Accepted

### Josh Holbrook

## Background

Programming languages with infix operators, such as Matanuska, need to implement operator precedence - also known as an "order of operations". Matanuska necessarily has operator precedence. But the decisions and implementation details are currently undocumented. This ADR intends to address that.

## Current Behavior

Operator precedence is encoded in the parser. Matanuska's parser uses recursive descent, and parses operators of higher precedence before operators of lower precedence. The architecture of the parser makes this precedence difficult to follow, but is currently (from lowest to highest):

| name        | operators                             |
| ----------- | ------------------------------------- |
| or          | `or`                                  |
| and         | `and`                                 |
| not         | `not`                                 |
| equalities  | `=`, `==`, `<>`, `!=`                 |
| comparisons | `>`, `<`, `>=`, `<=`                  |
| terms       | `+`, `-` (minus)                      |
| factors     | `/`, `*`                              |
| unaries     | `+`, (positive), `-` (negative)       |
| primaries   | literals, variables, `(...)` (groups) |

## Reserved Operators

A few operators are reserved:

| name    | operator | is token? | usage                     |
| ------- | -------- | --------- | ------------------------- |
| Percent | `%`      | Yes       | Possible modulo operator  |
| Mod     | `mod`    | No        | Possible modulo operator  |
| Hash    | `#`      | Yes       | Channels and streams      |
| Dot     | `.`      | Yes       | Possible attribute access |
| BSlash  | `\`      | Yes       | "Left divide" a la Matlab |

## Inspiration

Inspiration for Matanuska BASIC's operator precedence comes from two place.

The first is the Lox language from [Crafting Interpreters](https://craftinginterpreters.com/), which implements operator precedence like so (from lowest to highest):

| name        | operators                                             |
| ----------- | ----------------------------------------------------- |
| assignment  | `=`                                                   |
| or          | `or`                                                  |
| and         | `and`                                                 |
| equalities  | `==`, `!=`                                            |
| comparisons | `<`, `>`, `>=`, `<=`                                  |
| terms       | `+`, `-` (minus)                                      |
| factors     | `*`, `/`                                              |
| unaries     | `!`, `-` (negative)                                   |
| calls       | `.`, `(...)` (calls)                                  |
| primaries   | literals, `super`, `this`, variables, `(...)`(groups) |

The second is [Visual Basic](https://learn.microsoft.com/en-us/dotnet/visual-basic/language-reference/operators/operator-precedence), which implements it like so (from lowest to highest):

| name             | operators                                                               |
| ---------------- | ----------------------------------------------------------------------- |
| xor              | `Xor`                                                                   |
| or               | `Or`, `OrElse`                                                          |
| and              | `And`, `AndAlso`                                                        |
| not              | `Not`                                                                   |
| comparisons      | `=`, `<>`, `<`, `<=`, `>`, `>=`, `Is`, `IsNot`, `Like`, `TypeOf`...`Is` |
| bit shifts       | `<<`, `>>`                                                              |
| concatenation    | `&`                                                                     |
| terms            | `+` (plus), `-` (minus)                                                 |
| modulo           | `Mod`                                                                   |
| integer division | `/` (integer)                                                           |
| factors          | `*`, `/` (floating)                                                     |
| unaries          | `+` (positive), `-` (negative)                                          |
| exponents        | `^`                                                                     |
| await            | `await`                                                                 |

This is similar to what's currently implemented in Matanuska BASIC (and in Lox), with the following differences:

1. Matanuska BASIC does not currently implement `xor`.
2. `OrElse` and `AndAlso` are included as short circuiting operators. `Or` and `And` do not short circuit in Visual Basic, but _do_ short circuit in Matanuska BASIC.
3. All comparisons have the same precedence in Visual Basic, and are evaluated from left to right. Equalities in Matanuska check at a higher precedence than other comparisons.
4. Matanuska BASIC does not currently implement bit shifts.
5. Matanuska BASIC uses `+` for concatenation.
6. Matanuska BASIC does not currently implement a modulo operator.
7. Matanuska BASIC does not currently implement a unary `+` (positive) operator.
8. Matanuska BASIC does not currently implement exponentiation.
9. Matanuska BASIC does not currently implement `await`.

## Testing

Testing of precendence is accomplished by the test in `./test/precedence.ts`. This test is generated with the `test-generator` package.

This test is probably not comprehensive. In fact, it currently fails to generate expressions with unary operators. This is probably an issue with the generated output, not unary parsing _per se_. But it does generate _a_ test case that will exercise an expression involving all supported operators.

For more information on how to generate the precedence test, reference `./packages/test-generator/README.md`.
