---
name: setup_swagger
description: Detailed guidelines for setting up Swagger in Java Quarkus projects, including configuration, customization, and best practices for API documentation.
---

# Swagger/OpenAPI Implementation for Java Quarkus Applications

This guide provides comprehensive instructions for implementing Swagger/OpenAPI documentation in Java Quarkus applications using SmallRye OpenAPI.

---

## Overview

Swagger (OpenAPI) provides interactive API documentation that allows developers to explore and test API endpoints directly from a web interface. Quarkus uses the SmallRye OpenAPI extension to automatically generate OpenAPI specifications from your REST endpoints.

---

## Implementation Steps

### 1. Add Maven Dependency

Add the SmallRye OpenAPI dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-openapi</artifactId>
</dependency>
```

### 2. Configure OpenAPI Settings

Add the following configuration to your `application.properties` file:

```properties
# OpenAPI/Swagger Configuration
quarkus.smallrye-openapi.info-title=Your App Name
quarkus.smallrye-openapi.info-version=1.0.0
quarkus.smallrye-openapi.info-description=Your App Description
quarkus.smallrye-openapi.enable=true
```

**Configuration Parameters:**
- `quarkus.smallrye-openapi.info-title` - The title of your API (should match your application name)
- `quarkus.smallrye-openapi.info-version` - The version of your API
- `quarkus.smallrye-openapi.info-description` - A brief description of your API's purpose
- `quarkus.smallrye-openapi.enable` - Enable/disable OpenAPI documentation generation (set to `true`)

### 3. Customize for Your Application

When implementing Swagger for your specific application, update the configuration values:

```properties
# Example: Replace with your application details
quarkus.smallrye-openapi.info-title=your-application-name
quarkus.smallrye-openapi.info-version=1.0.0
quarkus.smallrye-openapi.info-description=Your API Description
quarkus.smallrye-openapi.enable=true
```

### 4. Annotate Your REST Endpoints (REQUIRED)

**Every endpoint MUST include comprehensive OpenAPI documentation** using `@Operation` and `@APIResponses` annotations. This ensures complete and accurate API documentation in Swagger UI.

**Required imports:**
```java
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import jakarta.ws.rs.core.MediaType;
```

**Optional import** (for grouping endpoints in Swagger UI):
```java
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
```

**Example with comprehensive documentation:**

```java
@Path("/api/example")
@Tag(name = "Example", description = "Example operations") // Optional - groups endpoints in Swagger UI
public class ExampleResource {

    @Operation(
        summary = "Get item by ID",
        description = "Retrieves a specific item by its identifier"
    )
    @APIResponses(value = {
        @APIResponse(
            responseCode = "200",
            description = "Success",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ExampleDTO.class)
            )
        ),
        @APIResponse(
            responseCode = "400",
            description = "Bad Request - Invalid input parameters",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        ),
        @APIResponse(
            responseCode = "404",
            description = "Not Found - Resource does not exist",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        ),
        @APIResponse(
            responseCode = "500",
            description = "Internal Server Error",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        )
    })
    @GET
    @Path("/{id}")
    public RestResponse<ExampleDTO> getById(@PathParam("id") Long id) {
        // Implementation
    }
}
```

**Note**: For complete Resource layer implementation guidelines, including all required annotations and patterns, refer to the `resource_layer_instructions_definition` tool.

---

## Accessing the Documentation

Once configured, your API documentation will be available at the following endpoints:

### Development Mode
- **Swagger UI**: `http://localhost:8080/q/swagger-ui`
- **OpenAPI Specification**: `http://localhost:8080/q/openapi`

### Production Mode
- **OpenAPI Specification**: `http://your-domain/q/openapi`
- Note: Swagger UI is disabled by default in production for security reasons

---

## Additional Configuration Options

### Enable Swagger UI in Production (Not Recommended)
```properties
quarkus.swagger-ui.always-include=true
```

### Custom Swagger UI Path
```properties
quarkus.swagger-ui.path=/custom-swagger-ui
```

### Add Contact Information
```properties
quarkus.smallrye-openapi.info-contact-name=Your Team Name
quarkus.smallrye-openapi.info-contact-email=team@example.com
quarkus.smallrye-openapi.info-contact-url=https://example.com
```

### Add License Information
```properties
quarkus.smallrye-openapi.info-license-name=Apache 2.0
quarkus.smallrye-openapi.info-license-url=https://www.apache.org/licenses/LICENSE-2.0.html
```

---

## Best Practices

1. **Always enable OpenAPI** in development and testing environments
2. **Use descriptive titles and descriptions** that accurately represent your API
3. **Document ALL endpoints** with `@Operation` and comprehensive `@APIResponses` annotations (REQUIRED)
4. **Include all relevant HTTP status codes** in `@APIResponses` (200, 400, 404, 500, etc.)
5. **Version your API** consistently using semantic versioning
6. **Document request/response models** using `@Schema` annotations on DTOs
7. **Use `@Tag` annotation** (optional) to organize endpoints into logical groups in Swagger UI
8. **Keep Swagger UI disabled in production** unless required for public APIs
9. **Update the version number** when making breaking changes to your API

---

## Verification

After implementation, verify that:
- [ ] Maven dependency added to `pom.xml`
- [ ] Configuration properties added to `application.properties`
- [ ] Application name, version, and description are correctly set
- [ ] Application builds successfully
- [ ] Swagger UI is accessible at `/q/swagger-ui` in development mode
- [ ] OpenAPI specification is generated at `/q/openapi`
- [ ] All REST endpoints are visible in the Swagger UI

---

## Troubleshooting

**Issue**: Swagger UI not loading
- Verify the dependency is correctly added
- Check that `quarkus.smallrye-openapi.enable=true`
- Ensure you're running in development mode or have enabled Swagger UI for production

**Issue**: Endpoints not showing in documentation
- Verify your REST resources have proper JAX-RS annotations (`@Path`, `@GET`, `@POST`, etc.)
- Check that the resources are in a package scanned by Quarkus

**Issue**: Incorrect API information displayed
- Double-check the configuration properties in `application.properties`
- Restart the application after making configuration changes
