# Matanuska BASIC

Matanuska is a BASIC dialect designed for use as a shell. It asks what it would've been like if the classic 80s BASIC was better able to rise to the occasion when it came to disk features and/or competing with DOS.

Matanuska is still in development, and needs a lot of work before it's ready for regular use.

## Install

There currently aren't any installable packages for Matanuska. If you would like to try it today, follow the instructions for development.

## Development

Matanuska BASIC uses `npm` for all of its tasks. Refer to `package.json` for details.

## ADRs

Architectural decisions are documented in [./adrs](./adrs). Notes on future decisions I haven't made yet are in [./adrs/draft](./adrs/draft).

## Current Status and Next Steps

The interpreter can run "hello world" in a REPL and evaluate simple expressions. Now is time to add some basic features and button up a few gaps.

### Prioritized Backlog

- [ ] Fully featured `cd` command
- [ ] Implement QT entry point
  - [ ] Deal with Node class exports in `@matanuska/host`
  - [ ] Implement `@matanuska/host`
  - [ ] Run host tests in QT
  - [ ] Implement `@matanuska/readline`
  - [ ] run readline tests in QT
  - [ ] Implement `@matanuska/debug`
  - [ ] Add node build version to format output
  - [ ] Add QT versions to format output
- [ ] Native commands
  - [x] jobs ADR
  - [x] parse native commands
  - [x] clean up disk command tokens
  - [ ] create jobs table abstractions
  - [ ] test jobs table abstractions
  - [ ] develop runtime instructions for managing jobs
  - [ ] use jobs to implement `pwd`
  - [ ] support \j in prompt rendering
  - `./adrs/draft/processes.md`
- [ ] Revisit draft ADRs
  - `./adrs/draft/end-keyword.md`
  - `./adrs/draft/peek-poke.md`
  - `./adrs/draft/stack-effects.md`
  - `./adrs/draft/sigil-typecasting.md`
  - `./adrs/draft/registers.md`
- [ ] Fully featured `cd` command
- [ ] Functions
  - [ ] Function syntax ADR
  - [ ] Add keywords to tokens/scanner
  - [ ] Add support to parser
  - [ ] Parser tests for functions
  - [ ] Add new op codes
  - [ ] Add support in runtime
  - [ ] Add support to disassembler
  - [ ] Add support to compiler
  - [ ] Compiler tests for functions
  - [ ] Runtime tests
  - [ ] Examples
  - [ ] Native function support
- [ ] Tests for `InstrShifter` in editor
- [ ] Support entering multiple lines in REPL
  - [ ] ADR
  - Probably a `Reader` class that handles `readline` stuff
  - Probably track block nesting
- [ ] PS1/PS2 support
  - `SET PS1` and `SET PS2`?
- [ ] Runtime tests for `Jump` and `Loop`
- [ ] STDIO and Background Control
  - `|`, `&` and stream redirection
- [ ] Spike on `^Z`, `^Y` and `fg`
- [ ] Spike on Rust Jobs Implementation
  - Use `neon`
  - Potentially implement process groups

### Up Next

- Test Shenanigans
  - Proper assert module
  - `test` and `assert` commands
  - BASIC runtime "test mode" and entrypoint subcommand
  - Reporter, possibly based off node-tap
- Revisit `format-markdown` script
  - Pandoc introduces newlines by default, which is less than ideal
- Fallout from QT Refactor
  - [ ] Implement proper assert module
    - Possibly by vendoring node's assert module
  - [ ] Refactor `path`
    - Use a class
    - Potentially move out of `host`
  - [ ] Revisit bundling `ansi-colors`
    - It handles sophisticated logic that my little helpers do not
    - Possibly a good target for a `grabthar` build
- User cmdlets
  - Dust off `./adrs/draft/cmdlets.md`
  - Import cmdlets from some directory
  - Probably move `.matbas_history` and existing files
- Closures
  - Closures ADR
  - ???
- More robust citree parser
  - Setting defaults in List instr is no bueno
- Complete Print/Format syntax
  - `./adrs/draft/print-statement.md`
  - Support ECMA-55?
  - Complete ADR
  - Print can take a channel config
- Shell variable export
- Date/Time/Duration/TZData types
  - Core library
  - Host support
  - (Language support can come later)
- Consider using `end` keyword as general purpose block end keyword
  - [ ] Finalize ADR
- Support `next` and `continue` keywords in loops
- Support for `HISTSIZE` and `HISTFILESIZE`
- Telemetry improvements
- Pipes support
- GOTOs
  - Probably a second pass on the chunk
  - Probably need to enforce being within current block/scope tree
  - Will need to close appropriate scopes
- Type-checking compiler
  - Implement type analogues to operations
  - Simulated stack in the compiler
- Add trace events to parser and compiler
- Audit/document OTEL environment variables
- Add `tflint` and `terraform validate`
  - [ ] entrypoint
  - [ ] fireball
