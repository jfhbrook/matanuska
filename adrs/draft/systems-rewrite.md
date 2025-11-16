# ADR ??? - Systems Language Rewrite

### Status: Draft

### Josh Holbrook

# Context

I initially wrote Matanuska in TypeScript and Node.js. This is because I'm familiar with Typescript and am productive in it.

However, there are a number of significant limitations of Node.js:

- No access to the `${0}` argument, which I currently cheese with a wrapper bash script
- No native `byte`, `float` or `integer` types
  - Matanuska uses `number` internally
  - Matanuska struggles to use real bytes in its "bytecode"
- Limited process management
  - Particularly around groups
- Less performant versus

A lot of these issues could be solved by rewriting some (or all) of Matanuska in a systems language - either C, C++ or Rust. Out of these, C is the one I'd struggle with the most. That leaves C++ or Rust.

## Parts to Rewrite

Some parts of Matanuska are more valuable to rewrite in a systems language than others. Plus, retaining some portions in TypeScript will help keep scope down.

These are parts that would be valuable to rewrite in a systems language, loosely ranked:

- Process/jobs management
- Runtime & Bytecode
- Values and mathematical operations
- Readline
- Host
- Entry point
- OpenTelemetry tracing
- Compiler
- Scanner/Parser

## Rust

Pros:

- Good, fully featured data structures
- Nice, pleasant syntax
- Strong crate ecosystem
- Can easily interoperate with C and C++
- Can embed JavaScript with [js_sandbox](https://docs.rs/js-sandbox/latest/js_sandbox/) or Deno more broadly

Cons:

- "Unsafe", pointer-based logic - possible, but finnicky
- I personally struggle with its memory management
- Certain areas are less well documented than in the alternatives

## C++

Pros:

- Object model will probably feel familiar
- Being able to write C-like code will make certain things easier
- Memory management less of a fight than with Rust
- Straightforward to embed in Node.js
- Can easily interoperate with Rust and C
- QT offers a strong base to work off
- Can embed JavaScript with [QJSEngine](https://doc.qt.io/qt-6/qjsengine.html)

# Decision
