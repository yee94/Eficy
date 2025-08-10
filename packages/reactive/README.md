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
- **🎯 Decorator Support**: TypeScript decorators for class-based reactive programming

## 📦 Installation

```bash
npm install @eficy/reactive reflect-metadata
# or
yarn add @eficy/reactive reflect-metadata
# or
pnpm add @eficy/reactive reflect-metadata
```

**Note**: `reflect-metadata` is required for decorator support.

## 🚀 Quick Start

### Function-based API (Recommended)

```typescript
import { observable, computed, effect, action } from '@eficy/reactive';

// Create reactive state
const userStore = observable({
  firstName: 'John',
  lastName: 'Doe',
  age: 25
});

// Create computed values
const fullName = computed(() => `${userStore.get('firstName')} ${userStore.get('lastName')}`);
const isAdult = computed(() => userStore.get('age') >= 18);

// Auto-run effects
effect(() => {
  console.log(`User: ${fullName()}, Adult: ${isAdult()}`);
});

// Create actions (MobX-style)
const updateUser = action((first: string, last: string, age: number) => {
  userStore.set('firstName', first);
  userStore.set('lastName', last);
  userStore.set('age', age);
});

// Trigger updates
updateUser('Jane', 'Smith', 30); // Output: User: Jane Smith, Adult: true
```

### Decorator-based API (Class Style)

For TypeScript projects with decorator support, you can use the class-based API:

```typescript
import 'reflect-metadata';
import { Observable, Computed, Action, makeObservable, ObservableClass } from '@eficy/reactive/annotation';

// Option 1: Manual makeObservable
class UserStore {
  @Observable
  firstName = 'John';

  @Observable
  lastName = 'Doe';

  @Observable
  age = 25;

  @Computed
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Computed
  get isAdult(): boolean {
    return this.age >= 18;
  }

  @Action
  updateUser(first: string, last: string, age: number) {
    this.firstName = first;
    this.lastName = last;
    this.age = age;
  }

  constructor() {
    makeObservable(this);
  }
}

// Option 2: ObservableClass base class (auto makeObservable)
class UserStore extends ObservableClass {
  @Observable
  firstName = 'John';

  @Observable
  lastName = 'Doe';

  @Observable
  age = 25;

  @Computed
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Computed
  get isAdult(): boolean {
    return this.age >= 18;
  }

  @Action
  updateUser(first: string, last: string, age: number) {
    this.firstName = first;
    this.lastName = last;
    this.age = age;
  }
}

// Usage
const store = new UserStore();

effect(() => {
  console.log(`User: ${store.fullName}, Adult: ${store.isAdult}`);
});

store.updateUser('Jane', 'Smith', 30);
```

### Decorator Configuration

To use decorators, ensure your TypeScript configuration supports them:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

If using Vite or other build tools, you may need additional configuration for decorator support.

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
import { observableObject } from '@eficy/reactive';

const user = observableObject({
  name: 'John',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});

// Reactive updates
effect(() => {
  console.log(`${user.get('name')} (${user.get('email')})`);
});

// Update nested properties
user.set('name', 'Jane');
user.update({ email: 'jane@example.com' });
```

## 📚 API Reference

### Core Functions

- **`signal(initialValue)`** - Create a reactive signal
- **`computed(fn)`** - Create a computed value that automatically updates
- **`effect(fn)`** - Create a side effect that runs when dependencies change
- **`action(fn)`** - Wrap function to batch updates and improve performance
- **`batch(fn)`** - Manually batch multiple updates
- **`watch(signal, callback)`** - Watch for signal changes

### Observable Creation

- **`observable(value)`** - Auto-detect type and create appropriate observable
- **`observable.box(value)`** - Create observable primitive (signal)
- **`observable.object(obj)`** - Create observable object
- **`observable.array(arr)`** - Create observable array
- **`observable.map(map)`** - Create observable Map
- **`observable.set(set)`** - Create observable Set

### Decorators (from '@eficy/reactive/annotation')

- **`@Observable`** - Mark class property as observable
- **`@Observable(initialValue)`** - Mark property as observable with initial value
- **`@Computed`** - Mark getter as computed property
- **`@Action`** - Mark method as action
- **`@Action('name')`** - Mark method as action with custom name
- **`makeObservable(instance)`** - Apply decorators to class instance
- **`ObservableClass`** - Base class that auto-applies makeObservable

### Collections

- **`observableArray<T>(items?)`** - Reactive array with MobX-compatible API
- **`observableObject<T>(obj)`** - Reactive object with get/set methods
- **`observableMap<K,V>(entries?)`** - Reactive Map
- **`observableSet<T>(values?)`** - Reactive Set

## 🎯 Migration from MobX

This library is designed to be largely compatible with MobX patterns:

```typescript
// MobX style
import { Observable, Computed, Action, makeObservable } from 'mobx';

// @eficy/reactive style (very similar!)
import { Observable, Computed, Action, makeObservable } from '@eficy/reactive/annotation';
```

Key differences:

1. Uses `@preact/signals-core` instead of Proxy-based reactivity
2. Requires `reflect-metadata` for decorators
3. Function-based API available as alternative to class-based
4. Some advanced MobX features may not be available

## ⚡ Performance Tips

1. **Use actions for batching**: Wrap multiple state updates in `action()` for better performance
2. **Computed caching**: Computed values are automatically cached and only recalculate when dependencies change
3. **Selective observation**: Only observe the data you actually need in components
4. **Avoid creating observables in render**: Create observables outside render functions

## 🧪 Testing

```typescript
import { signal, effect } from '@eficy/reactive';

// Test reactive behavior
const count = signal(0);
let effectRuns = 0;

effect(() => {
  effectRuns++;
  count(); // Read signal to create dependency
});

expect(effectRuns).toBe(1);

count(5);
expect(effectRuns).toBe(2);
```

### Signal 的 set 用法（不消费事件）

```typescript
import { signal } from '@eficy/reactive';

const count = signal(0);

// 直接设置值
count.set(1);
// 或使用函数式更新
count.set((prev) => prev + 1);

// 也可以使用调用风格（与 set 等价）
count(5);
count((prev) => prev + 1);

// 表单事件中请显式取值（不会自动从事件中读取 value/checked）
// input 文本框
const text = signal('');
// onChange={(e) => text.set(e.target.value)}

// checkbox
const checked = signal(false);
// onChange={(e) => checked.set(e.target.checked)}
```

## 📝 TypeScript Support

This library is written in TypeScript and provides excellent type inference:

```typescript
// Types are automatically inferred
const user = observable({
  name: 'John',    // string
  age: 25,         // number
  active: true     // boolean
});

// TypeScript knows the return type
const greeting = computed(() => {
  return `Hello, ${user.get('name')}!`; // string
});
```

## 🔗 Ecosystem

- **[@eficy/reactive-react](../reactive-react)** - React bindings for @eficy/reactive
- **[@eficy/core](../core)** - UI framework using @eficy/reactive

## 📜 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests to our repository.

---

**Made with ❤️ by the Eficy team** 