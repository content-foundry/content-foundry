# CLAUDE.md - Content Foundry Development Reference

## Essential Commands for Agents
- Build: `bff build` or `deno run infra/bff/bin/bff.ts build`
- Lint: `bff lint [--fix]`
- Format: `bff format` (alias: `bff f`)
- Type check: `bff check [file_path]`
- Test all: `bff test`
- Run single test: `deno test -A path/to/test/file.test.ts`
- Development environment: `bff devTools`
- Full CI check: `bff ci` (combines format, lint, check, test, build)

## Code Style Guidelines
- **Naming**: PascalCase for classes/types/components (BfComponent), camelCase for variables/functions
- **Imports**: Use absolute imports with explicit paths, group related imports together
- **Types**: Always use proper TypeScript typing, prefer interfaces for object types, generics when appropriate
- **Error handling**: Use structured logging with levels, optional chaining, null checks with fallbacks
- **Formatting**: 2-space indentation, semicolons required, double quotes for strings, JSDoc comments
- **Patterns**: Prefer immutability, use factory methods for object creation, separation of concerns
- **Linting rules**: camelCase, no-console, no-external-import, no-self-compare, no-sync-fn-in-async-fn, verbatim-module-syntax, no-eval

## Technology Stack
- **Deno 2**: Modern JavaScript/TypeScript runtime
- **React**: UI library for component-based interfaces
- **GraphQL**: API query language with schema in packages/graphql/
- **BFF**: Custom task runner and development tool suite
- **Sapling SCM**: Version control with commands like `sl status`, `sl commit`, etc.
- **Nix**: Environment management system for reproducible builds

See AGENT.md for full project documentation including architecture and best practices.