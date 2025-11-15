# ADR 026 - Undefined Values

### Status: Accepted

### Josh Holbrook

# Context

In [ADR 025](./025-command-return-values.md), we clarified that commands (and instructions generally) will not return values - at least, until a `pipe` feature pushes the issue.

However, we still have the issue where all compiled instructions explicitly return `nil`. For example, `cd ..` compiles to the following:

```
=== Disassembly of <input>: ===
10  1  CONSTANT  cd
10  3  CONSTANT  ..
10  5  CMD       2
10  7  NIL
10  8  RETURN
```

Matanuska BASIC attempts to log the return value from a compiled set of instructions, including `nil` values. For instance, this is the current behavior of `cd ..`:

```
josh@slowpoke:~/code/jfhbrook/matanuska$ cd ..
nil
josh@slowpoke:~/code/jfhbrook$
```

This motivates the introduction of an "undefined" value which may be distinguished from Matanuska's `nil` value, as in JavaScript.

On the other hand, within the Matanuska language, we are motivated to avoid an `undefined` concept. Within the language, `nil` would handedly represent that undefined value - and introducting "two nulls" would be confusing.

In this ADR, we will square the circle. How will the runtime handle "undefined" values? Will this concept be exposed in the language? Stay tuned.

# Decision

First, the Matanuska _language_ will **not** support an "undefined" type. For simplicity, `nil` will be the only non-value. This means that there will be no `undef` literal, and the runtime will never show the user an `undef` value.

However, Matanuska's internal value model **will** include a new `undef` value. The runtime will treat both `nil` and `undef` as "nullish" values. The one additional behavior, for now, will be that `undef` values will not be logged by the executor.

A bare `return` will return an `undef` value:

```
=== Disassembly of <input>: ===
10  1  CONSTANT  cd
10  3  CONSTANT  ..
10  5  CMD       2
10  7  UNDEF
10  8  RETURN
```

This may be thought as semantically equivalent to a `void` return type. In fact, `void` may be a more appropriate name for `undef`. But `void` is a keyword in TypeScript, while `undef` is not.
