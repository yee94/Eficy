# Eficy - 前端编排框架 LLM 文档

## 项目概述

Eficy 是一个现代化的前端编排框架，通过 JSON 配置即可编排任何 React 组件库，快速生成完整页面。项目采用 monorepo 架构，pnpm workspace 包含多个核心包。

### 核心特性

- 🔄 使用 JSON 配置编排任何 React 组件库，快速生成可用页面
- 📦 内置 Mobx Store，页面开发无需关心 store 变化
- 🔗 内置请求机制，简单配置即可完成数据请求
- ⚡ 内置双向绑定，配置页面实时同步
- 📊 精细化组件变更范围，实时查看组件渲染性能
- 🎯 支持插件定制，可统一配置 HOC，轻松实现前端 OOP
- 🏢 适用于大型多页面应用
- 🎨 与 AntD 4.0+ 无缝集成

### 环境支持

- 现代浏览器和 Internet Explorer 11+
- 服务端渲染
- Electron

## 安装

```bash
npm install @eficy/core --save
# 或
yarn add -S @eficy/core
```

Script 导入：
```html
<script src="https://unpkg.com/@eficy/core"></script>
```

## 基础使用

### 渲染到 DOM

```jsx
import * as Eficy from '@eficy/core';
import antd from 'antd';

// 配置全局默认组件映射
Eficy.Config.defaultComponentMap = Object.assign({}, antd);

Eficy.render(
  {
    '#view': 'div',
    style: {
      padding: 10,
      background: '#CCC',
    },
    '#children': [
      {
        '#view': 'Alert',
        message: 'Hello this is a Alert',
        type: 'info',
        showIcon: true,
      },
    ],
  },
  '#root',
);
```

### 渲染为 ReactElement

```jsx
import * as Eficy from '@eficy/core';
import antd from 'antd';

Eficy.Config.defaultComponentMap = Object.assign({}, antd);

const App = () => {
  return Eficy.createElement({
    '#view': 'div',
    style: {
      padding: 10,
      background: '#CCC',
    },
    '#children': [
      {
        '#view': 'Alert',
        message: 'Hello this is a Alert',
        type: 'info',
        showIcon: true,
      },
    ],
  });
};
```

### 实时更新示例

```jsx
export default [
  {
    '#view': 'Alert',
    message: 'quick bind ${models.input.value}', // => 将输出为 "quick bind value"
    type: 'success',
    showIcon: true,
  },
  {
    '#': 'input',
    '#view': 'Input',
    value: 'value', // => 值变化将同步到 Alert message
  },
];
```

### 异步请求渲染

基于异步结果更新视图：

```jsx
export default {
  views: [],
  requests: {
    immediately: true,
    url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
  },
};
```

根据异步返回结果填充数据：

```jsx
export default {
  views: [
    {
      '#view': 'Table',
      '#request': {
        '#': 'getTableData',
        url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/table/getlist',
        format: res => ({
          action: 'update',
          data: [
            {
              '#': 'table',
              dataSource: res.data,
            },
          ],
        }),
      },
      pagination: {
        total: 50,
      },
      columns: [
        // ...
      ],
    },
  ],
};
```

---

## Eficy Core V3 - 现代化版本

Eficy Core V3 是基于 React 18+ 构建的现代化声明式 UI 框架，采用 Schema 驱动的方式生成用户界面。

### 核心技术栈

- React 18+
- TypeScript
- @eficy/reactive (基于 @preact/signals-core)
- tsyringe (依赖注入)
- ahooks (React Hooks)
- react-error-boundary (错误边界)

### 核心架构

#### 主要类和服务

**Eficy (核心类)**
```typescript
class Eficy {
  config(options: IEficyConfig): this
  extend(options: IExtendOptions): this
  createElement(schema: IEficySchema): ReactElement | null
  render(schema: IEficySchema, container: string | HTMLElement): void
}
```

**ViewNode (数据模型)**
```typescript
class ViewNode extends ObservableClass {
  public readonly id: string
  @observable public '#': string
  @observable public '#view': string
  @observable public '#children': ViewNode[]
  @observable public '#content'?: string | ReactElement
  @observable public '#if'?: boolean | (() => boolean)
  
  @computed get props(): Record<string, any>
  @computed get shouldRender(): boolean
  
  @action updateField(key: string, value: any): void
  @action addChild(child: ViewNode): void
  @action removeChild(childId: string): void
}
```

