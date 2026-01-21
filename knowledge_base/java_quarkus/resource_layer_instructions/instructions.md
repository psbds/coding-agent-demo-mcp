# REST Endpoints Resource Creation Guide

This guide provides detailed instructions on how to create Resource files following a standard architectural pattern for Quarkus projects.

## Overview

**Resource** files are responsible for exposing REST endpoints of the application. They act as the presentation/controller layer in the architectural pattern, delegating business logic to the **Services**.

## Directory Structure

Resources should be organized following this structure:

```
src/main/java/com/yourcompany/yourproject/resources/
├── {domain}/
│   ├── {DomainResource.java}
│   └── dto/
│       └── {operationname}/
│           ├── {DomainResource}{OperationName}Request.java  (if necessary)
│           └── {DomainResource}{OperationName}Response.java
```

### Structure Example

```
src/main/java/com/yourcompany/yourproject/resourcess/
├── simulation/
│   ├── SimulationResource.java
│   └── dto/
│       └── getparameterssimulation/
│           ├── SimulationResourceGetParametersResponse.java
│           └── SimulationResourceGetParametersParameterResponse.java
├── channel/
│   ├── ChannelResource.java
│   └── dto/
│       └── getparameterschannel/
│           └── ChannelResourceGetParametersChannelResponse.java
```

## Patterns and Conventions

### 1. Class Naming

- **Resource**: `{Domain}Resource.java`
  - Example: `SimulationResource`, `ChannelResource`, `ProductResource`
  
- **Response**: `{Domain}Resource{OperationName}Response.java`
  - Example: `SimulationResourceGetParametersResponse`, `ChannelResourceGetParametersChannelResponse`
  
- **Request**: `{Domain}Resource{OperationName}Request.java` (when necessary)
  - Example: `ProductResourceCreateProductRequest`

### 2. Basic Resource Structure

```java
package com.yourcompany.yourproject.resources.{domain};

import org.jboss.resteasy.reactive.RestResponse;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import com.yourcompany.yourproject.resources.{domain}.dto.{operation}.*;
import com.yourcompany.yourproject.services.{domain}.*;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class {Domain}Resource {

    @Inject
    {Operation}Service {operation}Service;

    // Endpoint methods here
}
```

### 3. Required Class Annotations

- `@Path("/v1")` - Defines the base path of the resource (API version)
- `@Produces(MediaType.APPLICATION_JSON)` - Defines that the resource produces JSON
- `@Consumes(MediaType.APPLICATION_JSON)` - Defines that the resource consumes JSON
- `@Authenticated` - Ensures that all endpoints require authentication

### 4. Required Endpoint Documentation

**Every endpoint MUST include comprehensive OpenAPI documentation** using `@Operation` and `@APIResponses` annotations for Swagger:

```java
@Operation(
    summary = "Brief summary of the operation",
    description = "Detailed description of what this endpoint does"
)
@APIResponses(value = {
    @APIResponse(
        responseCode = "200",
        description = "Success",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = YourResponseDto.class)
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
```

**Required imports for endpoint documentation:**

```java
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
```

### 5. Endpoint Patterns

#### Simple GET

```java
@Operation(
    summary = "Get parameters",
    description = "Retrieves parameters for the specified domain"
)
@APIResponses(value = {
    @APIResponse(
        responseCode = "200",
        description = "Success",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = {Domain}ResourceGetParametersResponse.class)
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
@Path("/parameters-{domain}")
public RestResponse<{Domain}ResourceGetParametersResponse> getParameters(
        @HeaderParam("no-cache") @DefaultValue("false") Boolean noCache) {
    var response = getParametersService.getParameters(noCache);
    return RestResponse.ok(response);
}
```

#### GET with Path Parameters