- Split matanuska into modules
- `grabthar` improvements
  - swc cli build option
  - automatically update package.json
  - lint-staged and husky support
  - `grabthar clean`
- Investigate [Node.js inspector](https://nodejs.org/en/learn/getting-started/debugging)
- Escaped newlines
- Arrays
  - Including array literals - BASIC assigns each index one at a time, or uses the `data` command
  - Consider using [eigen](https://eigen.tuxfamily.org/index.php?title=Main_Page)
- Environment info in runtime fault outputs
  - [envinfo](https://www.npmjs.com/package/envinfo) for inspiration
  - OS
  - CPU
  - Memory
  - Build tool versions (cmake, make, etc) if compiling native code
  - Will need to scrub from format test snapshot
- Implement Acey Ducey
  - `center$(n)`
  - `rnd!` (random) function
  - If/then/goto
  - functions
  - no-arguments print
  - `end` command
- Hashes
- Date/time language support
- Exception language support
- File I/O
- Research garbage collection
  - TypeScript is obviously garbage collected
  - But the architecture may hang onto references I don't want
- Tab-complete support in the REPL
- Starship support
- Stream/pipe support
- Break-in
  - MSX BASIC uses the `stop` and `cont` commands to control break-in behavior
  - Will need to intercept and handle ctrl-c from readline (ctrl-stop in MSX BASIC)
- Symbol dump
  - `./adrs/draft/symbol-dump.md`
- Profiling
  - `./adrs/draft/profiler.md`
    - Revisit in light of recent opentelemetry features
  - Line-based for users
  - Opcode-based for me
- Performance tests
  - Benchmarks
  - Profile slow benchmarks
- Text Editor plugins
- Generated "exceedingly large" script tests

### The Future

- Implement `cd ~kenz` -> `/home/kenz`
  - Needs C: <https://stackoverflow.com/questions/2910377/get-home-directory-in-linux>
- Optimize identifier constants - see ADR 019
- Reimplement citree in Rust and [chumsky](https://docs.rs/chumsky/latest/chumsky/#example-brainfuck-parser)
- String templates
- Module system
- Package manager
- Partial rewrite in Rust and/or C/C++
- Implement entry point in Rust or C/C++
- Port to bun?
  - Nice FFI
  - Support for bundled executable
- Object support
- Vector/matrix support for 1D/2D integer/float arrays
- Assembler mini-language
- Stack trace tests robust against different node versions

## Resources

- [Architecture Diagram on Google Drawings](https://docs.google.com/drawings/d/1RmTGs-GMPhkeLOoZW9sSs_WXXnlG2CRBoIJOK83_qkk/edit?usp=sharing)
- [Crafting Interpreters](https://craftinginterpreters.com/contents.html) by Robert Nystrom
  - My implementations of lox: <https://github.com/jfhbrook/crafting-interpreters>
  - [A blog series on adding exception handling to clox](https://amillioncodemonkeys.com/2021/02/03/interpreter-exception-handling-implementation/)
- `Writing Interactive Compilers and Interpreters` by PJ Brown
- `Modern MSX BASIC Game Development` by Raul Portales
- [List of Java bytecode instructions](https://en.m.wikipedia.org/wiki/List_of_Java_bytecode_instructions)
- [Z80 Instruction Set (Complete)](https://ftp83plus.net/Tutorials/z80inset_fullA.htm)
- [OpenJDK Architecture](https://www.dcs.gla.ac.uk/~jsinger/pdfs/sicsa_openjdk/OpenJDKArchitecture.pdf)
- [cpython internals](https://devguide.python.org/internals/)
  - [Python disassembler](https://docs.python.org/3/library/dis.html)
- [MSX2 Technical Handbook](https://github.com/Konamiman/MSX2-Technical-Handbook/blob/master/md/Chapter2.md/)
- [MSX-BASIC Instructions - MSX Wiki](https://www.msx.org/wiki/Category:MSX-BASIC_Instructions)
- [An Introduction to Programming BBC BASIC](https://www.bbcbasic.co.uk/bbcwin/tutorial/index.html)
- [BBC BASIC Reference Manual](http://www.riscos.com/support/developers/bbcbasic/index.html)
- [GW-BASIC User's Guide](http://www.antonis.de/qbebooks/gwbasman/)
- [BASIC Computer Games Microcomputer Edition](https://annarchive.com/files/Basic_Computer_Games_Microcomputer_Edition.pdf)
- [Fantasy BASIC Consoles](https://github.com/paladin-t/fantasy)
- [Atto](https://atto.devicefuture.org/)
- [BASIC8 Manual](https://paladin-t.github.io/b8/docs/manual)
- [MEG-4 Manual](https://bztsrc.gitlab.io/meg4/manual_en.html)
- ECMA-55 Standard
  - <https://ecma-international.org/publications-and-standards/standards/ecma-55/>
  - [bas55 implementation](https://jorgicor.niobe.org/bas55/bas55.html)
