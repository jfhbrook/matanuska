/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 1`] = `
Print('hello')
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 10`] = `
ShortIf (true) { Print('true') }
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 11`] = `
ShortIf (true) { Print('true') } { Print('false') }
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 12`] = `
If (true) {
  Line(20) [
    Print('hello world'),
  ],
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 13`] = `
If (true) {
  Line(20) [
    Print('hello world'),
  ],
} Else {
  Line(20) [
    Print('hello world'),
  ],
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 14`] = `
If (true) {
  Line(20) [
    Print('true'),
  ],
} Else If (true) {
  Line(20) [
    Print('false, but true'),
  ],
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 2`] = `
Exit(0)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 3`] = `
Rem(a witty remark)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 4`] = `
New(null)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 5`] = `
Load('./examples/001-hello-world.bas', run=true)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 6`] = `
List
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 7`] = `
New(null)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 8`] = `
Run
`

exports[`test/format.ts > TAP > given a DefaultFormatter > commands > must match snapshot 9`] = `
Let(i%, 1)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseException > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
BaseException: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseFault > must match snapshot 1`] = `
=== INTERNAL FAULT ===

--- Internal Stack Trace ---
BaseFault: message
    at Test.<anonymous> ({CWD}/test/format.ts:268:40)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.cb ({CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17)
    at <anonymous> ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1153:21)
    at Test.main ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1161:7)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.runMain ({CWD}/node_modules/@tapjs/core/src/base.ts:613:15)
    at Test.runMain ({CWD}/node_modules/@tapjs/test/test-built/src/index.ts:79:19)
    at Test.#processSubtest ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1230:9)
    at Test.#process ({CWD}/node_modules/@tapjs/core/src/test-base.ts:881:29)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseWarning > must match snapshot 1`] = `
/home/josh/script.bas:100: BaseWarning: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseWarning without a traceback > must match snapshot 1`] = `
<unknown>:<?>: BaseWarning: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Binary expression > must match snapshot 1`] = `
Binary(+) {
  1,
  1,
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a boolean > must match snapshot 1`] = `
true
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BoolLiteral > must match snapshot 1`] = `
true
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Exception > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
Exception: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a FileError with one file > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
FileError EACCES: message
  Input File: /home/josh/script.bas
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a FileError with two files > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
FileError EACCES: message
  Source File: /home/josh/script.bas
  Destination File: another.bas
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Line > must match snapshot 1`] = `
Line(100) [
  Print('hello world'),
]
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a native value > must match snapshot 1`] = `
Set(3) { 'a', 'b', 'c' }
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a NilLiteral > must match snapshot 1`] = `
nil
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a NotImplementedError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
NotImplementedError: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a null value > must match snapshot 1`] = `
null
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a number > must match snapshot 1`] = `
12345
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Program > must match snapshot 1`] = `
Program(
  Line(100) [
    Print('hello world'),
  ],
)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a PromptLiteral > must match snapshot 1`] = `
'\\u@\\h:\\w\\$'
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a RealLiteral > must match snapshot 1`] = `
123.456
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a RuntimeError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
RuntimeError: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a RuntimeFault > must match snapshot 1`] = `
=== RUNTIME FAULT ===

--- Internal Stack Trace ---
AssertionError [ERR_ASSERTION]: underlying assertion
    at new AssertionError (node:internal/assert/assertion_error:451:5)
    at Test.<anonymous> ({CWD}/test/format.ts:272:26)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.cb ({CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17)
    at <anonymous> ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1153:21)
    at Test.main ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1161:7)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.runMain ({CWD}/node_modules/@tapjs/core/src/base.ts:613:15)
    at Test.runMain ({CWD}/node_modules/@tapjs/test/test-built/src/index.ts:79:19)
    at Test.#processSubtest ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1230:9)

--- Traceback ---
Traceback:
  File '/home/josh/script.bas', line 100

--- Versions ---
Matanuska BASIC: v0.0.1
TypeScript: v5.5.2
Node.js: NODE_VERSION

This is a bug in Matanuska BASIC. If you copy this entire message and post it
to the issues tracker:

    https://github.com/jfhbrook/matanuska/issues

the developers will do their best to fix it - and more importantly, they will
owe you a beer, coffee or beverage of your choice. 🍻


`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a string > must match snapshot 1`] = `
hello
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a StringLiteral > must match snapshot 1`] = `
'hello'
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Token > must match snapshot 1`] = `
Token(<string>) {
  index: 0,
  row: 0,
  offsetStart: 0,
  offsetEnd: 9,
  text: "'hello\\q'",
  value: 'hello\\q',
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Traceback > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a TypeError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
TypeError: message
  Value: 123
  From: integer
  To: nil
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Unary expression > must match snapshot 1`] = `
Unary(-) {
  1,
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a UsageFault > must match snapshot 1`] = `
Usage: lol
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a ZeroDivisionError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
ZeroDivisionError: Cannot divide 1 by 0
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an array of values > must match snapshot 1`] = `
[
  1,
  'two',
  true,
]
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an AssertionError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
AssertionError: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an Exit with a message > must match snapshot 1`] = `
Exit 0: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an Exit without message > must match snapshot 1`] = `
Exit 0
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an IntLiteral > must match snapshot 1`] = `
12
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an OsError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
OsError EADDRINUSE: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an undefined value > must match snapshot 1`] = `
undefined
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a ParseError > must match snapshot 1`] = `
/home/josh/script.bas:100:22: error: expected )
  100 print someFn(ident
                        ^
/home/josh/script.bas:100:17: warning: identifier has no sigil
  100 print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a ParseWarning > must match snapshot 1`] = `
/home/josh/script.bas:100:17: warning: identifier has no sigil
  100 print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a SyntaxError > must match snapshot 1`] = `
/home/josh/script.bas:100:22: error: expected )
  100 print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a SyntaxWarning > must match snapshot 1`] = `
/home/josh/script.bas:100:22: warning: expected )
  100 print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a ParseError > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): error: expected )
  print someFn(ident
                        ^
/home/josh/script.bas:<R0>:17 (after line 100): warning: identifier has no sigil
  print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a ParseWarning > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:17 (after line 100): warning: identifier has no sigil
  print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a SyntaxError > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): error: expected )
  print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a SyntaxWarning > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): warning: expected )
  print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 1`] = `
Print('hello')
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 10`] = `
ShortIf (true) { Print('true') }
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 11`] = `
ShortIf (true) { Print('true') } { Print('false') }
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 12`] = `
If (true) {
  Line(20) [
    Print('hello world'),
  ],
}
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 13`] = `
If (true) {
  Line(20) [
    Print('hello world'),
  ],
} Else {
  Line(20) [
    Print('hello world'),
  ],
}
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 14`] = `
If (true) {
  Line(20) [
    Print('true'),
  ],
} Else If (true) {
  Line(20) [
    Print('false, but true'),
  ],
}
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 2`] = `
Exit(0)
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 3`] = `
Rem(a witty remark)
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 4`] = `
New([1mnull[22m)
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 5`] = `
Load('./examples/001-hello-world.bas', run=true)
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 6`] = `
List
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 7`] = `
New([1mnull[22m)
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 8`] = `
Run
`

