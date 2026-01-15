# Unit Test Creation Guidelines for Java/Quarkus Projects

## Overview
When creating unit tests, you MUST follow these patterns and guidelines to ensure consistency, maintainability, and quality across the codebase.

## 📁 Project Structure

### Test File Location
- **REQUIREMENT**: Place all unit tests in `src/test/java/unit`
- Follow the same package structure as the source code being tested

## 🏗️ Test Structure and Patterns

### 1. Arrange/Act/Assert Pattern
**REQUIREMENT**: All test methods MUST follow the Arrange/Act/Assert pattern with explicit comments.

```java
@Test
void testMessageConstructor() {
    // Arrange
    var customMessage = "Custom message";

    // Act
    InvalidRequestException ex = new InvalidRequestException(customMessage);

    // Assert
    assertEquals("Custom message", ex.getMessage());
    assertNull(ex.getInnerException());
}
```

### 2. Test Method Naming Convention
**REQUIREMENT**: All test method names MUST follow the pattern: `<methodName>_when_<condition>_should_<expectedBehavior>()`

This naming convention provides clear documentation of:
- **What method** is being tested
- **Under what conditions** the test runs
- **What behavior** is expected

**Examples:**
```java
@Test
void userLogin_when_theCredentialsAreValid_should_returnTrue() {
    // Test implementation
}

@Test
void get_when_userExistsInTheDatabase_should_returnTheUser() {
    // Test implementation
}

@Test
void get_when_userDontExistsInTheDatabase_should_throwException() {
    // Test implementation
}

@Test
void create_when_validDataIsProvided_should_persistItemAndReturnId() {
    // Test implementation
}

@Test
void validate_when_emailFormatIsInvalid_should_throwValidationException() {
    // Test implementation
}
```

**For DTO tests, use simplified naming:**
```java
@Test
void testAllArgsConstructor() {
    // DTO constructor test
}

@Test
void testGettersAndSetters() {
    // DTO getter/setter test
}

@Test
void testUserIdFieldAnnotations() {
    // DTO annotation test for userId field
}
```

### 3. Import Statements
**REQUIREMENT**: Always use top-level imports instead of fully qualified names.

❌ **AVOID:**
```java
java.lang.reflect.Field pubField;
```

✅ **CORRECT:**
```java
import java.lang.reflect.Field;

Field pubField;
```

## 🔧 Quarkus Testing Framework

### 4. Test Only the Method's Own Logic
**MANDATORY REQUIREMENT**: Unit tests should ONLY test the logic that belongs to the method being tested, NOT the logic of other methods it calls.

This is a fundamental principle that applies to ALL unit tests across all class types (Services, Repositories, Controllers, etc.).

**Guidelines for determining test scope:**
- **Test what the method does directly** (its own logic, transformations, orchestration)
- **Do NOT test what other methods do** (validation in constructors, business rules in dependencies)
- **Use mocks/stubs** for dependencies to isolate your method's behavior
- **Focus on the method's responsibilities** (calling services, transforming data, handling responses)

❌ **AVOID testing delegated logic:**
```java
// In UserServiceTest - WRONG approach
@Test
void createUser_when_emailIsInvalid_should_throwValidationException() {
    // This tests User constructor validation, not UserService.createUser() logic
    // This test belongs in UserTest, not UserServiceTest
}

// In ItemMetadataRepositoryTest - WRONG approach
@Test
void persist_when_nullProvided_should_delegateToBaseRepository() {
    // This tests BaseRepository behavior, not ItemMetadataRepository logic
    // The repository just delegates without any null handling
}
```

✅ **CORRECT approach - test only your method's logic:**
```java
// In UserServiceTest - CORRECT approach  
@Test
void createUser_when_validUserData_should_callRepositoryAndReturnUser() {
    // This tests UserService.createUser()'s own logic:
    // - calling the repository
    // - transforming the result
    // - returning the correct value
}

// In UserTest - CORRECT location for validation tests
@Test
void constructor_when_emailIsInvalid_should_throwValidationException() {
    // This tests User constructor validation logic
}

// In ItemMetadataRepositoryTest - CORRECT approach
@Test
void persist_when_entitiesProvided_should_delegateToBaseRepository() {
    // This tests the repository's delegation logic only
}
```

