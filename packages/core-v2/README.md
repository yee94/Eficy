# Eficy Core v2.0

🚀 **全新架构的前端编排框架** - 基于现代技术栈重新设计

## ✨ 新特性

### 🏗️ 现代化架构
- **依赖注入**: 使用 `tsyringe` 构建依赖注入容器，面向对象设计
- **响应式系统**: 基于 `alien-signals` 替换 mobx，更高性能
- **由内向外构建**: React Tree 构建方式更符合 React 原生流程
- **纯净核心**: 移除 antd 等 UI 库依赖，框架更轻量

### 🔧 技术栈升级
- ✅ **tsyringe** - 依赖注入容器
- ✅ **alien-signals** - 高性能响应式系统
- ✅ **React Hooks** - 原生 React 模式
- ✅ **ahooks, lodash, axios, nanoid** - 现代工具库
- ❌ 移除 @vmojs/base 依赖
- ❌ 移除 plugin-decorator
- ❌ 移除 mobx 依赖

### 🔌 新插件体系
- 基于 tsyringe 的生命周期管理
- 更好的插件隔离和扩展性
- 内置插件：Request、Event、Action

## 📦 安装

```bash
npm install @eficy/core-v2
# 或
pnpm add @eficy/core-v2
```

## 🚀 快速开始

### 基础使用

```tsx
import { createEficy } from '@eficy/core-v2';

// 创建 Eficy 实例
const eficy = createEficy();

// 配置组件库
eficy.config({
  defaultComponentMap: {
    Button: ({ children, onClick }) => (
      <button onClick={onClick}>{children}</button>
    ),
    Input: ({ value, onChange }) => (
      <input value={value} onChange={onChange} />
    )
  }
});

// 渲染页面
eficy.render({
  '#view': 'div',
  style: { padding: 20 },
  '#children': [
    {
      '#view': 'Button',
      '#content': 'Hello Eficy v2.0',
      onClick: () => alert('Clicked!')
    }
  ]
}, '#root');
```

### 使用 React Hooks

```tsx
import { useSignal, useComputed } from '@eficy/core-v2';

function Counter() {
  const count = useSignal(0);
  const doubled = useComputed(() => count.get() * 2);

  return (
    <div>
      <p>Count: {count.get()}</p>
      <p>Doubled: {doubled.get()}</p>
      <button onClick={() => count.set(count.get() + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### 扩展组件库

```tsx
import { eficy } from '@eficy/core-v2';
import { Button, Input, Card } from 'antd';

// 扩展组件库 - 支持递归覆盖
eficy.extend({
  componentMap: {
    Button,
    Input,
    Card,
    // 自定义组件
    CustomCard: ({ title, children }) => (
      <Card title={title}>{children}</Card>
    )
  }
});
```

## 🏛️ 架构设计

### 依赖注入容器

```tsx
import { TOKENS, eficyContainer } from '@eficy/core-v2';

// 获取服务
const configService = eficyContainer.resolve(TOKENS.CONFIG_SERVICE);
const componentRegistry = eficyContainer.resolve(TOKENS.COMPONENT_REGISTRY);
```

### 插件开发

```tsx
import { BasePlugin } from '@eficy/core-v2';
import { DependencyContainer } from 'tsyringe';

export class MyPlugin extends BasePlugin {
  public readonly name = 'my-plugin';
  public readonly version = '1.0.0';

  protected onInstall(container: DependencyContainer, options?: any): void {
    // 插件安装逻辑
    this.registerService('MY_SERVICE', MyService);
  }

  protected onUninstall(container: DependencyContainer): void {
    // 清理逻辑
  }
}
```

## 🔄 从 v1 迁移

### 主要变更

1. **导入方式更改**
```tsx
// v1
import * as Eficy from '@eficy/core';

// v2
import { createEficy, eficy } from '@eficy/core-v2';
```

2. **配置方式更改**
```tsx
// v1
Eficy.Config.defaultComponentMap = componentMap;

// v2
eficy.config({ defaultComponentMap: componentMap });
```

3. **响应式数据**
```tsx
// v1 (mobx)
import { observable } from 'mobx';

// v2 (signals)
import { useSignal } from '@eficy/core-v2';
```

### 兼容性

- ✅ JSON Schema 格式兼容
- ✅ 基础 API 兼容
- ⚠️ 插件需要重写
- ⚠️ 响应式数据需要迁移

## 📊 性能优化

### 由内向外构建
- 减少不必要的重渲染
- 更好的 React 性能优化
- 支持 React.memo 和 useMemo

### Signals 响应式系统
- 更细粒度的更新
- 更低的内存占用
- 更快的计算属性

## 🔌 内置插件

### RequestPlugin
```tsx
// 自动注册，支持 axios 配置
eficy.config({
  requestConfig: {
    timeout: 5000,
    baseURL: '/api'
  }
});
```

### EventPlugin
```tsx
// 事件发布订阅
const eventService = eficy.getContainer().resolve(TOKENS.EVENT_EMITTER);
eventService.on('data-updated', (data) => {
  console.log('Data updated:', data);
});
```

### ActionPlugin
```tsx
// 内置动作：update, reset, success, error, request, navigate, reload
{
  '#view': 'Button',
  onClick: {
    action: 'request',
    data: { url: '/api/data' }
  }
}
```

## 🎯 路线图

- [x] 核心架构重构
- [x] 依赖注入系统
- [x] 响应式系统
- [x] 插件体系
- [ ] 完整解析器实现
- [ ] 表单插件
- [ ] 表格插件
- [ ] 路由插件
- [ ] 状态管理插件
- [ ] 测试套件
- [ ] 文档完善

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT 