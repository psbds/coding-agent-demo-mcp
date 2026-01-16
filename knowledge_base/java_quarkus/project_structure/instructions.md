# Java Quarkus Project Structure Guidelines

## Overview
This document defines the standard folder structure for Java Quarkus projects to ensure consistency, maintainability, and clear separation of concerns.

## Standard Folder Structure

All Java source code should be organized under the following structure:

```
src/
└── main/
    └── java/
        └── {groupId}.{artifactId}/
            ├── backends/
            ├── domain/
            ├── services/
            ├── mappers/
            ├── infrastructure/
            ├── repository/
            ├── messaging/
            ├── resources/
            └── utils/
```

## Folder Descriptions

### `backends/`
**Purpose**: Configuration for API Clients to access other services

**Contains**:
- REST client interfaces for external APIs
- API client wrapper classes
- DTOs for external service requests/responses
- Configuration classes for external service connections

**Example**:
```
backends/
├── payment/
│   ├── PaymentAPIClient.java
│   ├── PaymentClientWrapper.java
│   └── dto/
│       ├── PaymentRequest.java
│       └── PaymentResponse.java
└── user/
    ├── UserAPIClient.java
    └── dto/
```

---

### `domain/`
**Purpose**: Domain models and business objects representing the core business logic and persistence

**Contains**:
- Domain models (business entities with JPA annotations for persistence)
- Value objects
- Domain events
- Business rules and invariants
- Domain-specific exceptions

**Example**:
```
domain/
├── order/
│   ├── Order.java
│   ├── OrderItem.java
│   ├── OrderStatus.java
│   └── exceptions/
│       └── InvalidOrderException.java
└── payment/
    ├── Payment.java
    ├── PaymentMethod.java
    └── PaymentStatus.java
```

---

### `services/`
**Purpose**: Service layer where the business logic resides

**Contains**:
- Business logic implementation organized by specific purpose/action
- Each service follows the Single Responsibility Principle
- Business rule validation
- Orchestration of repository and external service calls

**Example**:
```
services/
├── order/
│   ├── CreateOrderService.java
│   ├── UpdateOrderService.java
│   ├── DeleteOrderService.java
│   └── validators/
│       └── OrderValidator.java
└── payment/
    ├── CreatePaymentService.java
    └── ProcessPaymentService.java
```

---

### `mappers/`
**Purpose**: Data transformation between different layers (DTOs and Domain models)

**Contains**:
- DTO to Domain mappings
- Domain to DTO mappings
- Request/Response mappings
- External API response mappings
- Aggregator mapper class per entity

**Example**:
```
mappers/
├── order/
│   ├── OrderMapper.java
│   ├── CreateOrderRequestMapping.java
│   ├── UpdateOrderRequestMapping.java
│   └── OrderResponseMapping.java
└── payment/
    ├── PaymentMapper.java
    ├── ProcessPaymentRequestMapping.java
    └── ProcessPaymentResponseMapping.java
```

---

### `infrastructure/`
**Purpose**: Configuration for external vendor services and system-wide configurations

**Contains**:
- Error handlers
- Health check configurations
- Tracing and observability configuration
- Cloud service configurations (Service Bus, Event Hubs, etc.)
- Security configurations
- Logging configurations

**Example**:
```
infrastructure/
├── error_handling/
│   ├── ErrorHandler.java
│   └── CustomExceptionMapper.java
├── servicebus/
│   ├── ServiceBusConfiguration.java
│   ├── ServiceBusProducerManager.java
│   └── ServiceBusConsumerManager.java
├── eventhub/
│   └── EventHubConfiguration.java
├── healthcheck/
│   ├── ReadinessHealthcheck.java
│   ├── LivenessHealthcheck.java
│   └── DatabaseHealthCheck.java
├── security/
│   ├── AuthenticationFilter.java
│   ├── AuthorizationFilter.java
│   ├── JwtHandler.java
│   └── SecurityConfiguration.java
└── tracing/
    └── TracingConfiguration.java
```

---

### `repository/`
**Purpose**: Data layer containing repository classes to access data in internal cache or external databases

**Contains**:
- Repository interfaces and implementations
- Data access logic using domain models from `domain/` package
- Cache implementations
- Database query methods

**Example**:
```
repository/
├── order/
│   └── OrderRepository.java
├── customer/
│   └── CustomerRepository.java
└── cache/
    └── OrderCacheRepository.java
```

**Note**: Repositories work with domain models from the `domain/` package. Domain models contain both business logic and JPA annotations for persistence.

---

### `messaging/`
**Purpose**: Configuration for producers, consumers, and message DTOs for messaging services

**Contains**:
- Message producers
- Message consumers/listeners
- Message DTOs and events
- Message routing configurations
- Message serialization/deserialization logic

