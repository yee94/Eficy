# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eficy is a front-end orchestration framework that allows orchestrating React components through JSON configuration. The framework is designed for building complex multi-page applications with minimal code.

**Current Version Status:**
- `packages/core/` - Legacy V1 implementation (MobX-based)
- `packages/core-v2/` - Modern V2 implementation (Signal-based with DI)

The V2 architecture represents a complete rewrite with modern patterns and better performance.

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
- `packages/core/` - Legacy V1 framework (MobX-based)
- `packages/core-v2/` - Modern V2 framework (Signal-based with DI)
- `packages/plugins/` - Plugin ecosystem for V2
- `playground/` - Development playground (currently using V2)

### Core Architecture (V2)
- **EficyController** - Central orchestrator with dependency injection
- **SignalStore** - Reactive state management using reactjs-signal
- **EficySchema** - Parses and validates JSON configuration into view models  
- **ViewNode** - Represents individual components in the schema tree
- **EficyRenderer** - Converts ViewNode models into React elements (inside-out rendering)
- **PluginManager** - Manages plugin lifecycle with tsyringe DI
- **DIContainer** - Dependency injection container (singleton wrapper around tsyringe)

### Key Dependencies (V2)
- **reactjs-signal** - Reactive state management (replaces MobX)
- **tsyringe** - Dependency injection container
- **React 18.x** - UI framework with hooks (peer dependency)
- **ahooks** - React hooks library
- **lodash** - Utility functions
- **axios** - HTTP client
- **nanoid** - Unique ID generation
- **tsdown** - Build tool for TypeScript compilation

### Plugin Architecture (V2)
Plugin system built on dependency injection:
- **BasePlugin** - Abstract base class for all plugins
- **RequestPlugin** - HTTP requests and data fetching
- **EventsPlugin** - Event handling and actions
- Plugins are registered via `Eficy.config()` and managed by PluginManager

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
Template strings like `${models.input.value}` are automatically replaced with actual values from the reactive store.

### Component Registration (V2)
The EficyController maintains a componentMap that registers React component instances through the ComponentRegistry service.

## V2 Migration Guide

### Key API Changes
```typescript
// V1 (MobX-based)
import Eficy from '@eficy/core';

// V2 (Signal-based with DI)
import Eficy from '@eficy/core-v2';

// Configuration API
Eficy.config({
  componentMap: { ...antd },
  defaultActions: {
    successAlert: (data) => message.success(data)
  },
  plugins: [
    { name: 'request', options: { baseURL: '/api' } }
  ]
});
```

### Signal-based Reactivity
```typescript
// V2 uses reactjs-signal instead of MobX
import { useSignalValue } from 'reactjs-signal';

const MyComponent = () => {
  const signalValue = useSignalValue(someSignal);
  return <div>{signalValue}</div>;
};
```

### Dependency Injection
```typescript
// Services are injected via tsyringe
import { inject, injectable } from 'tsyringe';

@injectable()
export class MyService {
  constructor(
    @inject('SignalStore') private signalStore: SignalStore
  ) {}
}
```

## Recent Changes (V2 Implementation)

**2024-07-24**: Complete V2 architecture implementation
- Replaced MobX with reactjs-signal for reactive state management
- Implemented dependency injection using tsyringe
- Created inside-out React rendering approach
- Built monorepo plugin architecture
- Added Eficy.extend() and Eficy.config() methods with recursive configuration
- Removed legacy dependencies (@vmojs/base, plugin-decorator)
- Converted to React 18+ with hooks
- Updated playground to use V2 API
- Fixed build issues with tsdown and export resolution