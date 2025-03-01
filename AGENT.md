# Content Foundry Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Key Technologies](#key-technologies)
- [Development Tools](#development-tools)
  - [BFF (Bolt Foundry Friend)](#bff-bolt-foundry-friend)
  - [Sapling SCM Integration](#sapling-scm-integration)
  - [Development Environment](#development-environment)
  - [Notebook Integration](#notebook-integration)
- [Code Organization](#code-organization)
  - [Front-end Architecture](#front-end-architecture)
  - [Database Layer](#database-layer)
  - [GraphQL API](#graphql-api)
  - [Additional Modules](#additional-modules)
- [Development Workflow](#development-workflow)
  - [Getting Started](#getting-started)
  - [Common Tasks](#common-tasks)
  - [Before Committing Changes](#before-committing-changes)
  - [Dependency Management](#dependency-management)
- [Code Quality](#code-quality)
  - [Code Reviews](#code-reviews)
  - [Code Style Guidelines](#code-style-guidelines)
  - [Common Type Errors](#common-type-errors)
- [Best Practices](#best-practices)

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
```

## Key Technologies

- **Deno 2**: Modern JavaScript/TypeScript runtime (v2.x)
- **React**: UI library for building component-based interfaces
- **GraphQL**: API query language and runtime
- **Sapling SCM**: Modern source control management system
- **BFF (Bolt Foundry Friend)**: Custom task runner and development tool suite
- **Nix**: Reproducible build system for environment management

## Development Tools

### BFF (Bolt Foundry Friend)

BFF is Content Foundry's custom task runner and development tool suite. It
provides a unified interface for common development tasks.

#### Key BFF Commands

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

### Sapling SCM Integration

Content Foundry uses Sapling SCM for source control management. Sapling offers
advanced features while maintaining compatibility with Git.

#### Key Sapling Commands

- `sl status` - Show modified files
- `sl commit` - Commit changes
- `sl push` - Push changes to remote
- `sl pull` - Pull changes from remote
- `sl goto` - Switch to specific branch or commit
- `sl log` - View commit history
- `sl web` - Start Sapling web interface
- `sl diff` - Show changes in working directory
- `sl submit` - Submit a pull request with your changes for review

#### Creating Structured Commits

When creating commits in Sapling, it's recommended to follow a structured format
with:

1. A clear, descriptive title
2. A detailed description with "Summary" and "Test Plan" sections

##### Using the Commit Template

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

##### Manual Commit Structure

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

##### Automated Commit Helpers

For convenience, there are two options to create properly formatted commits:

1. The `bff llmCommit` command leverages automatic analysis to prepare your
   commit:

```bash
# Run the automated commit helper with optional arguments
bff llmCommit [title] [summary] [test_plan]
```

2. Alternatively, a traditional commit helper script is available at
   `build/commit.sh`:

```bash
# Run the commit helper script
bash build/commit.sh
```

#### Splitting Commits

Guidelines for splitting commits:

- Each commit should represent a single logical change or feature
- Keep related changes together in the same commit
- Separate unrelated changes into different commits
- Consider splitting large changes into smaller, incremental commits
- Make sure each commit can be understood on its own

Example commit message:

## Isograph

Isograph is a key technology used in Content Foundry for data fetching and
component rendering. It provides a type-safe way to declare data dependencies
for React components and efficiently fetch that data from the GraphQL API.

### What is Isograph?

Isograph is a framework that integrates GraphQL with React components, allowing
you to:

1. Declare data requirements directly inside component definitions
2. Automatically generate TypeScript types for your data
3. Efficiently manage data fetching and caching
4. Create reusable component fragments

### How Isograph Works in Content Foundry

In Content Foundry, Isograph components are defined using the `iso` function
imported from the generated isograph module:

```typescript
import { iso } from "packages/app/__generated__/__isograph/iso.ts";

export const MyComponent = iso(`
  field TypeName.FieldName @component {
    id
    title
    description
    items {
      id
      name
    }
  }
`)(function MyComponent({ data }) {
  // data is typed based on the GraphQL fragment above
  return <div>{data.title}</div>;
});
```

The `iso` function takes a GraphQL fragment string that defines what data the
component needs, and returns a higher-order function that wraps your component,
providing the requested data via props.

### Key Concepts

#### Field Definitions

Components declare their data needs using GraphQL field definitions:

- `field TypeName.FieldName @component` - Creates a component field
- `entrypoint TypeName.FieldName` - Creates an entry point for routing

#### Component Structure

Isograph components follow this pattern:

1. Import the `iso` function
2. Define the GraphQL fragment with fields needed
3. Create a function component that receives the data
4. Apply the iso HOC to the component

#### Important Note on Isograph Component Usage

One of the key benefits of Isograph is that you **don't need to explicitly
import** components that are referenced in your GraphQL fragments. The Isograph
system automatically makes these components available through the `data` prop.

For example, if your GraphQL fragment includes a field like:

```typescript
// In ParentComponent.tsx
export const ParentComponent = iso(`
  field TypeName.ParentComponent @component {
    childItems {
      id
      ChildComponent  // This references another Isograph component
    }
  }
`)(function ParentComponent({ data }) {
  return (
    <div>
      {data.childItems.map((item) => (
        // The ChildComponent is automatically available as item.ChildComponent
        <item.ChildComponent key={item.id} />
      ))}
    </div>
  );
});
```

The `ChildComponent` becomes accessible directly through the data object without
explicit imports. This creates a tightly integrated system where the data
structure and component structure align perfectly.

#### Environment Setup

Content Foundry sets up the Isograph environment in
`packages/app/isographEnvironment.ts`:

- Creates an Isograph store
- Configures network requests to the GraphQL endpoint
- Sets up caching

### Development Workflow

1. **Define Components**: Create components with their data requirements
2. **Build**: Run `bff build` to generate Isograph types
3. **Use Components**: Import and use the components in your app

### Fragment Reader Components

For dynamic component rendering, Content Foundry uses
`BfIsographFragmentReader`:

```typescript
<BfIsographFragmentReader
  fragmentReference={someFragmentReference}
  networkRequestOptions={{
    suspendIfInFlight: true,
    throwOnNetworkError: true,
  }}
/>;
```

This utility component helps render Isograph fragments with proper error
handling and loading states.

### Common Isograph Patterns

1. **Component Fields**: Use `field TypeName.ComponentName @component` for
   reusable components
2. **Entrypoints**: Use `entrypoint TypeName.EntrypointName` for route entry
   points
3. **Mutations**: Use `entrypoint Mutation.MutationName` for GraphQL mutations

The Isograph compiler automatically generates TypeScript types and utilities in
`packages/app/__generated__/__isograph/`.

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

#### Using `sl diff` to Review Changes

The `sl diff` command is an essential part of the code review process, allowing
you to view and verify your changes before committing:

```bash
# Basic usage - shows all uncommitted changes
sl diff

# Save the diff to a file for easier review
sl diff > build/sl.txt

# View diff for a specific file
sl diff path/to/file.ts

# Compare with a specific commit
sl diff -r commit_hash

# Show a more compact summary of changes
sl diff --stat
```

### Development Environment

Content Foundry provides a comprehensive development environment through BFF:

```bash
# Start development tools
bff devTools

# This starts:
# - Sapling web interface (port 3011)
# - Jupyter notebook (port 8888)
# - Tools web interface (port 9999)
```

### Notebook Integration

Content Foundry integrates Jupyter notebooks for data analysis and
documentation:

```bash
# Open Jupyter notebook interface
bff devTools

# Access at: https://<your-domain>:8888 (token: bfjupyter)
```

## Code Organization

### Front-end Architecture

Content Foundry uses a component-based architecture with React:

- Components are in `packages/app/components/`
- Design system components in `packages/bfDs/components/`
- Isograph used for component data fetching
- Router context for navigation

### GraphQL API

Content Foundry uses GraphQL for its API layer:

- Schema is defined in `packages/graphql/types/`
- Generated schema available at `packages/graphql/__generated__/schema.graphql`

#### Context Usage in Resolvers

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

### Database Backends

Content Foundry supports multiple database backends through an abstraction
layer:

#### Backend Architecture

- Database operations are abstracted through the `DatabaseBackend` interface
- The database backend is selected based on environment configuration

#### Implementing Custom Backends

The database abstraction makes it easy to add new backend implementations:

1. Implement the `DatabaseBackend` interface in a new class
2. Add backend selection logic to the `getBackend()` function in `bfDb.ts`
3. Use environment variables to control backend selection

### Additional Modules

- **Feature Flags**: Feature toggle system in `packages/featureFlags/` for
  controlled feature rollouts
- **Analytics**: Custom analytics implementation in `packages/analytics/`
- **Error Handling**: Centralized error handling via `packages/BfError.ts`
- **Configuration**: Environment-based configuration in
  `packages/getConfigurationVariable.ts`
- **Logging**: Structured logging system in `packages/logger.ts`
- **Tools**: Developer tools in `packages/tools/`
- **Web Server**: Web server implementation in `packages/web/`

## Development Workflow

### Getting Started

To get started with Content Foundry development:

1. Start the development environment: `bff devTools`
2. Access development tools:
   - Web app: http://localhost:8000
   - Sapling web: http://localhost:3011
   - Jupyter: http://localhost:8888
   - Tools UI: http://localhost:9999

### Common Tasks

- Build: `bff build` or `deno run infra/bff/bin/bff.ts build`
- Lint: `bff lint [--fix]`
- Format: `bff format` (alias: `bff f`)
- Type check: `bff check [file_path]`
- Test all: `bff test`
- Run single test: `deno test -A path/to/test/file.test.ts`
- Development environment: `bff devTools`
- Full CI check: `bff ci` (combines format, lint, check, test, build)

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

### Dependency Management

Content Foundry uses Deno 2 for JavaScript/TypeScript runtime and dependency
management.

#### Deno 2 Dependency Management

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

#### Nix Integration

Content Foundry uses Nix for reproducible builds and environment management:

```bash
# Build the current nix system
bff nix

# Build with only deployment packages
bff nix:deploy
```

The Nix configuration is defined in `flake.nix` and ensures consistent
development environments across different systems.

## Code Quality

### Testing Approaches

#### Standard Testing

The project primarily uses Deno's built-in testing capabilities:

- Standard syntax with `Deno.test("description", () => { ... })`
- Assertions from `@std/assert` (not `@std/testing/asserts`)
- Simple execution with `deno test` or `bff test`

```typescript
// Example standard test
import { assertEquals } from "@std/assert";

Deno.test("my test function", () => {
  assertEquals(1 + 1, 2);
});
```

### Code Reviews

Code reviews are a critical part of the development process in Content Foundry.
They help maintain code quality, share knowledge, and ensure consistency across
the codebase.

#### Performing Code Reviews

When reviewing code for Content Foundry, follow these guidelines:

1. **Focus Areas**: Review for:
   - **Functionality**: Does the code work as intended?
   - **Security**: Are there any security vulnerabilities?
   - **Performance**: Are there obvious performance issues?
   - **Readability**: Is the code clear and maintainable?
   - **Test Coverage**: Are there appropriate tests?

2. **Style Consistency**: Ensure code follows Content Foundry style guidelines:
   - PascalCase for classes/types/components (BfComponent)
   - camelCase for variables/functions
   - Proper TypeScript typing
   - Consistent indentation (2 spaces)

3. **Constructive Feedback**: Provide specific, actionable feedback:
   ```
   // Instead of: "This code is confusing"
   // Say: "Consider extracting this logic into a named function to clarify its purpose"
   ```

4. **Code Review Checklist**:
   - [ ] Code follows TypeScript best practices
   - [ ] New functionality has appropriate tests
   - [ ] No unnecessary console logs or commented code
   - [ ] Error handling is appropriate
   - [ ] Component interfaces are clearly defined
   - [ ] No potential memory leaks
   - [ ] Permissions and access control are properly handled

#### Code Review Workflow

1. **Submitting Code for Review**:
   ```bash
   # Ensure code is formatted and passes tests
   bff f
   bff test

   # Generate a diff to review your changes
   sl diff > build/sl.txt

   # Review the changes before committing
   cat build/sl.txt

   # Create a descriptive commit
   sl commit

   # Push changes for review
   sl push
   ```

2. **Reviewing in Sapling**:
   - Use `sl web` to open the Sapling web interface
   - Navigate to "Changes" to see pending reviews
   - Add inline comments by clicking on specific lines
   - Use the "Request changes" or "Approve" options when done

3. **Addressing Review Feedback**:
   ```bash
   # Make requested changes
   bff f  # Format code after changes

   # Amend your commit with changes
   sl amend

   # Push updated changes
   sl push --force
   ```

4. **Completing the Review**:
   - Respond to all comments
   - Request another review if significant changes were made
   - Merge once approved with `sl land`

#### Code Review Best Practices

- **Review Small Changes**: Aim for small, focused commits that are easier to
  review
- **Timely Reviews**: Try to complete reviews within 24 hours
- **Balance Thoroughness and Progress**: Be thorough but pragmatic
- **Knowledge Sharing**: Use reviews as an opportunity to share knowledge
- **Focus on Code, Not the Coder**: Review the code, not the person who wrote it

### Code Style Guidelines

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

### Common Type Errors

#### Testing Imports

When writing tests, use the correct import paths for assertion functions:

```typescript
// INCORRECT - will cause error
import { assertEquals } from "@std/testing/asserts";

// CORRECT
import { assertEquals } from "@std/assert";
```

The `@std/assert` module provides all assertion functions for testing, while
`@std/testing` contains other testing utilities like mocks and BDD testing
frameworks.

#### Using Optional Chaining for Nullable Values

When working with potentially null or undefined values, use the optional
chaining operator (`?.`) to safely access properties or methods:

```typescript
// PROBLEMATIC - TypeScript will warn about possible null/undefined
<Component key={item.id} /> // Error: 'item' is possibly 'null'

// BETTER - Using conditional rendering with && and Using optional chaining operator
{item && <Component key={item?.id} />}

The optional chaining operator (`?.`) short-circuits if the value before it is `null` or `undefined`, returning `undefined` instead of throwing an error.

#### String vs BfGid Type Mismatch

A common error when working with the Content Foundry database layer occurs when
trying to use string IDs directly with collection caches or database lookups:
```

TS2345 [ERROR]: Argument of type 'string' is not assignable to parameter of type
'BfGid'. Type 'string' is not assignable to type '{ readonly [__nominal__type]:
"BfGid"; }'.

````
##### Why This Happens

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
````

##### Content Collection ID Format

Content collections follow a specific naming pattern:

- Collections are created with IDs like: `collection-content-marketing`
- But code might try to access with short names like: `collection-marketing`

This naming mismatch, combined with the BfGid type requirement, causes common
errors.

##### How to Fix

Always use the `toBfGid` function when passing IDs to database functions:

```typescript
import { toBfGid } from "packages/bfDb/classes/BfNodeBase.ts";

// Convert string ID to BfGid before using with database methods
const collectionId = toBfGid("collection-content-marketing");
const collection = await ctx.find(BfContentCollection, collectionId);
```

For content collections specifically, ensure you're using the full ID pattern
that includes the content path prefix.

## Best Practices

1. **Use BFF commands** for common tasks
2. **Always run `bff f` and `bff ci`** before committing
3. **Follow modular structure** for code organization
4. **Write tests** for new functionality
5. **Document your code** thoroughly
6. **Use typed interfaces** for better reliability
7. **Use `deno add`** for managing dependencies
8. **Leverage Nix** for consistent environments
9. **Use project root-relative paths** in imports and file references, not
   relative to the current file. For example, use
   `import { X } from "packages/web/component.ts"` instead of
   `import { X } from "../web/component.ts"`.
10. **Use lexically sortable inheritance naming** for classes that implement
    interfaces or extend base classes. Start with the base class or interface
    name, followed by specifics, like `DatabaseBackendPostgres` instead of
    `DatabaseBackendPostgres`. This makes imports and directory listings easier
    to scan and understand inheritance hierarchies.
11. **Use static factory methods instead of constructors** for BfModels (BfNode,
    BfEdge, etc.). Never use the `new` keyword directly with these classes.
    Instead:
    - For creating a new node:
      `await BfMyNode.__DANGEROUS__createUnattached(cv, props, metadata)`
    - For creating a node connected to an existing node:
      `await existingNode.createTargetNode(BfMyNode, props, metadata, role)`
    - For creating an edge between nodes:
      `await BfEdge.createBetweenNodes(cv, sourceNode, targetNode, role)`
    - For retrieving existing nodes: `await BfMyNode.find(cv, id)` or
      `await BfMyNode.findX(cv, id)`

    These factory methods ensure proper creation, validation, lifecycle
    callbacks, and database consistency.

## Test-Driven Development (TDD)

Content Foundry encourages Test-Driven Development for creating robust and
maintainable code. TDD follows a specific workflow cycle known as
"Red-Green-Refactor":

### TDD Workflow

1. **Red**: Write a failing test that defines a function or improvements of a
   function
   - Write a test that defines how the code should behave
   - Run the test to see it fail (it should fail because the functionality
     doesn't exist yet)
   - This validates that your test is actually testing something

2. **Green**: Write the simplest code to make the test pass
   - Focus on just making the test pass, not on perfect code
   - The goal is to satisfy the requirements defined by the test
   - Avoid optimizing at this stage

3. **Refactor**: Clean up the code while ensuring tests still pass
   - Improve the implementation without changing its behavior
   - Eliminate code duplication, improve naming, etc.
   - Run tests after each change to ensure functionality is preserved

### Example TDD Process

Here's a simple example of how TDD might be applied to a Content Foundry
feature:

```typescript
// 1. RED: Write a failing test first
Deno.test("BfEdgeInMemory should find edges by source node", async () => {
  const mockCv = getMockCurrentViewer();
  const sourceNode = await MockNode.__DANGEROUS__createUnattached(mockCv, { name: "Source" });
  const targetNode = await MockNode.__DANGEROUS__createUnattached(mockCv, { name: "Target" });
  
  // Create an edge between nodes
  await BfEdgeInMemory.createBetweenNodes(mockCv, sourceNode, targetNode, "test-role");
  
  // Test the findBySource method (which doesn't exist yet)
  const edges = await BfEdgeInMemory.findBySource(mockCv, sourceNode);
  
  assertEquals(edges.length, 1);
  assertEquals(edges[0].metadata.bfSid, sourceNode.metadata.bfGid);
  assertEquals(edges[0].metadata.bfTid, targetNode.metadata.bfGid);
});

// 2. GREEN: Implement the minimum code to make the test pass
static async findBySource(
  cv: BfCurrentViewer,
  sourceNode: BfNodeBase,
): Promise<BfEdgeInMemory[]> {
  const result: BfEdgeInMemory[] = [];
  
  for (const edge of this.inMemoryEdges.values()) {
    if (edge.metadata.bfSid === sourceNode.metadata.bfGid) {
      result.push(edge);
    }
  }
  
  return result;
}

// 3. REFACTOR: Improve the implementation while keeping tests passing
static async findBySource(
  cv: BfCurrentViewer,
  sourceNode: BfNodeBase,
  role?: string,
): Promise<BfEdgeInMemory[]> {
  return Array.from(this.inMemoryEdges.values()).filter(edge => {
    const sourceMatches = edge.metadata.bfSid === sourceNode.metadata.bfGid;
    return role ? (sourceMatches && edge.props.role === role) : sourceMatches;
  });
}
```

### Benefits of TDD in Content Foundry

- **Clear requirements**: Tests document what the code is supposed to do
- **Confidence in changes**: Existing tests catch regressions when modifying
  code
- **Design improvement**: Writing tests first encourages more modular, testable
  code
- **Focus on user needs**: Tests represent user requirements, keeping
  development focused
- **Documentation**: Tests serve as executable documentation showing how
  components should work

### Running Tests

Content Foundry provides several ways to run tests:

- Run all tests: `bff test`
- Run specific tests: `deno test -A packages/path/to/test.ts`
- Test coverage: `bff testCoverage`

When writing tests, remember to use the `@std/assert` module for assertions:

```typescript
import { assertEquals, assertThrows } from "@std/assert";
```
