# Deno V2 Application Documentation

## Project Overview

This is a basic Deno v2 application with a structured project layout and a
simple web server. The application demonstrates modern Deno v2 practices and
follows a clean architecture approach.

## Project Structure

```
.
├── build                   # Compiled application output
├── content                 # Documentation content
│   └── README.md           # Content documentation
├── deno.jsonc              # Deno configuration file
├── deno.lock               # Dependency lock file
├── generated-icon.png      # Project icon
├── infra                   # Infrastructure-related files
│   └── README.md           # Infrastructure documentation
├── main.ts                 # Main application entry point
├── packages                # Project modules/packages
│   └── web                 # Web server package
│       └── web.ts          # Web server implementation
├── replit.nix              # Replit configuration file
└── static                  # Static files for web serving
    ├── index.html          # Main HTML page
    └── styles.css          # CSS styles
```

## Key Components

### Main Application (main.ts)

The main entry point for the application. It imports the web server from the
packages directory and starts it with configured port and hostname settings.

```typescript
import { startServer } from "./packages/web/web.ts";

// Define the port to listen on
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const HOSTNAME = "0.0.0.0";

// Start the server
console.log("Starting Deno v2 application...");
startServer(PORT, HOSTNAME);
```

### Web Server (packages/web/web.ts)

The core web server implementation that:

- Serves static files from the `static` directory

Key features:

- Implements request routing with proper file serving
- Returns appropriate content types and status codes

```typescript
export function startServer(port = 8000, hostname = "0.0.0.0"): void {
  console.log(`Starting server on http://${hostname}:${port}/`);

  Deno.serve({ port, hostname }, handleRequest);

  console.log("Server created, listening for requests...");
}
```

### Static Content

#### HTML (static/index.html)

The main page of the application features:

- Modern HTML5 structure
- Responsive design
- Integration with the API endpoint via JavaScript
- Deno-themed styling and branding

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deno v2 Application</title>
    <link rel="stylesheet" href="/static/styles.css">
  </head>
  <body>
    <!-- Content -->
  </body>
</html>
```

#### CSS (static/styles.css)

The application uses a clean, modern CSS design with:

- CSS variables for theming
- Responsive layout with grid and flexbox
- Consistent spacing and typography
- Deno color palette

## Configuration

### Deno Config (deno.jsonc)

The `deno.jsonc` file configures the Deno runtime with:

```json
{
  "name": "deno-v2-app",
  "version": "1.0.0",
  "description": "A basic Deno v2 application with a structured project layout and simple web server",
  "exports": "./main.ts",
  "tasks": {
    "start": "deno run --allow-net --allow-read --watch main.ts",
    "build": "deno compile --allow-net --allow-read --output build/app main.ts",
    "dev": "deno run --allow-net --allow-read --watch main.ts",
    "lint": "deno lint",
    "fmt": "deno fmt"
  },
  "imports": {
    "@std/http": "jsr:@std/http@^1.0.13",
    "std/": "https://deno.land/std@0.220.0/"
  },
  "compilerOptions": {
    "allowJs": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "fmt": {
    "lineWidth": 100,
    "indentWidth": 2,
    "singleQuote": true
  }
}
```

### Replit Workflow Configuration

The project is configured with a Replit workflow that runs the Deno server:

```
Name: Deno Server
Command: deno run --allow-net --allow-env --allow-read main.ts
```

## Running the Application

### Development Mode

To run the application in development mode with file watching:

```bash
deno task dev
```

Or manually:

```bash
deno run --allow-net --allow-read --watch main.ts
```

### Production Mode

To run the application in production mode:

```bash
deno task start
```

Or manually:

```bash
deno run --allow-net --allow-read main.ts
```

### Building the Application

To compile the application into a standalone executable:

```bash
deno task build
```

This will create an executable in the `build` directory.

## API Endpoints

The application provides the following API endpoints:

- `GET /` - Serves the main index.html page
- `GET /static/*` - Serves static files from the static directory

## Technologies Used

- **Deno v2**: The secure JavaScript/TypeScript runtime
- **JSR (@std/http)**: The JavaScript Registry for package management
- **HTML5/CSS3**: For the frontend interface
- **TypeScript**: For type-safe code
- **Deno Standard Library**: For additional utilities
- **Sapling SCM**: Modern version control system for source code management
- **BFF (Bolt Foundry Friend)**: Task runner and development tool suite

## Deno v2 Dependency Management

Deno v2 introduces significant changes to dependency management:

### Important Note:

- **Never use `deno cache` or `deno vendor` in Deno v2**. These commands have
  been removed in Deno 2.0.
- Dependencies are automatically downloaded and cached when running Deno
  programs.
- JSR (JavaScript Registry) is the recommended package source.
- Package imports use the format
  `import { xyz } from "jsr:@org/package@version";`
- NPM packages can be imported directly with
  `import { xyz } from "npm:package-name@version";`

### Best Practices for Dependencies in Deno v2:

1. Use `deno.jsonc` to declare imports with explicit versions
2. Reference JSR packages when possible
3. For NPM compatibility, use the npm: specifier
4. Use lock files for reproducible builds

cat /tmp/agent_addition.txt

## Best Practices Implemented

1. **Modular Structure**: Code is organized in a modular, maintainable way
2. **Type Safety**: TypeScript is used throughout for type checking
3. **Security**: Deno's permission system is properly utilized
4. **Error Handling**: Proper error responses are provided
5. **Documentation**: Code is well-documented with comments
6. **Configuration**: Proper configuration via deno.jsonc
7. **Static Analysis**: Linting and formatting rules are defined
8. **Version Control**: Using Sapling SCM for advanced source control management

