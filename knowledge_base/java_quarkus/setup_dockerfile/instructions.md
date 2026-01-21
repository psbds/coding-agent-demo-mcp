# Dockerfile Setup Instructions for Java Quarkus Application

## Overview
This guide provides instructions for creating a production-ready Dockerfile for Java Quarkus applications using a multi-stage build approach. The Dockerfile optimizes image size and security while ensuring efficient builds.

## Multi-Stage Build Architecture

The Dockerfile uses a two-stage build process:
1. **Build Stage**: Compiles the application using Maven
2. **Runtime Stage**: Creates a minimal runtime image with only necessary artifacts

## Complete Dockerfile

Create a file named `Dockerfile` in the root directory of your project with the following content:

```dockerfile
FROM maven:3-eclipse-temurin-21 AS build
COPY . .

RUN mvn clean install -DskipTests

FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu

RUN apt update && apt upgrade -y curl

RUN mkdir /opt/deploy
COPY --from=build target/quarkus-app/*.jar /opt/deploy/
COPY --from=build target/quarkus-app/lib/ /opt/deploy/lib/
COPY --from=build target/quarkus-app/app/ /opt/deploy/app/
COPY --from=build target/quarkus-app/quarkus/ /opt/deploy/quarkus/

EXPOSE 80
ENTRYPOINT ["java", "-jar","/opt/deploy/quarkus-run.jar"]
```

## Detailed Explanation

### Stage 1: Build Stage

```dockerfile
FROM maven:3-eclipse-temurin-21 AS build
```
- Uses Maven 3 with Eclipse Temurin JDK 21 as the base image
- Named `build` for reference in subsequent stages
- Provides all tools needed for compilation

```dockerfile
COPY . .
```
- Copies the entire project source code into the build container
- Includes pom.xml, source files, and resources

```dockerfile
RUN mvn clean install -DskipTests
```
- Cleans previous builds
- Compiles and packages the application
- Skips tests to speed up the build (tests should run in CI/CD pipeline)
- Generates the Quarkus application in `target/quarkus-app/`

### Stage 2: Runtime Stage

```dockerfile
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu
```
- Uses Microsoft's official OpenJDK 21 image based on Ubuntu
- Smaller than the build image
- Contains only the runtime environment

```dockerfile
RUN apt update && apt upgrade -y curl
```
- Updates package lists
- Upgrades curl for health checks and external communications
- Ensures security patches are applied

```dockerfile
RUN mkdir /opt/deploy
```
- Creates the deployment directory
- Standardized location for application artifacts

```dockerfile
COPY --from=build target/quarkus-app/*.jar /opt/deploy/
COPY --from=build target/quarkus-app/lib/ /opt/deploy/lib/
COPY --from=build target/quarkus-app/app/ /opt/deploy/app/
COPY --from=build target/quarkus-app/quarkus/ /opt/deploy/quarkus/
```
- Copies compiled artifacts from the build stage
- Preserves Quarkus fast-jar structure:
  - `*.jar`: Main runner JAR (quarkus-run.jar)
  - `lib/`: Application dependencies
  - `app/`: Application classes and resources
  - `quarkus/`: Quarkus framework files

```dockerfile
EXPOSE 80
```
- Documents that the application listens on port 80
- Note: This is declarative; actual port mapping occurs at runtime

```dockerfile
ENTRYPOINT ["java", "-jar","/opt/deploy/quarkus-run.jar"]
```
- Defines the command to start the application
- Executes the Quarkus runner JAR
- Uses exec form for proper signal handling

## Building the Docker Image

To build the Docker image, run:

```bash
docker build -t your-app-name:version .
```

Example:
```bash
docker build -t my-quarkus-app:1.0.0 .
```

## Running the Container

To run the container:

```bash
docker run -p 8080:80 your-app-name:version
```

With environment variables:
```bash
docker run -p 8080:80 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://host:5432/db \
  -e QUARKUS_DATASOURCE_USERNAME=user \
  -e QUARKUS_DATASOURCE_PASSWORD=pass \
  your-app-name:version
```

## Best Practices

### 1. Use .dockerignore
Create a `.dockerignore` file in the root directory using a whitelist approach (exclude everything except required files):

```
# Exclude everything
*

# Include only required files for build
!src/
!pom.xml
!.mvn/
!mvnw
!mvnw.cmd
```

**Explanation:**
- `*` excludes everything by default
- `!pattern` explicitly includes specific files/folders
- This ensures only necessary files are copied to the build stage
- Keeps the build context small and secure

### 2. Port Configuration
Ensure your `application.properties` or `application.yml` configures Quarkus to listen on port 80:

```properties
quarkus.http.port=80
quarkus.http.host=0.0.0.0
```

### 3. Health Checks
Add health check configuration to the Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:80/q/health || exit 1
```

### 4. Non-Root User (Security Enhancement)
For production, run the application as a non-root user:

```dockerfile
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu

RUN apt update && apt upgrade -y curl

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

RUN mkdir /opt/deploy && chown -R appuser:appuser /opt/deploy

COPY --from=build --chown=appuser:appuser target/quarkus-app/*.jar /opt/deploy/
COPY --from=build --chown=appuser:appuser target/quarkus-app/lib/ /opt/deploy/lib/
COPY --from=build --chown=appuser:appuser target/quarkus-app/app/ /opt/deploy/app/
COPY --from=build --chown=appuser:appuser target/quarkus-app/quarkus/ /opt/deploy/quarkus/

USER appuser

EXPOSE 80
ENTRYPOINT ["java", "-jar","/opt/deploy/quarkus-run.jar"]
```

### 5. JVM Optimization
Add JVM options for containerized environments:

```dockerfile
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "/opt/deploy/quarkus-run.jar"]
```

### 6. Build Arguments
Use build arguments for flexibility:

```dockerfile
ARG MAVEN_VERSION=3
ARG JAVA_VERSION=21

FROM maven:${MAVEN_VERSION}-eclipse-temurin-${JAVA_VERSION} AS build
# ... rest of build stage

FROM mcr.microsoft.com/openjdk/jdk:${JAVA_VERSION}-ubuntu
# ... rest of runtime stage
```

## Troubleshooting

### Issue: Application not starting
- Check logs: `docker logs <container-id>`
- Verify port configuration in application.properties
- Ensure all dependencies are copied correctly

### Issue: Image size too large
- Verify .dockerignore is properly configured
- Consider using distroless images for runtime
- Remove unnecessary packages from runtime image

### Issue: Build fails
- Ensure Maven can access dependencies (check network/proxies)
- Verify pom.xml is valid
- Check Java version compatibility

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
- name: Build Docker Image
  run: docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .

- name: Push to Registry
  run: docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

## Additional Resources

- [Quarkus Container Images Guide](https://quarkus.io/guides/container-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
