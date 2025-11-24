# @matanuska/host

`@matanuska/host` implements general purpose platform-level functionality for Matanuska. Generally speaking, this is anything which depends on node core.

These exports are expected to be implemented in pure C++ in the QT implementation.

## Core Features

First, `@matanuska/host` exports a few entities directly from Node.js:

- `util.inspect`, which is used in Matanuska's inspector
- `stream.Readable`, `stream.Writable` and `stream.Transform`, used for testing

Second, it exports some entities used for configuring log levels and channels:

- `Level` - an enum for log levels
- `Channel` and `StdChannel` - types for channel IDs
- `INPUT`, `OUTPUT`, `ERROR`, `WARN`, `INFO` and `DEBUG` - constants for channel IDs
- `stdChannel` - a function which returns the appropriate standard channel to emit a potentially non-standard channel to

Third, it exports some error related entities:

- `HostError`, `HostException`, `ExitError`, `FileReadError`, `FileWriteError` - host-specific error interfaces
- `isHostException`, `isHostExit`, `isFileReadError` and `isFileWriteError` - type guards for the error interfaces

These are introduced because the library can't leverage Matanuska's core exception types. It's expected that Matanuska will use the type guards to capture these errors and wrap them in said exception types.

Fourth, it includes a vendored and modified version of `node:path`, in `path.ts`, and exports:

- `PathObject` - a type for the return value of `path.parse`
- `PathTool` - a type representing the interface of `node:path`, minus the globbing feature

Finally, it defines and exports `Host` and `ConsoleHost` interfaces, as well as an implemtation of `ConsoleHost`, exported as `host`. This host is largely exposed as-is in Matanuska's `host.ts`, with the following modifications:

- `formatter`, which is stubbed to use `util.inspect`, is replaced with Matanuska's default formatter
- Methods which throw host-internal errors are wrapped so they throw Matanuska-native exceptions

For details, view the `Host` and `ConsoleHost` types in `index.ts`.

## Testing

The module `@matanuska/host/test` contains tools for mocking out tests in Matanuska's core test suite:

- `MockInputStream`, `MockOutputStream` and `MockErrorStream`, which are used for testing host logging and output features
- `MockConsoleHost`, a subtype of `ConsoleHost` which types the stdio streams to expect our mocks, exposes a mock file system, and includes an `expect` method for testing outputs from the mock streams
- `mockConsoleHost`, which takes a mock file system and outputs a `MockConsoleHost`

You can see its use in Matanuska's test suite.