**Examples by class type:**

**Service Classes:** Test orchestration, parameter transformation, business logic
```java
// Test the service's own coordination logic
@Test
void processOrder_when_validOrder_should_validateAndPersistAndNotify() {
    // Test that service calls validator, repository, and notifier in order
    verify(validator).validate(order);
    verify(repository).save(order);
    verify(notifier).sendConfirmation(order);
}
```

**Repository Classes:** Test delegation, parameter transformation, query building
```java
// Test the repository's own query building logic
@Test
void findByEmail_when_emailProvided_should_normalizeEmailAndQuery() {
    // Test that repository normalizes email before querying
    verify(baseRepository).find("email", "normalized@example.com");
}
```

**Controller Classes:** Test request/response mapping, parameter validation
```java
// Test the controller's own request handling logic
@Test
void createItem_when_validRequest_should_callServiceAndReturnResponse() {
    // Test that controller maps request, calls service, maps response
    verify(service).create(any(Item.class));
    assertEquals(expectedResponse, actualResponse);
}
```

### 5. Dependency Injection Testing
**MANDATORY REQUIREMENT**: When testing classes that use `@Inject`, you MUST use `@QuarkusComponentTest`.

**Exception**: The only exception is when `@Inject` is followed by `@RestClient` annotation - these can be tested with regular unit tests using manual mocking.

```java
@QuarkusComponentTest
class BlocklistAPIWrapperTest {

    @Inject
    ClassToBeTested subject;

    @InjectMock
    Dependency dependency1;
    
    @InjectMock
    Dependency dependency2;
    
    @Test
    void yourTestMethod() {
        // Test implementation
    }
}
```

**For classes with @Inject @RestClient:**
```java
class ServiceWithRestClientTest {
    
    private ServiceWithRestClient service;
    private ExternalApiClient mockRestClient;
    
    @BeforeEach
    void setUp() {
        mockRestClient = mock(ExternalApiClient.class);
        service = new ServiceWithRestClient(mockRestClient);
    }
    
    @Test
    void methodName_when_condition_should_behavior() {
        // Regular unit test implementation
    }
}
```

### 6. Avoid Mockito Extensions
**REQUIREMENT**: Do NOT use `@ExtendWith(MockitoExtension.class)` and `@Mock`. Instead, use:
- `@QuarkusComponentTest`
- `@Inject` 
- `@InjectMock`

## 📋 Class-Specific Testing Guidelines

### 7. DTO Classes
**REQUIREMENT**: For DTO classes, create these test cases:

1. **Constructor Test**: Verify all-args constructor sets properties correctly (if constructor exists)
2. **Getters and Setters Test**: Verify getter/setter functionality
3. **Field Annotation Tests**: Verify that fields have the expected annotations with correct values

**Do NOT** test Lombok annotations like `@Getter` and `@Setter`.

#### Basic DTO Test Structure:
```java
class UpdateNotificationsDtoTest {

    @Test
    void testAllArgsConstructor() {
        // Arrange
        String userId = "12345678901";
        Channel channel = Channel.EMAIL;

        // Act
        UpdateNotificationsDto dto = new UpdateNotificationsDto(userId, channel);

        // Assert
        assertEquals(userId, dto.getUserId(), 
            "userId should be set correctly by constructor");
        assertEquals(channel, dto.getChannel(), 
            "channel should be set correctly by constructor");
    }

    @Test
    void testGettersAndSetters() {
        // Arrange
        UpdateNotificationsDto dto = new UpdateNotificationsDto("initialUserId", Channel.EMAIL);
        String newUserId = "98765432109";
        Channel newChannel = Channel.SMS;

        // Act
        dto.setUserId(newUserId);
        dto.setChannel(newChannel);

        // Assert
        assertEquals(newUserId, dto.getUserId(), 
            "getUserId should return the value set by setUserId");
        assertEquals(newChannel, dto.getChannel(), 
            "getChannel should return the value set by setChannel");
    }
}
```

**IMPORTANT**: Do NOT create additional getter/setter tests like `testGettersAndSettersWithDifferentValues()`. The single `testGettersAndSetters()` method already validates the complete getter/setter functionality by setting and retrieving values. Additional tests that only change the values being set are redundant and add no value.

