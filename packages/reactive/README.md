# @eficy/reactive

A modern annotation-based reactive state management library with **MobX-compatible API**, powered by `@preact/signals-core` for high-performance reactivity.

## 🚀 Key Features

- **🎯 Signal-Based**: High-performance reactivity powered by `@preact/signals-core`
- **📝 MobX-Compatible API**: Familiar annotations and patterns from MobX
- **⚡ Automatic Batching**: Actions automatically batch state updates
- **📦 Type-Safe**: Full TypeScript support with excellent type inference
- **🔄 No Proxy**: Better compatibility without Proxy dependency
- **🎨 Flexible Design**: Supports arrays, objects and complex state structures
- **🧪 Well Tested**: >90% test coverage with comprehensive unit tests

## 📦 Installation

```bash
npm install @eficy/reactive
# or
yarn add @eficy/reactive
# or
pnpm add @eficy/reactive
```

## 🚀 Quick Start

### Basic Reactive State

```typescript
import { signal, computed, effect, action } from '@eficy/reactive';

// Create reactive state
const count = signal(0);
const doubled = computed(() => count() * 2);

// Auto-run effects
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// Create action (MobX-style)
const increment = action(() => {
  count(count() + 1);
});

// Trigger updates
increment(); // Output: Count: 1, Doubled: 2
```

### Observable Arrays (MobX-Compatible)

```typescript
import { observableArray, action } from '@eficy/reactive';

const todos = observableArray<string>(['Learn', 'Work']);

// Array operations automatically trigger updates
const addTodo = action((todo: string) => {
  todos.push(todo);
});

const removeTodo = action((index: number) => {
  todos.splice(index, 1);
});

// Watch array changes
effect(() => {
  console.log('Todos:', todos.toArray());
  console.log('Count:', todos.length);
});

addTodo('Exercise'); // Automatically triggers updates
```

### Observable Objects (MobX-Compatible)

```typescript
import { observableObject, action } from '@eficy/reactive';

const user = observableObject({
  name: 'John',
  age: 25,
  email: 'john@example.com'
});

// Object operations
const updateUser = action((updates: Partial<typeof user.value>) => {
  user.update(updates);
});

const growOlder = action(() => {
  user.set('age', user.get('age') + 1);
});

// Watch object changes
effect(() => {
  console.log(`User: ${user.get('name')}, Age: ${user.get('age')}`);
});

updateUser({ age: 26 }); // Triggers update
```

### Class-Based Reactive Stores (MobX-Style)

```typescript
import { defineReactiveClass, observable, computed, actionAnnotation } from '@eficy/reactive';

const Store = defineReactiveClass({
  // Observable state (like MobX @observable)
  count: observable(0),
  name: observable('Hello'),
  
  // Computed values (like MobX @computed)
  displayText: computed(function(this: any) {
    return `${this.name()}: ${this.count()}`;
  }),
  
  // Actions (like MobX @action)
  increment: actionAnnotation(function(this: any) {
    this.count(this.count() + 1);
  }),
  
  setName: actionAnnotation(function(this: any, newName: string) {
    this.name(newName);
  }),
  
  reset: actionAnnotation(function(this: any) {
    this.count(0);
    this.name('Hello');
  })
});

// Usage
effect(() => {
  console.log(Store.displayText());
});

Store.increment(); // Triggers update
Store.setName('World'); // Triggers update
```

## 🎯 Batching (MobX runInAction equivalent)

### Automatic Batching

All `action` functions automatically batch updates:

```typescript
const state = {
  x: signal(0),
  y: signal(0),
  z: signal(0)
};

const sum = computed(() => state.x() + state.y() + state.z());

effect(() => {
  console.log('Sum:', sum()); // Only prints once
});

// Action automatically batches multiple state updates
const updateAll = action(() => {
  state.x(1);  // These updates are batched
  state.y(2);  // Only triggers effect once
  state.z(3);
});

updateAll();
```

### Manual Batching

