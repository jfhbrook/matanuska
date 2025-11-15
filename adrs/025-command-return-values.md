# ADR 025 - Command Return Values & Undefined Values

### Status: Draft

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

This is not the intended behavior. This is due to mixed abstractions in Matanuska BASIC, which we now need to sort out.

## Return Values of Commands

Currently, commands use the `null` type to represent "undefined" values, and the runtime throws those values out:

```typescript
case OpCode.Command:
  a = await this.command();
  if (a !== null) {
    this.stack.push(a);
  }
  break;
```

## Compilation of Interactive Instructions

Compilation also currently always places a `nil` on the stack before a top level return, excepting for interactive expression commands as a special case:

```
  private emitReturn(): void {
    // NOTE: If/when implementing classes, I would need to detect when
    // compiling a constructor and return "this", not nil.

    if (this.routineType !== RoutineType.Command || !this.isExpressionCmd) {
      this.emitByte(OpCode.Nil);
    }
    this.emitByte(OpCode.Return);
  }
```

# Decision

## Do Instructions Create Values?

Generally speaking, instructions _should_ not create values. But there are exceptions.

The primary exception is expression statements. Expressions always leave a value on the stack, and (in an interactive context) the resulting value of expression _statements_ should be returned to the executor. This means that, if commands never create values, that we may safely retain an exception for expression statements and continue as before.

A potential secondary exception is native commands. Any spawned command will create a process, with standard IO. Currently, the runtime does not have special support for that output. In the future, that process may get processed with a `pipe` feature. But for now, we may treat native commands as having no returned value.

Until we implement native commands, no command will return a value - the return type will always be `Promise<void>`. We will continue to make an exception for expression statements in a command context.

It's worth noting that the semantics within the compiler around expression statements are non-general - in other words, the flag is currently `this.isExpressionCmd`. This is acceptable for now. But it's worth noting that there's room to generalize this concept in the future, if there are other instances of commands which should return a value to the runtime.