#### Field Annotation Validation Tests:
**REQUIREMENT**: Create annotation tests ONLY for annotations that are actually present on the fields.

**Test these annotations when present:**
- `@JsonProperty` - Verify the JSON property name
- `@NotNull` - Verify the annotation exists with correct message
- `@NotBlank` - Verify the annotation exists with correct message  
- `@NotEmpty` - Verify the annotation exists with correct message
- `@Size` - Verify min/max values and message
- `@Pattern` - Verify regex pattern and message
- `@Email` - Verify the annotation exists
- `@Min` / `@Max` - Verify the values and messages
- Custom validation annotations

**Example annotation tests:**
```java
@Test
void testUserIdFieldAnnotations() throws NoSuchFieldException {
    // Arrange
    Field userIdField = UpdateNotificationsDto.class.getDeclaredField("userId");
    
    // Assert JsonProperty annotation
    JsonProperty jsonProperty = userIdField.getAnnotation(JsonProperty.class);
    assertNotNull(jsonProperty, "userId field should have @JsonProperty annotation");
    assertEquals("user_id", jsonProperty.value(), 
        "userId field should have correct JsonProperty value");
    
    // Assert NotNull annotation
    NotNull notNull = userIdField.getAnnotation(NotNull.class);
    assertEquals("User ID is required", notNull.message(), 
        "userId field should have correct NotNull message");
    
    // Assert Size annotation
    Size size = userIdField.getAnnotation(Size.class);
    assertEquals(1, size.min(), "userId field should have correct Size min value");
    assertEquals(50, size.max(), "userId field should have correct Size max value");
    assertEquals("User ID must be between 1 and 50 characters", size.message(), 
        "userId field should have correct Size message");
}

@Test
void testChannelFieldAnnotations() throws NoSuchFieldException {
    // Arrange
    Field channelField = UpdateNotificationsDto.class.getDeclaredField("channel");
    
    // Assert JsonProperty annotation
    JsonProperty jsonProperty = channelField.getAnnotation(JsonProperty.class);
    assertNotNull(jsonProperty, "channel field should have @JsonProperty annotation");
    assertEquals("notification_channel", jsonProperty.value(), 
        "channel field should have correct JsonProperty value");
    
    // Assert NotNull annotation
    NotNull notNull = channelField.getAnnotation(NotNull.class);
    assertEquals("Channel is required", notNull.message(), 
        "channel field should have correct NotNull message");
}
```

**Required imports for annotation testing:**
```java
import java.lang.reflect.Field;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
```

### 8. Entity Classes (JPA/Panache Entities)
**REQUIREMENT**: For Entity classes (annotated with `@Entity`), create comprehensive test cases:

1. **Constructor Validation Tests**: Test all validation logic in parameterized constructors
2. **Business Method Tests**: Test custom business methods (like `addMetadata()`)
3. **Class Annotation Tests**: Verify `@Entity` annotation presence
4. **Field Annotation Tests**: Verify JPA annotations on all fields

#### Entity Test Structure:
```java
class ItemTest {

    private static final String VALID_USER_ID = "user123";
    private static final Long VALID_PRODUCT_ID = 1L;
    private static final int VALID_QUANTITY = 5;
    private static final Double VALID_PRICE = 99.99;
    private static final String INVALID_VALUE_ERROR_CODE = "INVALID_VALUE";

    @Test
    void constructor_when_allValidParametersProvided_should_createItemSuccessfully() {
        // Arrange & Act
        Item item = new Item(VALID_USER_ID, VALID_PRODUCT_ID, VALID_QUANTITY, VALID_PRICE);

        // Assert
        assertEquals(VALID_USER_ID, item.getUserId(), "UserId should be set correctly");
        assertEquals(VALID_PRODUCT_ID, item.getProductId(), "ProductId should be set correctly");
        assertEquals(VALID_QUANTITY, item.getQuantity(), "Quantity should be set correctly");
        assertEquals(VALID_PRICE, item.getPrice(), "Price should be set correctly");
        assertNotNull(item.getMetadata(), "Metadata list should be initialized");
        assertTrue(item.getMetadata().isEmpty(), "Metadata list should be empty initially");
    }

    @Test
    void constructor_when_userIdIsNull_should_throwBusinessException() {
        // Arrange
        String nullUserId = null;

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> new Item(nullUserId, VALID_PRODUCT_ID, VALID_QUANTITY, VALID_PRICE),
            "Should throw BusinessException when userId is null");
        
        assertEquals(INVALID_VALUE_ERROR_CODE, exception.getErrorCode(), 
            "Should have correct error code");
        assertEquals("User ID is required and cannot be empty", exception.getErrorMessage(), 
            "Should have correct error message");
    }
}
```

