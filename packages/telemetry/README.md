# Telemetry

This package contains Matanuska's OpenTelemetry SDK configuration. It's
separated from the main project so that it can be required with the
`--require` flag:

```sh
node --require '@matanuska/telemetry' ./dist/main.mjs
```

This will stand up a simple stack that writes OTLP spans to the endpoint
created by running `fireball up`. For more details, look at the entrypoint
generated by `@matanuska/entrypoint` and the details of `@matanuska/fireball`.
