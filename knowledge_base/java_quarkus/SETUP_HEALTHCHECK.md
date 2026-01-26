---
name: setup_healthcheck
description: Detailed guidelines for setting up health checks in Java Quarkus projects, including configuration, implementation, and best practices for monitoring application health.
---

# Health Check Implementation Guide for Java Quarkus

## Overview
Health checks are essential for monitoring the status of your application in containerized and cloud environments. Quarkus uses the MicroProfile Health specification to provide standardized health check endpoints.

## Types of Health Checks

### 1. **Liveness Probe** (`@Liveness`)
- Indicates if the application is running
- Used by Kubernetes to determine if a container should be restarted
- Should only fail if the application is in an unrecoverable state
- Default endpoint: `/q/health/live`

### 2. **Readiness Probe** (`@Readiness`)
- Indicates if the application is ready to handle requests
- Used by Kubernetes to determine if traffic should be routed to the container
- Should check dependencies like databases, external services, etc.
- Default endpoint: `/q/health/ready`

### 3. **Startup Probe** (`@Startup`)
- Indicates if the application has started successfully
- Used during initialization phase
- Default endpoint: `/q/health/started`

## Required Dependency

Add the following dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-health</artifactId>
</dependency>
```

## Project Structure

Health checks should be organized in the infrastructure layer:

```
src/
└── main/
    └── java/
        └── your/company/{project-name}/
            └── infrastructure/
                └── healthcheck/
                    ├── LivenessHealthCheck.java
                    ├── ReadinessHealthCheck.java
                    └── StartupHealthCheck.java (optional)
```

## Implementation Guidelines

### 1. Liveness Health Check

The liveness check should be simple and fast, only verifying that the application is running.

```java
package your.company.{project-name}.infrastructure.healthcheck;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Liveness;

import jakarta.enterprise.context.ApplicationScoped;

@Liveness
@ApplicationScoped
public class LivenessHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.named("Liveness Check")
                .up()
                .build();
    }
}
```

**Key Points:**
- Annotate with `@Liveness`
- Use `@ApplicationScoped` for proper CDI management
- Keep the logic simple and fast
- Return `.up()` unless the application is in an unrecoverable state

### 2. Readiness Health Check

The readiness check should verify that all dependencies are available and the application can handle requests.

```java
package your.company.{project-name}.infrastructure.healthcheck;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Readiness;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@Readiness
@ApplicationScoped
public class ReadinessHealthCheck implements HealthCheck {

    @Inject
    DataSource dataSource;

    @Override
    public HealthCheckResponse call() {
        HealthCheckResponseBuilder responseBuilder = HealthCheckResponse.named("Readiness Check");

        try {
            // Check database connection
            checkDatabaseConnection();
            
            // Check external services
            checkExternalServices();
            
            // All checks passed
            return responseBuilder
                    .up()
                    .withData("database", "available")
                    .withData("external-services", "available")
                    .build();
                    
        } catch (Exception e) {
            return responseBuilder
                    .down()
                    .withData("error", e.getMessage())
                    .build();
        }
    }

    private void checkDatabaseConnection() throws Exception {
        // Example: Simple database connectivity check
        try (var connection = dataSource.getConnection()) {
            connection.prepareStatement("SELECT 1").execute();
        }
    }

    private void checkExternalServices() throws Exception {
        // Example: Check external API availability
        // Implement your specific checks here
    }
}
```

**Key Points:**
- Annotate with `@Readiness`
- Check all critical dependencies (databases, caches, external APIs)
- Use `.withData()` to provide additional diagnostic information
- Return `.down()` if any critical dependency is unavailable
- Keep timeout low to avoid blocking health check requests

### 3. Startup Health Check (Optional)

Use for slow-starting applications that need more time during initialization.

```java
package your.company.{project-name}.infrastructure.healthcheck;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Startup;

import jakarta.enterprise.context.ApplicationScoped;

