# ADR ??? - Telemetry Improvements

### Status: Draft

### Josh Holbrook

## Context

### Problem: Read-eval-print appears to fire "twice"

No special requirements for root spans, as far as I can tell

### Problem: No traces when running script

- Appears that shutdown doesn't flush all traces
- Calling forceFlush on everything doesn't seem to do the trick
- May need to set tracer provider timeouts to 0 - see <https://github.com/jfhbrook/matanuska/blob/a325e0a045aac030222304aa621934c3727a3178/telemetry.ts>

## Problem: otel diagnostic logger is ugly

- Note: The SDK will automatically incorporate a `DiagConsoleLogger` if you set `OTEL_LOG_LEVEL`: <https://github.com/open-telemetry/opentelemetry-js/blob/887ff1cd6e3f795f703e40a9fbe89b3cba7e88c3/experimental/packages/opentelemetry-sdk-node/src/sdk.ts#L127-L133>
- Also consider a `ConsoleSpanExporter`
- They recommend "info" as a "default" - debug is too chatty

## Decision

TK
