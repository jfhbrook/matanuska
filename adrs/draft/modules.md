# ADR ??? - Module System

### Status: Draft

### Josh Holbrook

## Context

Traditionally, BASIC doesn't support modules - all code in a BASIC program is implemented in a single file. This is fine for a first cut of Matanuska BASIC, but long term I would like to support a module system.

### BASIC

While BASIC doesn't have the concept of modules, there _is_ a history of namespaces. For instance, a variable `x` defined in a subroutine `foo` may be stored in the global environment as `foo.x`. [citation needed - maybe from WIC&I?]

### Python

Python loads modules based on a namespace. These modules are loaded based on the value of the `CLASSPATH`. By default, Python will load modules from a shared `site-packages` directory. Because this directory is shared and generally non-configurable, this strategy requires support for virtualenvs.

### Visual Basic

VB implements imports from namespaces, using the same mechanism as other .NET technologies. I do not know the specific mechanics.

I believe VB also supports a `namespace` syntax, which namespaces variables defined within a block under that namespace.

### JavaScript

Node.js loads modules in three different ways:

1. Native modules are loaded from inside Node.js.
2. Library modules are referenced through a path, relative to the current file.
3. Non-path module names are loaded from the `node_modules` directory in the root of the current module.

JavaScript more generally can operate on an object using `with`. This is somewhat similar to `namespace`, but rather than taking a namespace, it takes the object which contains that namespace.

### Steel

[Steel](https://github.com/mattwparas/steel) is a Scheme dialect. Its module system is documented here:

<https://mattwparas.github.io/steel/book/reference/modules.html>

What's noteworthy is that it uses the `require` keyword to import modules, but the `provide` keyword to export entities. Since `export` is reserved for environment exports, use of this `provide` keyword could be compelling.

### BASIC8

<https://paladin-t.github.io/b8/docs/manual>

BASIC8 supports modules with an `import` keyword. I don't know off-hand how it supports exports, or if it does them "like python".

## Decision

TK
