# Content Foundry Documentation

## Project Overview

Content Foundry is an open-source platform designed to help creators tell their
stories effectively across various platforms. The application uses modern web
technologies with Deno as the runtime, React for the UI, and GraphQL for the API
layer.

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

BFF is Content Foundry's custom task runner and development tool suite. It
provides a unified interface for common development tasks.

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

Content Foundry uses Sapling SCM for source control management. Sapling offers
advanced features while maintaining compatibility with Git.

### Key Sapling Commands

- `sl status` - Show modified files
- `sl commit` - Commit changes
- `sl push` - Push changes to remote
- `sl pull` - Pull changes from remote
- `sl goto` - Switch to specific branch or commit
- `sl log` - View commit history
- `sl web` - Start Sapling web interface
- `sl diff` - Show changes in working directory
- `sl submit` - Submit a pull request with your changes for review

### Creating Structured Commits

When creating commits in Sapling, it's recommended to follow a structured format
with:

1. A clear, descriptive title
2. A detailed description with "Summary" and "Test Plan" sections

#### Using the Commit Template

We've set up a commit template to help you create well-structured commits. To
use it:

```bash
# First ensure code is formatted properly
bff f

# Generate a diff and save it to a file for review
sl diff > build/sl.txt

# Review the diff to understand changes
cat build/sl.txt

# Create a commit using the template
sl commit
```

This will open your editor with the commit template pre-populated:

```
# Title: concise description of changes (50 chars max)

## Summary
# Explain what changed and why (bullet points work well)
# - Change 1
# - Change 2

## Test Plan
# Describe how you tested these changes
# - What you verified
# - How others can test/verify
```