exports[`test/format.ts > TAP > given a Inspector > commands > must match snapshot 9`] = `
Let(i%, 1)
`

exports[`test/format.ts > TAP > given a Inspector > it formats a BaseException > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
BaseException: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats a BaseFault > must match snapshot 1`] = `
=== INTERNAL FAULT ===

--- Internal Stack Trace ---
BaseFault: message
    at Test.<anonymous> ({CWD}/test/format.ts:268:40)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.cb ({CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17)
    at <anonymous> ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1153:21)
    at Test.main ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1161:7)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.runMain ({CWD}/node_modules/@tapjs/core/src/base.ts:613:15)
    at Test.runMain ({CWD}/node_modules/@tapjs/test/test-built/src/index.ts:79:19)
    at Test.#processSubtest ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1230:9)
    at Test.#process ({CWD}/node_modules/@tapjs/core/src/test-base.ts:881:29)
`

exports[`test/format.ts > TAP > given a Inspector > it formats a BaseWarning > must match snapshot 1`] = `
/home/josh/script.bas:100: BaseWarning: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats a BaseWarning without a traceback > must match snapshot 1`] = `
<unknown>:<?>: BaseWarning: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Binary expression > must match snapshot 1`] = `
Binary(+) {
  1,
  1,
}
`

exports[`test/format.ts > TAP > given a Inspector > it formats a boolean > must match snapshot 1`] = `
[33mtrue[39m
`

exports[`test/format.ts > TAP > given a Inspector > it formats a BoolLiteral > must match snapshot 1`] = `
true
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Exception > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
Exception: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats a FileError with one file > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
FileError EACCES: message
  Input File: /home/josh/script.bas
`

exports[`test/format.ts > TAP > given a Inspector > it formats a FileError with two files > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
FileError EACCES: message
  Source File: /home/josh/script.bas
  Destination File: another.bas
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Line > must match snapshot 1`] = `
Line(100) [
  Print('hello world'),
]
`

exports[`test/format.ts > TAP > given a Inspector > it formats a native value > must match snapshot 1`] = `
Set(3) { [32m'a'[39m, [32m'b'[39m, [32m'c'[39m }
`

exports[`test/format.ts > TAP > given a Inspector > it formats a NilLiteral > must match snapshot 1`] = `
nil
`

exports[`test/format.ts > TAP > given a Inspector > it formats a NotImplementedError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
NotImplementedError: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats a null value > must match snapshot 1`] = `
[1mnull[22m
`

exports[`test/format.ts > TAP > given a Inspector > it formats a number > must match snapshot 1`] = `
[33m12345[39m
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Program > must match snapshot 1`] = `
Program(
  Line(100) [
    Print('hello world'),
  ],
)
`

