---
name: implement_redis
description: Detailed instructions for implementing Redis Cache in Quarkus projects.
---

# Redis Cache Implementation Guide - Quarkus Project

This guide provides complete instructions for implementing Redis cache in Quarkus projects.

## 📋 Prerequisites

### 1. Maven Dependencies

Add the following dependencies to your `pom.xml`:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-redis-client</artifactId>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

### 2. Redis Configuration

Configure Redis in the `application.properties` file:

```properties
# Redis Configuration
quarkus.redis.redis-[SEU-PROJETO].hosts=${REDIS_HOST}
quarkus.redis.redis-[SEU-PROJETO].password=${REDIS_PASSWORD}

# Cache TTL Configuration
[seu-prefixo].cache.[nome-do-cache].ttl-seconds=86400
```

**Example:**
```properties
# Redis Configuration
quarkus.redis.redis-meu-projeto.hosts=${REDIS_HOST}
quarkus.redis.redis-meu-projeto.password=${REDIS_PASSWORD}

# Cache TTL Configuration
meu-projeto.cache.usuarios.ttl-seconds=3600
meu-projeto.cache.produtos.ttl-seconds=7200
```

## 🔴 IMPORTANTE: Escopo da Solicitação

### ⚠️ "Configure o Redis cache nessa aplicação"

Quando você receber uma solicitação para **"configurar o Redis cache"** em uma aplicação, isso significa:

#### ✅ O QUE FAZER:
1. **Adicionar as dependências Maven** (Passo 1)
2. **Configurar o Redis no application.properties** (Passo 2) 
3. **Criar APENAS a classe RemoteCache base** (Passo 3)
4. **NÃO implementar cache em features específicas**

#### ❌ O QUE NÃO FAZER:
- ❌ NÃO criar classes de cache específicas (UsuarioCache, ProdutoCache, etc.)
- ❌ NÃO modificar Services existentes
- ❌ NÃO modificar Resources/Controllers existentes
- ❌ NÃO implementar cache em todas as features da aplicação

### 📋 Configuração Básica (Quando solicitado "configurar Redis")

Se a solicitação for apenas para **configurar** o Redis, execute SOMENTE:

1. **Dependências Maven** (seção 1)
2. **Configuração application.properties** (seção 2)  
3. **Classe RemoteCache** (Passo 1 da implementação)

### 🔧 Implementação Completa (Quando solicitado "implementar cache")

Se a solicitação for para **implementar cache** em features específicas, aí sim execute todos os passos incluindo:
- Classes de cache específicas
- Modificações em Services
- Modificações em Resources
- Testes unitários

> **💡 DICA:** Sempre confirme o escopo antes de implementar. A configuração básica é suficiente para deixar o Redis disponível na aplicação.

## 🛠️ Step-by-Step Implementation

### Step 1: Create the Base RemoteCache Class

Create the generic `RemoteCache` class that will be reused by all caches:

```java
package com.yourcompany.yourproject.repository.cache;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.quarkus.logging.Log;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.Nullable;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RemoteCache {

    RedisDataSource datasource;

    private final ValueCommands<String, String> commands;
    private final String dataSourceKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RemoteCache() {
        this.datasource = null;
        this.commands = null;
        this.dataSourceKey = null;
    }

    public RemoteCache(String dataSourceKey, RedisDataSource datasource) {
        this.dataSourceKey = dataSourceKey;
        this.datasource = datasource;
        commands = datasource.value(String.class);
    }

    public void set(String key, String value) {
        commands.setnx(formatKey(key), value);
    }

    public void setex(String key, String value, long duration) {
        commands.setex(formatKey(key), duration, value);
    }

    public String get(String key) {
        return commands.get(formatKey(key));
    }

    public void del(String key) {
        commands.getdel(formatKey(key));
    }

    public Set<String> keys() {
        return datasource.key()
                .keys(formatKey("*"))
                .stream()
                .collect(Collectors.toSet());
    }

    public Map<String, String> list() {
        return commands.mget(formatKey(""));
    }

    private String formatKey(String key) {
        return dataSourceKey + ":" + key;
    }

    @Nullable
    public <T> T getValue(String key, Class<T> clazz) {
        try {
            String value = get(key);
            if (value != null) {
                return objectMapper.readValue(value, clazz);
            }
            return null;
        } catch (Exception e) {
            Log.errorf(e, "Failed to deserialize cache value for key: %s", key);
            return null;
        }
    }

    public void setValue(String key, Object value, long ttlSeconds) {
        try {
            String jsonValue = objectMapper.writeValueAsString(value);
            setex(key, jsonValue, ttlSeconds);
        } catch (Exception e) {
            Log.errorf(e, "Failed to save cache value for key: %s", key);
        }
    }
}
```