@Startup
@ApplicationScoped
public class StartupHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.named("Startup Check")
                .up()
                .withData("initialization", "completed")
                .build();
    }
}
```

## Best Practices

### 1. **Keep Liveness Checks Simple**
- Don't check external dependencies in liveness probes
- Avoid heavy computations
- Only fail if the application needs to be restarted

### 2. **Make Readiness Checks Comprehensive**
- Check all critical dependencies
- Include database connectivity
- Verify external service availability
- Check cache connectivity (Redis, etc.)

### 3. **Set Appropriate Timeouts**
- Health checks should complete quickly (< 5 seconds)
- Use connection timeouts for external checks
- Fail fast if a dependency is unavailable

### 4. **Provide Diagnostic Information**
- Use `.withData()` to include helpful metadata
- Add timestamps, versions, or status details
- Help troubleshooting without exposing sensitive data

### 5. **Test Health Checks**
- Verify both success and failure scenarios
- Ensure checks don't cause performance issues
- Test in containerized environments

## Health Check Endpoints

Once implemented, Quarkus automatically exposes these endpoints:

- **All Health Checks**: `GET /q/health`
- **Liveness Only**: `GET /q/health/live`
- **Readiness Only**: `GET /q/health/ready`
- **Startup Only**: `GET /q/health/started`

### Response Format

```json
{
    "status": "UP",
    "checks": [
        {
            "name": "Liveness Check",
            "status": "UP"
        },
        {
            "name": "Readiness Check",
            "status": "UP",
            "data": {
                "database": "available",
                "external-services": "available"
            }
        }
    ]
}
```

## Configuration Options

Add to `application.properties` for customization:

```properties
# Enable/disable health checks
quarkus.health.enabled=true

# Custom health check path (default: /q/health)
quarkus.smallrye-health.root-path=/health

# Include/exclude built-in checks
quarkus.smallrye-health.check."io.quarkus.example.HealthCheck".enabled=true
```

## Kubernetes Integration

Example Kubernetes deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quarkus-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: quarkus-app:latest
        livenessProbe:
          httpGet:
            path: /q/health/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /q/health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /q/health/started
            port: 8080
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
```

## Testing Health Checks

### Local Testing

```bash
# Test all health checks
curl http://localhost:8080/q/health

# Test liveness
curl http://localhost:8080/q/health/live

# Test readiness
curl http://localhost:8080/q/health/ready

# Pretty print JSON
curl http://localhost:8080/q/health | jq .
```

### Unit Testing Example

```java
@QuarkusTest
class HealthCheckTest {

    @Test
    void testLivenessHealthCheck() {
        given()
            .when().get("/q/health/live")
            .then()
            .statusCode(200)
            .body("status", is("UP"));
    }

    @Test
    void testReadinessHealthCheck() {
        given()
            .when().get("/q/health/ready")
            .then()
            .statusCode(200)
            .body("status", is("UP"))
            .body("checks[0].name", is("Readiness Check"));
    }
}
```

## Common Scenarios

### Database Health Check

```java
@Inject
DataSource dataSource;

private void checkDatabase() throws Exception {
    try (var connection = dataSource.getConnection();
         var stmt = connection.prepareStatement("SELECT 1")) {
        stmt.setQueryTimeout(3);
        stmt.execute();
    }
}
```

### Redis Cache Health Check

```java
@Inject
RedisClient redisClient;

private void checkRedis() {
    try {
        redisClient.ping();
    } catch (Exception e) {
        throw new RuntimeException("Redis unavailable", e);
    }
}
```

### External API Health Check

```java
@RestClient
ExternalApiClient apiClient;

private void checkExternalApi() {
    try {
        Response response = apiClient.healthCheck();
        if (response.getStatus() != 200) {
            throw new RuntimeException("External API unhealthy");
        }
    } catch (Exception e) {
        throw new RuntimeException("External API unavailable", e);
    }
}
```

## Troubleshooting

### Health Check Returns 503
- Check if any health check is failing
- Review logs for exceptions
- Verify database/external service connectivity

### Health Check Timeout
- Reduce check complexity
- Add timeouts to dependency checks
- Consider making checks async

### False Positives
- Review readiness check logic
- Ensure checks accurately reflect application state
- Add more granular dependency checks

## References

- [Quarkus SmallRye Health Guide](https://quarkus.io/guides/smallrye-health)
- [MicroProfile Health Specification](https://github.com/eclipse/microprofile-health)
- [Kubernetes Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