#### Entity Constructor Validation Testing:
**REQUIREMENT**: For each validation rule in the constructor, create separate test cases:

- **Null value tests**: When constructor validates null parameters
- **Empty/blank string tests**: When constructor validates empty or blank strings  
- **Numeric validation tests**: When constructor validates ranges (> 0, >= 0, etc.)
- **Business rule tests**: When constructor enforces business rules
- **Happy path test**: When all parameters are valid

**Examples of validation test patterns:**
```java
@Test
void constructor_when_userIdIsEmpty_should_throwBusinessException() {
    // Test empty string validation
}

@Test
void constructor_when_userIdIsBlank_should_throwBusinessException() {
    // Test blank/whitespace string validation  
}

@Test
void constructor_when_quantityIsZero_should_throwBusinessException() {
    // Test zero value validation
}

@Test
void constructor_when_quantityIsNegative_should_throwBusinessException() {
    // Test negative value validation
}

@Test
void constructor_when_priceIsNegative_should_throwBusinessException() {
    // Test negative price validation
}

@Test
void constructor_when_priceIsZero_should_createItemSuccessfully() {
    // Test that zero price is allowed (business rule)
}
```

#### Entity Business Method Testing:
**REQUIREMENT**: Test custom business methods that modify entity state:

```java
@Test
void addMetadata_when_validKeyAndValueProvided_should_addMetadataToList() {
    // Arrange
    Item item = new Item(VALID_USER_ID, VALID_PRODUCT_ID, VALID_QUANTITY, VALID_PRICE);
    String key = "color";
    String value = "red";
    int initialSize = item.getMetadata().size();

    // Act
    item.addMetadata(key, value);

    // Assert
    assertEquals(initialSize + 1, item.getMetadata().size(), 
        "Metadata list size should increase by one");
    
    ItemMetadata addedMetadata = item.getMetadata().get(item.getMetadata().size() - 1);
    assertEquals(key, addedMetadata.getKey(), "Added metadata should have correct key");
    assertEquals(value, addedMetadata.getValue(), "Added metadata should have correct value");
    assertEquals(item, addedMetadata.getItem(), "Added metadata should reference the correct item");
}
```

#### Entity Annotation Testing:
**REQUIREMENT**: Create tests to verify JPA annotations on the entity class and fields.

**Test these JPA annotations when present:**
- `@Entity` - Verify entity annotation on class
- `@Column` - Verify column name and nullable settings
- `@OneToMany` - Verify mappedBy and cascade settings
- `@ManyToOne` - Verify join column and fetch settings
- `@OneToOne` - Verify mappedBy and cascade settings
- `@ManyToMany` - Verify join table and mappedBy settings
- `@JoinColumn` - Verify column name and nullable settings
- `@JoinTable` - Verify table name and join columns

**Example JPA annotation tests:**
```java
@Test
void testEntityAnnotation() {
    // Arrange
    Class<Item> itemClass = Item.class;

    // Act
    Entity entityAnnotation = itemClass.getAnnotation(Entity.class);

    // Assert
    assertNotNull(entityAnnotation, "Item class should have @Entity annotation");
}

@Test
void testUserIdFieldAnnotations() throws NoSuchFieldException {
    // Arrange
    Field userIdField = Item.class.getDeclaredField("userId");

    // Act
    Column columnAnnotation = userIdField.getAnnotation(Column.class);

    // Assert
    assertNotNull(columnAnnotation, "userId field should have @Column annotation");
    assertEquals("user_id", columnAnnotation.name(), 
        "userId field should have correct column name");
    assertFalse(columnAnnotation.nullable(), 
        "userId field should be marked as not nullable");
}

@Test
void testMetadataFieldAnnotations() throws NoSuchFieldException {
    // Arrange
    Field metadataField = Item.class.getDeclaredField("metadata");

    // Act
    OneToMany oneToManyAnnotation = metadataField.getAnnotation(OneToMany.class);

    // Assert
    assertNotNull(oneToManyAnnotation, "metadata field should have @OneToMany annotation");
    assertEquals("item", oneToManyAnnotation.mappedBy(), 
        "metadata field should have correct mappedBy value");
}
```

