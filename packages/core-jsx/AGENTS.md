# @eficy/core-jsx

Custom JSX runtime + plugin system. Heart of Eficy framework.

## STRUCTURE

```
src/
├── jsx-runtime.ts       # Custom jsx/jsxs functions
├── jsx-dev-runtime.ts   # Dev mode JSX
├── Eficy.ts             # Main class - DI container
├── EficyProvider.tsx    # React context provider
├── EficyNode.tsx        # Core render component
├── plugins/             # Plugin lifecycle system
├── services/            # ComponentRegistry, EventEmitter
└── __tests__/
```

## WHERE TO LOOK

| Task                | File                            | Notes                          |
| ------------------- | ------------------------------- | ------------------------------ |
| JSX transformation  | `jsx-runtime.ts`                | Wraps React + signal handling  |
| Plugin installation | `Eficy.ts`                      | `core.install(Plugin, config)` |
| Component lookup    | `services/ComponentRegistry.ts` | `e-` prefix resolution         |
| Lifecycle hooks     | `plugins/decorators.ts`         | @Initialize, @Render, @Destroy |
| Error boundaries    | `EficyNode.tsx`                 | Auto error UI                  |

## CONVENTIONS

### Plugin Development

```tsx
@injectable()
class MyPlugin implements ILifecyclePlugin {
  name = 'my-plugin';

  @Initialize()
  async initialize(config?: any) { /* setup */ }

  @Render(priority?: number)
  onRender(context, next) {
    const Component = next();
    return (props) => <Component {...props} />;
  }

  @Destroy()
  destroy() { /* cleanup */ }
}
```

### Lifecycle Hooks Order

1. `@Initialize` - Plugin setup
2. `@RootMount` - App mounted
3. `@Render` - Each component render (洋葱模型)
4. `@RootUnmount` - App unmounted
5. `@Destroy` - Plugin cleanup

### Component Registration

```tsx
core.registerComponents({ Button, Input });
// Now use: <e-Button> or <e-Input> in JSX
```

## ANTI-PATTERNS

- **NEVER** access `context.props` outside render hook
- **NEVER** throw in lifecycle hooks without error handling
- Plugin `enforce: 'pre'` runs before `'post'` plugins
