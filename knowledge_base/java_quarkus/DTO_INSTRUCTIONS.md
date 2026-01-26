---
name: dto_creation_guidelines
description: Comprehensive guidelines and best practices for creating Data Transfer Objects (DTOs) in Java Quarkus projects, including JSON property annotations, validation, and Lombok integration.
---

# Java Quarkus DTO Creation Guidelines

## Overview
Data Transfer Objects (DTOs) in Java Quarkus are simple classes used to transfer data between different layers of an application or between services. They should be lightweight, contain no business logic, and focus solely on data representation.

## Core Requirements

### 1. JSON Property Annotations
- **ALWAYS** use `@JsonProperty` annotation for all fields
- This ensures proper JSON serialization/deserialization
- Provides explicit control over field naming in JSON

### 2. No Business Logic
- DTOs should **NEVER** contain domain/business logic or complex operations
- Only contain data fields, validation annotations, and simple utility methods
- Allowed utility methods include:
  - Factory methods (e.g., `create()`, `of()`)
  - Conversion methods (e.g., `toEntity()`, `fromEntity()`)
  - Builder pattern methods
  - Simple validation or formatting helpers
- Keep complex business rules in service layers, not DTOs

### 3. Validation Annotations
- Use appropriate validation annotations when needed:
  - `@NotNull`, `@NotBlank`, `@NotEmpty`
  - `@Size`, `@Min`, `@Max`
  - `@Email`, `@Pattern`
  - `@Valid` for nested objects

## Lombok Integration

### When Lombok is Available
If the project uses Lombok, include these class-level annotations:

```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
```

### When Lombok is NOT Available
Manually implement:
- Default constructor
- Constructor with all parameters
- Getter and setter methods for all fields

## DTO Template Examples

### With Lombok
```java
package com.example.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("username")
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @JsonProperty("email")
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;
    
    @JsonProperty("first_name")
    @NotBlank(message = "First name cannot be blank")
    private String firstName;
    
    @JsonProperty("last_name")
    @NotBlank(message = "Last name cannot be blank")
    private String lastName;
    
    @JsonProperty("age")
    @NotNull(message = "Age cannot be null")
    private Integer age;
}
```

### Without Lombok
```java
package com.example.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

public class UserRequest {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("username")
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @JsonProperty("email")
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;
    
    @JsonProperty("first_name")
    @NotBlank(message = "First name cannot be blank")
    private String firstName;
    
    @JsonProperty("last_name")
    @NotBlank(message = "Last name cannot be blank")
    private String lastName;
    
    @JsonProperty("age")
    @NotNull(message = "Age cannot be null")
    private Integer age;
    
    // Default constructor
    public UserRequest() {}
    
    // All-args constructor
    public UserRequest(Long id, String username, String email, String firstName, String lastName, Integer age) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}
```

## Naming Conventions

### Class Names
- Use `PascalCase`

### Field Names
- Use `camelCase` in Java
- Use `@JsonProperty` to map to API naming conventions (snake_case, kebab-case, etc.)

## Acceptable Utility Methods in DTOs

DTOs can include simple utility methods that help with object creation, conversion, or basic operations:

### Factory Methods
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    
    @JsonProperty("name")
    @NotBlank(message = "Name cannot be blank")
    private String name;
    
    @JsonProperty("age")
    @NotNull(message = "Age cannot be null")
    @Min(value = 0, message = "Age must be positive")
    private Integer age;
    
    // Factory method to create new DTO
    public static CustomerDto create(String name, Integer age) {
        return new CustomerDto(name, age);
    }
    
    // Factory method with validation
    public static CustomerDto of(String name, Integer age) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        if (age == null || age < 0) {
            throw new IllegalArgumentException("Age must be a positive number");
        }
        return new CustomerDto(name, age);
    }
}
```

### Conversion Methods
```java
public class CustomerDto {
    // ... fields and constructors ...
    
    // Convert from entity to DTO
    public static CustomerDto fromEntity(Customer customer) {
        return new CustomerDto(customer.getName(), customer.getAge());
    }
    
    // Convert from DTO to entity
    public Customer toEntity() {
        Customer customer = new Customer();
        customer.setName(this.name);
        customer.setAge(this.age);
        return customer;
    }
}
```

### Builder Pattern (Alternative to Lombok)
```java
public class CustomerDto {
    // ... fields ...
    
    public static CustomerDtoBuilder builder() {
        return new CustomerDtoBuilder();
    }
    
    public static class CustomerDtoBuilder {
        private String name;
        private Integer age;
        
        public CustomerDtoBuilder name(String name) {
            this.name = name;
            return this;
        }
        
        public CustomerDtoBuilder age(Integer age) {
            this.age = age;
            return this;
        }
        
        public CustomerDto build() {
            return new CustomerDto(name, age);
        }
    }
}
```

## Best Practices

1. **Immutability**: Consider making DTOs immutable when possible
2. **Validation**: Always validate input DTOs at the controller layer
3. **Documentation**: Use JavaDoc for complex DTOs
4. **Nested Objects**: Use `@Valid` annotation for nested DTO validation
5. **Collections**: Properly validate collections with `@Valid` and size constraints
6. **Date Handling**: Use appropriate date/time types and Jackson annotations
7. **Utility Methods**: Keep utility methods simple and focused on data manipulation, not business logic

### Example with Nested Objects and Collections
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("customer")
    @NotNull(message = "Customer cannot be null")
    @Valid
    private CustomerRequest customer;
    
    @JsonProperty("items")
    @NotNull(message = "Items cannot be null")
    @Size(min = 1, message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;
    
    @JsonProperty("total_amount")
    @NotNull(message = "Total amount cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be positive")
    private BigDecimal totalAmount;
    
    @JsonProperty("order_date")
    @NotNull(message = "Order date cannot be null")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime orderDate;
}
```

## Common Validation Annotations

| Annotation | Purpose | Example |
|------------|---------|----------|
| `@NotNull` | Field cannot be null | `@NotNull private String name;` |
| `@NotBlank` | String cannot be null, empty, or whitespace | `@NotBlank private String username;` |
| `@NotEmpty` | Collection/array cannot be null or empty | `@NotEmpty private List<String> tags;` |
| `@Size` | Validates size of strings, collections, arrays | `@Size(min = 2, max = 50)` |
| `@Min/@Max` | Validates numeric minimum/maximum | `@Min(18) private Integer age;` |
| `@Email` | Validates email format | `@Email private String email;` |
| `@Pattern` | Validates against regex pattern | `@Pattern(regexp = "^[A-Z]{2}[0-9]{4}$")` |
| `@Valid` | Enables validation of nested objects | `@Valid private AddressRequest address;` |
| `@DecimalMin/@DecimalMax` | Validates decimal values | `@DecimalMin("0.0")` |


This approach ensures that your DTOs are consistent, well-validated, and follow Java Quarkus best practices.
