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

A stub for a QT entry point is currently implemented in `./core`. However, it currently struggles to handle the bundle correctly, for reasons that will be made apparent.

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

These refactors are complete, with the exception of ongoing issues, which are detailed later in this document.

## Idiosyncrasies of QJSEngine

There are a few idiosyncrasies of `QJSEngine` which lead to certain compromises in the TypeScript implementation. So far, these have not been truly show-stopping.

All QJSEngine code runs in `strict` mode. This means that `eval` and `arguments` are forbidden names.

QJSEngine can not reference classes before they are defined, during definition. This presents challenges in both `format.ts` (which references a global instance before definition) and `compiler/base.ts` (which contains circular references between `IfBlock`, `ElseBlock` and `IfElseBlock`).

## Build Details

Three new build tools have been introduced: `qmake`, `make` and `just`.

`qmake` is the standard build tool for QT, and is used for building the QT project. The primary alternative is `cmake`, and there may be a switch in the future. In the meantime, `qmake` is simple and is meeting current needs.

`make` is being used for the QT build, as `qmake` outputs Makefiles. In addition, it being used at the top level to coordinate build steps between various components. This is because the build now has multiple complex stages:

1. Build underlying dependencies - `@matanuska/debug`, `@matanuska/host`, `@matanuska/readline`
2. Build the AST, if `./ast/index.citree` has changed
3. Build `./dist/main.js`
4. Build the QT application

`make` should, in theory, allow the build to skip steps which are unnecessary, making them faster overall.

`just` is introduced as a high-level task runner that can leverage `npm` for Node.js tasks, but additionally call other tools for the C++ portion of the project.

Additionally, `clang-format` has been introduced to format C++ source files. I used it previously with the Crafting Interpreters work, and copied its configuration from that project more or less uncritically.

### Packages

The three internal packages (`@matanuska/host`, `@matanuska/readline`, and `@matanuska/debug`) are build with `tsc`. This is because using `tsc` allows for each file to remain separate. This will make it easier to import sub-libraries of `@matanuska/host` (such as `@matanuska/host/path`) as JavaScript, while replacing `@matanuska/host`'s core with C++ in the QT implementation.

### Dependency Management

All dependencies are built as tarballs with `npm pack`, and installed from tarball with `npm i`. In addition, all packages are currently build by `tsc` with the `nodenext` build type.

The reason for tarball builds is that Vite aggressively bundles linked dependencies, and it is difficult to disable in both the build and the tests reliably. Installing tarballs ensures that Vite, when combined with an appropriate configuration, at least does not bundle them into the build.

The reason for `nodenext` builds is two-fold.

First, Vitest still insists on bundling the dependencies, and struggles to bundle commonjs. Compiling to `nodenext` modules sidesteps this issue, at the cost of Node's whacky import requirements, discussed in [ADR 017](./017-grabthar.md).

Second, at least some files are intended to be imported by QT. These files must be separate (making `grabthar` bundling problematic), and they must use import syntax.

An issue that will be tackled in the future is potential use by QT of the `@matanuska/host/test` module. This module imports entities from local files, which have Node.js style import paths. This will cause problems if we attempt to import this file into QT. However, it's currently only in use by Vitest in the main build, and would potentially need refactoring to support tape-driven tests anyway. Figuring this out will be deferred until there's a practical need for it.

## Ongoing Issues

### Idiosyncrasies with Make

The `make` build has some problems. The listed file dependencies are unwieldy, and Make seems to struggle. In addition, unexpected changes in dependent files can cause Make to either not build something I expect it to, or run a build multiple times.

There are a few potential options.

The first is to generate a Makefile with a custom tool. This is not an uncommon strategy - it's how `cmake` operates, after all. But custom tooling can be hard to debug.

The second is to use an alternative build tool, such as [gulp](https://npm.im/gulp). In theory, it should be possible to retain the optimized builds enabled by `make` [with the gulp-changed and gulp-cached modules](https://stackoverflow.com/questions/45215847/gulp-sass-compile-only-changed-changed-files-folder).

Finally, I may implement a simple build script, which does _not_ optimize builds, but which is at least simple to understand and debug.

Currently, `make` works well enough that I will move forward with it. But this will likely be refactored soon.

### Host and Readline Tests

Currently, tests for host functionality remain in the root tests, and tests for readline are unimplemented.

We want to be able to run the same tests against both the Node.js and c++ implementations of `@matanuska/host` and `@matanuska/readline`. That loosely implies forking [tape](https://github.com/tape-testing/tape) and switching its behavior based on whether tests are running in QT or in Vite. But the details still need to be ironed out.

In the meantime, I may implement the tests in `vite`, as they are currently. This could stand as an incremental step.
