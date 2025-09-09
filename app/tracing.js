import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const exporter = new OTLPTraceExporter({
  url: 'http://jaeger:4318/v1/traces'
});

const sdk = new NodeSDK({
  traceExporter: exporter,
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'obs-demo-app',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

await sdk.start();
console.log("✅ OpenTelemetry tracing started (OTLP → Jaeger)");