**Required imports for JPA annotation testing:**
```java
import java.lang.reflect.Field;
import jakarta.persistence.*;
```

#### Entity Testing Guidelines:
**REQUIREMENTS**:

1. **Test Constructor Validation Logic Only**: Only test validation logic that exists in the constructor - don't test simple field assignments
2. **One Test Per Validation Rule**: Create separate tests for each validation condition (null, empty, range checks, etc.)
3. **Verify Exception Details**: For validation failures, verify both error code and error message
4. **Test Business Methods Completely**: For methods like `addMetadata()`, verify the complete behavior including side effects
5. **Test All JPA Annotations**: Create individual test methods for each field's JPA annotations
6. **Use Constants for Test Data**: Extract frequently used test values to constants
7. **Test Relationship Integrity**: For relationship methods, verify that both sides of the relationship are properly set

**Do NOT test:**
- Simple getter/setter methods (covered by Lombok or auto-generated)
- JPA lifecycle methods unless they contain custom logic
- Framework-provided methods from PanacheEntity
- Default constructor (unless it contains validation logic)

### 9. Repository Classes
**REQUIREMENT**: For Repository classes (classes that delegate to other repositories), follow the general principle from section 4 "Test Only the Method's Own Logic".

#### Repository Test Guidelines:
**Test ONLY the repository's own logic:**
- Method delegation (verify the correct method is called on the dependency)
- Parameter transformation (if the repository modifies parameters before delegation)
- Return value transformation (if the repository modifies the response)
- Business logic specific to the repository class

**Do NOT test:**
- Edge cases that the repository doesn't handle (null, empty collections, invalid data)
- Behavior of the delegated repository (BaseRepository, PanacheRepository, etc.)
- Framework-provided functionality

This follows the core principle: **test what the repository method does directly, not what the delegated dependency does**.

#### Repository Test Structure:
```java
@QuarkusComponentTest
class ItemMetadataRepositoryTest {

    @Inject
    ItemMetadataRepository repository;

    @InjectMock
    BaseRepository<ItemMetadata, Long> baseRepository;

    @Test
    void persist_when_entitiesProvided_should_delegateToBaseRepository() {
        // Arrange
        ItemMetadata metadata1 = mock(ItemMetadata.class);
        ItemMetadata metadata2 = mock(ItemMetadata.class);
        List<ItemMetadata> entities = Arrays.asList(metadata1, metadata2);

        // Act
        repository.persist(entities);

        // Assert
        verify(baseRepository).persist(entities);
    }

    // Only add tests for edge cases if the repository has specific logic for them
    // Example: If repository validates input before delegation
    @Test
    void findByUserId_when_userIdIsNull_should_throwValidationException() {
        // This test is ONLY valid if ItemMetadataRepository has validation logic:
        // public List<ItemMetadata> findByUserId(String userId) {
        //     if (userId == null) {
        //         throw new ValidationException("User ID cannot be null");
        //     }
        //     return baseRepository.find("userId", userId).list();
        // }
    }
}
```

**Examples of what NOT to test in repository classes:**
```java
❌ // WRONG - Testing edge cases without repository logic
@Test
void persist_when_nullProvided_should_delegateToBaseRepository() {
    // This test adds no value if the repository just delegates:
    // public void persist(Iterable<Entity> entities) {
    //     baseRepository.persist(entities);
    // }
}

❌ // WRONG - Testing empty collections without repository logic  
@Test
void persist_when_emptyListProvided_should_delegateToBaseRepository() {
    // This test adds no value - the repository doesn't handle empty lists differently
}
```

