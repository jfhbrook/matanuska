# @matanuska/test

`@matanuska/test` is a small test framework. It's designed to support some very niche requirements.

First, it must be a single file es-style module. This is so it may easily be imported by QT's `QJSEngine`.

Second, it needs to support multiple parent runners:

1. Vite
2. QT test
3. Matanuska's built-in BASIC testing facilities

These requirements led to it being written from scratch.
