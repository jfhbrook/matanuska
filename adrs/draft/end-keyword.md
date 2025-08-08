# ADR ??? - General Purpose End Keyword

### Status: Draft

### Josh Holbrook

## Context

Matanuska BASIC currently has per-block-type end blocks: `endif`, `endfor`, and `endwhile`. However, it also nominally parses and compiles the `end` keyword. As per the code comments:

```typescript
// TODO: I'm currently treating 'end' as a synonym for 'return nil'.
// But perhaps it should behave differently? In MSX it also cleans up
// open file handles.
```

This ADR explores why this decision was initially made; what decisions in MSX BASIC influenced this decision, and whether or not to use `end` as a general purpose block end keyword.

## Behavior in Other BASIC Dialects

[According to msx.org](https://www.msx.org/wiki/END), the `end` command "Closes all open files (if any) and ends program execution." In the example, it is seen as a "top-level" instruction:

```basic
10 PRINT "The end is nigh!"
20 END
30 PRINT "I shall not be executed"
```

Note, however, that MSX BASIC does not have blocks. This means that, if `end` is called inside a loop, it will still end execution of the whole program.

Additionally recall that:

1. `for` loops do not have an "end" keyword. Rather, `next` is used in a way similar to `continue`, and loops do not encode blocks.
2. MSX BASIC does not have `if` blocks, simply one-line commands. The idiom for multi-line behavior is to have GOTOs within what Matanuska BASIC calls "short if" instructions.
3. MSX BASIC does not have other looping constructs (ie, no `while`, no `repeat`).

In BBC BASIC, `end` also ends programs. Note that this motivates a significant correction on [ADR 018](./018-looping-syntax.md), which misunderstands the `end` keyword as closing `for` loops. This has been noted in the ADR.

Finally, BASIC8 uses the `next` keyword like other BASIC dialects in `for` loops. It uses `wend` to use `while` loops, and `endif` for `if` blocks.

## Syntax in Matanuska BASIC

Like BASIC8, Matanuska BASIC uses an `endif` keyword. Similar to BASIC8, it uses an `endwhile` keyword in a way similar to BASIC8's `wend` keyword.

Unlike other dialects of BASIC, Matanuska BASIC uses an `endfor` keyword. to end `for` blocks. Recall that, unlike other dialects of BASIC, Matanuska treats the contents of `for` loops as blocks.

## Block Behavior in Matanuska BASIC

Recall that Matanuska BASIC has a `Block` class that it uses to track which block is currently being compiled.

Blocks have parents, and execution always occurs in _some_ block. All compiled outputs have a `GlobalBlock`. The top-level blocks for programs and commands are, respectively, `ProgramBlock` and `CommandBlock`. These two blocks have the `GlobalBlock` as a parent.

Matanuska BASIC also has a function called `isRootBlock`, which returns `true` for all three of these block types - that is, `ProgramBlock` and `CommandBlock` are both treated as "root blocks".

The upshot is that, if Matanuska used the `end` keyword to close all blocks, it could still treat the `end` keyword as ending execution of programs at the _top level_. This would be _inconsistent with other BASIC dialects_, which always end the whole program on the `end` keyword. But it would still allow for that use.

## Decision

TK
