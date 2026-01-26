---
name: project_default_configuration
description: Guidelines for setting up default configurations in Java Quarkus projects, covering essential settings, environment configurations, and best practices to ensure optimal performance and maintainability.
---

# Default Configurations for Java Quarkus Projects

This document defines the mandatory default configurations that **MUST** be present in every Java Quarkus project. These configurations ensure consistency, observability, and adherence to best practices across all projects.

---

## 1. Java Version (MANDATORY)

Every Java Quarkus project **MUST** target Java 21 as the minimum Java version.

### Requirements
- **Source Compatibility**: Java 21
- **Target Compatibility**: Java 21
- **Maven/Gradle Configuration**: Must specify Java 21 in build configuration
- **Runtime**: Applications must run on Java 21 or higher

### Maven Configuration Example
```xml
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <maven.compiler.release>21</maven.compiler.release>
</properties>
```

### Gradle Configuration Example
```gradle
java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}
```

---

## 2. OpenTelemetry Configuration (MANDATORY)

Every Java Quarkus project **MUST** have OpenTelemetry configured for distributed tracing, metrics, and logging.

### Implementation
Use the `setup_open_telemetry_java_quarkus` tool to implement the complete OpenTelemetry configuration for the project. This tool provides all necessary guidelines.

---

## 3. OpenAPI (Swagger) Configuration (MANDATORY)

Every Java Quarkus project **MUST** have OpenAPI (Swagger) configured for API documentation.

### Implementation
Use the `setup_swagger` tool to implement the complete OpenAPI/Swagger configuration for the project. This tool provides all necessary guidelines and setup instructions.

---

## 4. Health Checks Configuration (MANDATORY)

Every Java Quarkus project **MUST** have health checks configured for monitoring and container orchestration (Kubernetes/Docker).

### Implementation
Use the `setup_healthcheck` tool to implement the complete health check configuration for the project. This tool provides all necessary guidelines.

### Requirements
- **Liveness Probe**: Mandatory - indicates if the application is running
- **Readiness Probe**: Mandatory - indicates if the application is ready to handle requests
- **Startup Probe**: Optional - useful for slow-starting applications

### Endpoints
- `/q/health` - All health checks
- `/q/health/live` - Liveness only
- `/q/health/ready` - Readiness only
- `/q/health/started` - Startup only (if implemented)

---

## 5. Docker Configuration (MANDATORY)

Every Java Quarkus project **MUST** have Docker configuration for containerization and deployment.

### Implementation
Use the `setup_dockerfile` tool to implement the complete Docker configuration for the project. This tool provides all necessary guidelines and Dockerfile setup instructions.

### Requirements
- **Dockerfile**: Mandatory - defines the container image build process
- **Multi-stage build**: Recommended - optimizes image size and security
- **Base image**: Use official Quarkus base images or approved enterprise images
- **.dockerignore**: Mandatory - excludes unnecessary files from the build context

---

---

## Implementation Guidelines

When creating or updating a Java Quarkus project, ensure:

1. **Verify all mandatory configurations are present** before considering the project complete
2. **Use the referenced tools** (`setup_open_telemetry`, etc.) for detailed implementation instructions
3. **Follow naming conventions** as defined in the project structure guidelines
4. **Test the configurations** in a development environment before deploying to production
5. **Document any project-specific customizations** while maintaining the mandatory baseline

---

## Validation

Before marking a project as complete, validate that:
- All mandatory configurations are implemented
- Configuration files are properly formatted and error-free
- Environment variables are documented in the project README
- Deployment manifests include all required components
- The application successfully starts with all configurations enabled
- Health check endpoints are accessible and returning expected responses (`/q/health/live` and `/q/health/ready`)

---

**Note**: This is a living document. As new mandatory configurations are identified, they should be added to this specification and all projects must be updated accordingly.