```java
@Operation(
    summary = "Get parameters by ID",
    description = "Retrieves parameters for a specific resource by its ID"
)
@APIResponses(value = {
    @APIResponse(
        responseCode = "200",
        description = "Success",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = {Domain}ResourceGetParametersResponse.class)
        )
    ),
    @APIResponse(
        responseCode = "404",
        description = "Not Found",
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
@Path("/parameters-{domain}/{id}")
public RestResponse<{Domain}ResourceGetParametersResponse> getParametersById(
        @PathParam("id") String id,
        @HeaderParam("no-cache") @DefaultValue("false") Boolean noCache) {
    var response = getParametersService.getParameters(id, noCache);
    return RestResponse.ok(response);
}
```

#### GET with Multiple Path Parameters

```java
@GET
@Path("/parameters-{domain}/{category}/{subcategory}")
public RestResponse<{Domain}ResourceGetParametersResponse> getParametersByCategoryAndSubcategory(
        @PathParam("category") String category,
        @PathParam("subcategory") String subcategory,
        @HeaderParam("no-cache") @DefaultValue("false") Boolean noCache) {
    var response = getParametersService.getParameters(category, subcategory, noCache);
    return RestResponse.ok(response);
}
```

#### POST with Request Body

```java
@Operation(
    summary = "Create new resource",
    description = "Creates a new resource in the system"
)
@APIResponses(value = {
    @APIResponse(
        responseCode = "201",
        description = "Created",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = {Domain}ResourceCreateResponse.class)
        )
    ),
    @APIResponse(
        responseCode = "400",
        description = "Bad Request - Invalid input",
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
@POST
@Path("/{domain}")
public RestResponse<{Domain}ResourceCreateResponse> create(
        {Domain}ResourceCreateRequest request) {
    var response = createService.create(request);
    return RestResponse.status(RestResponse.Status.CREATED, response);
}
```

#### PUT for Update

```java
@PUT
@Path("/{domain}/{id}")
public RestResponse<{Domain}ResourceUpdateResponse> update(
        @PathParam("id") String id,
        {Domain}ResourceUpdateRequest request) {
    var response = updateService.update(id, request);
    return RestResponse.ok(response);
}
```

#### DELETE

```java
@DELETE
@Path("/{domain}/{id}")
public RestResponse<Void> delete(@PathParam("id") String id) {
    deleteService.delete(id);
    return RestResponse.noContent();
}
```

### 6. Response Models Structure

```java
package com.yourcompany.yourproject.resources.{domain}.dto.{operation};

import com.fasterxml.jackson.annotation.JsonProperty;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@Schema(description = "Description of what the response represents")
public class {Domain}Resource{Operation}Response {

    @Schema(description = "Field description")
    @JsonProperty("fieldName")
    private String fieldName;

    @Schema(description = "List description")
    @JsonProperty("items")
    private List<{Domain}Resource{Operation}ItemResponse> items;
}
```

### 7. Request Models Structure

```java
package com.yourcompany.yourproject.resources.{domain}.dto.{operation};

import com.fasterxml.jackson.annotation.JsonProperty;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Description of what the request represents")
public class {Domain}Resource{Operation}Request {

    @NotNull(message = "Required field")
    @NotBlank(message = "Field cannot be empty")
    @Schema(description = "Field description", required = true)
    @JsonProperty("fieldName")
    private String fieldName;

    @Min(value = 1, message = "Minimum value is 1")
    @Max(value = 100, message = "Maximum value is 100")
    @Schema(description = "Numeric field description")
    @JsonProperty("numericValue")
    private Integer numericValue;
}
```

## Standard Headers

### no-cache Header

All GET endpoints must support the `no-cache` header for cache bypass:

```java
@HeaderParam("no-cache") @DefaultValue("false") Boolean noCache
```

This header allows the client to force fetching updated data, bypassing the cache.

## Dependency Injection

### Services

Inject the required services using `@Inject`:

```java
@Inject
GetParametersSimulationService getParametersSimulationService;

@Inject
CreateSimulationService createSimulationService;
```

### Injected Variable Naming

