# ADR ??? - Command or Instruction?
### Status: Draft
### Josh Holbrook

## Context

What do you call the elements of a BASIC program separated by colons, which
aren't expressions?

I've been calling them "commands". I've seen this terminology in at least
some documentation on BASIC, though I don't recall exactly where.

However, in the [MSX Wiki](https://www.msx.org/wiki/Category:MSX-BASIC_Instructions),
they very consistently call them "instructions".

The question is: do we stay the course with commands? Or do we rename commands
to instructions?

One motivation for switching to "instructions", aside from consistency with
MSX, is that the term "command" is actually overloaded to mean *interactive*.
In other words, if a generic "command" is called an "instruction", then
"command" can specifically refer to an "interactive command" - and a "runtime
command" would simply be an "instruction".

A reason to avoid this change, however, is that "instruction" is overloaded
with the concept of opcodes. This is not entirely accidental - in traditional
BASIC, programs are stored in an uncanny valley between AST and bytecode.
Like bytecode, BASIC programs are stored in bytes, with instructions stored
in "reverse polish" - but, like an AST, they can be translated back into
source code at any time. The structure of BASIC means that source code
instructions are exactly equivalent to bytecode instructions.

This overloading may not be so bad. After all, there is actually a pretty
close mapping between a source instruction and a bytecode instruction. For
example, "print" is an instruction in both the source and the bytecode.

Of course, we also have the option of calling them "opcodes" - this is already
a common synonym in the codebase.

## Decision

TK
