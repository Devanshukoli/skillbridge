import {
  Span,
  SpanStatusCode,
  trace,
  Tracer,
} from "@opentelemetry/api";

const tracer: Tracer = trace.getTracer("skillbridge-api");

export interface TraceOptions {
  attributes?: Record<string, string | number | boolean>;
}

export async function traceSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: TraceOptions
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (options?.attributes) {
        span.setAttributes(options.attributes);
      }

      const result = await fn(span);

      span.setStatus({
        code: SpanStatusCode.OK,
      });

      return result;
    } catch (error) {
      span.recordException(error as Error);

      span.setStatus({
        code: SpanStatusCode.ERROR,
      });

      throw error;
    } finally {
      span.end();
    }
  });
}