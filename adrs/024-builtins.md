# ADR 024 - Builtins & Commands

### Status: Draft

### Josh Holbrook

# Context

In [ADR 012](./012-execution-domain-model.md), we described the distinction between instructions, commands, and "interactive commands". To review, a **command** is an instruction executed during an interactive session; and a **runtime command** (or **compiled command**) is a command which is compiled into bytecode and executed in the runtime.

In code, however, it's **interactive commands** which have a unique abstraction. In the `CommandCompiler`, "runtime commands" are compiled as a complete unit (through the `runtime` method) and "interactive commands" are called through a `CommandRunner` visitor, using an `InteractiveCommand` callable type, with expression arguments executed as separate compiled units. In other words, "interactive commands" are still called "commands" in the compiler architecture.

Currently, I am adding a new class of instructions, tentatively called "builtins". These instructions are intended to be callable at runtime (unlike the current _interactive commands_), universally accept params (unlike some _interactive commands_), and are executed through a new `Builtin` op code.

These new "builtin" instructions share some clear mechanics with _interactive commands_. In particular:

1. The bulk of their logic exists clearly outside the runtime
2. They are executed through handlers accessed through some delegation logic
3. They accept a similar `Context`, including the `Executor`, `Host`, and an array of `Value`/`null` arguments

However, there are also some important differences:

1. _Interactive commands_ may use structured arguments, while _builtins_ **always** use params
2. _Interactive commands_ are always executed _outside_ the runtime, while _builtins_ are always executed _from_ the runtime
3. _Interactive commands_ delegate with a visitor (enabled through unique AST classes), while _builtins_ delegate with a record lookup (using their generic "name") property
4. _Interactive commands_ must include the `Editor` and the currently active `Program` in their context, while _builtins_ likely _should_ not have access to those entities

This ADR discusses how to reify the common threads between these two concepts. We would like to finesse the distinction between these concepts, and identify the core abstractions and mechanisms between them.

# Decision

TK
