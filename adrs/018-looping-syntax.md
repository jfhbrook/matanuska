# ADR 018 - Looping Syntax

### Status: Draft

### Josh Holbrook

## Context

The next feature to implement in Matanuska is looping.

Classic BASIC's looping structures are... idiosyncratic, especially as compared to what's expected in a modern language. Therefore, we would like to compare what's offered by BASIC versus a modern language (in this case, Python), and make a decision based on these trade-offs.

It is worth clarifying what design heuristics are important in this decision:

1. Matanuska BASIC should loosely mirror classic BASIC dialects, such as MSX BASIC.
2. Matanuska BASIC should support modern features, such as those in Python, as appropriate.
3. Matanuska BASIC should be internally consistent. Design heuristics leveraged in its conditionals should also be reflected in its looping.

## Current Behavior

### Blocks

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

### Conditionals

Recall that in [./013-if-then-else.md](a prior ADR), we introduced specific syntax for conditionals. Of particular note is that it followed BBC BASIC's lead, and closed multi-line `if` blocks with an `ENDIF` token. Ideally, we would like to continue those themes here.

## Implementations in Other Languages

### MSX BASIC

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

`GOTO` is very low level, and _can not_ take advantage of blocks.

### BBC BASIC

BBC BASIC's `for` loops look a little different:

```basic
10 FOR x%=1 TO 10
20   PRINT x%
30   NEXT x%
40 END
```

What's noteworthy here is that BBC BASIC uses an `END` keyword to close the loop, but also supports `NEXT` in a way similar to MSX BASIC. Note that `END` is inconsistent with other `END{begin_block}` tokens in BBC BASIC.

Unlike MSX BASIC, BBC BASIC also has `while` loops:

```basic
WHILE x% > 0
  x% = x% / 2
ENDWHILE
```

Nothing too sophisticated here.

BBC BASIC also supports a `repeat`/`until` loop, that is about what one would expect:

```basic
REPEAT
  ...
UNTIL ...
END
```

### BASIC8

BASIC8's `for` loops are similar to those of MSX BASIC. Its `while` loops are similar to BBC BASIC, but use the `WEND` keyword instead of the `ENDWHILE` keyword.

It also has a `do`/`until` loop, similar to BBC BASIC, but with significantly different syntax:

```basic
DO
  ...
UNTIL ...
```

Unlike BBC BASIC, BASIC8 does not require an `END` keyword. It treats `UNTIL` as similar to MSX BASIC's `NEXT` keyword.

### Python

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

### JavaScript

JavaScript supports a standard C-like `for` loop:

```javascript
for (let x = 0; i < 10; i++) {
  ...
}
```

But it also supports syntax for iterating over objects, namely arrays:

```javascript
for (const x of xs) {
  ...
}
```

## Decision

### For

Standard `for` loops will have the following syntax:

```basic
10 FOR x%=1 TO 10
20   PRINT x%
30   NEXT
40 ENDFOR
```

This leans into the design of BBC BASIC, with a few differences.

First, `for` loops will be closed with an `endfor` keyword. This is inconsistent with BBC BASIC's implementation of `for` loops, but consistent with the syntax of its other looping constructs, as well as Matanuska's syntax for conditionals. Additionally, it will allow for clear block semantics.

Second, `NEXT` will be supported optionally in a way that mirrors `continue` in Python. However, it will not accept a variable. This is because Matanuska (unlike MSX BASIC) is block structured.

Note that, in this case, we _will_ support BASIC's syntax with regard to the `TO` keyword. However, in the future, Matanuska will likely support an additional `for` loop structure that mirrors `for...of` in JavaScript:

```basic
10 FOR x% of xs%
20   ...
30 ENDFOR
```

The specifics of this syntax and implementation are out of scope for this ADR, and will be revisited when Matanuska BASIC supports arrays.

### While and Repeat

Matanuska BASIC will also support `WHILE`, similar to BBC BASIC:

```basic
WHILE x% > 0
  x% = x% / 2
ENDWHILE
```

It will also support `repeat`/`until`:

```basic
REPEAT
  ...
UNTIL ...
```

Like BASIC8, it will close these blocks with the `UNTIL` keyword. Including an `ENDREPEAT` keyword would be redundant. However, it will use the `REPEAT` keyword in line with BBC BASIC.

### GOTO

GOTO is considered out of scope for this ADR, and will be revisited at a later date.
