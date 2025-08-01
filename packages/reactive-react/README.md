# @eficy/reactive-react

React bindings for @eficy/reactive - MobX-compatible reactive state management with React integration.

## 🚀 Quick Start

### Installation

```bash
npm install @eficy/reactive-react
# or
yarn add @eficy/reactive-react
# or 
pnpm add @eficy/reactive-react
```

### Basic Usage

```tsx
import React from 'react';
import { Observable, Action, observer } from '@eficy/reactive-react';

// 使用 observable 创建响应式状态 (MobX 兼容语法)
const store = observable({
  count: 0,
  name: 'Hello'
});

// 创建 actions
const increment = action(() => {
  store.set('count', store.get('count') + 1);
});

const updateName = action((newName: string) => {
  store.set('name', newName);
});

// 使用 observer 让组件响应式
const Counter = observer(() => (
  <div>
    <h1>{store.get('name')}: {store.get('count')}</h1>
    <button onClick={increment}>+1</button>
    <button onClick={() => updateName('Updated!')}>Update Name</button>
  </div>
));

export default Counter;
```

## 📚 Core API

### observable

主要的入口点，类似 MobX 的 `observable` 方法：

```tsx
import { observable } from '@eficy/reactive-react';

// 自动检测类型并创建对应的可观察对象
const store = observable({
  count: 0,
  items: ['a', 'b', 'c']
});

const arr = observable([1, 2, 3]);
const map = observable(new Map());
const set = observable(new Set());
const primitive = observable(42);
```

### 显式方法

```tsx
// 创建可观察对象
const store = observable.object({ count: 0 });

// 创建可观察数组  
const items = observable.array(['apple', 'banana']);

// 创建可观察的基本类型 (Box)
const count = observable.box(0);

// 创建可观察 Map
const userMap = observable.map();

// 创建可观察 Set
const tagSet = observable.set();
```

### observer

将 React 组件转换为响应式组件：

```tsx
import { observer } from '@eficy/reactive-react';

const MyComponent = observer(() => {
  return <div>Count: {store.get('count')}</div>;
});

// 带 forwardRef 的用法
const MyInput = observer(React.forwardRef((props, ref) => {
  return <input ref={ref} value={store.get('value')} />;
}), { forwardRef: true });
```

### useObserver Hook

在函数组件中直接使用响应式逻辑：

```tsx
import { useObserver } from '@eficy/reactive-react';

function MyComponent() {
  return useObserver(() => (
    <div>Count: {store.get('count')}</div>
  ));
}
```

### action

批处理状态更新，确保只触发一次重新渲染：

```tsx
import { action } from '@eficy/reactive-react';

const updateMultiple = action(() => {
  store.set('count', 10);
  store.set('name', 'Updated');
  // 只会触发一次重新渲染
});
```

## 🎯 高级用法

### 计算值

```tsx
import { computed } from '@eficy/reactive-react';

const store = observable({
  firstName: 'John',
  lastName: 'Doe'
});

const fullName = computed(() => 
  `${store.get('firstName')} ${store.get('lastName')}`
);

const MyComponent = observer(() => (
  <div>Full name: {fullName()}</div>
));
```

### 数组操作

```tsx
const items = observable(['apple', 'banana']);

const ItemList = observer(() => (
  <ul>
    {items.toArray().map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
));

// 添加项目
const addItem = action(() => {
  items.push('orange');
});
```

### Map 和 Set

```tsx
const userMap = observable.map<string, User>();
const tagSet = observable.set<string>();

const UserList = observer(() => {
  // 确保通过访问 size 建立依赖关系
  const mapSize = userMap.size;
  const users = Array.from(userMap.entries());
  
  return (
    <div>
      <h3>Users ({mapSize}):</h3>
      {users.map(([id, user]) => (
        <div key={id}>{user.name}</div>
      ))}
    </div>
  );
});
```

## 🔄 从 MobX 迁移

@eficy/reactive-react 提供了与 MobX 兼容的 API，迁移通常很简单：

```tsx
// MobX
import { Observable, Action, computed } from 'mobx';
import { observer } from 'mobx-react';

// @eficy/reactive-react
import { Observable, Action, computed, observer } from '@eficy/reactive-react';

// API 基本相同！
const store = observable({
  count: 0
});

const increment = action(() => {
  store.set('count', store.get('count') + 1);
});
```

## ⚡ 性能特性

- **精细化更新**: 只有依赖变化的组件会重新渲染
- **自动批处理**: `action` 内的多个更新会被批处理  
- **高效依赖追踪**: 基于 `@preact/signals-core` 的高性能实现
- **懒计算**: 计算值只在被访问时计算

## 🧪 测试

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Observable, Action, observer } from '@eficy/reactive-react';

it('should update component when observable changes', () => {
  const store = observable({ count: 0 });
  const increment = action(() => store.set('count', store.get('count') + 1));
  
  const Counter = observer(() => (
    <div>
      <span data-testid="count">{store.get('count')}</span>
      <button data-testid="increment" onClick={increment}>+</button>
    </div>
  ));
  
  render(<Counter />);
  expect(screen.getByTestId('count')).toHaveTextContent('0');
  
  fireEvent.click(screen.getByTestId('increment'));
  expect(screen.getByTestId('count')).toHaveTextContent('1');
});
```

## 📝 TypeScript

完全支持 TypeScript，提供类型安全的 API：

```tsx
interface UserStore {
  name: string;
  age: number;
}

const userStore = observable<UserStore>({
  name: 'John',
  age: 25
});

// 类型安全的访问
const name: string = userStore.get('name');
const age: number = userStore.get('age');
```

## 📖 更多信息

- [GitHub Repository](https://github.com/yee94/eficy)
- [@eficy/reactive 文档](../reactive/README.md)

## 📄 License

MIT
