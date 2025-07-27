# Eficy Core V3

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/generator-bxd-oss.svg)](#License)
[![](https://flat.badgen.net/npm/v/@eficy/core?icon=npm)](https://www.npmjs.com/package/@eficy/core)
[![NPM downloads](http://img.shields.io/npm/dm/@eficy/core.svg?style=flat-square)](http://npmjs.com/@eficy/core)

Eficy Core V3 是一个现代化的前端编排框架，采用全新的技术栈和架构设计，实现高性能、可扩展的 JSON 驱动组件渲染。

## ✨ 核心特性

- 🔄 基于 `@eficy/reactive` 的现代化响应式系统
- 💉 使用 `tsyringe` 依赖注入容器
- ⚡ 独立节点渲染，使用 `React.memo` 优化性能
- 🎯 支持任意 React 组件库
- 🔌 基于生命周期钩子的插件系统
- 📦 TypeScript 原生支持

## 📦 安装

```bash
npm install @eficy/core @eficy/reactive @eficy/reactive-react tsyringe reflect-metadata
```

## 🔨 基础使用

```typescript
import { Eficy } from '@eficy/core'
import * as antd from 'antd'
import 'reflect-metadata'

const eficy = new Eficy()

// 配置组件库
eficy.config({
  componentMap: antd
})

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'welcome',
      '#view': 'div',
      '#style': { padding: 20 },
      '#children': [
        {
          '#': 'title',
          '#view': 'h1',
          '#content': 'Welcome to Eficy V3!'
        },
        {
          '#': 'button',
          '#view': 'Button',
          type: 'primary',
          '#content': 'Click Me',
          onClick: () => console.log('Clicked!')
        }
      ]
    }
  ]
}, '#root')
```

## 🚀 Schema 格式

```typescript
interface IViewData {
  '#'?: string                           // 节点ID
  '#view'?: string                       // 组件名称
  '#children'?: IViewData[]              // 子节点
  '#content'?: string | ReactElement     // 内容
  '#if'?: boolean | (() => boolean)      // 条件渲染
  '#style'?: Record<string, any>         // 样式
  '#class'?: string | string[]           // CSS类名
  [key: string]: any                     // 其他属性
}
```

## 🔧 主要 API

```typescript
const eficy = new Eficy()

// 配置
eficy.config({ componentMap: { Button: MyButton } })

// 创建元素
const element = await eficy.createElement(schema)

// 渲染到 DOM
await eficy.render(schema, '#root')

// 节点操作
eficy.updateNode('nodeId', { text: 'Updated' })
eficy.addChild('parentId', { '#view': 'span', '#content': 'New' })
```

## 🔌 插件系统

```typescript
class MyPlugin implements ILifecyclePlugin {
  name = 'MyPlugin'
  version = '1.0.0'
  
  async onInit(context, next) {
    console.log('插件初始化')
    await next()
  }
}

eficy.registerPlugin(new MyPlugin())
```

## 📊 与 V2 对比

| 特性 | V2 | V3 |
|------|----|----|
| 响应式 | MobX | @eficy/reactive |
| 依赖注入 | 无 | tsyringe |
| 渲染 | 同步 | 异步 |
| 性能 | 基础 | React.memo 优化 |

## 📄 许可证

ISC

---

Made with ❤️ by the Eficy team