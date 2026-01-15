# API Client Creation Instructions

## ⚠️ MANDATORY PRE-REQUISITE ⚠️

**Failure to follow naming conventions will result in non-compliant code.**

## Overview
This document provides standardized instructions for creating API clients in Java projects using Quarkus framework. All API clients should follow the established patterns for consistency, maintainability, and testability.

## Directory Structure Rules

### 1. Auto-Detecting Base Package
Before creating API clients, identify your project's base package structure by:
1. Looking at existing Java files in `src/main/java/`
2. Finding the main application class or existing service classes
3. Using the package structure up to the main package name (e.g., if you have `src/main/java/com/company/myapp/service/SomeService.java`, your base package is `com.company.myapp`)

**Common patterns:**
- `com.company.project` → `{base_package}` = `com.company.project`
- `org.example.app` → `{base_package}` = `org.example.app`
- `io.github.username.projectname` → `{base_package}` = `io.github.username.projectname`

### 2. Backend Client Location
All API clients must be placed inside the `backends` folder following this structure:

```
{base_package_path}/backends/
└── {service_name}/
    ├── {ServiceName}APIClient.java
    ├── {ServiceName}APIClientWrapper.java
    └── model/
        └── {endpoint_name}/
            ├── {ServiceName}API{EndpointName}Response.java
            └── {ServiceName}API{EndpointName}Request.java (if needed)
```

**Note:** `{base_package_path}` should be automatically detected from your existing project structure (e.g., `src/main/java/com/company/project` or `src/main/java/org/example/app`).

**Example:** For a ProductAPI client:
- Location: `{base_package_path}/backends/product/ProductAPIClient.java`
- Wrapper: `{base_package_path}/backends/product/ProductAPIClientWrapper.java`
- Models: `{base_package_path}/backends/product/model/getproduct/ProductAPIGetProductResponse.java`

## Implementation Components

### 1. API Client Interface (`{ServiceName}APIClient.java`)

**Purpose:** Defines the contract for external API communication using Quarkus REST Client.

**Template:**
```java
package {base_package}.backends.{service_name};

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import {base_package}.backends.{service_name}.model.{endpoint_name}.{ServiceName}API{EndpointName}Response;
import io.quarkus.oidc.client.filter.OidcClientFilter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@RegisterRestClient(configKey = "{service-name}-api")
@OidcClientFilter("default-oidc-filter")
public interface {ServiceName}APIClient {

    @GET
    @Path("/{endpoint}")
    @Produces(MediaType.APPLICATION_JSON)
    public {ServiceName}API{EndpointName}Response {methodName}(@PathParam("param") {ParamType} param);

    @POST
    @Path("/{endpoint}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public {ServiceName}API{EndpointName}Response {methodName}({ServiceName}API{EndpointName}Request request);
}
```

**Key Annotations:**
- `@RegisterRestClient(configKey = "{service-name}-api")`: Links to configuration properties
- `@OidcClientFilter("default-oidc-filter")`: Enables OAuth2 authentication for service-to-service calls
- Standard JAX-RS annotations for HTTP methods and paths

### 2. API Client Wrapper (`{ServiceName}APIClientWrapper.java`)

**Purpose:** Provides error handling, null safety, and business logic around the raw REST client.

**Template:**
```java
package {base_package}.backends.{service_name};

import org.eclipse.microprofile.rest.client.inject.RestClient;
import {base_package}.backends.{service_name}.model.{endpoint_name}.{ServiceName}API{EndpointName}Response;
import jakarta.annotation.Nullable;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class {ServiceName}APIClientWrapper {

    private {ServiceName}APIClient client;

    @Inject
    public {ServiceName}APIClientWrapper(@RestClient {ServiceName}APIClient client) {
        this.client = client;
    }

    public @Nullable {ServiceName}API{EndpointName}Response {methodName}({ParamType} param) {
        try {
            return client.{methodName}(param);
        } catch (WebApplicationException ex) {
            throw ex;
        }
    }
}
```

**Key Features:**
- `@ApplicationScoped`: CDI managed bean
- Constructor injection with `@RestClient`
- Graceful handling of HTTP 404 responses
- Proper exception propagation for other errors

### 3. Response Models (`{ServiceName}API{EndpointName}Response.java`)

**Purpose:** Data Transfer Objects (DTOs) for API responses with proper JSON mapping.

**Template:**
```java
package {base_package}.backends.{service_name}.model.{endpoint_name};

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class {ServiceName}API{EndpointName}Response {
    
    @JsonProperty("field_name")
    private String fieldName;
    
    @JsonProperty("numeric_field")
    private BigDecimal numericField;
    
    @JsonProperty("collection_field")
    private List<{NestedObjectType}> collectionField = new ArrayList<>();
}
```

**Key Features:**
- Lombok annotations for getters/setters
- `@JsonProperty` for proper JSON field mapping
- Initialize collections to avoid null pointer exceptions
- Use appropriate Java types (BigDecimal for money, Long for IDs, etc.)

## Configuration Setup

### 1. Application Properties
Add configuration for each new API client in `application.properties`:

```properties
# {ServiceName} API Configuration
quarkus.rest-client.{service-name}-api.url=${SERVICE_NAME_API_URL}
```

**Environment Variables:**
- `SERVICE_NAME_API_URL`: The base URL of the external API

### 2. Authentication Configuration
The OIDC client filter configuration is already set up globally:

```properties
# Internal Services OIDC Client Configuration (already exists)
quarkus.oidc-client.default-oidc-filter.auth-server-url=${AUTH_SERVER_URL}
quarkus.oidc-client.default-oidc-filter.client-id=${SERVICES_AUTH_CLIENT_ID}
quarkus.oidc-client.default-oidc-filter.credentials.secret=${SERVICES_AUTH_CLIENT_SECRET}
quarkus.oidc-client.default-oidc-filter.grant.type=client
```

## Required Dependencies

Ensure these dependencies are present in your `pom.xml`:

```xml
<!-- REST Client -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client-jackson</artifactId>
</dependency>

<!-- OIDC Client for service-to-service authentication -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc-client-filter</artifactId>
</dependency>

<!-- Jackson for JSON processing -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-jackson</artifactId>
</dependency>

<!-- Lombok for boilerplate code reduction -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>
```

## Naming Conventions

### Files and Classes
- **Interface:** `{ServiceName}APIClient` (e.g., `ProductAPIClient`, `StockAPIClient`)
- **Wrapper:** `{ServiceName}APIClientWrapper` (e.g., `ProductAPIClientWrapper`)
- **Response Models:** `{ServiceName}API{EndpointName}Response` (e.g., `ProductAPIGetProductResponse`)
- **Request Models:** `{ServiceName}API{EndpointName}Request` (e.g., `ProductAPICreateProductRequest`)

### Packages
- **Base Package:** `{base_package}.backends.{service_name}`
- **Models Package:** `{base_package}.backends.{service_name}.model.{endpoint_name}`

### Configuration Keys
- **Config Key:** `{service-name}-api` (lowercase with hyphens)
- **Environment Variables:** `{SERVICE_NAME}_API_URL` (uppercase with underscores)

## Best Practices

### 1. Error Handling
- Always handle 404 responses gracefully in the wrapper
- Use `@Nullable` return types when appropriate
- Propagate other exceptions for proper error handling upstream

### 2. Security
- Always use `@OidcClientFilter("default-oidc-filter")` for service-to-service calls
- Never hardcode authentication credentials
- Use environment variables for all configuration

### 3. Documentation
- Add JavaDoc comments for public methods
- Document expected HTTP status codes
- Include examples of request/response payloads in comments
