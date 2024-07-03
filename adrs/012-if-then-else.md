# ADR 012 - If, Then and Else
### Status: Draft
### Josh Holbrook

## Context

It's time to implement conditional branching! But there's specification work
to be done. We don't want to naively implement MSX BASIC's semantics for
if/then/else, because it's really limited. However, we do want to retain some
of the syntax.

MSX BASIC supports the following forms:

- `IF <condition> THEN <lineNo | instructions>`
- `IF <condition> THEN <lineNo | instructions> ELSE <lineNo | instructions>`
- `IF <condition> GOTO <lineNo>`
- `IF <condition> GOTO <lineNo> ELSE <lineNo | instructions>`

When supplied a lineNo, BASIC will jump to that line. Otherwise, it will run
the listed instructions. Note that `Instructions` is what MSX BASIC calls the
equivalents to Matanuska's "commands", and are likewise colon-separated.

Also notable is that MSX BASIC does *not* support multi-line if statements.
For example, the following is unsupported:

```
IF <condition> THEN
  ...
ELSE
  ...
ENDIF
```

There is, of course, no token equivalent to "end if" - we would have to decide
on one. Sadly, the obvious choice - "end" - is currently meant to end execution
of the program (ie, a program-level return). That decision isn't set in stone,
though - alternatives include using `return` as in Lua (in fact, the command
compiles into a bare return), though MSX BASIC *also* uses `return` for
non-scoped subroutines, as in
[`ON ... GOSUB`](https://www.msx.org/wiki/ON...GOSUB). This is the core
difficulty in challenging BASIC's choice in keywords - it has cascading
effects.

MSX BASIC also, as far as I can tell, does not have `else if` - though, it
likely parses `if <cond> then <ins> else if <cond> then <ins> else <ins>` as
`If(cond, ins, If(cond, ins, ins))`, where the second `if` is simply another
instruction.

## Decision

We will start by supporting the following forms:

- `if <condition> then <commands>`
- `if <condition> then <commands> else <commands>`
- `if <condition> then <lines> end`
- `if <condition> then <lines> else <lines> end`
- `if <condition> then <lines> else if <condition> then <lines> end`

Note that these forms don't support line numbers for `goto`. That decision
will be made in the future, when `goto` is existing functionality.

As mentioned, `end` will need to have its semantics changed. For now, we will
use `return` in place of `end`, as it's currently equivalent in behavior.
However, this decision may revisited if `gosub` is implemented and the
semantics of `return` in that context are too challenging.

This implies the following AST structures:

```
ShortIf => condition: Expr, then: Cmd[], else: Cmd[]

If     => condition: Expr
Else!
ElseIf => condition: Expr
End
```

Note that these commands do *not* attempt to generate a nested AST, delegating
building the structure to the compiler. This is necessary because the parser
needs to parse and insert lines into the editor *in isolation*.

## The Future

Once `goto` is implemented, we will have to consider its support in
conditionals. There are a few options:

1. Allow if statements to take lineNos and/or labels as well as commands. This
   makes parsing more complicated - you have to specially treat an isolated
   IntLiteral or BareIdent token - but it also avoids a special form for goto.
2. Implement a variation of `if <condition> goto <lineNo | label> else <lineNo | label>`.
   This is easier to parse than overloading if/then, so I'm partial to it.
   But I'm hesitant to implement variations that optionally take commands, not
   just because of parsing but also because I want to avoid needless syntactic
   overlap.
3. Don't implement a special form. In this case the commands would be `goto`s.
   In other words, `if <condition> then goto <lineNo | label> else goto <lineNo | label>`.

Luckily, we can punt on this decision for now, as Matanuska doesn't currently
implement GOTO.