### Step 2: Create Specific Cache Classes

For each entity you want to cache, create a specific class:

#### Example: User Cache

```java
package com.yourcompany.yourproject.repository.cache;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.yourcompany.yourproject.model.Usuario;
import io.quarkus.redis.client.RedisClientName;
import io.quarkus.redis.datasource.RedisDataSource;
import jakarta.annotation.Nullable;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UsuarioCache {

    @ConfigProperty(name = "[seu-prefixo].cache.usuarios.ttl-seconds")
    public long ttlSeconds;

    private static final String USUARIOS_KEY = "usuarios";

    protected final RemoteCache redisCache;

    public UsuarioCache(@RedisClientName("redis-[seu-projeto]") RedisDataSource redisDataSource) {
        this.redisCache = new RemoteCache("[SEU_PROJETO_UPPERCASE]", redisDataSource);
    }

    // Simple cache (single key)
    @Nullable
    public Usuario get(String userId) {
        var key = String.format("%s-%s", USUARIOS_KEY, userId);
        return this.redisCache.getValue(key, Usuario.class);
    }

    public void set(Usuario usuario, String userId) {
        var key = String.format("%s-%s", USUARIOS_KEY, userId);
        this.redisCache.setValue(key, usuario, ttlSeconds);
    }

    // Cache with multiple parameters
    @Nullable
    public Usuario getByEmailAndDepartamento(String email, String departamento) {
        var key = String.format("%s-email-%s-dept-%s", USUARIOS_KEY, email, departamento);
        return this.redisCache.getValue(key, Usuario.class);
    }

    public void setByEmailAndDepartamento(Usuario usuario, String email, String departamento) {
        var key = String.format("%s-email-%s-dept-%s", USUARIOS_KEY, email, departamento);
        this.redisCache.setValue(key, usuario, ttlSeconds);
    }

    // Invalidate specific cache
    public void invalidate(String userId) {
        var key = String.format("%s-%s", USUARIOS_KEY, userId);
        this.redisCache.del(key);
    }
}
```

#### Example: Product Cache (with general and specific cache)

```java
package com.yourcompany.yourproject.repository.cache;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.yourcompany.yourproject.model.Produto;
import io.quarkus.redis.client.RedisClientName;
import io.quarkus.redis.datasource.RedisDataSource;
import jakarta.annotation.Nullable;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProdutoCache {

    @ConfigProperty(name = "[seu-prefixo].cache.produtos.ttl-seconds")
    public long ttlSeconds;

    private static final String PRODUTOS_KEY = "produtos";
    private static final String PRODUTOS_LIST_KEY = "produtos-list";

    protected final RemoteCache redisCache;

    public ProdutoCache(@RedisClientName("redis-[seu-projeto]") RedisDataSource redisDataSource) {
        this.redisCache = new RemoteCache("[SEU_PROJETO_UPPERCASE]", redisDataSource);
    }

    // Cache for complete list
    @Nullable
    public List<Produto> getAll() {
        return this.redisCache.getValue(PRODUTOS_LIST_KEY, new TypeReference<List<Produto>>() {}.getClass());
    }

    public void setAll(List<Produto> produtos) {
        this.redisCache.setValue(PRODUTOS_LIST_KEY, produtos, ttlSeconds);
    }

    // Cache for specific product
    @Nullable
    public Produto get(String produtoId) {
        var key = String.format("%s-%s", PRODUTOS_KEY, produtoId);
        return this.redisCache.getValue(key, Produto.class);
    }

    public void set(Produto produto, String produtoId) {
        var key = String.format("%s-%s", PRODUTOS_KEY, produtoId);
        this.redisCache.setValue(key, produto, ttlSeconds);
    }

    // Cache with filters
    @Nullable
    public List<Produto> getByCategoria(String categoria) {
        var key = String.format("%s-categoria-%s", PRODUTOS_KEY, categoria);
        return this.redisCache.getValue(key, new TypeReference<List<Produto>>() {}.getClass());
    }

    public void setByCategoria(List<Produto> produtos, String categoria) {
        var key = String.format("%s-categoria-%s", PRODUTOS_KEY, categoria);
        this.redisCache.setValue(key, produtos, ttlSeconds);
    }
}
```

