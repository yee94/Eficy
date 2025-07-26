# Eficy Core V3

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/generator-bxd-oss.svg)](#License)
[![](https://flat.badgen.net/npm/v/@eficy/core-v3?icon=npm)](https://www.npmjs.com/package/@eficy/core-v3)
[![NPM downloads](http://img.shields.io/npm/dm/@eficy/core-v3.svg?style=flat-square)](http://npmjs.com/@eficy/core-v3)

Eficy Core V3 是一个现代化的前端编排框架，采用全新的技术栈和架构设计，实现高性能、可扩展的 JSON 驱动组件渲染。

## ✨ 新特性

- **现代化响应式系统**: 使用 `@eficy/reactive` 和 `@eficy/reactive-react` 替代 MobX
- **依赖注入架构**: 基于 `tsyringe` 的现代化依赖注入容器
- **面向对象设计**: 核心架构采用面向对象模式，易于扩展和维护
- **由内向外渲染**: 全新的渲染策略，提升性能
- **独立节点渲染**: 每个 `#view` 节点独立渲染，使用 `React.memo` 完全隔绝父层 rerender
- **纯手工数据模型**: 移除 `@vmojs/base` 依赖，更轻量级
- **插件化架构**: 基于装饰器的生命周期系统
- **无组件库依赖**: 支持任意 React 组件库

## 🏗️ 核心架构

### 依赖注入容器
```typescript
import { Eficy } from '@eficy/core-v3'

const eficy = new Eficy()
```

### 响应式 ViewNode
```typescript
import { ViewNode } from '@eficy/core-v3'

const viewNode = new ViewNode({
  '#': 'myComponent',
  '#view': 'Button',
  text: 'Click me',
  onClick: () => console.log('Clicked!')
})

// 响应式更新
viewNode.updateField('text', 'Updated!')
```

### 配置和扩展
```typescript
// 基础配置
eficy.config({
  componentMap: {
    Button: MyButton,
    Input: MyInput
  }
})

// 扩展配置（递归合并）
eficy.extend({
  componentMap: {
    Modal: MyModal
  }
})
```

## 📦 安装

```bash
npm install @eficy/core-v3 @eficy/reactive @eficy/reactive-react
```

```bash
pnpm add @eficy/core-v3 @eficy/reactive @eficy/reactive-react
```

## 🔨 基础使用

### 渲染到 DOM

```typescript
import { Eficy } from '@eficy/core-v3'
import * as antd from 'antd'

const eficy = new Eficy()

// 配置组件库
eficy.config({
  componentMap: antd
})

// 渲染 Schema
eficy.render({
  views: [
    {
      '#': 'welcome',
      '#view': 'div',
      style: { padding: 20, background: '#f0f0f0' },
      '#children': [
        {
          '#': 'title',
          '#view': 'h1',
          '#content': 'Welcome to Eficy V3!'
        },
        {
          '#': 'description',
          '#view': 'Alert',
          message: 'A modern JSON-driven component orchestration framework',
          type: 'info',
          showIcon: true
        }
      ]
    }
  ]
}, '#root')
```

### 创建 React 元素

```typescript
import { Eficy } from '@eficy/core-v3'

const eficy = new Eficy()
eficy.config({ componentMap: { Button: MyButton } })

const App = () => {
  const element = eficy.createElement({
    views: [
      {
        '#': 'myButton',
        '#view': 'Button',
        type: 'primary',
        '#content': 'Click Me'
      }
    ]
  })
  
  return element
}
```

## 🚀 高级特性

### 条件渲染

```typescript
const schema = {
  views: [
    {
      '#': 'conditionalContent',
      '#view': 'div',
      '#if': () => new Date().getHours() < 12,
      '#content': 'Good morning!'
    },
    {
      '#': 'fallbackContent', 
      '#view': 'div',
      '#if': () => new Date().getHours() >= 12,
      '#content': 'Good afternoon!'
    }
  ]
}
```

### 响应式数据更新

```typescript
import { ViewNode } from '@eficy/core-v3'
import { effect } from '@eficy/reactive'

const viewNode = new ViewNode({
  '#': 'counter',
  '#view': 'div',
  '#content': 'Count: 0'
})

// 监听变化
effect(() => {
  console.log('Content changed:', viewNode.props.children)
})

// 更新数据
viewNode.updateField('#content', 'Count: 1')
```

### 嵌套组件渲染

```typescript
const schema = {
  views: [
    {
      '#': 'form',
      '#view': 'Form',
      layout: 'vertical',
      '#children': [
        {
          '#': 'nameField',
          '#view': 'Form.Item',
          label: 'Name',
          '#children': [
            {
              '#': 'nameInput',
              '#view': 'Input',
              placeholder: 'Enter your name'
            }
          ]
        },
        {
          '#': 'submitButton',
          '#view': 'Button',
          type: 'primary',
          htmlType: 'submit',
          '#content': 'Submit'
        }
      ]
    }
  ]
}
```

## 🔧 API 参考

### Eficy 主类

```typescript
class Eficy {
  // 配置实例
  config(options: IEficyConfig): this
  
  // 扩展配置
  extend(options: IExtendOptions): this
  
  // 创建 React 元素
  createElement(schema: IEficySchema): ReactElement | null
  
  // 渲染到 DOM
  render(schema: IEficySchema, container: string | HTMLElement): void
}
```

### ViewNode 模型

```typescript
class ViewNode {
  // 核心属性
  '#': string              // 节点ID
  '#view': string          // 组件名称  
  '#children': ViewNode[]  // 子节点
  '#content': string       // 内容
  '#if': boolean | (() => boolean)  // 条件渲染
  
  // 计算属性
  get props(): Record<string, any>      // 组件props
  get shouldRender(): boolean           // 是否应该渲染
  
  // 方法
  updateField(key: string, value: any): void  // 更新字段
  addChild(child: ViewNode): void            // 添加子节点
  removeChild(childId: string): void         // 移除子节点
  toJSON(): IViewData                        // 序列化
}
```

## 🏃‍♂️ 性能优化

### React.memo 优化
每个 RenderNode 使用 `React.memo` 进行优化，只有当 ViewNode 发生变化时才重新渲染。

### 响应式粒度控制
基于 `@eficy/reactive` 的细粒度响应式更新，只有依赖的字段变化时才触发重新渲染。

### 由内向外构建
新的渲染策略从叶子节点开始构建，减少不必要的渲染开销。

## 🔌 扩展性

### 插件系统（规划中）
```typescript
import { Init, BuildViewNode } from '@eficy/core-v3'

class MyPlugin {
  @Init
  async onInit(context: InitContext, next: () => Promise<void>) {
    console.log('Plugin initializing...')
    await next()
  }
  
  @BuildViewNode
  async onBuildViewNode(context: BuildViewNodeContext, next: () => Promise<void>) {
    console.log('Building view node:', context.viewData)
    await next()
  }
}
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --run ViewNode.spec.ts

# 观察模式
npm run test:watch
```

## 📊 与 V2 的对比

| 特性 | V2 | V3 |
|------|----|----|
| 响应式系统 | MobX | @eficy/reactive |
| 依赖注入 | 无 | tsyringe |
| 数据模型 | @vmojs/base | 纯手工构建 |
| 渲染策略 | 由外向内 | 由内向外 |
| 性能优化 | 有限 | React.memo + 细粒度响应式 |
| 插件系统 | plugin-decorator | 基于装饰器的生命周期 |
| 组件库依赖 | 强依赖 antd | 支持任意组件库 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进 Eficy Core V3！

## 📄 许可证

ISC

---

Made with ❤️ by the Eficy team
