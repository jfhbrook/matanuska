# ADR 025 - Command Return Values

### Status: Accepted

### Josh Holbrook

# Context

Currently, Matanuska BASIC has a concept of _return values_ for commands. These commands may return a `Value`, which would then be stored on the stack. On the other hand, they may return a `null`, in which case no value is stored on the stack.

Currently, Matanuska BASIC logs the returned value from a compiled _interactive instruction_. Outside the context of an expression statement, we compile these instructions such that they always return `nil`. For example, `cd ..` compiles to the following:

```
=== Disassembly of <input>: ===
10  1  CONSTANT  cd
10  3  CONSTANT  ..
10  5  CMD       2
10  7  NIL
10  8  RETURN
```

Matanuska BASIC also logs the return value from a compiled set of instructions. For instance, `cd ..` currently logs that returned `nil`:

```
josh@slowpoke:~/code/jfhbrook/matanuska$ cd ..
nil
josh@slowpoke:~/code/jfhbrook$
```

This is not the intended behavior. This is due to a number of factors.

First: most compiled instructions return `nil`, regardless of the current state of the stack. The need to distinguish between `nil` and "undefined" values will be handled in a separate ADR.

The primary exception is expression statements. Expressions always leave a value on the stack, and (in an interactive context) the resulting value of expression _statements_ should be returned to the executor. Because this exception is narrow, we are able to handle it today, as a special case, through a `this.isExpressionCmd` flag in the compiler.

But, even if compiled interactive instructions respected existing existing stack values, _commands_ would still not have a meaningful way to signal an "undefined" return. They can return `nil`, of course, which drives the current behavior. Otherwise, they may return `null`, which places _no_ value on the stack:

```typescript
case OpCode.Command:
  a = await this.command();
  if (a !== null) {
    this.stack.push(a);
  }
  break;
```

This would make it difficult to handle a case where we _would_ want to return an "undefined" value. The `Return` instruction must always pop a `Value` off the stack. If the prior command places no such value, then the runtime will try (and fail) to pop an empty stack.

This ADR focuses on the question of which instructions (particularly commands) should be able to return a value. Once this decision is made, it should be more straightforward to handle the broader issue of "undefined" return values in compiled instructions.

# Decision

Generally speaking, instructions _should_ not create values - that is, only expressions should create values. But there are exceptions.

As mentioned, the primary exception is expression statements. But, if this remains the only corner case, then the existing treatment should remain acceptable.

A potential secondary exception is native commands. Any spawned command will create a process, with standard IO. Currently, the runtime does not have special support for that output. In the future, that process may get processed with a `pipe` feature. But for now, we may treat native commands as having no returned value. This decision will be revisited in the future.

Until we implement native commands, no command will return a value - the return type will always be `Promise<void>`. We will continue to make an exception for expression statements in a command context.

Finally, we will rename `this.isExpressionCmd` to `this.isReturningInstruction`. Its behavior will be unchanged, but the naming will reflect that it may be used for other cases when an instruction is expected to return a value.
