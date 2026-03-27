# @eficy/reactive

Core reactive state management. MobX-compatible API powered by `@preact/signals-core`.

## STRUCTURE

```
src/
├── core/           # Signal primitives
├── annotation/     # Decorators (@Observable, @Computed, @Action)
├── collections/    # ObservableArray, ObservableMap, ObservableSet
└── __tests__/      # Vitest tests
```

## WHERE TO LOOK

| Task                   | File                   | Notes                       |
| ---------------------- | ---------------------- | --------------------------- |
| Create signal          | `src/core/signal.ts`   | Wraps @preact/signals-core  |
| Computed values        | `src/core/computed.ts` | Auto-dependency tracking    |
| Side effects           | `src/core/effect.ts`   | `effect()`, `watch()`       |
| Batching               | `src/core/batch.ts`    | `action()`, `batch()`       |
| Class decorators       | `src/annotation/`      | Requires `reflect-metadata` |
| Observable collections | `src/collections/`     | Array, Map, Set wrappers    |

## CONVENTIONS

### Function-based API (Recommended)

```tsx
const store = observable({ count: 0 });
const double = computed(() => store.get('count') * 2);

const increment = action(() => {
  store.set('count', store.get('count') + 1);
});
```

### Decorator-based API (Class Style)

```tsx
import 'reflect-metadata';
import { Observable, Computed, Action, makeObservable } from '@eficy/reactive/annotation';

class Store {
  @Observable count = 0;

  @Computed get doubled() {
    return this.count * 2;
  }

  @Action increment() {
    this.count++;
  }

  constructor() {
    makeObservable(this);
  }
}
```

## ANTI-PATTERNS

- **NEVER** read signals without establishing dependency context
- **NEVER** mutate observables outside `action()` in production
- **AVOID** creating signals inside render functions