- Use **camelCase** starting with lowercase
- Keep the class name without duplicating the suffix
- ✅ `getParametersSimulationService`
- ❌ `getParametersSimulationServiceService`

## Response Types

### Success (200 OK)

```java
return RestResponse.ok(response);
```

### Created (201 Created)

```java
return RestResponse.status(RestResponse.Status.CREATED, response);
```

### No Content (204 No Content)

```java
return RestResponse.noContent();
```

### Custom Response

```java
return RestResponse.status(RestResponse.Status.ACCEPTED, response);
```

## Complete Example

### 1. Create the Main Resource

**File**: `src/main/java/com/yourcompany/yourproject/resources/product/ProductResource.java`

```java
package com.yourcompany.yourproject.resources.product;

import org.jboss.resteasy.reactive.RestResponse;

import com.yourcompany.yourproject.resources.product.dto.getproduct.ProductResourceGetProductResponse;
import com.yourcompany.yourproject.resources.product.dto.createproduct.ProductResourceCreateProductRequest;
import com.yourcompany.yourproject.resources.product.dto.createproduct.ProductResourceCreateProductResponse;
import com.yourcompany.yourproject.services.product.GetProductService;
import com.yourcompany.yourproject.services.product.CreateProductService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class ProductResource {

    @Inject
    GetProductService getProductService;

    @Inject
    CreateProductService createProductService;

    @GET
    @Path("/products/{id}")
    public RestResponse<ProductResourceGetProductResponse> getProduct(
            @PathParam("id") String id,
            @HeaderParam("no-cache") @DefaultValue("false") Boolean noCache) {
        var response = getProductService.getProduct(id, noCache);
        return RestResponse.ok(response);
    }

    @POST
    @Path("/products")
    public RestResponse<ProductResourceCreateProductResponse> createProduct(
            ProductResourceCreateProductRequest request) {
        var response = createProductService.create(request);
        return RestResponse.status(RestResponse.Status.CREATED, response);
    }
}
```

### 2. Create the Response Model

**File**: `src/main/java/com/yourcompany/yourproject/resources/product/dto/getproduct/ProductResourceGetProductResponse.java`

```java
package com.yourcompany.yourproject.resources.product.dto.getproduct;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Represents product data")
public class ProductResourceGetProductResponse {

    @Schema(description = "Unique product identifier")
    @JsonProperty("id")
    private String id;

    @Schema(description = "Product name")
    @JsonProperty("name")
    private String name;

    @Schema(description = "Product description")
    @JsonProperty("description")
    private String description;

    @Schema(description = "Product price in cents")
    @JsonProperty("price")
    private Integer price;

    @Schema(description = "Indicates if the product is active")
    @JsonProperty("active")
    private Boolean active;
}
```

### 3. Create the Request Model

**File**: `src/main/java/com/yourcompany/yourproject/resources/product/dto/createproduct/ProductResourceCreateProductRequest.java`

```java
package com.yourcompany.yourproject.resources.product.dto.createproduct;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to create a product")
public class ProductResourceCreateProductRequest {

    @NotNull(message = "Name is required")
    @NotBlank(message = "Name cannot be empty")
    @Schema(description = "Product name", required = true)
    @JsonProperty("name")
    private String name;

    @Schema(description = "Product description")
    @JsonProperty("description")
    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than or equal to zero")
    @Schema(description = "Product price in cents", required = true)
    @JsonProperty("price")
    private Integer price;
}
```

## Creation Checklist

When creating a new Resource, make sure to:

- [ ] Create the domain directory in `resources/`
- [ ] Create the main Resource class with the correct annotations
- [ ] Add `@Operation` and `@APIResponses` documentation to all endpoints
- [ ] Create the `dto/` subdirectory inside the domain
- [ ] Create subdirectories for each operation (e.g., `getproduct/`, `createproduct/`)
- [ ] Create Response classes with `@Schema` and `@JsonProperty` annotations
- [ ] Create Request classes (if necessary) with appropriate validations
- [ ] Inject the required Services with `@Inject`
- [ ] Use `var` for local variable declarations
- [ ] Include support for the `no-cache` header in GET endpoints
- [ ] Document all fields with `@Schema(description = "...")`
- [ ] Return appropriate `RestResponse` types
- [ ] Follow the standardized package structure

