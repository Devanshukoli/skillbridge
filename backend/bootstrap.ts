import { sdk } from "./observability/instrumentation";

try {
  await sdk.start();
  console.log("[OpenTelemetry] SDK started");

  await import("./server");
} catch (error) {
  console.error("[OpenTelemetry] Failed to start SDK", error);
}

process.on("SIGTERM", async () => {
  await sdk.shutdown();
  console.log("[OpenTelemetry] SDK shut down");
});