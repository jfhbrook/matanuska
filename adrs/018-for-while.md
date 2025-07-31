# ADR 018 - For and While

### Status: Draft

### Josh Holbrook

## Context

The next feature to implement in Matanuska is looping.

Classic BASIC's looping structures are... idiosyncratic, especially as compared to what's expected in a modern language. Therefore, we would like to compare what's offered by BASIC versus a modern language (in this case, Python), and make a decision based on these trade-offs.

### Matanuska Blocks

Recall that Matanuska's compiler uses a `Block` abstraction to track which block is being compiled. These blocks carry context that's relevant to the block type, and uses a visitor pattern to introduce block-specific behavior for instructions.

Currently, conditionals are implemented. For am example `Block` class:

```typescript
class IfBlock extends Block {
  kind = 'if';

  constructor(public elseJump: Short) {
    super();
  }

  visitElseInstr(else_: Else): void {
    const endJump = this.compiler.else_(this.elseJump);
    this.next(else_, new ElseBlock(endJump));
  }

  visitElseIfInstr(elseIf: ElseIf): void {
    const endJump = this.compiler.else_(this.elseJump);
    const elseJump = this.compiler.if_(elseIf.condition);
    this.next(elseIf, new ElseIfBlock(elseJump, endJump));
  }

  visitEndIfInstr(_endIf: EndIf): void {
    // TODO: Optimize for no 'else'
    const endJump = this.compiler.else_(this.elseJump);
    this.compiler.endIf(endJump);
    this.end();
  }
}
```

However, these blocks are intended to meet other block-like use cases, such as looping and functions.

The good news is that, for abstractions which have clear blocks, the abstraction should gracefully carry state at compile time and help ensure that blocks are well-formed. The bad news is that, for things which _don't_ create blocks but _do_ create state, that state would need to be tracked separately.

### Matanuska Conditionals

Recall that in [./013-if-then-else.md](a prior ADR), we introduced specific syntax for conditionals. Of particular note is that it followed BBC BASIC's lead, and closed multi-line `if` blocks with an `ENDIF` token. Ideally, we would like to continue those themes here.

### Implementation in MSX BASIC

MSX BASIC, which is typical in terms of a classic BASIC, has only a `for/next` loop and the classic `goto`. The structure of a classic for/next loop is like so:

```basic
10 FOR x%=1 TO 10 STEP 1
20   FOR y%=1 TO 10 STEP 1
30     PRINT x%
40     PRINT y%
30 NEXT x%,y%
```

Note that end is inclusive - ie, `FOR x=1 TO 10` will print the numbers 1 to 10. Also note that `STEP n` and the variables to `NEXT` are optional.

The behavior of `NEXT` is a little idiosyncratic - it operates as both an `end` and a `continue`, and can mark _which_ loop to continue based on a variable.

In terms of how this works under the hood, for loops are **not** structured as blocks as they are in Matanuska. Instead, they are treated as isolated statements which introduce runtime state. Note that this means MSX BASIC can't guard against "broken" nesting, something that Matanuska attempts to do at compile time.

For completeness, simple GOTO looks like so:

```basic
10 PRINT "hello world!"
20 GOTO 10
```

`GOTO` is very low level, and *can not* take advantage of blocks.

### Implementation in BBC BASIC

TK

### Implementation in Python

Python's `for` loops look like so:

```python
for i in range(0, 10):
    print(i)
```

What's noteworthy here is two things:

1. Python takes an iterator as an argument. Classic BASIC does not have first class iterators. But it would be nice if Matanuska could implement them in the future.
2. Python has proper blocks, like Matanuska.

Python also has a `while` loop:

```python
while True:
    print "hey"
```

It also supports the `break` and `continue` keywords. `continue` operates similarly to `next` in MSX BASIC. But `break` seems novel.

## Decision

TK
