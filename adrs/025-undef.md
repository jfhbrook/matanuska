# ADR 025 - Undefined Values

### Status: Draft

### Josh Holbrook

# Context

Matanuska BASIC, as a language, has a single nullish value, `Nil`. This is usually correct.

However, in the context of interactive evaluation, there's a distinction to be made. If an expression or command returns a value - even `nil` - we want to display that value to the user. However, if a command returns an _undefined_ value, we *don't* want to display it on the screen.

For example, `cd` is not intended to return a value - and yet:

```
josh@slowpoke:~/code/jfhbrook/matanuska$ cd ..
nil
josh@slowpoke:~/code/jfhbrook$ 
```

Currently, commands use the `null` type to represent "undefined" values, and the runtime throws those values out:

```typescript
case OpCode.Command:
  a = await this.command();
  if (a !== null) {
    this.stack.push(a);
  }
  break;
```

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

TK
