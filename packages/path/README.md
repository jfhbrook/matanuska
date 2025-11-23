# @matanuska/path

`@matanuska/path` is a fork of Node.js's `path` library. It differs from Node's in the following ways:

1. It's written in TypeScript, with reasonably good typing
2. It returns a factory which wraps a `Host` object, rather than exporting the path helpers directly
3. It does not (currently) include globbing support