**Example**:
```
messaging/
├── producers/
│   ├── OrderEventProducer.java
│   └── NotificationProducer.java
├── consumers/
│   ├── PaymentEventConsumer.java
│   └── OrderStatusConsumer.java
└── dto/
    ├── OrderCreatedEvent.java
    ├── PaymentProcessedEvent.java
    └── NotificationMessage.java
```

---

### `resources/`
**Purpose**: All the resource API endpoints (REST controllers)

**Contains**:
- REST resource classes (JAX-RS endpoints) organized by entity/resource
- API endpoint definitions
- Request/Response DTOs specific to API contracts organized by operation
- API documentation annotations

**Example**:
```
resources/
├── order/
│   ├── OrderResource.java
│   └── dto/
│       ├── createorder/
│       │   ├── CreateOrderRequest.java
│       │   └── CreateOrderResponse.java
│       ├── updateorder/
│       │   ├── UpdateOrderRequest.java
│       │   └── UpdateOrderResponse.java
│       └── getorder/
│           └── GetOrderResponse.java
└── payment/
    ├── PaymentResource.java
    └── dto/
        └── processpayment/
            ├── ProcessPaymentRequest.java
            └── ProcessPaymentResponse.java
```

---

### `utils/`
**Purpose**: System-wide utility files

**Contains**:
- String handling utilities
- Date/time utilities
- Conversion utilities
- Common helper methods
- Constants and enums

**Example**:
```
utils/
├── StringUtils.java
├── DateUtils.java
├── ValidationUtils.java
├── JsonUtils.java
└── constants/
    ├── AppConstants.java
    └── ErrorCodes.java
```

---

## Best Practices

1. **Package Naming**: Always use the full `{groupId}.{artifactId}` as the base package
   - Example: `com.company.orderservice`

2. **Separation of Concerns**: Keep each layer focused on its specific responsibility
   - Don't mix business logic in resources
   - Don't access repositories directly from resources
   - Use services as the orchestration layer

3. **DTOs Organization**: 
   - Keep API DTOs in `resources/{entity}/dto/{operation}/`
   - Keep external service DTOs in `backends/{service}/dto/`
   - Keep messaging DTOs in `messaging/dto/`

4. **Configuration**: All cloud and infrastructure configurations should reside in `infrastructure/`

5. **Testing Structure**: Mirror the main structure in test folders, organized by test type
   ```
   src/
   └── test/
       └── java/
           └── unit/
               └── {groupId}.{artifactId}/
                   ├── domain/
                   ├── services/
                   ├── mappers/
                   ├── resources/
                   └── repository/
   ```

6. **Avoid Deep Nesting**: Try to keep folder hierarchy no more than 3-4 levels deep for maintainability

7. **Consistent Naming**:
   - Resources: `*Resource.java`
   - Services: `{Action}{Entity}Service.java` (e.g., `CreateOrderService.java`, `UpdatePaymentService.java`)
   - Repositories: `*Repository.java`
   - Mappers: 
     - Aggregator: `{Entity}Mapper.java` (e.g., `OrderMapper.java`, `PaymentMapper.java`)
     - Individual mappings: `{DTOName}Mapping.java` (e.g., `CreateOrderRequestMapping.java`, `OrderCreatedEventMapping.java`)
   - Domain Models: Use singular nouns (e.g., `Order.java`, `Payment.java`)
   - DTOs: `*Request.java`, `*Response.java`, `*DTO.java`, `*Event.java`
   - Configs: `*Config.java` or `*Configuration.java`

## Example Complete Structure

