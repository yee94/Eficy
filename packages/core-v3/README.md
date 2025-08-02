# @eficy/core-v3

Modern React-based component system with signals reactivity

## 📖 概述

`@eficy/core-v3` 是 Eficy 框架的第三代核心库，专为 B 端系统设计，旨在通过单文件 JSX 实现完整的页面渲染。该版本基于 React 18+ 构建，深度集成了 signals 响应式系统，提供了强大的插件体系和组件注册机制。

## 🎯 核心理念

在 B 端系统中，我们希望通过一个单文件的 JSX 来完成完整的页面渲染，页面中的所有状态都可以通过 signals 来完成管理，无需依赖复杂的 React 状态管理方案。

```jsx
import { signal, computed } from '@eficy/reactive';
import { asyncSignal } from '@eficy/reactive-async';

const name = signal("Yee");
const { loading, data } = asyncSignal(async () => ({ list: [], total: 0 }));

export default () => (
  <div>
    Hi, {name}

    {loading ? <div>Loading...</div> : (
      <div>
        {computed(() => data().list.map((item) => (
          <div key={item.id}>{item.name}</div>
        )))}
      </div>
    ))}
  </div>
);
```

## ✨ 核心特性

### 🔄 响应式系统集成

- **自动 Signal 识别**: 在 JSX 中使用的 signal 会被自动识别并订阅
- **零配置响应**: 无需手动调用 `useState` 或其他 React Hooks
- **细粒度更新**: 只有使用了变化 signal 的组件会重新渲染

### 🧩 组件注册系统

- **预注册组件**: 通过 `EficyProvider` 预注册组件，在 JSX 中通过 `e-` 前缀快速使用
- **动态组件解析**: 支持字符串类型的组件名称，自动从注册表中查找对应组件
- **原生标签支持**: 完全支持原生 HTML 标签渲染

### 🔌 插件体系

- **生命周期钩子**: 提供完整的组件生命周期钩子系统
- **渲染拦截**: 插件可以拦截和修改渲染过程
- **依赖注入**: 基于 tsyringe 的依赖注入系统
- **洋葱式中间件**: 插件按照洋葱模型执行，支持 pre/post 执行顺序

### 📦 自定义 JSX Runtime

- **透明集成**: 通过自定义 JSX runtime 实现对 signals 的自动处理
- **零运行时开销**: 编译时转换，运行时性能优异
- **TypeScript 支持**: 完整的类型定义和类型安全

## 📦 安装

```bash
npm install @eficy/core-v3 @eficy/reactive @eficy/reactive-react
# 或
yarn add @eficy/core-v3 @eficy/reactive @eficy/reactive-react
# 或
pnpm add @eficy/core-v3 @eficy/reactive @eficy/reactive-react
```

## 🚀 快速开始

### 1. 配置 TSX/JSX

在你的 `tsconfig.json` 中：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@eficy/core-v3"
  }
}
```

### 2. 基础使用

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { EficyProvider, Eficy } from '@eficy/core-v3';
import { signal } from '@eficy/reactive';

// 创建 Eficy 实例
const core = new Eficy();

// 注册自定义组件
const CustomButton = ({ children, ...props }) => (
  <button className="custom-btn" {...props}>
    {children}
  </button>
);

core.registerComponents({
  CustomButton,
  // 可以通过 e-custom-button 在 JSX 中使用
});

// 应用组件
const App = () => {
  const count = signal(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <e-custom-button onClick={() => count(count() + 1)}>Click me!</e-custom-button>
    </div>
  );
};

// 渲染应用
const root = createRoot(document.getElementById('root'));
root.render(
  <EficyProvider core={core}>
    <App />
  </EficyProvider>,
);
```

## 🔧 API 文档

### Eficy 核心类

#### 创建实例

```typescript
const core = new Eficy();
```

#### 组件注册

```typescript
// 单个组件注册
core.registerComponent('MyButton', MyButtonComponent);

// 批量组件注册
core.registerComponents({
  MyButton: MyButtonComponent,
  MyInput: MyInputComponent,
});
```

