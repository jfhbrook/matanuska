# ADR 028 - Custom C++ JavaScript Runtime

### Status: Accepted

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
- Less performant versus C, C++ and Rust

A lot of these issues could be solved by rewriting the core of Matanuska in a systems language - either C, C++ or Rust. Out of these, C is the one I'd struggle with the most. That leaves C++ or Rust.

However, it makes sense to retain the bulk of Matanuska's implementation in JavaScript. Matanuska includes well over 20,000 lines of code - even if a full rewrite was in the works, we would need to approach it incrementally.

# Decision

## Use QT

There are a number of options for the general platform:

- Rust and [js_sandbox](https://docs.rs/js-sandbox/latest/js_sandbox/)
- C++ and v8
- C++ and QT's `QJSEngine`

I have decided to move forward with C++ and QT, up and until I run into insurmountable issues. The benefit is that QT is a nice, approachable and fully featured framework. The major downside is that `QJSEngine` is not as fully-featured as a browser engine like v8 and has some awkward limitations.

### Idiosyncrasies of QJSEngine

There are a few idiosyncrasies of `QJSEngine` which lead to certain compromises in the TypeScript implementation. So far, these have not been truly show-stopping.

All QJSEngine code runs in `strict` mode. This means that `eval` and `arguments` are forbidden names.

QJSEngine can not reference classes before they are defined, during definition. This presents challenges in both `format.ts` (which references a global instance before definition) and `compiler/base.ts` (which contains circular references between `IfBlock`, `ElseBlock` and `IfElseBlock`).

## Dependency Handling

`QJSEngine` does not, of course, implement Node.js's APIs. It also does not implement an in-runtime module resolution facility like you would see in Node. Instead, you are expected to import the module through C++.

This means that `./dist/main.js` may not include any imports of Node.js dependencies. Instead, it should contain a short list of imports of internally controlled libraries, which may then be implemented separately in Node.js (for Vitest and the Node.js runtime and). As a corollary, any external dependencies which leverage Node.js need to be either removed or vendored.

The three dependencies `./dist/main.js` now references are:

- `@matanuska/debug` - The parts of `debug.ts` which depended on OpenTelemetry
- `@matanuska/host` - The core `Host` implementation, including a vendored `path` library
- `@matanuska/readline` - The core `readline` implementation, extracted from `executor.ts`

These dependencies were removed and replaced with either vendored or bespoke libraries:

- `@nestjs` - replaced with a custom container class
- `dotenv` - removed in favor of `dotenvx` and `just`
- `ansi-colors` - replaced with simple functions, for now
- `text-table` - vendored
- `strftime` - vendored

## Current State

A stub entry point, implemented in `QT` , has been added in `./core`. It compiles and starts, but fails to run the bundle.

The necessary refactors on the TypeScript side have also been completed.

## Ongoing Issues

### Vite Bundling

The Vite bundle currently bundles `@matanuska/host`, `@matanuska/readline`, and `@matanuska/debug`. Cursory investigation suggests that this is caused by these packages being linked from `./packages`. Attempts at getting Vite to explicitly ignore these packages have not been successful.

I will attempt to build a useful example and post issues in the Vite Q&A feature and on Stack Overflow. But barring that, I have two options: either publish these packages and remove them from NPM workspaces, or switch to a different bundling strategy.

This issue is somewhat hairy, but certainly not insurmountable.

# Host and Readline Tests

Currently, tests for host functionality remain in the root tests, and tests for readline are unimplemented.

We want to be able to run the same tests against both the Node.js and c++ implementations of `@matanuska/host` and `@matanuska/readline`. That loosely implies forking [tape](https://github.com/tape-testing/tape) and switching its behavior based on whether tests are running in QT or in Vite. But the details are TBD.
