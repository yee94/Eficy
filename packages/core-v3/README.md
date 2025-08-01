# @eficy/core-v3

Eficy Core V3 - 现代化的基于 React 的组件系统，具备 signals 响应式能力。

## ✨ 特性

- 🚀 **基于 React** - 直接基于 React，无需额外转换
- ⚡ **Signals 响应式** - 自动检测并处理包含 signals 的 props
- 🏗️ **依赖注入** - 基于 tsyringe 的现代化 DI 系统
- 🔧 **组件注册** - 动态组件注册和管理
- 🎯 **简化架构** - 相比 v2 大幅简化，专注核心功能
- 📦 **TypeScript** - 完整的 TypeScript 支持

## 📦 安装

```bash
npm install @eficy/core-v3 @eficy/reactive
# 或
yarn add @eficy/core-v3 @eficy/reactive
# 或
pnpm add @eficy/core-v3 @eficy/reactive
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
/** @jsxImportSource @eficy/core-v3 */
import React from 'react';
import { signal } from '@eficy/reactive';
import { EficyProvider, EficyCore } from '@eficy/core-v3';

// 创建 signals
const count = signal(0);
const name = signal('World');

// 自定义组件
function CustomButton({ children, onClick, ...props }: any) {
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
}

function App() {
  const core = new EficyCore();
  
  // 注册组件
  core.registerComponent('CustomButton', CustomButton);
  
  return (
    <EficyProvider core={core}>
      <div>
        <h1>Hello, {name}!</h1>
        <p>Count: {count}</p>
        
        {/* 包含 signals 的 props 会自动被 EficyNode 处理 */}
        <CustomButton onClick={() => count.set(count() + 1)}>
          Increment: {count}
        </CustomButton>
        
        {/* 普通 props 直接使用 React 渲染 */}
        <button onClick={() => name.set('Eficy')}>
          Change Name
        </button>
      </div>
    </EficyProvider>
  );
}
```

## 📚 核心概念

### EficyCore

核心管理类，基于 tsyringe 提供依赖注入：

```typescript
import { EficyCore } from '@eficy/core-v3';

const core = new EficyCore();

// 注册组件
core.registerComponent('MyButton', MyButton);
core.registerComponents({
  MyInput: MyInput,
  MyCard: MyCard
});

// 创建子实例
const childCore = core.createChild();

// 访问服务
const componentRegistry = core.componentRegistry;
const pluginManager = core.pluginManager;
const eventEmitter = core.eventEmitter;
```

### EficyProvider

提供 Eficy 上下文：

```tsx
import { EficyProvider } from '@eficy/core-v3';

function App() {
  return (
    <EficyProvider
      core={core}                    // 可选，会自动创建
      components={{                  // 组件映射
        Button: MyButton,
        Input: MyInput
      }}
      inherit={false}                // 是否继承父级上下文
    >
      <YourApp />
    </EficyProvider>
  );
}
```

### Signals 自动处理

当 JSX 的 props 中包含 signals 时，会自动使用 `EficyNode` 进行响应式渲染：

```tsx
import { signal } from '@eficy/reactive';

const count = signal(0);
const isVisible = signal(true);

// 这会被 EficyNode 处理，因为包含 signals
<div 
  className={count.map(c => c > 5 ? 'high' : 'low')}
  style={{ display: isVisible() ? 'block' : 'none' }}
>
  Count: {count}
</div>

// 这会直接用 React 渲染，因为没有 signals
<div className="static">
  Static content
</div>
```

### Hooks

```tsx
import { 
  useEficyCore, 
  useComponentRegistry, 
  useEficyContext 
} from '@eficy/core-v3';

function MyComponent() {
  // 获取核心实例
  const core = useEficyCore();
  
  // 获取组件注册表
  const componentRegistry = useComponentRegistry();
  
  // 获取完整上下文
  const context = useEficyContext();
  
  return <div>...</div>;
}
```

## 🔧 高级用法

### 插件系统

```typescript
import { Plugin } from '@eficy/core-v3';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install(core) {
    // 安装逻辑
    core.registerComponent('PluginComponent', MyComponent);
  },
  uninstall(core) {
    // 卸载逻辑
  }
};

core.pluginManager.register(myPlugin);
await core.pluginManager.install('my-plugin');
```

### 事件系统

```typescript
// 监听事件
const unsubscribe = core.eventEmitter.on('custom-event', (data) => {
  console.log('Event received:', data);
});

// 发射事件
core.eventEmitter.emit('custom-event', { message: 'Hello' });

// 取消监听
unsubscribe();
```

### 自定义服务

```typescript
import { injectable } from 'tsyringe';

@injectable()
class MyService {
  getName() {
    return 'MyService';
  }
}

// 注册服务
core.registerSingleton(MyService);

// 使用服务
const myService = core.resolve(MyService);
console.log(myService.getName());
```

## 🔄 从 Core V2 迁移

### 主要变化

1. **简化架构** - 移除了复杂的 ViewData 转换，直接基于 React
2. **自动检测** - 自动检测 signals 并切换渲染模式
3. **更好的 TypeScript** - 完整的类型支持和智能提示
4. **保留 DI** - 继续使用 tsyringe 依赖注入

### 迁移步骤

1. 更新导入：
   ```typescript
   // 旧版本
   import Eficy from '@eficy/core';
   
   // 新版本
   import { EficyCore, EficyProvider } from '@eficy/core-v3';
   ```

2. 更新 JSX 配置：
   ```json
   {
     "compilerOptions": {
       "jsxImportSource": "@eficy/core-v3"
     }
   }
   ```

3. 使用新的 Provider：
   ```tsx
   // 旧版本
   <EficyProvider value={eficyInstance}>
   
   // 新版本
   <EficyProvider core={eficyCore}>
   ```

## 📊 性能

- ⚡ **自动优化** - 只有包含 signals 的组件使用响应式渲染
- 🎯 **精确更新** - signals 变化时只更新相关组件
- 💾 **内存效率** - 无需维护双重状态树
- 🔄 **React 兼容** - 充分利用 React 的优化机制

## 🤝 与生态系统集成

### React DevTools

完全兼容 React DevTools，可以正常调试组件树。

### 第三方库

可以与任何 React 生态系统的库集成：

```tsx
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';

<Provider store={store}>
  <Router>
    <EficyProvider core={core}>
      <App />
    </EficyProvider>
  </Router>
</Provider>
```

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。