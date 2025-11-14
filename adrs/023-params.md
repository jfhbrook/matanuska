# ADR 023 - Params

### Status: Accepted

### Josh Holbrook

# Context

While Matanuska BASIC is in the BASIC family of languages, it is also intended to be a shell language. That means it needs to handle command line style arguments.

This is in part because Matanuska BASIC is intended to run real shell commands; this feature is intended for use with builtins as well. Currently, the only built-in command that supports any command line flags is `load`, with its `--run` flag:

```basic
load "file.bas" --run
```

In current internal parlance, these sort of arguments and flags are known as "params", after [the parameters concept in PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parameters?view=powershell-7.5).

This feature is currently half-baked and poorly tested, since it only needs to support `load`. However, I am in the process of implementing disk-based shell builtins - `cd`, `cp`, `rm`, `touch`, `mv`, `mkdir`, `rmdir` and `pwd`. Most of these accept params. Therefore, it is worth stepping back and doing some up-front design.

# Decision

## AST

Certain instructions will accept an array of "params", as opposed to the more structured formats of others:

```
Command => name: string, params: Expr[]
```

These expressions will generally contain either `ShellLiteral` expressions, or full expressions as seen in other contexts.

## Shell Literal Parsing

Currently, all tested paths and options flags scan as a combination of basic tokens, _not_ separated by whitespace:

| text            | tokens                              |
| --------------- | ----------------------------------- |
| `/`             | `/`                                 |
| `./`            | `.`, `/`                            |
| `..`            | `.`, `.`                            |
| `../`           | `.`, `.`, `/`                       |
| `./`            | `.`, `/`                            |
| `./path`        | `.`, `/`, `<ident>`                 |
| `.\path`        | `.`, `\`, `<ident>`                 |
| `./*.txt`       | `.`, `/`, `*`, `.`, `<ident>`       |
| `-o`            | `-`, `<ident>`                      |
| `--long-option` | `-`, `-`, `<ident>`, `-`, `<ident>` |

This means that we can parse out `ShellLiteral(value)` expressions by accepting any token which doesn't include "illegal" characters, pausing if we encounter whitespace.

## Expression Parsing

In addition, we would like to accept standard expressions. But we need to be careful that the expression will parse clearly, in the presence of shell literals which may confuse the parser.

We do this by only treating tokens corresponding to `primary` entities as expressions. This includes literals (such as strings or numbers), identifiers, and groups (`(...)`). In these cases, we dive right into the `primary()` parser; otherwise, we accept a shell literal.

## Compiling

Currently, shell literals are treated the same as strings in the compiler. Generally speaking, we don't have a particular need for a dedicated shell type. This decision may be re-evaluated in the future, if such a need arises.

## Params Parsing

For these commands, the AST parser only handles extracting the expressions into a list of params. Because we won't know what an expression evaluates to until runtime, we're forced to do "command line options parsing" at runtime.

This parsing is supported by a class called `Params`. Its general interface looks like so (using an example based on the `load` command):

```typescript
const PARAMS = new Params([new Arg('filename'), new Flag('run')]);

const { filename, run } = PARAMS.parse(['some-filename.bas', '--run']);
```

Negative flags are handled with a `--no` prefix - ie `--flag` is negated by `--no-flag`. Short flags are handled by treating flags of length 1 as short. Note that short flags currently do not support negation.

This format should be able to handle general use cases for built-in commands. Non-builtins (ie real shell commands) should be able to delegate their behavior to their respective commands.