```
src/
└── main/
    ├── java/
    │   └── com.example.orderservice/
    │       ├── backends/
    │       │   ├── payment/
    │       │   │   ├── PaymentAPIClient.java
    │       │   │   └── dto/
    │       │   │       ├── PaymentRequest.java
    │       │   │       └── PaymentResponse.java
    │       │   └── inventory/
    │       │       └── InventoryAPIClient.java
    │       ├── domain/
    │       │   └── order/
    │       │       ├── Order.java
    │       │       ├── OrderItem.java
    │       │       └── OrderStatus.java
    │       ├── services/
    │       │   ├── order/
    │       │   │   ├── CreateOrderService.java
    │       │   │   ├── UpdateOrderService.java
    │       │   │   └── DeleteOrderService.java
    │       │   └── payment/
    │       │       ├── CreatePaymentService.java
    │       │       └── ProcessPaymentService.java
    │       ├── mappers/
    │       │   ├── order/
    │       │   │   ├── OrderMapper.java
    │       │   │   ├── CreateOrderRequestMapping.java
    │       │   │   ├── UpdateOrderRequestMapping.java
    │       │   │   └── OrderResponseMapping.java
    │       │   └── payment/
    │       │       ├── PaymentMapper.java
    │       │       ├── ProcessPaymentRequestMapping.java
    │       │       └── ProcessPaymentResponseMapping.java
    │       ├── infrastructure/
    │       │   ├── error_handling/
    │       │   │   └── ErrorHandler.java
    │       │   ├── servicebus/
    │       │   │   ├── ServiceBusConfiguration.java
    │       │   │   ├── ServiceBusProducerManager.java
    │       │   │   └── ServiceBusConsumerManager.java
    │       │   ├── healthcheck/
    │       │   │   ├── ReadinessHealthcheck.java
    │       │   │   └── LivenessHealthcheck.java
    │       │   └── security/
    │       │       ├── AuthenticationFilter.java
    │       │       ├── AuthorizationFilter.java
    │       │       └── JwtHandler.java
    │       ├── repository/
    │       │   ├── order/
    │       │   │   └── OrderRepository.java
    │       │   └── customer/
    │       │       └── CustomerRepository.java
    │       ├── messaging/
    │       │   ├── producers/
    │       │   │   └── OrderEventProducer.java
    │       │   ├── consumers/
    │       │   │   └── PaymentEventConsumer.java
    │       │   └── dto/
    │       │       └── OrderCreatedEvent.java
    │       ├── resources/
    │       │   ├── order/
    │       │   │   ├── OrderResource.java
    │       │   │   └── dto/
    │       │   │       ├── createorder/
    │       │   │       │   ├── CreateOrderRequest.java
    │       │   │       │   └── CreateOrderResponse.java
    │       │   │       └── getorder/
    │       │   │           └── GetOrderResponse.java
    │       │   └── payment/
    │       │       ├── PaymentResource.java
    │       │       └── dto/
    │       │           └── processpayment/
    │       │               ├── ProcessPaymentRequest.java
    │       │               └── ProcessPaymentResponse.java
    │       └── utils/
    │           ├── DateUtils.java
    │           └── constants/
    │               └── AppConstants.java
    └── resources/
        └── application.properties
```

## When Creating New Components

Always place new components in the appropriate folder based on their responsibility:
- Creating a domain model or business object? → `domain/` (includes JPA annotations)
- Creating an API endpoint? → `resources/`
- Adding business logic? → `services/`
- Mapping between DTOs and Domain models? → `mappers/`
- Connecting to external API? → `backends/`
- Database access? → `repository/` (works with domain models)
- Message handling? → `messaging/`
- Infrastructure concern (security, health, config)? → `infrastructure/`
- Reusable utility? → `utils/`

---

## Anti-Patterns to Avoid

### ❌ **Don't Do This**

1. **Mixing Layers**
   - ❌ Don't put business logic in Resource classes
   - ❌ Don't access Repository directly from Resources
   - ❌ Don't put HTTP/REST logic in Services
   - ✅ Always use Services as the orchestration layer

2. **Wrong Package Placement**
   - ❌ Don't put DTOs in the `domain/` package
   - ❌ Don't put service logic in `utils/`
   - ❌ Don't put configuration in `domain/`
   - ✅ Domain models are business objects with both logic and persistence annotations

3. **Tight Coupling**
   - ❌ Don't expose domain models directly in REST responses
   - ❌ Don't use DTOs in domain logic
   - ❌ Don't reference Resource classes from Services
   - ✅ Use mappers to transform between DTOs and domain models

4. **God Classes**
   - ❌ Don't create `OrderService` that handles all order operations
   - ❌ Don't create generic `Utils.java` with unrelated methods
   - ✅ Follow Single Responsibility Principle: `CreateOrderService`, `UpdateOrderService`, etc.

5. **Inconsistent Naming**
   - ❌ Don't mix naming conventions (`OrderService` vs `ServiceOrder`)
   - ❌ Don't use abbreviations (`OrdSvc.java`)
   - ❌ Don't use generic names (`Manager.java`, `Handler.java` without context)
   - ✅ Use clear, consistent, descriptive names

6. **Deep Nesting**
   - ❌ Don't create folder hierarchies deeper than 4-5 levels
   - ❌ Don't over-organize with unnecessary subfolders
   - ✅ Keep structure flat and navigable

7. **Mixing Concerns in Infrastructure**
   - ❌ Don't put business logic in exception handlers
   - ❌ Don't put data access in health checks
   - ✅ Infrastructure should only handle cross-cutting concerns

8. **Repository Anti-Patterns**
   - ❌ Don't put business logic in Repository classes
   - ❌ Don't create repository methods that return DTOs
   - ❌ Don't put validation logic in repositories
   - ✅ Repository should only handle data access using domain models

9. **Circular Dependencies**
   - ❌ Don't create circular references between services
   - ❌ Don't have domain models depend on services
   - ✅ Maintain clear dependency direction: Resources → Services → Repositories

10. **Testing Structure Mismatch**
    - ❌ Don't organize tests differently from source code
    - ❌ Don't mix unit and integration tests in the same folder
    - ✅ Mirror the source structure in test folders and separate by test type

---

This structure ensures consistency across all Java Quarkus projects and makes it easier for teams to navigate and maintain the codebase.
