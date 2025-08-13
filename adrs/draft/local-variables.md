# ADR ??? - Local Variables

### Status: Draft

### Josh Holbrook

# Context

Matanuska currently implements global variables. We would like to implement local variables. This ADR includes details on the design of the stack and managing scope.

Note that closures (and upvalues) are out of scope for this ADR.

## Stack

The current implementation of the values stack is in `./stack.ts`. This stack is initialized in the runtime as a `Stack<Value>`. Currently, this stack only holds "temporaries" - for example, values which are used when evaluating expressions.

# Decision

TK