#### 插件管理

```typescript
// 安装插件
await core.install(MyPlugin, {
  // 插件配置
});

// 获取插件实例
const plugin = core.pluginManager.getPlugin('plugin-name');
```

#### 子实例创建

```typescript
// 创建子实例，继承父实例的组件注册
const childCore = core.createChild();
```

### EficyProvider 组件

```typescript
interface EficyProviderProps {
  children: ReactNode;
  core?: Eficy; // 可选，不提供会自动创建新实例
}
```

### EficyNode 组件

```typescript
interface EficyNodeProps {
  type: string | ComponentType<any>;
  props: Record<string, any>;
  key?: string;
}
```

EficyNode 是框架的核心渲染组件，负责：

- Signal 属性解析和订阅
- 组件类型解析（字符串 -> 实际组件）
- 插件钩子执行
- 错误边界处理

### Hooks

```tsx
import { useEficyContext } from '@eficy/core-v3';

function MyComponent() {
  // 获取 Eficy 实例
  const eficy = useEficyContext();

  // 访问服务
  const componentRegistry = eficy.componentRegistry;
  const pluginManager = eficy.pluginManager;
  const eventEmitter = eficy.eventEmitter;

  return <div>...</div>;
}
```

## 🔌 插件开发

### 基础插件结构

```typescript
import { injectable, ILifecyclePlugin, Initialize, Render } from '@eficy/core-v3';

@injectable()
export class MyPlugin implements ILifecyclePlugin {
  public readonly name = 'my-plugin';
  public readonly version = '1.0.0';
  public readonly enforce = 'pre'; // 'pre' | 'post' | undefined

  @Initialize()
  async initialize(config?: any) {
    // 插件初始化逻辑
    console.log('Plugin initialized with config:', config);
  }

  @Render()
  onRender(context: IRenderContext, next: () => ComponentType<any>): ComponentType<any> {
    const OriginalComponent = next();

    // 在这里可以修改组件或包装组件
    return (props: any) => {
      console.log('Rendering component with props:', props);
      return <OriginalComponent {...props} />;
    };
  }
}
```

### 生命周期钩子

框架提供以下生命周期钩子：

```typescript
enum HookType {
  INITIALIZE = 'initialize', // 插件初始化
  RENDER = 'render', // 组件渲染
  ROOT_MOUNT = 'rootMount', // 根组件挂载
  ROOT_UNMOUNT = 'rootUnmount', // 根组件卸载
  DESTROY = 'destroy', // 插件销毁
}
```

### 装饰器使用

```typescript
import { Initialize, Render, RootMount, RootUnmount, Destroy } from '@eficy/core-v3';

@injectable()
export class ExamplePlugin implements ILifecyclePlugin {
  @Initialize()
  async initialize() {
    /* ... */
  }

  @Render(10) // 可选优先级参数
  onRender(context, next) {
    /* ... */
  }

  @RootMount()
  onRootMount() {
    /* ... */
  }

  @RootUnmount()
  onRootUnmount() {
    /* ... */
  }

  @Destroy()
  destroy() {
    /* ... */
  }
}
```

## 🎨 信号响应式系统

### Signal 基础用法

```typescript
import { signal } from '@eficy/reactive';

const count = signal(0);

// 在 JSX 中使用（自动订阅）
<div>Count: {count}</div>;

// 编程式访问
const currentCount = count(); // 获取值
count.set(10); // 设置值
count.set((prev) => prev + 1); // 函数式更新
```

### 异步 Signal

```typescript
import { asyncSignal } from '@eficy/reactive-async';

const { data, loading, error } = asyncSignal(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// 在 JSX 中使用
{
  loading && <div>Loading...</div>;
}
{
  error && <div>Error: {error.message}</div>;
}
{
  data && <div>{data.title}</div>;
}
```

### 计算属性

```typescript
import { computed } from '@eficy/reactive';

const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName()} ${lastName()}`);

