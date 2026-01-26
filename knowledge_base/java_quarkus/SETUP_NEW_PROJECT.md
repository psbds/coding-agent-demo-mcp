---
name: setup_new_project
description: Detailed guidelines for setting up a new project in Java Quarkus, including initial configuration, project structure, and best practices.
---

# How to Create a New Java Quarkus Project

## Prerequisites

Before creating a new Quarkus project, ensure you have:
- Java 21 JDK installed
- Quarkus CLI installed (or Maven/Gradle)
- Git (optional, for version control)

## Project Creation Command

Always use the `quarkus create app` command to create a new Quarkus project.

**Important**: The project should be created in the root folder of the repository. This means the `pom.xml` file should be located at the root level of the repo, not in a subdirectory.

### Basic Command Structure

```bash
quarkus create app <groupId>:<artifactId> \
  --java=21 \
  --no-code
```

### Default GroupId

The default groupId should be: **psbds.demo**

### Example: Creating a New Project

To create the project in the root folder of your repository:

1. First, create and navigate to your repository directory:
   ```bash
   mkdir my-project-name
   cd my-project-name
   git init  # Optional: initialize git repository
   ```

2. Create the Quarkus project in the current directory (root):
   ```bash
   quarkus create app psbds.demo:my-project-name \
     --java=21 \
     --no-code \
     --output-directory=.
   ```

   The `--output-directory=.` option ensures the project files are created in the current directory (root) rather than in a subdirectory.

3. Verify that `pom.xml` is in the root folder:
   ```bash
   ls pom.xml  # Should show pom.xml in current directory
   ```

Replace `my-project-name` with your actual project name.

## Command Options

- `--java=21`: Specifies Java version 21
- `--no-code`: Creates the project without example code
- The command automatically uses the latest stable version of Quarkus

## After Project Creation

1. Navigate to the project directory:
   ```bash
   cd my-project-name
   ```

2. Verify the project structure was created correctly

3. **Important**: Delete the default Dockerfile configurations that Quarkus creates in the `src/main/docker` folder. These auto-generated Docker files should NOT be used.
   ```bash
   rm -rf src/main/docker
   ```

4. Follow the project structure guidelines from the `project_structure` documentation

5. Apply default configurations from the `project_default_configuration` documentation

6. Create a `.gitignore` file in the root of the project with the standard template (see section below)

## Standard .gitignore Template

Always create a `.gitignore` file in the root of new Java Quarkus web application projects with the following content:

```gitignore
#Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
release.properties
.flattened-pom.xml

# Eclipse
.project
.classpath
.settings/
bin/

# IntelliJ
.idea
*.ipr
*.iml
*.iws

# NetBeans
nb-configuration.xml

# Visual Studio Code
.vscode
.factorypath

# OSX
.DS_Store

# Vim
*.swp
*.swo

# patch
*.orig
*.rej

# Local environment
.env

# Plugin directory
/.quarkus/cli/plugins/
# TLS Certificates
.certs/
```

## Project Naming Conventions

- Use lowercase letters
- Separate words with hyphens (kebab-case)
- Keep names descriptive but concise
- Example: `customer-service`, `payment-api`, `order-processor`

## Next Steps

After creating the project:
1. Review and update the `application.properties` file
2. Set up your project structure according to established guidelines
3. Configure required dependencies in `pom.xml`
4. Set up unit testing framework
5. Configure CI/CD pipelines if needed
