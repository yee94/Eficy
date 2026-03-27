# EFICY PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-20
**Commit:** 94880c8
**Branch:** master

## OVERVIEW

Zero-build JSX runtime for React with signals reactivity. Renders JSX directly in browser via `<script type="text/eficy">`. Designed for LLM-generated pages.

## STRUCTURE

```
Eficy/
├── packages/
│   ├── eficy/           # Main entry - aggregates all packages
│   ├── reactive/        # Core signal system (@preact/signals-core)
│   ├── reactive-react/  # React bindings for signals
│   ├── reactive-async/  # Async data fetching (ahooks-compatible)
│   ├── core-jsx/        # Custom JSX runtime + plugin system
│   ├── browser/         # Browser standalone bundle
│   ├── plugin-unocss/   # UnoCSS atomic CSS plugin
│   └── shadcn-ui/       # shadcn/ui component library
├── playground/          # Demo app with examples
└── dist/                # Legacy build output (ignore)
```

## WHERE TO LOOK

| Task               | Location                               | Notes                                    |
| ------------------ | -------------------------------------- | ---------------------------------------- |
| Signal primitives  | `packages/reactive/src/`               | `signal`, `computed`, `effect`, `action` |
| React integration  | `packages/reactive-react/src/`         | `observer`, `useObserver`                |
| Async data         | `packages/reactive-async/src/`         | `asyncSignal`, `antdTableSignal`         |
| JSX runtime        | `packages/core-jsx/src/jsx-runtime.ts` | Custom jsx/jsxs functions                |
| Plugin system      | `packages/core-jsx/src/`               | `Eficy` class, lifecycle hooks           |
| Browser entry      | `packages/browser/src/standalone.ts`   | No-build browser usage                   |
| Component registry | `packages/core-jsx/src/`               | `e-` prefix component lookup             |

## PACKAGE DEPENDENCY GRAPH

```
eficy (main entry)
├── @eficy/core-jsx
│   ├── @eficy/reactive
│   └── @eficy/reactive-react
├── @eficy/reactive-async
│   └── @eficy/reactive
├── @eficy/plugin-unocss
│   └── @eficy/core-jsx
└── (re-exports all)

@eficy/browser
└── eficy (bundled standalone)
```

## CONVENTIONS

### JSX Runtime Configuration

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "eficy"
  }
}
```

### Signal Usage Pattern

```tsx
// Signals auto-subscribe in JSX - no useState needed
const count = signal(0);
const doubled = computed(() => count() * 2);

// Read: count() | Write: count.set(5) or count(5)
<div>{count}</div>; // Auto-subscribes
```

### Component Protocol

- Register components via `core.registerComponents()`
- Use `e-` prefix in JSX: `<e-Button>` → looks up registered `Button`
- Enables consistent LLM output

### Build System

- **Monorepo**: pnpm workspaces + Turborepo
- **Package builds**: tsdown (most) / rslib (browser, shadcn-ui)
- **Tests**: Vitest

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER** use `useState`/`useReducer` for state - use signals
- **NEVER** suppress TypeScript errors with `as any`
- **NEVER** import from `dist/` directories
- **AVOID** React Context for state - signals work outside components

## COMMANDS

```bash
pnpm dev          # Start all packages in watch mode
pnpm build        # Build all packages (respects dependency order)
pnpm test         # Run all tests
pnpm play         # Start playground dev server
```

## NOTES

- `reflect-metadata` required for decorators (@Observable, @Computed, @Action)
- `strictNullChecks: false` in tsconfig (intentional)
- `packages/shadcn-ui` is a Next.js app that exports components
- `llm_shadcn.txt` contains prompts for LLM page generation
