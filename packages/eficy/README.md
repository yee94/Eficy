# Eficy

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/eficy.svg)](#License)
[![](https://flat.badgen.net/npm/v/eficy?icon=npm)](https://www.npmjs.com/package/eficy)
[![NPM downloads](http://img.shields.io/npm/dm/eficy.svg?style=flat-square)](http://npmjs.com/eficy)

**Eficy** 是一个现代化的前端编排框架，通过 JSON 配置驱动任意 React 组件库，快速构建完整的页面应用。这是整个 Eficy 生态系统的完整入口包，集成了核心框架和常用插件。

[English](./README-en.md) | 简体中文

## ✨ 核心特性

- 🎯 **JSON 驱动** - 通过 JSON 配置编排任意 React 组件库
- 🔄 **现代响应式** - 基于 `@preact/signals-react` 的高性能响应式系统
- 💉 **依赖注入** - 使用 `tsyringe` 容器实现模块化架构
- ⚡ **性能优化** - 独立节点渲染，React.memo 自动优化
- 🔌 **插件生态** - 丰富的插件系统，开箱即用
- 🎨 **样式集成** - 内置 UnoCSS 支持，原子化 CSS
- 📱 **TypeScript** - 完整的类型支持和智能提示
- 🌐 **组件库兼容** - 完美支持 Ant Design、Material-UI 等

## 🚀 快速开始

### 安装

```bash
npm install eficy
# 或
yarn add eficy
# 或
pnpm add eficy
```

### 基础使用

```typescript
import { create } from 'eficy'
import * as antd from 'antd'
import 'reflect-metadata'

// 创建 Eficy 实例（已预装插件）
const eficy = create()

// 配置组件库
eficy.config({
  componentMap: antd
})

// 渲染页面
await eficy.render({
  views: [
    {
      '#': 'welcome-page',
      '#view': 'div',
      '#style': { padding: 20, background: '#f5f5f5' },
      '#children': [
        {
          '#': 'title',
          '#view': 'h1',
          '#content': '欢迎使用 Eficy！',
          '#style': { color: '#1890ff', textAlign: 'center' }
        },
        {
          '#': 'alert',
          '#view': 'Alert',
          message: '这是一个通过 JSON 配置生成的页面',
          type: 'success',
          showIcon: true,
          className: 'mb-4'
        },
        {
          '#': 'button-group',
          '#view': 'div',
          className: 'flex gap-2 justify-center',
          '#children': [
            {
              '#': 'primary-btn',
              '#view': 'Button',
              type: 'primary',
              '#content': '主要按钮',
              onClick: () => console.log('点击了主要按钮')
            },
            {
              '#': 'default-btn',
              '#view': 'Button',
              '#content': '默认按钮',
              onClick: () => console.log('点击了默认按钮')
            }
          ]
        }
      ]
    }
  ]
}, '#root')
```

## 📦 包含的组件

Eficy 完整包包含以下核心模块：

### 核心框架
- **@eficy/core** - 核心编排引擎
- **@eficy/reactive** - 现代响应式状态管理（基于 @preact/signals-core）
- **@eficy/reactive-react** - React 响应式绑定（基于 @preact/signals-react）

### 内置插件
- **@eficy/plugin-unocss** - UnoCSS 原子化 CSS 支持

## 🎨 样式系统

内置 UnoCSS 插件，支持原子化 CSS：

```typescript
{
  '#view': 'div',
  className: 'flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg shadow-md',
  '#children': [
    {
      '#view': 'span',
      '#content': '原子化样式示例',
      className: 'text-lg font-bold'
    }
  ]
}
```

## 🔄 响应式数据

基于 `@eficy/reactive` 的现代响应式系统：

```typescript
import { observable, computed, action, ObservableClass } from '@eficy/reactive'

class UserStore extends ObservableClass {
  @observable users = []
  @observable filter = ''
  
  @computed get filteredUsers() {
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.filter.toLowerCase())
    )
  }
  
  @action addUser(user) {
    this.users = [...this.users, user]
  }
  
  @action setFilter(filter) {
    this.filter = filter
  }
}

const userStore = new UserStore()

// 在 Schema 中使用
{
  '#view': 'Input',
  placeholder: '搜索用户',
  value: '${userStore.filter}',
  onChange: (e) => userStore.setFilter(e.target.value)
}
```

## 🔌 插件系统

### 使用内置插件

```typescript
import { create } from 'eficy'

// create() 函数已自动注册常用插件
const eficy = create()
```

### 自定义插件

```typescript
import { Eficy } from '@eficy/core'
import { UnocssPlugin } from '@eficy/plugin-unocss'

class MyPlugin implements ILifecyclePlugin {
  name = 'my-plugin'
  version = '1.0.0'
  
  async onInit(context, next) {
    console.log('插件初始化')
    await next()
  }
}

const eficy = new Eficy()
eficy.registerPlugin(new MyPlugin())
eficy.registerPlugin(new UnocssPlugin())
```

## 📊 Schema 配置

### 基础节点结构

```typescript
interface IViewData {
  '#'?: string                           // 节点唯一标识
  '#view'?: string                       // 组件名称
  '#children'?: IViewData[]              // 子节点数组
  '#content'?: string | ReactElement     // 节点内容
  '#if'?: boolean | (() => boolean)      // 条件渲染
  '#style'?: Record<string, any>         // 内联样式
  '#class'?: string | string[]           // CSS 类名
  className?: string                     // CSS 类名（别名）
  [key: string]: any                     // 组件属性
}
```

### 条件渲染

```typescript
{
  '#view': 'div',
  '#if': () => userStore.isLoggedIn,
  '#children': [
    {
      '#view': 'h2',
      '#content': '欢迎回来！'
    }
  ]
}
```

### 列表渲染

```typescript
{
  '#view': 'div',
  '#children': userStore.users.map(user => ({
    '#': `user-${user.id}`,
    '#view': 'Card',
    title: user.name,
    '#children': [
      {
        '#view': 'p',
        '#content': user.email
      }
    ]
  }))
}
```

## 🎯 实际应用示例

### 用户管理页面

```typescript
const userManagementSchema = {
  views: [
    {
      '#': 'user-management',
      '#view': 'div',
      className: 'p-6',
      '#children': [
        // 页面标题
        {
          '#': 'page-header',
          '#view': 'div',
          className: 'mb-6',
          '#children': [
            {
              '#view': 'h1',
              '#content': '用户管理',
              className: 'text-2xl font-bold mb-2'
            },
            {
              '#view': 'p',
              '#content': '管理系统用户信息',
              className: 'text-gray-600'
            }
          ]
        },
        
        // 搜索栏
        {
          '#': 'search-bar',
          '#view': 'div',
          className: 'mb-4 flex gap-4',
          '#children': [
            {
              '#': 'search-input',
              '#view': 'Input',
              placeholder: '搜索用户名或邮箱',
              className: 'flex-1',
              value: '${userStore.searchTerm}',
              onChange: (e) => userStore.setSearchTerm(e.target.value)
            },
            {
              '#': 'add-user-btn',
              '#view': 'Button',
              type: 'primary',
              '#content': '添加用户',
              onClick: () => userStore.showAddModal()
            }
          ]
        },
        
        // 用户表格
        {
          '#': 'user-table',
          '#view': 'Table',
          dataSource: '${userStore.filteredUsers}',
          columns: [
            {
              title: '姓名',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: '邮箱',
              dataIndex: 'email',
              key: 'email'
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status) => ({
                '#view': 'Tag',
                color: status === 'active' ? 'green' : 'red',
                '#content': status === 'active' ? '活跃' : '禁用'
              })
            },
            {
              title: '操作',
              key: 'actions',
              render: (_, record) => ({
                '#view': 'div',
                className: 'flex gap-2',
                '#children': [
                  {
                    '#view': 'Button',
                    size: 'small',
                    '#content': '编辑',
                    onClick: () => userStore.editUser(record.id)
                  },
                  {
                    '#view': 'Button',
                    size: 'small',
                    danger: true,
                    '#content': '删除',
                    onClick: () => userStore.deleteUser(record.id)
                  }
                ]
              })
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔧 高级配置

### 自定义组件映射

```typescript
import { create } from 'eficy'
import * as antd from 'antd'
import { MyCustomComponent } from './components'

const eficy = create()

eficy.config({
  componentMap: {
    ...antd,
    MyCustomComponent,
    // 组件别名
    'CustomButton': antd.Button,
    'MyInput': antd.Input
  }
})
```

### 全局配置

```typescript
eficy.config({
  // 组件库映射
  componentMap: antd,
  
  // 默认样式
  defaultStyle: {
    fontFamily: 'Inter, sans-serif'
  },
  
  // 错误处理
  onError: (error, context) => {
    console.error('Eficy 渲染错误:', error)
  },
  
  // 性能监控
  onPerformance: (metrics) => {
    console.log('渲染性能:', metrics)
  }
})
```

## 🚀 性能优化

### 自动优化
- **React.memo** - 自动包装组件避免不必要的重渲染
- **细粒度更新** - 基于 signals 的精确更新
- **懒加载** - 按需加载组件和插件

### 手动优化

```typescript
// 使用 computed 缓存计算结果
class DataStore extends ObservableClass {
  @observable rawData = []
  
  @computed get processedData() {
    // 复杂计算会被缓存
    return this.rawData.map(item => ({
      ...item,
      processed: true
    }))
  }
}

// 使用 action 批量更新
@action updateMultiple() {
  this.field1 = 'value1'
  this.field2 = 'value2'
  this.field3 = 'value3'
  // 只会触发一次重渲染
}
```

## 🌐 浏览器支持

- 现代浏览器和 Internet Explorer 11+
- 服务端渲染 (SSR)
- Electron 应用

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari |
|---|---|---|---|
| IE11, Edge | last 2 versions | last 2 versions | last 2 versions |

## 📚 相关文档

- [核心框架文档](../core/README.md)
- [响应式系统文档](../reactive/README.md)
- [React 绑定文档](../reactive-react/README.md)
- [UnoCSS 插件文档](../plugin-unocss/README.md)
- [完整示例](../../playground/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情

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
  <strong>用 ❤️ 构建，为了更好的前端开发体验</strong>
</div>
