# ADR 029 - Function Specification

### Status: Draft

### Josh Holbrook

# Context

It's time to implement functions in Matanuska!

This ADR concerns itself with three elements: the syntax, the semantics, and the implementation details.

## Prior Art

### MSX BASIC

MSX BASIC doesn't have functions, per se. Instead, it has `GOSUB` and `RETURN`.

The elements these share with functions are basically the concept of a call stack. `GOSUB` behaves much like a `GOTO`, complete with line number, but pushes a new frame onto the stack; and `RETURN` pops from the call stack to put the `PC` back to its prior location.

Unlike functions, these commands do not maintain scope, nor do they maintain structured blocks. Similar issues were seen with looping - see [ADR 018](./adrs/018-looping-syntax.md).

### BBC BASIC

BBC BASIC, unlike MSX BASIC, **does** have functions. This example is taken from [the official tutorial](https://www.bbcbasic.co.uk/bbcwin/tutorial/chapter17.html):

```basic
DEF FN_IsAVowel(Ch$)
IF INSTR("AEIOUaeiou", LEFT$(CH$, 1)) THEN
  =TRUE
ELSE
  =FALSE
ENDIF
```

Some noteworthy callouts:

1. It uses the `def` keyword to define a function, similar to Python
2. It uses an `=` sign to signify a return, rather than a `return` keyword
3. Complex values, such as arrays, may not be returned
4. Functions do not have a defined block syntax; rather, the following command, expression or block (in this case, an if statement) is treated as the body

### BASIC8

BASIC8 defines a function syntax, which it variously calls "routines", "subs" and "procedures". [From its manual](https://paladin-t.github.io/b8/docs/manual#sub-routine):

```basic
DEF foo(a, b)
  c = CALL bar(a, b)
  RETURN c
ENDDEF
```

Noteworthy callouts here:

1. Like BBC BASIC, it uses the `def` keyword to define a function
2. It has an explicit `call` instruction, which allows calling a function with will be defined later
3. It _does_ include a keyword to define a block, namely `ENDDEF`
4. While BASIC8 has support for `GOTO` and `GOSUB`, they can not be used within the same program
5. BASIC8 supports multi arity with a `...` unpacking syntax

### Visual Basic

One question we have has to do with defining lambdas. Most BASIC dialects do not have lambdas, but Visual Basic is an exception.

Its lambdas use [the same overall syntax as its standard functions](https://learn.microsoft.com/en-us/dotnet/visual-basic/programming-guide/language-features/procedures/lambda-expressions), though anonymized:

```basic
Dim increment1 = Function(x) x + 1
Dim increment2 = Function(x)
    Return x + 2
End Function
```

# Decision

TK
