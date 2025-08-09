# ADR 020 - Revisiting For Loop Syntax

### Status: Accepted

### Josh Holbrook

## Background

In ADR 018, we implemented for loop syntax like so:

```basic
10 FOR x% OF xs%
20   ...
30 ENDFOR
```

This is different than what you would see in a classic BASIC dialect. A simple loop in MSX:

```basic
10 FOR x%=1 TO 10 STEP 1
30  PRINT x%
30 NEXT
```

or a more complicated one:

```basic
10 FOR x%=1 TO 10 STEP 1
20   FOR y%=1 TO 10 STEP 1
30     PRINT x%
40     PRINT y%
30 NEXT x%,y%
```

All other BASIC dialects examined use the `next` keyword similarly. This inconsistency is unfortunate. I'd like to revisit this decision.

## Why Not Use Next?

The decision to use `endfor` was initially made because `next` has semantics more similar to `continue` in other languages, with `for` not implementing blocks. However, that assumes that `next` would, in fact, be used as in a `continue` in other languages.

Suppose Matanuska BASIC used `next` as a block end in `for` loops. That would have two ramifications: we would need an alternative for `continue` like semantics, and we would need to examine the `next i%` syntax.

## Alternate Keywords for Continue Semantics

One idea is to use the keyword `continue`. However, MSX BASIC uses `cont` to continue execution of an interrupted program. We would like to reserve this keyword for that purpose, and having both `cont` and `continue` seems bad.

It is likely that we would use a clever synonym. Some options:

- `onward`
- `forward`
- `ahead`

## Next Keyword with Specified Variable

The variable arguments to `next` are used to match the `next` with the appropriate `for` loop. Even with blocks, we could use that here. If such a variable name is encountered, we can close out blocks until we reach a `for` block which defines a matching variable. This is non-trivial to implement, but conceptually straightforward.

## Break Semantics

The keyword `break` is available, at least from the perspective of MSX BASIC.

## Decision

First, the `endfor` keyword will be removed, and the `next` keyword will be used to close `for` loops.

Second, the `onward` keyword will be used for `continue` semantics - in other words, replacing the current use of the `next` keyword.

Third, `break` will be used to prematurely exit for loops.

Finally, _in the future_, the `next i%` syntax will be supported. This will implicitly end currently open blocks until the matching `for` is found.