### Step 3: Integrate Cache in the Service

Use the cache in your service following the pattern:

```java
package com.yourcompany.yourproject.service;

import com.yourcompany.yourproject.repository.cache.UsuarioCache;
import com.yourcompany.yourproject.model.Usuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class UsuarioService {

    @Inject
    UsuarioCache usuarioCache;

    @Inject
    UsuarioRepository usuarioRepository;

    public Usuario getUsuario(String userId, Boolean noCache) {
        // If noCache is not true, try to fetch from cache
        if (!Boolean.TRUE.equals(noCache)) {
            var cachedUsuario = usuarioCache.get(userId);
            if (cachedUsuario != null) {
                return cachedUsuario;
            }
        }

        // Fetch from repository/API
        var usuario = usuarioRepository.findById(userId);
        
        // Save to cache if user was found
        if (usuario != null) {
            usuarioCache.set(usuario, userId);
        }

        return usuario;
    }

    public Usuario atualizarUsuario(String userId, Usuario usuarioAtualizado) {
        // Update in repository
        var usuario = usuarioRepository.update(userId, usuarioAtualizado);
        
        // Invalidate cache or update with new value
        usuarioCache.set(usuario, userId);
        
        return usuario;
    }

    public void deletarUsuario(String userId) {
        // Remove from repository
        usuarioRepository.delete(userId);
        
        // Invalidate cache
        usuarioCache.invalidate(userId);
    }
}
```

### Step 4: Integrate in Resource/Controller

```java
package com.yourcompany.yourproject.resource;

import com.yourcompany.yourproject.service.UsuarioService;
import com.yourcompany.yourproject.model.Usuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.RestResponse;

@Path("/v1/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioResource {

    @Inject
    UsuarioService usuarioService;

    @GET
    @Path("/{userId}")
    public RestResponse<Usuario> getUsuario(
            @PathParam("userId") String userId,
            @HeaderParam("no-cache") @DefaultValue("false") Boolean noCache) {
        
        var usuario = usuarioService.getUsuario(userId, noCache);
        return RestResponse.ok(usuario);
    }

    @PUT
    @Path("/{userId}")
    public RestResponse<Usuario> atualizarUsuario(
            @PathParam("userId") String userId, 
            Usuario usuario) {
        
        var usuarioAtualizado = usuarioService.atualizarUsuario(userId, usuario);
        return RestResponse.ok(usuarioAtualizado);
    }

    @DELETE
    @Path("/{userId}")
    public RestResponse<Void> deletarUsuario(@PathParam("userId") String userId) {
        usuarioService.deletarUsuario(userId);
        return RestResponse.noContent();
    }
}
```

## 🧪 Unit Tests

### Cache Test Example