```typescript
import { batch } from '@eficy/reactive';

// Manual batching (like MobX runInAction)
batch(() => {
  state.x(10);
  state.y(20);
  state.z(30);
}); // Only triggers one update
```

## 👀 Watching Changes (MobX observe equivalent)

```typescript
import { watch, ref } from '@eficy/reactive';

const name = ref('Alice');
const age = ref(20);

// Watch single value changes
const stopWatching = watch(
  () => name.value,
  (newName, oldName) => {
    console.log(`Name changed from ${oldName} to ${newName}`);
  }
);

// Watch computed value changes
const fullInfo = computed(() => `${name.value}-${age.value}`);
watch(
  () => fullInfo(),
  (newInfo, oldInfo) => {
    console.log(`Info updated: ${newInfo}`);
  }
);

name.value = 'Bob'; // Triggers watcher
```

## 📚 API Reference

### Core API (MobX-Compatible)

| API | Description | Example |
|-----|-------------|---------|
| `signal(value)` | Create reactive state | `const count = signal(0)` |
| `computed(fn)` | Create computed value (like MobX @computed) | `const doubled = computed(() => count() * 2)` |
| `effect(fn)` | Auto-run effect (like MobX autorun) | `effect(() => console.log(count()))` |
| `action(fn)` | Create batched action (like MobX @action) | `const inc = action(() => count(count() + 1))` |
| `batch(fn)` | Manual batching (like MobX runInAction) | `batch(() => { /* multiple updates */ })` |

### Collection API

| API | Description | Example |
|-----|-------------|---------|
| `observableArray(arr)` | Create observable array (like MobX observable.array) | `const list = observableArray([1, 2, 3])` |
| `observableObject(obj)` | Create observable object (like MobX observable.object) | `const user = observableObject({ name: 'Alice' })` |
| `defineReactiveClass(def)` | Create reactive class | `const Store = defineReactiveClass({ count: observable(0) })` |

### Utility API

| API | Description | Example |
|-----|-------------|---------|
| `watch(getter, callback)` | Watch value changes (like MobX observe) | `watch(() => count(), (new, old) => {})` |
| `ref(value)` | Create reactive reference | `const name = ref('Alice')` |

## 🔄 Migration Guide

### From MobX to @eficy/reactive

```typescript
// MobX
import { observable, computed, autorun, action, runInAction } from 'mobx';

const state = observable({ count: 0 });
const doubled = computed(() => state.count * 2);
autorun(() => console.log(state.count));
const increment = action(() => state.count++);

// @eficy/reactive (compatible API)
import { observableObject, computed, effect, action } from '@eficy/reactive';

const state = observableObject({ count: 0 });
const doubled = computed(() => state.get('count') * 2);
effect(() => console.log(state.get('count')));
const increment = action(() => state.set('count', state.get('count') + 1));
```

### From V1 to V2

```typescript
// V1 (Proxy-based)
const state = observable({ count: 0 });
autorun(() => console.log(state.count));
state.count++;

// V2 (Signal-based) 
const count = signal(0);
effect(() => console.log(count()));
count(count() + 1);

// Or using object wrapper
const state = observableObject({ count: 0 });
effect(() => console.log(state.get('count')));
state.set('count', state.get('count') + 1);
```

## ✨ Best Practices

1. **Use actions for mutations**: All state modifications should be wrapped in actions (like MobX)
2. **Leverage computed values**: Avoid complex calculations in effects
3. **Clean up effects**: Remember to call the cleanup function returned by effect
4. **Avoid direct mutations**: Use provided methods instead of direct state modification
5. **Type safety**: Leverage TypeScript's type system for better development experience

## 🚀 Performance Features

- **Fine-grained Signal-based updates**: Only updates truly dependent parts
- **Automatic batching**: Prevents unnecessary re-computations (like MobX)
- **Lower memory footprint**: More lightweight compared to Proxy-based solutions
- **Faster access**: Direct function calls without proxy overhead

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please check the [Contributing Guide](../../CONTRIBUTING.md) for more information. 