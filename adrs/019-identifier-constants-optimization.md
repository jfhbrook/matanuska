# ADR 019 - Identifier Contant Optimization

### Status: Accepted

### Josh Holbrook

## Context

While working on looping, I discovered an interesting behavior in compilation of global variable access. Consider the following program:

```basic
10 rem A simple for loop
20 for i% = 1 to 10
30   print i%
40 endfor
```

This compiles to the following disassembled bytecode:

```
20  1   CONSTANT       i%
20  3   CONSTANT       1
20  5   DEFINE_GLOBAL  i%
20  7   CONSTANT       i%
20  9   GET_GLOBAL     i%
20  11  CONSTANT       10
20  13  LE
20  14  JUMP_IF_FALSE  14 -> 44
20  17  POP
20  18  JUMP           18 -> 36
20  21  CONSTANT       i%
20  23  CONSTANT       i%
20  25  GET_GLOBAL     i%
20  27  CONSTANT       1
20  29  ADD
20  30  SET_GLOBAL     i%
20  32  POP
20  33  LOOP           33 -> 7
30  36  CONSTANT       i%
30  38  GET_GLOBAL     i%
30  40  PRINT
40  41  LOOP           41 -> 21
40  44  NIL
40  45  RETURN
```

With the following constants table:

| constant index | value | relevant instructions                    |
| -------------- | ----- | ---------------------------------------- |
| 0              | `i%`  | `1 CONSTANT`, `5 DEFINE_GLOBAL`          |
| 1              | 1     | `3 CONSTANT`                             |
| 2              | `i%`  | `7 CONSTANT`, `9 GET_GLOBAL`             |
| 3              | 10    | `11 CONSTANT`                            |
| 4              | `i%`  | `21 CONSTANT`, `30 SET_GLOBAL`           |
| 5              | `i%`  | `23 CONSTANT`, `25 GET_GLOBAL`, `29 ADD` |
| 6              | 1     | `27 CONSTANT`, `29 ADD`                  |
| 7              | `i%`  | `36 CONSTANT`, `38 GET_GLOBAL`           |

The op codes are perhaps confusing, but correct. However, we do note that there are seven constants. The constants for `1`, `10` and `1` are expected - those are the start, end and increment respectively. But what about the five instances of `i%`?

On inspection, we will notice that `i%` is defined once per each call to `DEFINE_GLOBAL`, `GET_GLOBAL` and `SET_GLOBAL`, respectively. `DEFINE_GLOBAL` is called once (to define `i%`), `GET_GLOBAL` is called thrice (once to compare to `10`, once to add `1` to `i%`'s value, once to print `i%`), and `SET_GLOBAL` is called once (to increment `i%` by one). This behavior is simply unoptimized.

## The Challenge

It turns out that's intentional within `Crafting Interpreters`, the primary reference used for implementing this bytecode. In its "Challenges" section, it notes:

> The compiler adds a global variable’s name to the constant table as a string every time an identifier is encountered. It creates a new constant each time, even if that variable name is already in a previous slot in the constant table. That’s wasteful in cases where the same variable is referenced multiple times by the same function. That, in turn, increases the odds of filling up the constant table and running out of slots since we allow only 256 constants in a single chunk.
>
> Optimize this. How does your optimization affect the performance of the compiler compared to the runtime? Is this the right trade-off?

## Proposed Implementation

Recall the contents of the `emitIdent` method in the compiler:

```typescript
  private emitIdent(ident: Token): Short {
    const constant = this.makeConstant(ident.value as Value);
    this.emitBytes(OpCode.Constant, constant);
    return constant;
  }
```

This function currently creates a constant, and returns its index. This index is then used by methods that need the identifier. These are currently `let_`:

```typescript
  private let_(variable: Variable, value: Expr | null): void {
    const target = this.emitIdent(variable.ident);
    if (value) {
      value.accept(this);
    } else {
      this.emitByte(OpCode.Nil);
    }
    this.emitBytes(OpCode.DefineGlobal, target);
  }
```

`assign`:

```typescript
  private assign(variable: Variable, value: Expr) {
    const target = this.emitIdent(variable.ident);
    value.accept(this);
    this.emitBytes(OpCode.SetGlobal, target);
  }
```

and `visitVariableExpr`, which currently gets a global value (the only kind of variable currently supported by Matanuska):

```typescript
  visitVariableExpr(variable: Variable): void {
    const ident = this.emitIdent(variable.ident);
    this.emitBytes(OpCode.GetGlobal, ident);
  }
```

What this means is that we may create a new method, `getIdent`, which wraps `emitIdent`, and call that method instead from current users of `emitIdent`.

What this likely means is storing the ident as a hash key:

```typescript
type IdentTable = { [ident: string]: number };
```

Then, in `getIdent`:

```typescript
  private getIdent(ident: Token): Short {
    return typeof this.idents[ident.value] !== 'undefined'
      ? this.idents[ident.value]
      : this.emitIdent(variable);
  }
```

and in `emitIdent`:

```typescript
  private emitIdent(ident: Token): Short {
    const constant = this.makeConstant(ident.value as Value);
    this.emitBytes(OpCode.Constant, constant);
    this.idents[ident.value] = constant;
    return constant;
  }
```

## Ramifications

On one hand, this will keep the constants table small. In this case, the constants table size would go from 7 values down to 4, a decrease of nearly 50%. Note that, even with the addition of the ident table, memory should still be saved overall, since the identifier would be stored at most twice - once in the constants table, and once in the identifier table.

The _compute_ cost in the compiler is unclear. On one hand, it would need to check if the identifier is in the table every time `getIdent` is called. Additionally, for new identifiers, an additional call would get made to set the ident in the table. However, for reused identifiers, the lookup should be quick, and we _avoid_ a call to `makeConstant`. Without benchmarks, it's likely that this would operate as a very marginal improvement in runtime performance, due to caching.

The _runtime_ performance would remain largely the same. Array access is roughly O(1), and is unaffected by the size of the constants table. The number of instructions would also remain the same - the calls to the global methods would simply access the same constant.

It may seem like this change would make it easier to understand the output of a chunk, since identifier constants wouldn't be repeated. However, it would necessarily make the code more complex. Again, it would also have no affect on the disassembled bytecode - it would simply access different constants.

## Decision

While this change is tempting, I will not move forward with it at this time. Unlike `clox`, our constants table's size is unbound, and it's unclear as to whether or not the potential memory savings would be worth the change.

In the future, as more complex programs are implemented, we will revisit this question. We will inspect the constants tables for full programs, and make a decision then. For now, we will focus on more important functionality.
