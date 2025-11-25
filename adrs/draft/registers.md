# ADR ??? - Registers

### Status: Draft

### Josh Holbrook

## Context

Typically, a hardware architecture has a fixed set of registers. It's not unusual for bytecode VMs to have registers as well, though `clox` in _Crafting Interpreters_ stores values on the C stack with scope.

While Matanuska has ad-hoc registers, the design has not been formalized. We would now like to do that here.

### Types of Registers

There are a few general types of registers to consider:

1. **Pointers and Counters.** These point to locations in memory. The stack pointer points to a location in the stack, and the program counter (or instruction pointer) points to a location in the chunk.
2. **Accumulators.** These are used to store intermediate results of execution.
3. **Flags.** These are usually internal things that an engineer wouldn't need to be aware of.

### Matanuska

Matanuska doesn't have an explicit register abstraction yet. That said, it does have a `PC` which points to the current chunk. Some additional memory locations to point to include the memory stack (`SP`), the call stack, and global namespace.

It also has two accumulators, the variables `a` and `b`. Unlike a real processor, these variables contain full `Value`s. It's unlikely at this point that Matanuska will require additional accumulators.

Matanuska doesn't currently have any runtime flags, but will probably eventually have them. A particularly likely flag is a "testing" flag, which will cause the runtime to execute tests and output their results. Flags supporting interrupts and/or a "break" state may also be in the future.

### MEG-4 BASIC

<https://bztsrc.gitlab.io/meg4/manual_en.html#assembly>

MEG-4 BASIC has a specified VM and assembly language which supports the following registers:

> - AC: accumulator register, with an integer value
> - AF: accumulator register, with a floating point value
> - FLG: processor flags (setup is done, blocked for I/O, blocked for timer, execution stopped)
> - TMR: the timer register's current value
> - DP: data pointer, this points to the top of the used global variable memory
> - BP: base pointer, marks the top of the function stack frame
> - SP: stack pointer, the bottom of the stack
> - CP: callstack pointer, the top of the callstack
> - PC: program counter, the address of the instruction currently being executed

### minicube64

<https://aeriform.gitbook.io/minicube64/start>

Minicube64 has the following registers:

- PC
- SP
- A (accumulator)
- X
- Y
- VP (video register)
- P1 (input register)

I believe the registers store raw bytes, not `Value`s.

## Decision

TK