## BFF (Bolt Foundry Friend)

BFF stands for "Bolt Foundry Friend" and serves as a powerful task runner and
development tool suite for the project. It provides a streamlined interface for
common development operations.

### Key BFF Commands

- `bff build`: Builds the application with optimized settings
- `bff devTools`: Starts the development tools with debugging enabled
- `bff test`: Runs test suites for the application

### BFF Workflow Integration

BFF is integrated into our project workflow and can be used to manage various
development tasks:

```bash
# Start development tools with debugging
bff devTools --debug

# Build the project
bff build --slow-exit
```

This task runner helps standardize development workflows and ensures consistency
across the project.

## Sapling SCM Integration

### What is Sapling SCM?

Sapling SCM (Source Control Management) is a modern, scalable version control
system developed by Meta (formerly Facebook) as an alternative to Git and
Mercurial. Released as open-source software in 2022, Sapling combines the best
features of Git and Mercurial while addressing some of their limitations.

### Using Sapling SCM

**IMPORTANT**: Sapling SCM uses the `sl` command for all operations, NOT `hg`.

The primary commands include:

- `sl status` - Show modified files in working directory
- `sl commit` - Commit changes to the repository
- `sl push` - Push changes to remote repository
- `sl pull` - Pull changes from remote repository
- `sl log` - View commit history
- `sl diff` - Show changes between commits

### Key Features of Sapling SCM

1. **Compatibility with Git**:
   - Sapling is fully compatible with Git repositories and workflows
   - Provides a Git-compatible command line interface with `sl` commands that
     mirror Git
   - Can interact with GitHub, GitLab, and other Git hosting services

2. **Improved Performance**:
   - Optimized for large repositories and monorepos
   - Better handling of binary files
   - Efficient operations on repositories with long histories

3. **Enhanced Developer Experience**:
   - More intuitive and user-friendly command interface
   - Comprehensive undo capabilities for almost any operation
   - Immutable history with safer rewriting capabilities

4. **Advanced Features**:
   - Built-in stacked diff workflow support
   - Improved merging algorithms
   - Better handling of large-scale repos with millions of files

5. **Cross-Platform Support**:
   - Works on Windows, macOS, and Linux
   - Consistent behavior across all platforms

### Sapling in Our Project

We've integrated Sapling SCM into our Deno v2 project to leverage its advanced
version control capabilities. This integration provides several benefits:

1. **Seamless Git Compatibility**:
   - Team members can continue using Git clients while others adopt Sapling
   - Compatible with existing CI/CD pipelines built for Git

2. **Enhanced Collaboration**:
   - Better support for parallel development with stacked diffs
   - Improved handling of complex merge scenarios

3. **Simplified Command Interface**:
   - More intuitive commands for common operations
   - Reduced risk of repository corruption

### Basic Sapling Commands

| Sapling Command | Git Equivalent          | Description                   |
| --------------- | ----------------------- | ----------------------------- |
| `sl clone`      | `git clone`             | Clone a repository            |
| `sl status`     | `git status`            | Show working directory status |
| `sl add`        | `git add`               | Add files to staging          |
| `sl commit`     | `git commit`            | Commit changes                |
| `sl push`       | `git push`              | Push changes to remote        |
| `sl pull`       | `git pull`              | Pull changes from remote      |
| `sl log`        | `git log`               | View commit history           |
| `sl diff`       | `git diff`              | Show differences              |
| `sl branch`     | `git branch`            | Manage branches               |
| `sl merge`      | `git merge`             | Merge branches                |
| `sl undo`       | N/A (unique to Sapling) | Undo recent operations        |

### Sapling Configuration

A basic `.sl/config` file for our project:

```toml
[ui]
username = "Your Name <your.email@example.com>"

[aliases]
st = status
ci = commit
co = checkout

[extensions]
fsmonitor = true
absorb = true

[experimental]
diff-algorithm = patience
```

### Sapling Workflow in Our Project

1. **Initial Setup**:
   ```bash
   # Clone the repository using Sapling
   sl clone https://github.com/yourusername/deno-v2-app.git
   cd deno-v2-app
   ```

2. **Daily Development Workflow**:
   ```bash
   # Update your local copy
   sl pull

   # Create a new feature branch
   sl branch feature-name
   sl checkout feature-name

   # Make changes and commit
   sl status
   sl add .
   sl commit -m "Implement new feature"

   # Push changes
   sl push -u origin feature-name
   ```

3. **Code Review Process**:
   - Create pull/merge requests using GitHub/GitLab interfaces
   - Address review comments with additional commits
   - Use `sl absorb` to automatically fixup commits

4. **Stacked Diff Workflow** (Advanced):
   ```bash
   # Create dependent feature branches
   sl checkout main
   sl checkout -b feature-base
   # make changes
   sl commit -m "Base feature implementation"

   sl checkout -b feature-extension
   # make additional changes
   sl commit -m "Extended functionality"

   # Submit for review
   sl push -u origin feature-base
   sl push -u origin feature-extension
   ```

## BFF Command: iso

The project includes a custom BFF command called `iso` which runs the isograph
compiler for GraphQL code generation. This command simplifies the build process
by abstracting away the complexities of the isograph compiler.

### Using the iso command:

```bash
# Run the isograph compiler 
bff iso

# Run with verbose output
bff iso --verbose
```

The `iso` command is integrated into the build process (`bff build`), which
automatically runs isograph compilation as part of the build pipeline.