```java
package unit.com.yourcompany.yourproject.repository.cache;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.yourcompany.yourproject.repository.cache.UsuarioCache;
import com.yourcompany.yourproject.repository.cache.RemoteCache;
import com.yourcompany.yourproject.model.Usuario;
import io.quarkus.redis.datasource.RedisDataSource;

class UsuarioCacheTest {

    private static final String TEST_USER_ID = "12345";
    private static final long TEST_TTL_SECONDS = 3600L;

    private UsuarioCache usuarioCache;
    private RemoteCache mockRemoteCache;
    private RedisDataSource mockRedisDataSource;

    @BeforeEach
    void setUp() {
        mockRedisDataSource = mock(RedisDataSource.class);
        mockRemoteCache = mock(RemoteCache.class);

        usuarioCache = new UsuarioCache(mockRedisDataSource);
        usuarioCache.ttlSeconds = TEST_TTL_SECONDS;

        // Inject the mock using reflection
        try {
            var field = UsuarioCache.class.getDeclaredField("redisCache");
            field.setAccessible(true);
            field.set(usuarioCache, mockRemoteCache);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject mock RemoteCache", e);
        }
    }

    @Test
    void get_when_cacheHasData_should_returnCachedUser() {
        // Arrange
        Usuario expectedUser = createMockUser();
        String expectedKey = "usuarios-" + TEST_USER_ID;
        when(mockRemoteCache.getValue(expectedKey, Usuario.class)).thenReturn(expectedUser);

        // Act
        Usuario actualUser = usuarioCache.get(TEST_USER_ID);

        // Assert
        assertNotNull(actualUser);
        assertEquals(expectedUser, actualUser);
        verify(mockRemoteCache).getValue(expectedKey, Usuario.class);
    }

    @Test
    void set_when_userProvided_should_delegateToRemoteCacheWithCorrectTtl() {
        // Arrange
        Usuario testUser = createMockUser();
        String expectedKey = "usuarios-" + TEST_USER_ID;

        // Act
        usuarioCache.set(testUser, TEST_USER_ID);

        // Assert
        verify(mockRemoteCache).setValue(expectedKey, testUser, TEST_TTL_SECONDS);
    }

    private Usuario createMockUser() {
        Usuario user = mock(Usuario.class);
        when(user.getId()).thenReturn(TEST_USER_ID);
        when(user.getNome()).thenReturn("João da Silva");
        return user;
    }
}
```

## 📝 Patterns and Conventions

### 1. Key Naming

- Use consistent prefixes: `[entity]-[identifier]`
- For composite keys: `[entity]-[param1]-[value1]-[param2]-[value2]`
- Examples:
  - `usuarios-12345`
  - `produtos-categoria-eletronicos`
  - `parametros-canal-WEB`

### 2. TTL Configuration

- Configure appropriate TTLs based on data change frequency
- Use environment variables to facilitate adjustments:
  ```properties
  # Frequently changing data
  cache.usuarios-sessao.ttl-seconds=300    # 5 minutes
  
  # Stable data
  cache.parametros-sistema.ttl-seconds=86400  # 24 hours
  
  # Rarely changed data
  cache.configuracoes.ttl-seconds=604800   # 7 days
  ```

### 3. Cache Strategies

#### Cache-Aside (Recommended)
```java
public Usuario getUsuario(String id) {
    // 1. Check cache
    Usuario usuario = cache.get(id);
    if (usuario != null) {
        return usuario;
    }
    
    // 2. Fetch from database
    usuario = repository.findById(id);
    
    // 3. Save to cache
    if (usuario != null) {
        cache.set(usuario, id);
    }
    
    return usuario;
}
```

#### Write-Through
```java
public Usuario salvarUsuario(Usuario usuario) {
    // 1. Save to database
    Usuario usuarioSalvo = repository.save(usuario);
    
    // 2. Update cache
    cache.set(usuarioSalvo, usuarioSalvo.getId());
    
    return usuarioSalvo;
}
```

#### Write-Behind (Invalidation)
```java
public void atualizarUsuario(String id, Usuario usuario) {
    // 1. Update in database
    repository.update(id, usuario);
    
    // 2. Invalidate cache (will be reloaded on next fetch)
    cache.invalidate(id);
}
```

## ⚠️ Logging Configuration

### Standard Logging

Use Quarkus's standard logging facility for error handling:

```java
import io.quarkus.logging.Log;
```

#### Logger Usage:

For logging errors with exceptions:
```java
Log.errorf(exception, "Message with parameter: %s", parameter);
```

#### Implementation Example:

