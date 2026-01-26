---
name: setup_open_telemetry_java_quarkus
description: For Java Quarkus, get comprehensive guidelines and best practices for setting up Open Telemetry in Java projects, including configuration, instrumentation, and monitoring.
---

# Action

Use this step-by-step guide to configure OpenTelemetry in a Java Quarkus project

## OpenTelemetry Setup for Quarkus Projects

This file contains the complete guide to set up OpenTelemetry observability (traces, metrics, and logs) in a Quarkus application with proper instrumentation and configuration.

## Prerequisites

- Quarkus project already initialized
- Access to an OpenTelemetry Collector endpoint (e.g., Azure Application Insights, Jaeger, or custom OTLP endpoint)
- Maven or Gradle build tool configured

## Step 1: Add Dependencies

Add the following dependencies to your `pom.xml`:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-extension-trace-propagators</artifactId>
</dependency>
```

### What these dependencies provide:

- **quarkus-opentelemetry**: Core Quarkus extension for OpenTelemetry integration (traces, metrics, logs)
- **opentelemetry-extension-trace-propagators**: Additional trace context propagation formats (W3C Trace Context, B3, etc.)

## Step 2: Configure application.properties

Add the following OpenTelemetry configuration to your `src/main/resources/application.properties`:

```properties
# OpenTelemetry Configuration
quarkus.otel.exporter.otlp.endpoint=${OTEL_EXPORTER_HOST:http://otel-lgtm:4317}
quarkus.application.name=your-application-name
quarkus.otel.metrics.enabled=true
quarkus.otel.logs.enabled=true
quarkus.otel.instrument.resteasy-client=true
quarkus.otel.instrument.rest=true
quarkus.otel.instrument.resteasy=true
quarkus.otel.propagators=ottrace
quarkus.log.level=${OTEL_LOG_LEVEL:INFO}
quarkus.otel.traces.sampler.arg=${OTEL_SAMPLING:1.0}
quarkus.otel.resource.attributes=service.name=${OTEL_SERVICE_NAME:your-application-name-app}
```

### Configuration Properties Explained:

| Property | Description | Example Value |
|----------|-------------|---------------|
| `quarkus.otel.exporter.otlp.endpoint` | OTLP collector endpoint URL | `http://localhost:4317` or `https://your-collector.com` |
| `quarkus.application.name` | Application name for identification | `silce-parametros-gestao` |
| `quarkus.otel.metrics.enabled` | Enable metrics collection | `true` |
| `quarkus.otel.logs.enabled` | Enable logs export to OTLP | `true` |
| `quarkus.otel.instrument.resteasy-client` | Auto-instrument REST client calls | `true` |
| `quarkus.otel.instrument.rest` | Auto-instrument JAX-RS endpoints | `true` |
| `quarkus.otel.instrument.resteasy` | Auto-instrument RESTEasy | `true` |
| `quarkus.otel.propagators` | Trace context propagation format | `ottrace`, `tracecontext`, `b3` |
| `quarkus.log.level` | Application log level | `INFO`, `DEBUG`, `WARN` |
| `quarkus.otel.traces.sampler.arg` | Trace sampling ratio (0.0 to 1.0) | `1.0` (100% sampling) |
| `quarkus.otel.resource.attributes` | Additional resource attributes | `service.name=my-app,environment=prod` |

## Step 3: Set Environment Variables

Create or update your `.env` file with the required environment variables:

```bash
# OpenTelemetry Exporter Configuration
OTEL_EXPORTER_HOST=http://localhost:4317

# Optional: Override log level
OTEL_LOG_LEVEL=INFO

# Optional: Sampling rate (1.0 = 100%, 0.1 = 10%)
OTEL_SAMPLING=1.0

# Optional: Custom service name
OTEL_SERVICE_NAME=your-application-name-app
```

### Environment-Specific Configuration

For production, create `application-prod.properties`:

```properties
# Production-specific OTEL settings
quarkus.otel.traces.sampler.arg=${OTEL_SAMPLING:0.1}
quarkus.log.level=${OTEL_LOG_LEVEL:WARN}
```

For testing, create `application-test.properties`:

```properties
# Test-specific OTEL settings (usually disabled)
quarkus.otel.metrics.enabled=false
quarkus.otel.logs.enabled=false
```

## Step 4: Verify Installation

After adding dependencies and configuration, verify the setup:

### 1. Build the project
```bash
mvn clean compile
```

### 2. Run in dev mode
```bash
mvn quarkus:dev
```

### 3. Check startup logs
Look for OpenTelemetry initialization messages:
```
INFO  [io.quarkus] (main) Installed features: [..., opentelemetry, ...]
```

### 4. Test instrumentation
Make HTTP requests to your endpoints and verify traces are exported to your OTLP collector.


## Validation Checklists

After setup, verify:

- [ ] Dependencies added to `pom.xml`
- [ ] Configuration added to `application.properties`
- [ ] Environment variables configured (`.env` or system environment)
- [ ] Application builds without errors
- [ ] Application starts successfully in dev mode
- [ ] OpenTelemetry feature listed in startup logs
- [ ] Traces visible in your OTLP collector/backend
- [ ] Metrics being exported (if using metrics backend)
- [ ] Logs being exported (if using logs backend)
- [ ] REST endpoints automatically instrumented
- [ ] REST client calls automatically traced