**Examples of what TO test in repository classes:**
```java
✅ // CORRECT - Testing parameter transformation
@Test
void findByEmail_when_emailProvided_should_normalizeEmailAndDelegate() {
    // This test is valuable if the repository transforms the parameter:
    // public User findByEmail(String email) {
    //     String normalizedEmail = email.toLowerCase().trim();
    //     return baseRepository.find("email", normalizedEmail).firstResult();
    // }
}

✅ // CORRECT - Testing return value transformation
@Test
void findActiveUsers_when_called_should_filterAndReturnOnlyActiveUsers() {
    // This test is valuable if the repository filters results:
    // public List<User> findActiveUsers() {
    //     return baseRepository.find("status", "ACTIVE").list();
    // }
}
```

### 10. REST Client Interfaces (Exception Case)
**ONLY** for interfaces annotated with `@RegisterRestClient`, create tests that verify:
- Correct `@RegisterRestClient` annotation with proper configKey
- Correct `@Path` annotation on class and methods
- Correct HTTP method annotations (`@GET`, `@POST`, etc.)
- Correct `@Consumes` and `@Produces` annotations

## 🚫 What NOT to Test

### 11. Avoid Low-Value Tests
**REQUIREMENT**: Do NOT create tests for:
- Method signatures or return types (compiler already validates)
- Method existence (compiler already validates)
- Parameter count or parameter types (compiler already validates)
- Class structure verification
- Annotation presence (except REST clients)

❌ **AVOID these patterns:**
```java
@Test
void createMethod_ShouldExistWithCorrectSignature() {
    // This adds no value - compilation already verifies this
}

@Test
void method_ShouldReturnCorrectType() {
    // This adds no value - type safety is enforced by compiler
}

@Test
void testPersistMethodExists() {
    // This adds no value - if method doesn't exist, code won't compile
    Method persistMethod = ItemMetadataRepository.class.getMethod("persist", Iterable.class);
    assertNotNull(persistMethod, "persist method should exist");
    assertEquals("persist", persistMethod.getName());
    assertEquals(1, persistMethod.getParameterCount());
}

@Test
void testMethodParameterTypes() {
    // This adds no value - compiler enforces parameter types
}

@Test
void testMethodReturnType() {
    // This adds no value - compiler enforces return types
}
```

### 12. Avoid Redundant Test Cases
**REQUIREMENT**: Do NOT create multiple tests that verify the same behavior.

❌ **AVOID redundant tests:**
```java
@Test
void create_ShouldCallFactory() {
    // ... only tests factory.create() is called
}

@Test  
void create_ShouldCallRepository() {
    // ... only tests repository.persist() is called
}

@Test
void create_HappyPath() {
    // ... tests both factory.create() AND repository.persist() calls plus return value
}
```

✅ **CORRECT approach:**
```java
@Test
void create_WithValidParameters_ShouldCreateAndPersist() {
    // ... tests factory.create(), repository.persist(), and return value
}

@Test
void create_WithNullInput_ShouldHandleGracefully() {
    // ... tests edge case with different behavior
}
```

### 13. Test Only Edge Cases That Change Behavior
**MANDATORY REQUIREMENT**: Create tests for null values, empty strings, or edge cases ONLY when the method under test has specific logic to handle these cases.

❌ **AVOID testing edge cases without behavioral changes:**
```java
// If BusinessException constructor just assigns values without validation
@Test
void constructor_when_nullErrorCodeProvided_should_setErrorCodeToNull() {
    // This test adds no value - the method doesn't have special null handling
}

@Test
void constructor_when_emptyStringProvided_should_setEmptyString() {
    // This test adds no value - the method doesn't have special empty string handling
}
```

✅ **CORRECT approach - test edge cases only when behavior changes:**
```java
// If UserService.validateEmail() has null checking logic
@Test
void validateEmail_when_emailIsNull_should_throwValidationException() {
    // This test is valuable because the method has specific null handling
}

@Test
void validateEmail_when_emailIsEmpty_should_throwValidationException() {
    // This test is valuable because the method has specific empty string handling
}

@Test
void validateEmail_when_emailIsValid_should_returnTrue() {
    // This test covers the happy path
}
```

**Guidelines for determining when to test edge cases:**

