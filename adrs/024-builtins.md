# ADR 024 - Builtins & Commands

### Status: Accepted

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

## Command Architecture

The high level code path for evaluating interactive commands looks like this:

```
input -> parser.parseInput(input) -> commands
commands -> compileCommands -> [cmd | null, chunks]
chunks -> runtime.interpret -> args
(context, args) -> cmd.accept -> command handler -> result`
```

To summarize: the `compileCommands` function returns an `Instr` if there's interactive behavior, plus a list of chunks (which will each generally evaluate to a `Value` at runtime). The `Instr` is then used to delegate command behavior through a visitor pattern.

Zooming in, the `compileCommands` code path looks like this:

```
compiler -> command.accept --> runtime
                           |-> interactive
                           \-> invalid

runtime -> [null, [chunk]]
interactive -> [cmd, chunks]
invalid -> (fail in interactive mode)
```

The compiler once again uses a visitor pattern to tell whether or not a command should be evaluated fully in the runtime, evaluated interactively, or treated as unsupported in interactive contexts. These "invalid" commands are typically ones that denote block boundaries, such as `for` and `while`.

This approach has the benefit of leveraging the existing visitor pattern to leverage the type information inherent in the AST. However, it does complicate the compiler and the executor significantly.

## Builtin Architecture

The AST currently has a `Builtin(name: string, params: Expr[])` instruction, and the runtime has a `Builtin [nargs]` op code which would then call out to a functionof `type BuiltinRunner = (name: string, params: Array<Value | null>) => Value | null`. These commands would _always_ be evaluated as "runtime" instructions, and would delegate based on a string `name` instead of a visitor.

The major issue is that there would now be two ways of delegating behavior to commands - the "interactive" mode of switching behavior in the compiler and handling the arguments passing in the executor, and the "builtin" mode of compiling the command as normal and handling the arguments passing in the runtime. Ideally, we could consolidate on a single strategy.

# Decision

## Definitions

The following new definitions will be adopted:

- **commands** are instructions which have core implementations outside the runtime. This is regardless of whether or not they're interactive or accept params.
- **interactive instructions** are instructions which may only be run interactively, in the REPL.
- **builtin commands** are commands which have implementations internal to Matanuska. This is opposed to user-defined commands (analogous to PowerShell [cmdlets](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/cmdlet-overview?view=powershell-7.5)) or native commands (binaries).

## Core Interfaces

Commands will be structured as function handlers, which accept a context and an array of optional values (called args). The core interfaces will be:

```typescript
interface Context {
  executor: Executor;
  host: Host;
}

type Args = Array<Value | null>;
type ReturnValue = Value | null;

interface Command {
  interactive: false | undefined;
  main: (args: Args, context: Context) => Promise<ReturnValue>;
}
```

Interactive commands additionally get access to the `Editor` and active `Program`:

```typescript
interface InteractiveContext extends Context {
  editor: Editor;
  program: Program;
}

interface InteractiveCommand {
  interactive: true;
  main: (args: Args, context: InteractiveContext) => Promise<ReturnValue>;
}
```

This allows interactive commands to access state which is only available in interactive commands.

## Command Delegation

All commands, interactive or not, will be delegated through the runtime, using instructins such as `Command(name: string, params: Expr[])`.

This means that the compiler will no longer include switching behavior for interactive versus runtime instructions. Instead, it will compile all commands as runtime instructions. This will simplify compilation significantly.

When a command instruction is encountered, it will be delegated to based on its string name. If the command is tagged as `interactive: true`, it will either be passed an `InteractiveContext` or raise an error, as appropriate. Otherwise, the command will be run with a standard `Context`.

This loses the advantages of the visitor pattern. However, it does mean we don't need to define handlers for _all_ instruction types - just commands. It also allows for easy extension with native commands and user-provided cmdlets.

"Invalid" instructions should be appropriately handled by the runtime, as they won't compile in the interactive context.