```java
// In the RemoteCache class
@Nullable
public <T> T getValue(String key, Class<T> clazz) {
    try {
        String value = get(key);
        if (value != null) {
            return objectMapper.readValue(value, clazz);
        }
        return null;
    } catch (Exception e) {
        Log.errorf(e, "Failed to deserialize cache value for key: %s", key);
        return null;
    }
}

public void setValue(String key, Object value, long ttlSeconds) {
    try {
        String jsonValue = objectMapper.writeValueAsString(value);
        setex(key, jsonValue, ttlSeconds);
    } catch (Exception e) {
        Log.errorf(e, "Failed to save cache value for key: %s", key);
    }
}
```

> **💡 TIP:** The `Log.errorf()` method accepts the exception as the first parameter, followed by the message template and parameters.

## 🔧 Advanced Configuration

### Redis Cluster Configuration

```properties
# Configuration for Redis cluster
quarkus.redis.redis-meu-projeto.hosts=redis-node1:6379,redis-node2:6379,redis-node3:6379
quarkus.redis.redis-meu-projeto.password=${REDIS_PASSWORD}
quarkus.redis.redis-meu-projeto.client-type=CLUSTER
```

### SSL Configuration

```properties
# SSL Configuration
quarkus.redis.redis-meu-projeto.ssl=true
quarkus.redis.redis-meu-projeto.trust-all=false
quarkus.redis.redis-meu-projeto.trust-store-path=/path/to/truststore.jks
quarkus.redis.redis-meu-projeto.trust-store-password=${TRUSTSTORE_PASSWORD}
```

### Connection Pool Configuration

```properties
# Connection pool
quarkus.redis.redis-meu-projeto.max-pool-size=20
quarkus.redis.redis-meu-projeto.max-pool-waiting=24
```

## 📊 Monitoring and Observability

### Custom Metrics

```java
import io.micrometer.core.annotation.Counted;
import io.micrometer.core.annotation.Timed;

@ApplicationScoped
public class UsuarioCache {
    
    @Counted(value = "cache.usuarios.hits", description = "Number of cache hits")
    @Timed(value = "cache.usuarios.get.time", description = "Cache fetch time")
    public Usuario get(String userId) {
        return this.redisCache.getValue(formatKey(userId), Usuario.class);
    }
    
    @Counted(value = "cache.usuarios.sets", description = "Number of cache writes")
    @Timed(value = "cache.usuarios.set.time", description = "Cache write time")
    public void set(Usuario usuario, String userId) {
        this.redisCache.setValue(formatKey(userId), usuario, ttlSeconds);
    }
}
```

### Redis Health Check

```java
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

@Readiness
@ApplicationScoped
public class RedisHealthCheck implements HealthCheck {
    
    @Inject
    @RedisClientName("redis-meu-projeto")
    RedisDataSource redisDataSource;
    
    @Override
    public HealthCheckResponse call() {
        try {
            redisDataSource.value(String.class).set("health-check", "ok");
            return HealthCheckResponse.up("Redis connection");
        } catch (Exception e) {
            return HealthCheckResponse.down("Redis connection failed: " + e.getMessage());
        }
    }
}
```

## 🚀 Complete Example

You can find a complete working example in the `silce-parametros-gestao` project, which includes:

- ✅ Redis configuration
- ✅ RemoteCache implementation
- ✅ Specific caches (ParametrosCanalCache, ParametrosSimulacaoCache)
- ✅ Integration with Services
- ✅ Complete unit tests
- ✅ Usage in REST Resources

## 📚 References

- [Official Quarkus Redis Documentation](https://quarkus.io/guides/redis)
- [Redis Commands Reference](https://redis.io/commands)
- [Jackson Documentation](https://github.com/FasterXML/jackson-docs)

## 🆘 Troubleshooting

### Common Issues

1. **Connection Error**: Verify that the `REDIS_HOST` and `REDIS_PASSWORD` variables are configured
2. **Serialization**: Make sure objects are serializable (have default constructor)
3. **Performance**: Monitor object size in cache and adjust TTLs as needed
4. **Memory**: Configure appropriate limits in Redis to avoid out-of-memory

### Debug Logs

```properties
# Enable debug logs for Redis
quarkus.log.category."io.quarkus.redis".level=DEBUG
```

---

This guide provides a solid foundation for implementing Redis cache in Quarkus projects. Adapt the examples according to your specific needs and always test in a development environment before applying to production.