exports[`test/format.ts > TAP > given a Inspector > it formats a PromptLiteral > must match snapshot 1`] = `
'\\u@\\h:\\w\\$'
`

exports[`test/format.ts > TAP > given a Inspector > it formats a RealLiteral > must match snapshot 1`] = `
123.456
`

exports[`test/format.ts > TAP > given a Inspector > it formats a RuntimeError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
RuntimeError: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats a RuntimeFault > must match snapshot 1`] = `
=== RUNTIME FAULT ===

--- Internal Stack Trace ---
AssertionError [ERR_ASSERTION]: underlying assertion
    at new AssertionError (node:internal/assert/assertion_error:451:5)
    at Test.<anonymous> ({CWD}/test/format.ts:272:26)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.cb ({CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17)
    at <anonymous> ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1153:21)
    at Test.main ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1161:7)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.runMain ({CWD}/node_modules/@tapjs/core/src/base.ts:613:15)
    at Test.runMain ({CWD}/node_modules/@tapjs/test/test-built/src/index.ts:79:19)
    at Test.#processSubtest ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1230:9)

--- Traceback ---
Traceback:
  File '/home/josh/script.bas', line 100

--- Versions ---
Matanuska BASIC: v0.0.1
TypeScript: v5.5.2
Node.js: NODE_VERSION

This is a bug in Matanuska BASIC. If you copy this entire message and post it
to the issues tracker:

    https://github.com/jfhbrook/matanuska/issues

the developers will do their best to fix it - and more importantly, they will
owe you a beer, coffee or beverage of your choice. 🍻


`

exports[`test/format.ts > TAP > given a Inspector > it formats a string > must match snapshot 1`] = `
[32m'hello'[39m
`

exports[`test/format.ts > TAP > given a Inspector > it formats a StringLiteral > must match snapshot 1`] = `
'hello'
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Token > must match snapshot 1`] = `
Token(<string>) {
  index: 0,
  row: 0,
  offsetStart: 0,
  offsetEnd: 9,
  text: "'hello\\q'",
  value: 'hello\\q',
}
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Traceback > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
`

exports[`test/format.ts > TAP > given a Inspector > it formats a TypeError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
TypeError: message
  Value: [33m123[39m
  From: integer
  To: nil
`

exports[`test/format.ts > TAP > given a Inspector > it formats a Unary expression > must match snapshot 1`] = `
Unary(-) {
  1,
}
`

exports[`test/format.ts > TAP > given a Inspector > it formats a UsageFault > must match snapshot 1`] = `
Usage: lol
`

exports[`test/format.ts > TAP > given a Inspector > it formats a ZeroDivisionError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
ZeroDivisionError: Cannot divide 1 by 0
`

exports[`test/format.ts > TAP > given a Inspector > it formats an array of values > must match snapshot 1`] = `
[
  [33m1[39m,
  [32m'two'[39m,
  [33mtrue[39m,
]
`

exports[`test/format.ts > TAP > given a Inspector > it formats an AssertionError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
AssertionError: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats an Exit with a message > must match snapshot 1`] = `
Exit [32m0[39m: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats an Exit without message > must match snapshot 1`] = `
Exit [32m0[39m
`

exports[`test/format.ts > TAP > given a Inspector > it formats an IntLiteral > must match snapshot 1`] = `
12
`

exports[`test/format.ts > TAP > given a Inspector > it formats an OsError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
OsError EADDRINUSE: message
`

exports[`test/format.ts > TAP > given a Inspector > it formats an undefined value > must match snapshot 1`] = `
[90mundefined[39m
`

exports[`test/format.ts > TAP > given a Inspector > when it is a line > it formats a ParseError > must match snapshot 1`] = `
/home/josh/script.bas:100:22: error: expected )
  100 print someFn(ident
                        ^
/home/josh/script.bas:100:17: warning: identifier has no sigil
  100 print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is a line > it formats a ParseWarning > must match snapshot 1`] = `
/home/josh/script.bas:100:17: warning: identifier has no sigil
  100 print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is a line > it formats a SyntaxError > must match snapshot 1`] = `
/home/josh/script.bas:100:22: error: expected )
  100 print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is a line > it formats a SyntaxWarning > must match snapshot 1`] = `
/home/josh/script.bas:100:22: warning: expected )
  100 print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is not a line > it formats a ParseError > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): error: expected )
  print someFn(ident
                        ^
/home/josh/script.bas:<R0>:17 (after line 100): warning: identifier has no sigil
  print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is not a line > it formats a ParseWarning > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:17 (after line 100): warning: identifier has no sigil
  print someFn(ident
                   ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is not a line > it formats a SyntaxError > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): error: expected )
  print someFn(ident
                        ^
`

exports[`test/format.ts > TAP > given a Inspector > when it is not a line > it formats a SyntaxWarning > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): warning: expected )
  print someFn(ident
                        ^
`