**RenderNode (渲染组件)**
```typescript
const RenderNode = memo<IRenderNodeProps>((props) => {
  return (
    <ErrorBoundary>
      <RenderNodeInner {...props} />
    </ErrorBoundary>
  )
})
```

### Schema 格式

#### 基础结构
```typescript
interface IViewData {
  '#'?: string                    // 节点ID
  '#view': string                 // 组件名称
  '#children'?: IViewData[]       // 子节点
  '#content'?: string | ReactElement // 文本内容
  '#if'?: boolean | (() => boolean)   // 条件渲染
  [key: string]: any              // 其他属性
}

interface IEficySchema {
  views: IViewData[]
}
```

#### 使用示例

**基础示例**
```typescript
const schema = {
  views: [
    {
      '#': 'welcome',
      '#view': 'div',
      className: 'welcome-container',
      '#children': [
        {
          '#': 'title',
          '#view': 'h1',
          '#content': 'Hello Eficy V3!',
          style: { color: 'blue' }
        },
        {
          '#': 'button',
          '#view': 'button',
          '#content': 'Click Me',
          onClick: () => console.log('Clicked!')
        }
      ]
    }
  ]
}
```

**表单示例**
```typescript
const formSchema = {
  views: [
    {
      '#': 'user-form',
      '#view': 'Form',
      layout: 'vertical',
      '#children': [
        {
          '#': 'name-field',
          '#view': 'Form.Item',
          label: '姓名',
          '#children': [
            {
              '#': 'name-input',
              '#view': 'Input',
              placeholder: '请输入姓名'
            }
          ]
        }
      ]
    }
  ]
}
```

### API 使用

#### 创建和配置实例

```typescript
import { Eficy } from '@eficy/core-v3'
import { Button, Input, Form } from 'antd'

// 创建实例
const eficy = new Eficy()

// 配置组件库
eficy.config({
  componentMap: {
    Button,
    Input,
    Form,
    'Form.Item': Form.Item
  }
})

// 扩展配置（递归合并）
eficy.extend({
  componentMap: { Select, DatePicker }
})

// 渲染
const element = eficy.createElement(schema)
eficy.render(schema, '#root')
```

### 组件注册

#### 自动注册的 HTML 标签
```typescript
const htmlTags = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'button', 'input', 'textarea', 'select', 'option',
  'form', 'label', 'fieldset', 'legend',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'img', 'a', 'br', 'hr', 'strong', 'em', 'code', 'pre'
]
```

#### 注册自定义组件
```typescript
// 单个注册
eficy.config({
  componentMap: {
    'MyCustom': MyCustomComponent
  }
})

// 批量注册
eficy.extend({ 
  componentMap: {
    'Header': HeaderComponent,
    'Footer': FooterComponent
  }
})
```

---

## @eficy/reactive - 响应式状态管理

@eficy/reactive 是基于 @preact/signals-core 构建的现代化响应式状态管理库，提供装饰器风格和函数式风格的响应式编程支持。

### 核心特性

- 🔄 基于 signals 的细粒度响应式更新
- 🎯 支持装饰器 (@observable, @computed, @action)
- 📦 函数式 API (signal, effect, batch)
- ⚡ 高性能的响应式系统
- 🔧 不可变更新模式
- 📱 TypeScript 原生支持

### 装饰器 API (推荐)

#### 基础使用
```typescript
import { ObservableClass, observable, computed, action } from '@eficy/reactive'

class UserStore extends ObservableClass {
  @observable name = ''
  @observable age = 0
  
  @computed get isAdult() {
    return this.age >= 18
  }
  
  @action updateProfile(name: string, age: number) {
    this.name = name
    this.age = age
  }
}
```

#### TodoMVC 示例
```typescript
class TodoStore extends ObservableClass {
  @observable todos: Todo[] = []
  @observable filter: 'all' | 'active' | 'completed' = 'all'

  @computed get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
  }

  @computed get activeCount() {
    return this.todos.filter(todo => !todo.completed).length
  }

  @action addTodo(text: string) {
    const newTodo: Todo = {
      id: Date.now() + Math.random(),
      text,
      completed: false
    }
    this.todos = [...this.todos, newTodo] // 不可变更新
  }

  @action toggleTodo(id: number) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  }

  @action removeTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id)
  }
}
```

### 函数式 API