// 在 JSX 中使用计算属性
<div>Welcome, {fullName}!</div>;
```

## 🏗️ 高级用法

### 自定义组件前缀

通过组件注册，你可以使用 `e-` 前缀快速访问注册的组件：

```typescript
// 注册组件
core.registerComponents({
  Button: MyButtonComponent,
  Input: MyInputComponent,
  Modal: MyModalComponent,
});

// 在 JSX 中使用
<e-button variant="primary">Click me</e-button>
<e-input placeholder="Enter text" />
<e-modal title="Dialog">
  Modal content
</e-modal>
```

### 错误边界

EficyNode 自动提供错误边界功能：

```jsx
// 如果组件渲染出错，会显示友好的错误信息
<div style={{ color: 'red', border: '1px solid red' }}>
  <h4>Render Error</h4>
  <details>
    <summary>Details</summary>
    <pre>{errorMessage}</pre>
  </details>
  <button onClick={retry}>Retry</button>
</div>
```

### 插件间通信

```typescript
// 插件可以通过事件系统进行通信
@injectable()
export class PluginA implements ILifecyclePlugin {
  name = 'plugin-a';

  @Initialize()
  async initialize() {
    // 发送事件
    this.eventEmitter.emit('plugin-a:ready', { data: 'some data' });
  }
}

@injectable()
export class PluginB implements ILifecyclePlugin {
  name = 'plugin-b';

  @Initialize()
  async initialize() {
    // 监听事件
    this.eventEmitter.on('plugin-a:ready', (data) => {
      console.log('Plugin A is ready:', data);
    });
  }
}
```

## 🧪 测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Eficy, EficyProvider } from '@eficy/core-v3';
import { signal } from '@eficy/reactive';

describe('Eficy Core V3', () => {
  it('should render signal values', async () => {
    const core = new Eficy();
    const count = signal(5);

    const TestComponent = () => <div data-testid="count">Count: {count}</div>;

    const { getByTestId } = render(
      <EficyProvider core={core}>
        <TestComponent />
      </EficyProvider>,
    );

    expect(getByTestId('count')).toHaveTextContent('Count: 5');
  });
});
```

## 🔍 最佳实践

### 1. 组件设计模式

```jsx
// ✅ 推荐：使用 signals 管理状态
const useTableData = () => {
  const data = signal([]);
  const loading = signal(false);

  const loadData = async () => {
    loading.set(true);
    try {
      const response = await fetch('/api/table-data');
      data.set(await response.json());
    } finally {
      loading.set(false);
    }
  };

  return { data, loading, loadData };
};

const TableComponent = () => {
  const { data, loading, loadData } = useTableData();

  return (
    <div>
      {loading && <div>Loading...</div>}
      <table>
        {data.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
          </tr>
        ))}
      </table>
    </div>
  );
};
```

### 2. 插件开发模式

```typescript
// ✅ 推荐：使用装饰器和依赖注入
@injectable()
export class DataTablePlugin implements ILifecyclePlugin {
  name = 'data-table-plugin';

  @Initialize()
  async initialize(config: { apiEndpoint: string }) {
    // 初始化配置
  }

  @Render()
  onRender(context: IRenderContext, next: () => ComponentType<any>) {
    // 只处理相关组件
    if (context.type !== 'data-table') {
      return next();
    }

    const OriginalComponent = next();
    return (props: any) => (
      <div className="data-table-wrapper">
        <OriginalComponent {...props} />
      </div>
    );
  }
}
```

### 3. 性能优化

```jsx
// ✅ 推荐：使用 computed 避免重复计算
const expensiveData = computed(() => {
  return heavyProcessing(rawData());
});

// ✅ 推荐：合理使用 memo 和 signal
const OptimizedComponent = memo(() => {
  const value = signal(0);

  return <div>{value}</div>;
});
```

## 📦 相关包

- [`@eficy/reactive`](../reactive) - 核心响应式系统
- [`@eficy/reactive-async`](../reactive-async) - 异步信号支持
- [`@eficy/reactive-react`](../reactive-react) - React 集成
- [`@eficy/plugin-unocss`](../plugin-unocss) - UnoCSS 样式插件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
