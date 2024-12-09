import { NodeSDK } from '@opentelemetry/sdk-node';
import { Attributes, trace, Span } from '@opentelemetry/api';

//#if _MATBAS_BUILD == 'debug'
import VERSIONS from 'consts:versions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import { parseBoolEnv } from './env';
//#endif

let NO_TRACE = true;

//#if _MATBAS_BUILD == 'debug'
NO_TRACE = parseBoolEnv(process.env.NO_TRACE);
//#endif

let options = {};

//#if _MATBAS_BUILD == 'debug'
if (!NO_TRACE) {
  options = {
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'matbas',
      [ATTR_SERVICE_VERSION]: VERSIONS.matbas,
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'http://localhost:4317/v1/traces',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  };
}
//#endif

export const telemetry = new NodeSDK(options);

export function addEvent(message: string, attributes: Attributes = {}): void {
  const tracer = trace.getTracer('main');
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.addEvent(message, attributes);
  } else {
    tracer.startActiveSpan('event', (span: Span) => {
      span.addEvent(message, attributes);
    });
  }
}