1. **Examine the method's implementation**: Look for explicit checks like:
   - `if (value == null)`
   - `if (StringUtils.isEmpty(value))`
   - `if (value.trim().isEmpty())`
   - Try-catch blocks that handle specific exceptions

2. **Test edge cases when the method:**
   - Has conditional logic for null/empty values
   - Throws exceptions for invalid inputs
   - Returns different values based on input state
   - Performs validation or sanitization

3. **Skip edge case tests when the method:**
   - Simply assigns values to fields (like constructors without validation)
   - Delegates to other methods without adding logic
   - Has no conditional statements related to the edge case
   - **Methods that only delegate to dependencies without transformation or validation**

**Example of when NOT to test edge cases:**
```java
// BusinessException constructor - no validation logic
public BusinessException(String errorCode, String errorMessage) {
    super(errorMessage);
    this.errorCode = errorCode;      // Just assigns - no null check
    this.errorMessage = errorMessage; // Just assigns - no null check
}
// No need for null/empty tests here

// Repository method that only delegates - no validation logic
public void persist(Iterable<ItemMetadata> entities) {
    baseRepository.persist(entities); // Just delegates - no null/empty handling
}
// No need for null/empty tests here

// Service method that only delegates - no validation logic
public User findById(Long id) {
    return userRepository.findById(id); // Just delegates - no id validation
}
// No need for null/empty tests here
```

**Example of when TO test edge cases:**
```java
// EmailValidator.validate() - has validation logic
public boolean validate(String email) {
    if (email == null || email.trim().isEmpty()) {
        throw new ValidationException("Email cannot be null or empty");
    }
    return email.matches(EMAIL_REGEX);
}
// Need tests for null, empty, and valid email cases
```

## 🎭 Mocking Best Practices

### 14. Prefer Mocks for Complex Objects
**REQUIREMENT**: For complex DTOs or objects with many properties, use mocks instead of manual construction.

✅ **PREFERRED:**
```java
@Test
void create_WithValidDto_ShouldProcessCorrectly() {
    // Arrange
    ComplexDto mockDto = mock(ComplexDto.class);
    NestedDto mockNestedDto = mock(NestedDto.class);
    
    // Only mock the methods actually called by the method under test
    when(mockDto.getNestedObject()).thenReturn(mockNestedDto);
    when(mockNestedDto.getRequiredValue()).thenReturn("expectedValue");
    
    // Act & Assert
    // ... rest of test
}
```

❌ **AVOID for complex objects:**
```java
ComplexDto dto = new ComplexDto();
dto.setProperty1("value1");
dto.setProperty2("value2");
// ... setting 20+ properties
```

**When to use mocks vs concrete objects:**
- **Use mocks for:** DTOs with multiple properties, request/response objects, complex domain objects
- **Use concrete objects for:** Simple value objects, primitives, strings, collections of primitives
- **Use builders or factory methods for:** Objects that are simple to construct and enhance test readability

### 15. Mock Only What's Actually Called
**REQUIREMENT**: Analyze the method under test and only mock methods that are actually invoked.

**Process:**
1. Examine the method under test to identify which methods are called on dependencies
2. Only mock those specific methods
3. Avoid setting up unused mock behaviors

```java
// If the method under test only calls getNestedObject() and getValue()
private SomeDto createMockDto() {
    SomeDto mockDto = mock(SomeDto.class);
    NestedDto mockNestedDto = mock(NestedDto.class);
    
    // Only mock the methods actually called
    when(mockDto.getNestedObject()).thenReturn(mockNestedDto);
    when(mockNestedDto.getValue()).thenReturn("testValue");
    
    return mockDto;
}
```

## 🧹 Code Quality

### 16. Extract Constants for Repeated Strings
**REQUIREMENT**: If a string is used more than 2 times in tests, extract it to a constant.

```java
private static final String EXPECTED_MESSAGE = "Custom error message";
private static final String TEST_USER_ID = "12345678901";
```

## 📝 Annotation Testing

### 17. Method Annotation Testing
**REQUIREMENT**: If the methods being tested have business-critical annotations (not framework annotations like `@Getter`), create additional test cases to validate the annotations have the correct values.

**Focus on:** Custom business annotations, validation annotations, security annotations
**Skip:** Lombok annotations (`@Getter`, `@Setter`, etc.)