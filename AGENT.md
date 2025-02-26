# Content Foundry Documentation

## Project Overview

Content Foundry is an open-source platform designed to help creators tell their stories effectively across various platforms. The application uses modern web technologies with Deno as the runtime, React for the UI, and GraphQL for the API layer.

## Project Structure

```
.
├── build/                      # Compiled application output
├── content/                    # Content and documentation
│   ├── blog/                   # Blog posts
│   └── documentation/          # Project documentation
├── infra/                      # Infrastructure code
│   ├── appBuild/               # Build configuration
│   ├── bff/                    # BFF (Bolt Foundry Friend) tools
│   │   ├── bin/                # Executable scripts
│   │   ├── friends/            # BFF command modules
│   │   └── prompts/            # Prompt templates
│   └── jupyter/                # Jupyter notebook configuration
├── lib/                        # Shared utility functions
├── packages/                   # Project modules
│   ├── analytics/              # Analytics functionality
│   ├── app/                    # Main application code
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts
│   │   └── hooks/              # Custom React hooks
│   ├── bfDb/                   # Database interface
│   │   ├── coreModels/         # Core data models
│   │   ├── classes/            # Database classes
│   │   └── models/             # Data models
│   ├── bfDs/                   # Design system components
│   ├── extension/              # Browser extension code
│   ├── featureFlags/           # Feature flag management
│   ├── graphql/                # GraphQL schema and resolvers
│   ├── redirector/             # URL redirection handling
│   ├── tools/                  # Utility tools
│   └── web/                    # Web server implementation
├── static/                     # Static assets and CSS
├── AGENT.md                    # This file
└── README.md                   # Project overview
```

## Key Technologies

- **Deno 2**: Modern JavaScript/TypeScript runtime (v2.x)
- **React**: UI library for building component-based interfaces
- **GraphQL**: API query language and runtime
- **Sapling SCM**: Modern source control management system
- **BFF (Bolt Foundry Friend)**: Custom task runner and development tool suite
- **Nix**: Reproducible build system for environment management

## BFF (Bolt Foundry Friend)

BFF is Content Foundry's custom task runner and development tool suite. It provides a unified interface for common development tasks.

### Key BFF Commands

```bash
# Get a list of all commands
bff help

# Development Tools
bff devTools          # Start development environment
bff devToolsStop      # Stop development environment

# Build and Deployment
bff build             # Build the application
bff deploy            # Run CI checks and build for deployment
bff ci                # Run CI checks (lint, test, build, format)

# Testing and Quality
bff test              # Run tests
bff lint              # Lint code
bff format            # Format code using deno fmt

# Content Management
bff contentLint       # Lint markdown content files
bff llm               # Output files in a prompt-friendly format

# Database
bff db:reset          # Reset database (development only)
bff db:clean          # Clean database models

# Version Control
bff fork              # Fork the repository to personal GitHub account
bff land              # Pull code, install deps, create git commit
bff pull              # Pull latest code and goto remote/main
bff testStack         # Run tests on each commit in current stack
```

## Sapling SCM Integration

Content Foundry uses Sapling SCM for source control management. Sapling offers advanced features while maintaining compatibility with Git.

### Key Sapling Commands

- `sl status` - Show modified files
- `sl commit` - Commit changes
- `sl push` - Push changes to remote
- `sl pull` - Pull changes from remote
- `sl goto` - Switch to specific branch or commit
- `sl log` - View commit history
- `sl web` - Start Sapling web interface

### BFF Integration with Sapling

BFF includes commands to streamline working with Sapling:

```bash
# Fork repository to personal GitHub account
bff fork

# Pull latest code and switch to remote/main
bff pull

# Test each commit in the current stack
bff testStack
```

## Development Environment

Content Foundry provides a comprehensive development environment through BFF:

```bash
# Start development tools
bff devTools

# This starts:
# - Sapling web interface (port 3011)
# - Jupyter notebook (port 8888)
# - Tools web interface (port 9999)
```

## Notebook Integration

Content Foundry integrates Jupyter notebooks for data analysis and documentation:

```bash
# Open Jupyter notebook interface
bff devTools

# Access at: https://<your-domain>:8888 (token: bfjupyter)
```

## GraphQL API

Content Foundry uses GraphQL for its API layer:

- Schema is defined in `packages/graphql/types/`
- Generated schema available at `packages/graphql/__generated__/schema.graphql`

## Building the Application

```bash
# Build the application
bff build

# This:
# 1. Runs routesBuild.ts to generate route entrypoints
# 2. Runs contentBuild.ts to process markdown/MDX files
# 3. Runs GraphQL server generation
# 4. Runs isograph compiler for React components
# 5. Builds the client application
```

## Front-end Architecture

Content Foundry uses a component-based architecture with React:

- Components are in `packages/app/components/`
- Design system components in `packages/bfDs/components/`
- Isograph used for component data fetching
- Router context for navigation

## Database Layer

The application uses a custom database abstraction layer:

- Core models in `packages/bfDb/coreModels/`
- Business models in `packages/bfDb/models/`
- PostgreSQL via Neon for database storage

## Additional Modules

- **Feature Flags**: Feature toggle system in `packages/featureFlags/` for controlled feature rollouts
- **Analytics**: Custom analytics implementation in `packages/analytics/`
- **Error Handling**: Centralized error handling via `packages/BfError.ts`
- **Configuration**: Environment-based configuration in `packages/getConfigurationVariable.ts`
- **Logging**: Structured logging system in `packages/logger.ts`
- **Tools**: Developer tools in `packages/tools/`
- **Web Server**: Web server implementation in `packages/web/`

## Dependency Management

Content Foundry uses Deno 2 for JavaScript/TypeScript runtime and dependency management.

### Deno 2 Dependency Management

Deno 2 introduces significant changes to dependency management:

- Dependencies are handled through the `deno.json` configuration
- Use `deno add` to add new dependencies:
  ```bash
  # Add a dependency from JSR (JavaScript Registry)
  deno add @std/http
  
  # Add a dependency from npm
  deno add npm:react
  ```

- JSR (JavaScript Registry) is the preferred package source
- Import format for JSR: `import { xyz } from "jsr:@org/package@version";`
- Import format for npm: `import { xyz } from "npm:package-name@version";`

### Nix Integration

Content Foundry uses Nix for reproducible builds and environment management:

```bash
# Build the current nix system
bff nix

# Build with only deployment packages
bff nix:deploy
```

The Nix configuration is defined in `flake.nix` and ensures consistent development environments across different systems.

## Development Workflow

### Before Committing Changes

Before committing your changes, it's important to run the following commands:

```bash
# Format your code (shorthand for 'bff format')
bff f

# Run CI checks to ensure your code passes all validation
bff ci
```

The `bff ci` command runs:
- Code formatting checks
- Linting
- TypeScript type checking
- Tests
- Build verification

This ensures your code meets the project's quality standards before being committed.

## Best Practices

1. **Use BFF commands** for common tasks
2. **Always run `bff f` and `bff ci`** before committing
3. **Follow modular structure** for code organization
4. **Write tests** for new functionality
5. **Document your code** thoroughly
6. **Use typed interfaces** for better reliability
7. **Use `deno add`** for managing dependencies
8. **Leverage Nix** for consistent environments