Fill in each section, removing the comment lines (lines starting with #). Make
sure to:

- Use a short, descriptive title
- Leave a blank line after the title
- Use line breaks to make the commit message readable
- Use bullet points in the Summary and Test Plan sections
- Save and close the editor to complete the commit

#### Manual Commit Structure

If not using the template, you can still create a well-structured commit
manually:

```bash
# Format code before committing
bff f

# Then commit with a descriptive message
sl commit -m "Descriptive title

## Summary
- Change 1: Brief explanation of first change
- Change 2: Brief explanation of second change

## Test Plan
- Verified X works as expected
- Ran Y test and confirmed Z outcome"
```

The key is to use line breaks and formatting to make your commit message
readable.

Example commit message:

```
Fix content collection ID lookup and add BfGid type documentation

## Summary
- Fixed content collection lookup by correctly handling ID prefix conventions
- Added documentation about BfGid type errors to AGENT.md
- Updated collectionsCache.get() to properly convert string IDs to BfGid

## Test Plan
- Verified content/marketing collection now loads correctly
- Tested with shortened collection ID format
- Added explicit tests for ID conversion edge cases
```

This structured approach makes commits more informative and easier to review.

### Splitting Commits

Before committing your changes, it's recommended to split your work into
separate logical commits whenever possible. This makes changes easier to review,
understand, and potentially revert if needed.

Guidelines for splitting commits:

- Each commit should represent a single logical change or feature
- Keep related changes together in the same commit
- Separate unrelated changes into different commits
- Consider splitting large changes into smaller, incremental commits
- Make sure each commit can be understood on its own

For example, instead of committing "Update user profile and fix database
connection", create two separate commits: "Add user profile editing feature" and
"Fix database connection timeout issue".

#### Using the commit.sh Script or llmCommit

For convenience, there are two options to create properly formatted commits:

1. The `bff llmCommit` command leverages automatic analysis to prepare your
   commit:

```bash
# Run the automated commit helper with optional arguments
bff llmCommit [title] [summary] [test_plan]

# This command will:
# 1. Format your code with bff f
# 2. Generate a diff file 
# 3. Analyze changes to identify logical commits
# 4. Create a properly formatted github, sapling, sl, or bff commit
# 5. Split commits into logical units when possible
```

Note: This command is primarily designed for automated use by agents and
requires minimal interaction.

2. Alternatively, a traditional commit helper script is available at
   `build/commit.sh`:

```bash
# Run the commit helper script
bash build/commit.sh

# This script will:
# 1. Format your code with bff f
# 2. Generate a diff file
# 3. Open the diff for review
# 4. Prompt for commit message details
# 5. Create a properly formatted github, sapling, sl, or bff commit
```

You can use either of these options to streamline the commit process while
ensuring all steps are followed correctly.

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

Content Foundry integrates Jupyter notebooks for data analysis and
documentation:

```bash
# Open Jupyter notebook interface
bff devTools

# Access at: https://<your-domain>:8888 (token: bfjupyter)
```

## GraphQL API

Content Foundry uses GraphQL for its API layer:

- Schema is defined in `packages/graphql/types/`
- Generated schema available at `packages/graphql/__generated__/schema.graphql`

### Context Usage in Resolvers

GraphQL resolvers in Content Foundry use a context object (`ctx`) to access
models and data. This pattern ensures proper access control and consistent data
management:

```typescript
// Example resolver function
resolve: (async (parent, args, ctx) => {
  // Use ctx.find to get a model by ID
  const model = await ctx.find(ModelClass, id);

  // Use ctx.findX for required models (throws if not found)
  const requiredModel = await ctx.findX(ModelClass, id);

  // Access current user
  const currentUser = await ctx.findCurrentViewer();

  // For collections with items, use ctx to retrieve the parent first
  const collection = await ctx.findX(CollectionClass, parent.id);
  const items = collection.props.items || [];

  return result;
});
```

Key context methods:

- `ctx.find(Class, id)`: Find an object by ID (returns null if not found)
- `ctx.findX(Class, id)`: Find an object by ID (throws error if not found)
- `ctx.findCurrentUser()`: Get the current authenticated user
- `ctx.login()`, `ctx.register()`: Authentication methods

This pattern ensures:

1. Proper access control through the current viewer
2. Consistent data loading and caching
3. Type safety through the database model classes

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

- **Feature Flags**: Feature toggle system in `packages/featureFlags/` for
  controlled feature rollouts
- **Analytics**: Custom analytics implementation in `packages/analytics/`
- **Error Handling**: Centralized error handling via `packages/BfError.ts`
- **Configuration**: Environment-based configuration in
  `packages/getConfigurationVariable.ts`
- **Logging**: Structured logging system in `packages/logger.ts`
- **Tools**: Developer tools in `packages/tools/`
- **Web Server**: Web server implementation in `packages/web/`

## Dependency Management

Content Foundry uses Deno 2 for JavaScript/TypeScript runtime and dependency
management.

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

The Nix configuration is defined in `flake.nix` and ensures consistent
development environments across different systems.

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

This ensures your code meets the project's quality standards before being
committed.

## Best Practices

1. **Use BFF commands** for common tasks
2. **Always run `bff f` and `bff ci`** before committing
3. **Follow modular structure** for code organization
4. **Write tests** for new functionality
5. **Document your code** thoroughly
6. **Use typed interfaces** for better reliability
7. **Use `deno add`** for managing dependencies
8. **Leverage Nix** for consistent environments

- Build: `bff build` or `deno run infra/bff/bin/bff.ts build`
- Lint: `bff lint [--fix]`
- Format: `bff format` (alias: `bff f`)
- Type check: `bff check [file_path]`
- Test all: `bff test`
- Run single test: `deno test -A path/to/test/file.test.ts`
- Development environment: `bff devTools`
- Full CI check: `bff ci` (combines format, lint, check, test, build)

## Code Style Guidelines

- **Naming**: PascalCase for classes/types/components (BfComponent), camelCase
  for variables/functions
- **Imports**: Use absolute imports with explicit paths, group related imports
  together
- **Types**: Always use proper TypeScript typing, prefer interfaces for object
  types, generics when appropriate
- **Error handling**: Use structured logging with levels, optional chaining,
  null checks with fallbacks
- **Formatting**: 2-space indentation, semicolons required, double quotes for
  strings, JSDoc comments
- **Patterns**: Prefer immutability, use factory methods for object creation,
  separation of concerns
- **Linting rules**: camelCase, no-console, no-external-import, no-self-compare,
  no-sync-fn-in-async-fn, verbatim-module-syntax, no-eval

## Technology Stack

- **Deno 2**: Modern JavaScript/TypeScript runtime
- **React**: UI library for component-based interfaces
- **GraphQL**: API query language with schema in packages/graphql/
- **BFF**: Custom task runner and development tool suite, always available in
  path
- **Sapling SCM**: Version control with commands like `sl status`, `sl commit`,
  etc.
- **Nix**: Environment management system for reproducible builds

## Common Type Errors

### String vs BfGid Type Mismatch

A common error when working with the Content Foundry database layer occurs when
trying to use string IDs directly with collection caches or database lookups:

```
TS2345 [ERROR]: Argument of type 'string' is not assignable to parameter of type 'BfGid'.
  Type 'string' is not assignable to type '{ readonly [__nominal__type]: "BfGid"; }'.
```

#### Why This Happens

Content Foundry uses a nominal typing system for IDs to prevent accidental
mix-ups between different types of IDs. The `BfGid` type is a branded string,
which means it's a string with an additional type property to distinguish it
from regular strings.

When using collection lookups or database queries, you must convert string IDs
to `BfGid` using the `toBfGid` function:

```typescript
// Incorrect - will cause type error
const collection = collectionsCache.get("collection-id");

// Correct - converts string to BfGid
const collection = collectionsCache.get(toBfGid("collection-id"));
```

#### Content Collection ID Format

Content collections follow a specific naming pattern:

- Collections are created with IDs like: `collection-content-marketing`
- But code might try to access with short names like: `collection-marketing`

This naming mismatch, combined with the BfGid type requirement, causes common
errors.

#### How to Fix

Always use the `toBfGid` function when passing IDs to database functions:

```typescript
import { toBfGid } from "packages/bfDb/classes/BfNodeBase.ts";

// Convert string ID to BfGid before using with database methods
const collectionId = toBfGid("collection-content-marketing");
const collection = await ctx.find(BfContentCollection, collectionId);
```

For content collections specifically, ensure you're using the full ID pattern
that includes the content path prefix.
