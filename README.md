# Content Foundry: The Content Operating System

> This is a preview of the project. Right now, we're focused on developer
> experience, and engaging the community for early feedback. Our primary
> objective is to lay out the vision, create the world's best developer
> experience, and find people who want to help everyone tell their stories as
> well as they can.

## What is Content Foundry?

Content Foundry is an open-source platform designed to help creators tell their
story across all platforms, including their own. Content Foundry has five
pillars, each describing a step of the content creation process.

### Personas

Take anecdotes, inspirations, ideas, user research, sales calls, and whatever
information you have that relates to your brand and put it here. This serves as
origin material for the rest of the process.

### Research

Figure out what you should say before you say it. Come up with sketches,
outlines or other ideas for tweets, posts, videos, etc.

### Creation

Write your content with AI-assistance that maintains your unique voice.

### Distribution

Get your content where it needs to go efficiently and effectively.

### Analytics

Learn what works with your audience, and feed it back into the process.

---

## Developer Experience

We want to create the best developer experience possible. We want it to be
simpler to contribute to Content Foundry than it is to contribute to Wikipedia.
We're not there yet, but here's what we do have.

### Replit-first Developer Experience

The best way to get started with Content Foundry is to
[head to our Replit app](https://replit.com/t/bolt-foundry/repls/Content-Foundry/view).

From there, you can fork (they call it remix now) our app into your own Replit
account.

### Getting Started Locally

If you prefer to work locally, you'll need:

1. [Deno 2](https://deno.com/) (version 2.x)
2. [Sapling SCM](https://sapling-scm.com/) (for source control)
3. [Nix](https://nixos.org/) (optional, for reproducible environments)

Clone the repository, then run:

```bash
# Install dependencies
deno install

# If you have Nix installed (recommended)
bff nix  # Build the Nix environment

# Start development tools
bff devTools
```

#### Dependencies

We use Deno 2's built-in dependency management with `deno.jsonc`:

```bash
# Add a dependency from JSR (JavaScript Registry)
deno add jsr:@std/http

# Add a dependency from npm
deno add npm:react
```

Dependencies specified in `deno.jsonc` can be imported using bare specifiers:

```typescript
// In your code - use bare imports for dependencies mapped in deno.jsonc
import { serve } from "@std/http";
import { join } from "@std/path";
```

### BFF (Bolt Foundry Friend)

Content Foundry uses BFF, our custom task runner to simplify common development
tasks:

- `bff build` - Build the project
- `bff test` - Run tests
- `bff lint` - Lint code
- `bff deploy` - Run CI checks and build for deployment
- `bff devTools` - Start development tools (Sapling web interface, Jupyter
  notebook, etc.)

Run `bff help` to see all available commands.

More details in our [quickstart guide](/content/documentation/quickstart.md).
