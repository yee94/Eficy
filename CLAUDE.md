# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eficy is a front-end orchestration framework that allows orchestrating React components through JSON configuration. It uses MobX for state management and supports plugins for extensibility. The framework is designed for building complex multi-page applications with minimal code.

## Development Commands

```bash
# Development
pnpm dev           # Start development mode using Turbo
pnpm play          # Run playground development server

# Building
pnpm build         # Build all packages using Turbo

# Testing
pnpm test          # Run tests using Turbo
vitest run         # Run tests in core package directly

# Code Quality
pnpm prettier      # Format code using Turbo
pretty-quick --staged  # Format staged files (used in pre-commit)

# Package Management
pnpm install       # Install dependencies (uses pnpm workspace)
```

## Architecture

### Monorepo Structure
- Uses pnpm workspaces with Turbo for build orchestration
- `packages/core/` - Main framework code
- `playground/` - Development playground with examples

### Core Architecture
- **Controller (`Controller.ts`)** - Central orchestrator that manages components, plugins, and state
- **EficySchema** - Parses and validates JSON configuration into view models  
- **ViewNode** - Represents individual components in the schema tree
- **Resolver** - Converts ViewNode models into React elements
- **Plugin System** - Extensible architecture using `plugin-decorator`

### Key Dependencies
- **MobX 5.x** - State management (observable models, reactions)
- **React 16.x** - UI framework (peer dependency)
- **Ant Design 4.x** - Default component library (peer dependency)
- **tsdown** - Build tool for TypeScript compilation

### Plugin Architecture
Built-in plugins handle core functionality:
- **Request** - HTTP requests and data fetching
- **TwoWayBind** - Automatic data binding between components
- **Actions** - Event handling and state mutations
- **AntForm/AntTable** - Ant Design integrations
- **EficyInEficy** - Nested Eficy instances

### Testing
- Uses Vitest for unit testing
- Test files located in `packages/core/test/`
- Pre-commit hooks run tests and prettier formatting

## Key Concepts

### JSON Schema Structure
Components are defined as JSON objects with special properties:
- `#view` - Component type (maps to React components)
- `#` - Component ID for referencing
- `#children` - Child components array
- `#request` - Data fetching configuration

### Variable Replacement
Template strings like `${models.input.value}` are automatically replaced with actual values from the MobX store.

### Component Registration
The Controller maintains a componentMap that registers React component instances for direct access and manipulation.