import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core"
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web"
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web"
import { Resource } from "@opentelemetry/resources"
import { SEMRESATTRS_OS_NAME, SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

import { useEffect, useState } from "react"

import { Platform } from "react-native"

const Tracer = async () => {
  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "rn-otel-test",
    [SEMRESATTRS_OS_NAME]: Platform.OS,
  })
  const provider = new WebTracerProvider({ resource })

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `http://localhost:4318/v1/traces`,
      }),
      {
        scheduledDelayMillis: 500,
      },
    ),
  )

  // Helpful for debugging
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))

  provider.register({
    propagator: new CompositePropagator({
      propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
    }),
  })

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-user-interaction": { enabled: false },
        "@opentelemetry/instrumentation-document-load": { enabled: false },
        "@opentelemetry/instrumentation-fetch": {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: false,
        },
      }),
    ],
  })
}

export interface TracerResult {
  loaded: boolean
}

export const useTracer = (): TracerResult => {
  const [loaded, setLoaded] = useState<boolean>(false)

  useEffect(() => {
    console.log("Loaded ->", loaded)
    if (!loaded) {
      Tracer()
        .catch(() => console.warn("failed to setup tracer"))
        .finally(() => setLoaded(true))
    }
  }, [loaded])

  return {
    loaded,
  }
}
