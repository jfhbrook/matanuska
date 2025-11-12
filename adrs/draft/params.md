# ADR 023 - Params

### Status: Draft

### Josh Holbrook

# Context

While Matanuska BASIC is in the BASIC family of languages, it is also intended to be a shell language. That means it needs to handle command line style arguments.

This is in part because Matanuska BASIC is intended to run real shell commands; this feature is intended for use with builtins as well. Currently, the only built-in command that supports any command line flags is `load`, with its `--run` flag:

```basic
load "file.bas" --run
```

In current internal parlance, these sort of arguments and flags are known as "params", after [the parameters concept in PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parameters?view=powershell-7.5).

This feature is currently half-baked and poorly tested, since it only needs to support `load`. However, I am in the process of implementing disk-based shell builtins - `cd`, `cp`, `rm`, `touch`, `mv`, `mkdir`, `rmdir` and `pwd`. Most of these accept params. Therefore, it is worth stepping back and doing some up-front design.

# Path Literals and Shell Tokens

Before continuing, we should take the time to understand how Matanuska handles path literals and bare "shell" tokens.

Currently, all tested paths scan as a combination of basic tokens, _not_ separated by whitespace:

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

Off the cuff, it may seem like these scans are incorrect. However:

1. Because the scanner emits **whitespace** tokens, we can easily reassemble these entities in the scanner
2. In most contexts, we would want to treat these tokens as part of non-param expressions

In addition, the scanner is intended to handle standard shell-compatible tokens as a last resort. However, to date, no such tokens have been discovered - all inputs so far have scanned into higher level tokens.

## Runtime Handling

Currently, params are handled entirely in the parser. However, there are problems with this:

1. Shells allow for params to be quoted - `foo "bar" baz`
2. We would like to allow for params to be assembled with expressions at runtime

This would be expected to change to parsing at runtime, after expressions have been evaluated. In other words, AST nodes which currently look like this:

```
Rm => paths: Expr[], recursive: boolean, force: boolean, directory: boolean
```

should instead look like this:

```
Rm => argv: Expr[]
```

The runtime would then evaluate those arguments and pass those to the `Rm` instruction.

## Semantics

The params parser currently takes a `ParamsSpec` and returns a `Params` object, with an interface inspired by [minimist](https://www.npmjs.com/package/minimist).

```typescript
export interface Params {
  arguments: Expr[];
  flags: Record<string, boolean>;
  options: Record<string, Expr>;
}

export interface ParamsSpec {
  arguments?: string[];
  flags?: string[];
  options?: string[];
}
```

Negative flags are handled with a `--no` prefix - ie `--flag` is negated by `--no-flag`. Short flags are handled by treating flags of length 1 as short.

This format should be able to handle general use cases for builtins. Non-builtins (ie real shell commands) should be able to delegate their behavior to their respective commands.

# Decision

TK
