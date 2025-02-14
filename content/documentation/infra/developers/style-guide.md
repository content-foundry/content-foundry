# Code Formatting Standards

When we ask our LLM to format our codebase, it should take current changes (sl status)
and try to apply these principles:

## TypeScript/JavaScript
- Use 2-space indentation
- Use semicolons at the end of statements
- Use strict equality (`===`) over loose equality
- Use TypeScript types where possible
- Use destructuring for object properties
- Use arrow functions for callbacks
- Don't use the typescript syntax [], use Array\<type\> instead
- Use CONST_VALUES instead of magic strings whenever possible.

## Isograph whenever possible
- If you're writing app level components, you should be using isograph.
- Isograph components are stored by graphql type name
- Isograph components don't really require type declarations for their primary
  passed in data, only for their additional props.

## Component Structure
- One component per file
- Use PascalCase for component names
- Use `.tsx` extension for React components
- Use `.ts` extension for non-React TypeScript files
- Place styles in separate CSS files

## CSS/Styling
- Use camelCase for CSS-in-JS class names
- Group related styles together
- Use semantic class names
- Avoid inline styles
- Use CSS variables for theme values

## File Organization
- Place tests in __tests__ folder

## Naming Conventions
- Use `Bf` prefix for Bolt Foundry components (app level)
- Use `BfDs` prefix for design system components
- Use descriptive, action-based names for functions
- Use noun-based names for components

## Documentation
- Use JSDoc for function documentation for developer usage
- Avoid documenting code with inline comments
- Use markdown or jupyter notebooks for documentation files
- Keep documentation files in `content/documentation`

## Version control Practices

- Use Sapling for version control
- Use conventional commit messages
- Keep commits focused and atomic

## Debug logger practices
- Don't commit logger.setLevel calls