## Best Practices

### 1. Delegation to Services

The Resource **should not** contain business logic. All logic should be delegated to Services:

```java
// ✅ Correct - delegates to the service
@GET
@Path("/products/{id}")
public RestResponse<ProductResourceGetProductResponse> getProduct(
        @PathParam("id") String id,
        @HeaderParam("no-cache") @DefaultValue("false") Boolean noCache) {
    var response = getProductService.getProduct(id, noCache);
    return RestResponse.ok(response);
}

// ❌ Incorrect - contains business logic
@GET
@Path("/products/{id}")
public RestResponse<ProductResourceGetProductResponse> getProduct(
        @PathParam("id") String id) {
    var product = repository.findById(id);
    if (product == null) {
        throw new NotFoundException();
    }
    var response = mapper.toResponse(product);
    return RestResponse.ok(response);
}
```

### 2. Use of `var` for Local Variables

Use `var` for local variable declarations when the type is obvious:

```java
var response = getProductService.getProduct(id, noCache);
return RestResponse.ok(response);
```

### 3. Input Validation

Use Bean Validation annotations in Request models:

```java
@NotNull(message = "Required field")
@NotBlank(message = "Field cannot be empty")
@Size(min = 3, max = 100, message = "Must be between 3 and 100 characters")
@Pattern(regexp = "^[A-Z]+$", message = "Must contain only uppercase letters")
@Email(message = "Invalid email")
@Min(value = 0, message = "Minimum value is 0")
@Max(value = 100, message = "Maximum value is 100")
```

### 4. OpenAPI Documentation

Document all endpoints and models using OpenAPI annotations:

```java
@Schema(description = "Clear description of what this field represents")
@JsonProperty("fieldName")
private String fieldName;
```

**Important**: Every endpoint must include `@Operation` and `@APIResponses` annotations as shown in section 4 (Required Endpoint Documentation).

### 5. Imports Organization

Organize imports in the following order:
1. Standard Java library imports (`java.*`, `jakarta.*`)
2. Third-party library imports
3. Project imports (your project's base package)

## Troubleshooting

### Error: "Resource method matched but found no candidate"

**Cause**: Service not correctly injected or does not exist.

**Solution**: Verify that the Service is annotated with `@ApplicationScoped` or `@Singleton` and that the injection is correct.

### Error: "RESTEASY003210: Could not find resource for full path"

**Cause**: Endpoint path is incorrect or conflicting.

**Solution**: Check if the `@Path` is correct and does not conflict with other Resources.

### Error: "No message body writer for type"

**Cause**: The return type cannot be serialized to JSON.

**Solution**: Ensure that the Response class has getters/setters or use Lombok (`@Getter`, `@Setter`).

## References

- [Quarkus REST (JAX-RS) Guide](https://quarkus.io/guides/rest-json)
- [JAX-RS Annotations Reference](https://docs.oracle.com/javaee/7/api/javax/ws/rs/package-summary.html)
- [Bean Validation Constraints](https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html)
- [OpenAPI Annotations](https://github.com/eclipse/microprofile-open-api/blob/master/spec/src/main/asciidoc/microprofile-openapi-spec.adoc)

## Existing Project Examples

Refer to similar files in your project as reference:

- `src/main/java/com/yourcompany/yourproject/resources/simulation/SimulationResource.java`
- `src/main/java/com/yourcompany/yourproject/resources/channel/ChannelResource.java`

**Note**: Adapt the package names and paths to match your project's structure and naming conventions.

---

**Last Updated**: January 2026
**Version**: 1.0
