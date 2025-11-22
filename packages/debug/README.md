# @matanuska/debug

`@matanuska/debug` implements general purpose debug capabilities for Matanuska - namely, helpers for OpenTelemetry.

First, it re-exports a few types from OpenTelemetry, which may be used in Matanuska when managing spans.

Second, it implements the function `startSpan`. This is very similar to OpenTelemetry's implementation of startActiveSpan. It differs, however, in that it automatically closes the span, and attaches annotations in error cases. This function is used in Matanuska alongside `jscc` to add spans in debug builds:

```typescript
//#if _MATBAS_BUILD == 'debug'
return await startSpan('my span', async (_: Span) => {
  //#endif

  // (logic here)

  //#if _MATBAS_BUILD == 'debug'
});
//#endif
```

Finally, it implements the function `addEvent`, which gets the currently active span and adds an event to it. This method is useful in synchronous hot paths, which would create an unmanagable amount of spans and introduce unneeded performance overhead in the form of Promises.

These helpers are expected to be implemented in pure C++ in the QT implementation.
