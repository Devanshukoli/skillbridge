import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "skillbridge-api",
    [ATTR_SERVICE_VERSION]: "1.0.0",
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: "development",
  }),

  traceExporter,

  instrumentations: [getNodeAutoInstrumentations()],
});