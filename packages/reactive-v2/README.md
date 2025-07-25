# @eficy/reactive-v2

现代化的注解式响应式状态管理库，基于 `alien-signals` 构建，专注于简洁的 API 和高性能。

## 🚀 核心特性

- **🎯 基于 Signal**: 使用 `alien-signals` 提供高性能响应式
- **📝 注解式 API**: 简洁的声明式状态管理
- **⚡ 自动批处理**: Action 自动批处理状态更新
- **📦 类型安全**: 完整的 TypeScript 支持
- **🔄 无 Proxy**: 不依赖 Proxy，兼容性更好
- **🎨 灵活设计**: 支持数组、对象等复杂状态
- **🧪 全面测试**: 覆盖率 > 90% 的单元测试

## 📦 安装

```bash
npm install @eficy/reactive-v2
# or
yarn add @eficy/reactive-v2
# or
pnpm add @eficy/reactive-v2
```

## 🚀 快速开始

### 基础响应式状态

```typescript
import { signal, computed, effect, action } from '@eficy/reactive-v2';

// 创建响应式状态
const count = signal(0);
const doubled = computed(() => count() * 2);

// 自动运行效果
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// 创建 action
const increment = action(() => {
  count(count() + 1);
});

// 触发更新
increment(); // 输出: Count: 1, Doubled: 2
```

### 响应式数组

```typescript
import { observableArray, action } from '@eficy/reactive-v2';

const todos = observableArray<string>(['学习', '工作']);

// 数组操作自动触发更新
const addTodo = action((todo: string) => {
  todos.push(todo);
});

const removeTodo = action((index: number) => {
  todos.splice(index, 1);
});

// 监听数组变化
effect(() => {
  console.log('Todos:', todos.toArray());
  console.log('Count:', todos.length);
});

addTodo('运动'); // 自动触发更新
```

### 响应式对象

```typescript
import { observableObject, action } from '@eficy/reactive-v2';

const user = observableObject({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
});

// 对象操作
const updateUser = action((updates: Partial<typeof user.value>) => {
  user.update(updates);
});

const growOlder = action(() => {
  user.set('age', user.get('age') + 1);
});

// 监听对象变化
effect(() => {
  console.log(`用户: ${user.get('name')}, 年龄: ${user.get('age')}`);
});

updateUser({ age: 26 }); // 触发更新
```

### 注解式类定义

```typescript
import { defineReactiveClass, observable, computed, actionAnnotation } from '@eficy/reactive-v2';

const Store = defineReactiveClass({
  // 响应式状态
  count: observable(0),
  name: observable('Hello'),
  
  // 计算属性
  displayText: computed(function(this: any) {
    return `${this.name()}: ${this.count()}`;
  }),
  
  // Actions
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

// 使用
effect(() => {
  console.log(Store.displayText());
});

Store.increment(); // 触发更新
Store.setName('World'); // 触发更新
```

## 🎯 批处理 (Batch)

### 自动批处理

所有 `action` 自动进行批处理：

```typescript
const state = {
  x: signal(0),
  y: signal(0),
  z: signal(0)
};

const sum = computed(() => state.x() + state.y() + state.z());

effect(() => {
  console.log('Sum:', sum()); // 只会打印一次
});

// Action 自动批处理多个状态更新
const updateAll = action(() => {
  state.x(1);  // 这些更新会被批处理
  state.y(2);  // 只触发一次 effect
  state.z(3);
});

updateAll();
```

### 手动批处理

```typescript
import { batch } from '@eficy/reactive-v2';

// 手动批处理
batch(() => {
  state.x(10);
  state.y(20);
  state.z(30);
}); // 只触发一次更新
```

## 👀 监听变化 (Watch)

```typescript
import { watch, ref } from '@eficy/reactive-v2';

const name = ref('Alice');
const age = ref(20);

// 监听单个值变化
const stopWatching = watch(
  () => name.value,
  (newName, oldName) => {
    console.log(`名字从 ${oldName} 改为 ${newName}`);
  }
);

// 监听计算值变化
const fullInfo = computed(() => `${name.value}-${age.value}`);
watch(
  () => fullInfo(),
  (newInfo, oldInfo) => {
    console.log(`信息更新: ${newInfo}`);
  }
);

name.value = 'Bob'; // 触发监听器
```

## 📚 API 参考

### 核心 API

| API | 描述 | 示例 |
|-----|------|------|
| `signal(value)` | 创建响应式状态 | `const count = signal(0)` |
| `computed(fn)` | 创建计算属性 | `const doubled = computed(() => count() * 2)` |
| `effect(fn)` | 自动运行效果 | `effect(() => console.log(count()))` |
| `action(fn)` | 创建批处理动作 | `const inc = action(() => count(count() + 1))` |
| `batch(fn)` | 手动批处理 | `batch(() => { /* 多个更新 */ })` |

### 集合 API

| API | 描述 | 示例 |
|-----|------|------|
| `observableArray(arr)` | 创建响应式数组 | `const list = observableArray([1, 2, 3])` |
| `observableObject(obj)` | 创建响应式对象 | `const user = observableObject({ name: 'Alice' })` |
| `defineReactiveClass(def)` | 创建响应式类 | `const Store = defineReactiveClass({ count: observable(0) })` |

### 工具 API

| API | 描述 | 示例 |
|-----|------|------|
| `watch(getter, callback)` | 监听值变化 | `watch(() => count(), (new, old) => {})` |
| `ref(value)` | 创建响应式引用 | `const name = ref('Alice')` |

## 🔄 迁移指南

### 从 V1 迁移到 V2

```typescript
// V1 (Proxy-based)
const state = observable({ count: 0 });
autorun(() => console.log(state.count));
state.count++;

// V2 (Signal-based) 
const count = signal(0);
effect(() => console.log(count()));
count(count() + 1);

// 或使用对象包装
const state = observableObject({ count: 0 });
effect(() => console.log(state.get('count')));
state.set('count', state.get('count') + 1);
```

## ✨ 最佳实践

1. **优先使用 action**: 所有状态修改都应该在 action 中进行
2. **合理使用计算属性**: 避免在 effect 中进行复杂计算
3. **及时清理**: 记得调用 effect 返回的清理函数
4. **避免直接修改**: 不要直接修改响应式状态，使用提供的方法
5. **类型安全**: 充分利用 TypeScript 的类型系统

## 🚀 性能特点

- **基于 Signal 的细粒度更新**: 只更新真正依赖的部分
- **自动批处理**: 避免不必要的重复计算
- **更少的内存占用**: 相比 Proxy 方案更轻量
- **更快的访问速度**: 直接函数调用，无代理开销

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md) 了解更多信息。 