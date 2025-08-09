# Eficy

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/eficy.svg)](#License)
[![](https://flat.badgen.net/npm/v/eficy?icon=npm)](https://www.npmjs.com/package/eficy)
[![NPM downloads](http://img.shields.io/npm/dm/eficy.svg?style=flat-square)](http://npmjs.com/eficy)

**Eficy** 是一个零构建的 JSX 运行时。它可以在浏览器中直接渲染 JSX，使用已有的 React 组件，无需打包与编译；注册一次 React 组件即可作为协议元素使用（如 `e-Button`）；内置 Signal，状态管理更简单，非常适合 LLM 生成页面的场景。

<a href="https://stackblitz.com/edit/eficy-demo-a79lbepw?file=htmls%2Fbasic.mjs"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>

[English](./README.md) | 简体中文

## ⚡ 快速页面生成（LLM + shadcn/ui 提示词）

如果你希望快速使用 Eficy 完成页面生成，可以参考根目录中的 `llm_shadcn.txt` 提示词集合：

- 包含内容：Eficy + shadcn/ui 的最佳实践提示词、`e-` 前缀的组件协议、可直接使用的 HTML 模板与常见示例
- 使用方式：
  1. 打开 [`llm_shadcn.txt`](./llm_shadcn.txt)
  2. 在支持 HTML 预览的 LLM 客户端（例如 Cherry Studio）中，按照提示词生成基于 Eficy + shadcn/ui 的页面
  3. 直接在聊天窗口中预览效果，无需复制到本地 HTML 文件
- 相关链接：[浏览器使用指南](./packages/browser/README.md)

![llm_shadcn.txt](https://md.xiaobe.top/imgs/202508092129587.png!preview.webp)

## 🎯 为什么选择 Eficy？

Eficy 让你可以：

1. **无构建运行 JSX** — 在纯 HTML 中使用 `<script type="text/eficy">`
2. **协议化组件** — 统一注册 React 组件，使用 `e-Button` 等协议元素，保证 LLM 输出一致
3. **简单的响应式状态** — 内置 Signal，细粒度更新
4. **可选 UnoCSS 插件** — 从 `className` 自动生成原子化样式

## ✨ 核心特性

### 🔄 基于 Signal 的响应式系统
- **直观的状态管理** - 摆脱复杂的 React Hooks
- **自动依赖追踪** - JSX 中使用的 Signal 会自动被追踪
- **细粒度更新** - 只有使用了变化 Signal 的组件会重新渲染
- **异步数据支持** - 内置异步 Signal，自动处理加载和错误状态

### 🚀 无编译渲染
- **直接浏览器执行** - 在浏览器环境中直接运行 JSX
- **Script 标签支持** - 使用 `<script type="text/eficy">` 进行内联 JSX
- **实时转译** - 即时将 JSX 转换为可执行的 JavaScript

### 🧩 协议化组件渲染
- **前缀式组件** - 使用 `e-Button` 语法调用已注册组件
- **全局组件注册** - 一次注册，处处使用
- **一致的 LLM 输出** - 减少 LLM 生成组件的差异性

### 🎨 UnoCSS 集成
- **原子化 CSS 生成** - 自动从 className 属性生成样式
- **实时样式处理** - 在渲染过程中提取并生成 CSS
- **智能缓存** - 避免重复生成相同样式

### 📦 无缝 React 集成
- **完整 React 兼容** - 与现有 React 组件库协同工作
- **自定义 JSX Runtime** - 与 Signal 透明集成
- **TypeScript 支持** - 完整的类型安全

## 📦 安装

```bash
npm install eficy
# 或
yarn add eficy
# 或
pnpm add eficy
```

## 🚀 快速开始

### 浏览器使用（无需编译）

```html
<!DOCTYPE html>
<html>
<head>
  <title>Eficy Demo</title>
  <script type="module" src="https://unpkg.com/@eficy/browser/dist/standalone.mjs"></script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/eficy">
    import { signal } from 'eficy';
    import * as antd from 'antd';
    
    // 注册组件
    Eficy.registerComponents(antd);
    
    const App = () => {
      const count = signal(0);
      const name = signal('World');
      
      return (
        <div className="p-6 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Hello, {name}!</h1>
          <p className="mb-4">Count: {count}</p>
          
          <input 
            className="border p-2 mr-2"
            value={name}
            onChange={(e) => name.set(e.target.value)}
            placeholder="Enter your name"
          />
          
          <e-Button 
            type="primary" 
            onClick={() => count.set(count() + 1)}
          >
            Increment
          </e-Button>
        </div>
      );
    };
    
    Eficy.render(App, document.getElementById('root'));
  </script>
</body>
</html>
```

### Node.js 使用

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { create, EficyProvider } from 'eficy';
import { signal } from '@eficy/reactive';
import * as antd from 'antd';

// 创建 Eficy 实例
const core = await create();

// 注册组件
core.registerComponents(antd);

const App = () => {
  const count = signal(0);
  const name = signal('Eficy');
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Hello, {name}!</h1>
      <p className="mb-4">Count: {count}</p>
      
      <input 
        className="border p-2 mr-2"
        value={name}
        onChange={(e) => name.set(e.target.value)}
        placeholder="Enter your name"
      />
      
      <e-Button 
        type="primary" 
        onClick={() => count.set(count() + 1)}
      >
        Increment
      </e-Button>
    </div>
  );
};

// 渲染应用
const root = createRoot(document.getElementById('root'));
root.render(
  <EficyProvider core={core}>
    <App />
  </EficyProvider>
);
```

## 🧠 核心概念

### 使用 Signal 进行状态管理

```jsx
import { signal, computed } from 'eficy';

// 创建状态 Signal
const count = signal(0);
const name = signal('World');

// 创建计算属性
const greeting = computed(() => `Hello, ${name()}!`);

// 在 JSX 中使用（自动订阅）
const App = () => (
  <div>
    <h1>{greeting}</h1>
    <p>Count: {count}</p>
    <button onClick={() => count.set(count() + 1)}>
      Increment
    </button>
  </div>
);
```

### 异步数据处理

```jsx
import { asyncSignal } from 'eficy';

const userList = asyncSignal(async () => {
  const response = await fetch('/api/users');
  return response.json();
});

const UserList = () => (
  <div>
    {userList.loading() && <div>Loading...</div>}
    {userList.error() && <div>Error: {userList.error().message}</div>}
    {userList.data() && (
      <ul>
        {userList.data().map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    )}
  </div>
);
```

### 协议化组件

```jsx
// 全局注册组件
core.registerComponents({
  Button: ({ children, ...props }) => (
    <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>
      {children}
    </button>
  )
});

// 使用 e- 前缀调用
const App = () => (
  <div>
    <e-Button onClick={() => console.log('Clicked!')}>
      Click me
    </e-Button>
  </div>
);
```

## 📦 包含的模块

Eficy 完整包包含以下核心模块：

### 核心框架
- **@eficy/core-jsx** - 第三代核心引擎，基于自定义 JSX runtime
- **@eficy/reactive** - 高性能响应式状态管理系统
- **@eficy/reactive-react** - React 响应式集成
- **@eficy/reactive-async** - 异步响应式支持

### 内置插件
- **@eficy/plugin-unocss** - UnoCSS 原子化 CSS 自动生成插件

### 特殊包
- **@eficy/browser** - 为浏览器环境准备的无需编译包

## 🖥 支持环境

- 现代浏览器
- Node.js 环境
- 服务端渲染
- [Electron](https://www.electronjs.org/)

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Electron |
|---|---|---|---|---|
| IE11, Edge | last 2 versions | last 2 versions | last 2 versions | last 2 versions |

## 📚 相关文档

- [核心框架文档](./packages/core-jsx/README.md) - @eficy/core-jsx 详细文档
- [响应式系统文档](./packages/reactive/README.md) - @eficy/reactive 详细文档
- [React 响应式集成文档](./packages/reactive-react/README.md) - @eficy/reactive-react 详细文档
- [异步响应式文档](./packages/reactive-async/README.md) - @eficy/reactive-async 详细文档
- [UnoCSS 插件文档](./packages/plugin-unocss/README.md) - @eficy/plugin-unocss 详细文档
- [浏览器包文档](./packages/browser/README.md) - 浏览器使用文档
- [Playground 示例](./playground/README.md) - 完整的应用示例

## 🔗 API 参考

### 核心 API
- `create()` - 创建预配置的 Eficy 实例
- `EficyProvider` - 提供 Eficy 上下文的组件
- `useEficyContext()` - 获取 Eficy 实例的 Hook

### 响应式 API
- `signal(value)` - 创建响应式信号
- `computed(fn)` - 创建计算属性
- `asyncSignal(fn, options)` - 创建异步信号
- `useObserver(fn)` - React Hook，监听信号变化

### 插件 API
- `core.install(Plugin, config)` - 安装插件
- `core.registerComponent(name, component)` - 注册单个组件
- `core.registerComponents(components)` - 批量注册组件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的启发和支持：

- [React](https://reactjs.org/) - 用户界面库
- [Preact Signals](https://preactjs.com/guide/v10/signals/) - 响应式系统基础
- [@preact/signals-react](https://github.com/preactjs/signals) - React 响应式集成
- [UnoCSS](https://unocss.dev/) - 原子化 CSS 引擎
- [TSyringe](https://github.com/microsoft/tsyringe) - 依赖注入容器
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言

---

<div align="center">
  <strong>让 LLM 真正做到一句话生成页面</strong>
</div>
