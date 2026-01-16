# Action

Use this step-by-step guide and update my SETTINGS.md documentation

## Prompt for Configuration Documentation Update

This file contains the prompt and instructions to automatically update the `SETTINGS.md` documentation whenever there are changes in the application configuration files.

## How to Use

1. Make sure the configuration files are up to date
2. Attach the following files to the prompt:
   - `src/main/resources/application.properties`
   - `src/main/resources/application-prod.properties`
   - `src/main/resources/application-test.properties`
   - `.env.example`
   - `docs/SETTINGS.md` (current file)
3. Use the prompt below

## Prompt for AI

```
Analyze the attached configuration files (application.properties, application-prod.properties, application-test.properties, .env.example) and adjust the SETTINGS.md documentation to correctly reflect all existing configurations.

Make sure to:

1. **Include all configurations** present in the properties files
2. **Document all environment variables** used in the files
3. **Correctly specify whether each configuration is required**
4. **Include value examples** when appropriate
5. **Maintain the existing structure** of the documentation
6. **Add new sections** if necessary for undocumented configurations
7. **Update differences between environments** based on the different properties files
8. **Verify that the .env.example file** is aligned with the documented variables

Specific areas to check:
- Development configurations (Dev Services, Live Reload)
- Application configurations (environment)
- OpenAPI configurations
- Redis configurations (hosts, password)
- OpenTelemetry configurations (endpoint, metrics, logs, instrumentation)
- TLS configurations
- CORS configurations
- OIDC authentication configurations
- Required vs optional environment variables
- Differences between environments (local, prod, test)

Keep the documentation clear, organized, and useful for developers who need to configure the application.
```

## Files That Should Be Attached

### Main Configuration Files
- `/src/main/resources/application.properties` - Local/development configurations
- `/src/main/resources/application-prod.properties` - Production configurations
- `/src/main/resources/application-test.properties` - Test configurations

### Example and Documentation Files
- `/.env.example` - Environment variables template
- `/docs/SETTINGS.md` - Current documentation (for context)

## Validation Checklist

After the update, verify that:

- [ ] All properties from the `.properties` files are documented
- [ ] All environment variables are listed in the tables
- [ ] The required status is correct (Yes/No)
- [ ] Data types are correct (string, boolean, etc.)
- [ ] Descriptions are clear and useful
- [ ] Value examples are appropriate
- [ ] Differences between environments are updated
- [ ] The `.env.example` file is aligned with the documentation
- [ ] The documentation structure remains organized

## Usage Example

1. **Make changes** to the configuration files as needed
2. **Attach the 5 files** listed above in a conversation with AI
3. **Paste the prompt** from the "Prompt for AI" section
4. **Review the suggested changes** before applying
5. **Execute the validation** checklist

## Important Notes

- **Always review** security configurations before applying in production
- **Verify** that sensitive variables (passwords, secrets) are not exposed in examples
- **Maintain** comments about environment-specific configurations
- **Update** the last modification date if necessary

## Update History

| Date | Responsible | Change Description |
|------|-------------|-------------------|
| 2025-08-04 | System | Creation of template prompt for automatic updates |

---

**Tip**: Save this file in version control so that the entire team can use the same standardized process to update the documentation.
