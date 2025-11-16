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

Matanuska will be refactored to use a C++/QT based entry point. It will continue running TypeScript in a `QJSEngine`, exposing `QT` functionality through pluggable interfaces such as `Host`. Some functionality will additionally be written in Rust on a case-by-case basis.

## Getting Away from Node Core

In order to initiate this rewrite, we need to get away from using Node core modules. Most uses of these modules are contained within the `Host` abstraction. But there are a few others we can get away from first.

The easiest is `node:assert`. We may simply implement our own assertion errors.

The second easiest is `node:path`. This library is available on NPM - we just need to convince Vite to bundle it.

A final library is Node's `util.inspect`. This one is difficult to fully replace ahead of time. But we can wrap it in an internal module to start. Note that it can't be contained on `Host` itself, since that would introduce a circular dependency.

## Implementing the Entry Point

Next, make a simple entry point using C++ and QT's `QJSEngine`. This should be largely straightforward - we simply need to take the existing JavaScript bundle and embed it in the built binary.

At this point, a few things will be broken:

- OpenTelemetry
- `ConsoleHost`
- `node:readline`
- Tests

The new entry point should, however, crash and burn on start.

## Console Host

At this point, we'll need to rewrite `ConsoleHost` to use C++/QT facilities. The modules to look out for are:

- `node:buffer`
- `node:child_process`
- `node:fs`
- `node:os`
- `node:process`
- `node:stream`

Once this is complete, we should be able to execute files directly.

## Tests

Tests will likely be broken because Vitest doesn't know how to access the `ConsoleHost`. We should be able to work around this by avoiding access of `ConsoleHost` and continuing to leverage our mock host.

Some functionality may also be tested with [QT's test framework](https://doc.qt.io/qt-6/qtest-overview.html).

## Readline

Next, we can attempt to replace `node:readline` with a native implementation. The currently preferred strategy is to use Rust and [rustyline](https://github.com/kkawakam/rustyline). Given the use of C++, this will hopefully be straightforward. But if not, GNU Readline is also an option.

## OpenTelemetry

OpenTelemetry will likely need to be implemented in C++, and exposed to `QJSEngine` through a `debug` module. Luckily, OpenTelemetry _does_ have a C++ library.

## Inspect

QT has a function called `QDebug`, which will probably work reasonably well. Otherwise, we can hand-roll a solution and move on.
