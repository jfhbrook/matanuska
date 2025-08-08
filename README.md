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

- [ ] Scope Related ADRs
  - [ ] Local variables
  - [ ] Closures
  - [ ] Function syntax
- [ ] operator precedence ADR
- [ ] Test/fix global variables
  - The for loop reveals some weird bytecode
  - The variable tests only cover let/assign, not access
- [ ] Implement local variables
  - [ ] Use local variables in `for` loop
- [ ] Function support
  - [ ] BASIC
  - [ ] Native
- [ ] Path navigation - `cd`, `ls`, `etc`
  - `cd` is a builtin ("native function")
  - `ls` and others are on the PATH, actually
- [ ] Expanded list
  - `list 10`
  - `list 10-20`
- [ ] Tests for `InstrShifter` in editor
- [ ] Support entering multiple lines in REPL
  - [ ] ADR
  - Probably a `Reader` class that handles `readline` stuff
  - Probably track block nesting
- [ ] Shell commands
  - Will need to research jobs in Bash
  - Investigate alt-shells
    - [fish](https://fishshell.com/)
    - [nushell](https://www.nushell.sh/)
    - [elvish](https://elv.sh/)
  - Scanner and parser support for shell commands and "shell tokens"
  - Compiler support for shell commands
  - Host support for shell commands
  - Runtime support for shell commands
  - Support \j in prompt rendering
  - (Pipes will come later)
- PS1/PS2 support
  - `SET PS1` and `SET PS2`?

### Up Next

- Complete Print/Format syntax
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
- Assert module
  - Wrap 'node:assert'
  - Throw RuntimeFault
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
- Test harness
  - `test` and `assert` commands
  - Runtime "test mode" and entrypoint subcommand
  - Reporter, possibly based off node-tap
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
- Profiling
  - Line-based for users
  - Opcode-based for me
- Performance tests
  - Benchmarks
  - Profile slow benchmarks
- Editor plugins
- Generated "exceedingly large" script tests

### The Future

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