#### 基础用法
```typescript
import { signal, effect, createComputed, createAction, batch } from '@eficy/reactive'

// 创建响应式值
const count = signal(0)
const name = signal('John')

// 响应副作用
effect(() => {
  console.log(`Count is ${count.value}`)
})

// 计算值
const fullName = createComputed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 创建动作
const increment = createAction(() => {
  count.value++
})

// 批处理更新
batch(() => {
  count.value = 10
  name.value = 'Jane'
})
```

#### Watch API
```typescript
import { signal, watch, watchMultiple, watchDebounced } from '@eficy/reactive'

const count = signal(0)
const searchTerm = signal('')

// 基础观察
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})

// 多值观察
watchMultiple([firstName, lastName], ([first, last]) => {
  console.log(`User: ${first} ${last}`)
})

// 防抖观察
watchDebounced(searchTerm, (term) => {
  console.log(`Searching for: ${term}`)
}, { wait: 300 })
```

### 不可变更新范式

**新的方式（推荐）**
```typescript
// ✅ 不可变更新
@action addItem(item: Item) {
  this.items = [...this.items, item]
}

@action updateItem(id: string, updates: Partial<Item>) {
  this.items = this.items.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )
}

@action removeItem(id: string) {
  this.items = this.items.filter(item => item.id !== id)
}
```

**避免的方式**
```typescript
// ❌ 直接修改（不会触发更新）
@action addItem(item: Item) {
  this.items.push(item)
}
```

### 性能优化

#### 批处理更新
```typescript
// 自动批处理 (推荐)
@action updateMultiple() {
  this.name = 'New Name'
  this.age = 30
  this.email = 'new@example.com'
  // 这些更新会自动批处理
}

// 手动批处理
batch(() => {
  name.value = 'New Name'
  age.value = 30
})
```

#### 计算值缓存
```typescript
class DataStore extends ObservableClass {
  @observable rawData: Item[] = []

  // 计算值会自动缓存
  @computed get expensiveCalculation() {
    console.log('Computing...') // 只有依赖变化时才会执行
    return this.rawData
      .filter(item => item.active)
      .map(item => processItem(item))
      .sort((a, b) => a.priority - b.priority)
  }
}
```

---

## 最佳实践

### 1. Schema 设计
- 使用有意义的节点 ID (`'#'` 字段)
- 保持 Schema 结构清晰和层次化
- 合理使用条件渲染避免复杂嵌套

### 2. 组件注册
- 统一的组件命名约定
- 按功能模块组织组件
- 使用 TypeScript 类型定义

### 3. 响应式数据
- 始终使用不可变更新
- 合理使用计算属性缓存昂贵操作
- 避免在计算值中产生副作用

### 4. 错误处理
- 使用 ErrorBoundary 包装组件
- 提供 fallback 组件
- 添加适当的错误边界

### 5. 性能优化
- 使用 @action 批处理更新
- 避免在 `'#if'` 中进行复杂计算
- 合理拆分大型 Schema

---

## 开发环境

### Playground
```bash
cd playground
npm run dev:v3
# 访问 http://localhost:9899
```

### 测试
参考 `playground/src/main-v3.tsx` 查看完整的应用示例，包含：
- 基础组件使用
- 响应式数据演示
- 表单处理
- 条件渲染
- 组件库集成

---

## 迁移指南

### 从 V2 迁移到 V3

#### 依赖更新
```json
{
  "dependencies": {
    "@eficy/core-v3": "^3.0.0",
    "@eficy/reactive": "^1.0.0",
    "@eficy/reactive-react": "^1.0.0",
    "tsyringe": "^4.8.0",
    "reflect-metadata": "^0.2.2"
  }
}
```

#### 导入更新
```typescript
// V2
import { Controller } from '@eficy/core-v2'

// V3
import { Eficy } from '@eficy/core-v3'
```

#### 响应式数据更新
```typescript
// V2 (MobX)
import { observable, computed, action } from 'mobx'

// V3 (@eficy/reactive)
import { observable, computed, action, ObservableClass } from '@eficy/reactive'

class Store extends ObservableClass {
  @observable data = []
  
  @action updateData(newData) {
    // V2: 直接修改
    this.data.push(newData)
    
    // V3: 不可变更新
    this.data = [...this.data, newData]
  }
}
```

---

此文档为 Eficy 前端编排框架的完整 LLM 参考文档，涵盖了从基础使用到高级特性的所有重要信息。