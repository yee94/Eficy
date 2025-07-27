# UnoCSS Runtime Plugin for Eficy Core V3

## 项目概述

UnoCSS Runtime Plugin 是为 Eficy Core V3 设计的内置插件，实现了在运行时解析和注入 UnoCSS 样式的功能。该插件通过 Eficy 的生命周期钩子系统，自动收集 Schema 中的 CSS 类名，使用 UnoCSS 引擎动态生成样式，并注入到页面中。

## 核心特性

- ⚡ **运行时编译**: 无需构建步骤，动态解析和生成 CSS
- 🎯 **自动收集**: 自动从组件 props 中收集 className
- 📦 **多种注入方式**: 支持注入到 head、body 或根节点
- 🔧 **完全可配置**: 支持自定义 UnoCSS 配置
- 🚀 **高性能**: 只在根节点注入一次，避免重复处理
- 🧩 **插件架构**: 基于 Eficy 生命周期钩子系统
- 📊 **统计监控**: 提供详细的运行时统计信息

## 安装

```bash
npm install @eficy/core-v3 @unocss/core @unocss/preset-uno
```

## 基本用法

### 创建和注册插件

```typescript
import { Eficy, createUnocssRuntimePlugin } from '@eficy/core-v3'

// 创建 Eficy 实例
const eficy = new Eficy()

// 创建 UnoCSS Runtime 插件
const unocssPlugin = createUnocssRuntimePlugin({
  injectPosition: 'head', // 注入到 document head
  enableClassnameExtraction: true, // 启用类名自动提取
})

// 注册插件
eficy.registerPlugin(unocssPlugin)
```

### 在 Schema 中使用 UnoCSS 类

```typescript
import type { IEficySchema } from '@eficy/core-v3'

const schema: IEficySchema = {
  views: [
    {
      '#': 'app',
      '#view': 'div',
      className: 'min-h-screen bg-gray-100 p-8',
      '#children': [
        {
          '#': 'card',
          '#view': 'div',
          className: 'max-w-md mx-auto bg-white rounded-xl shadow-md p-6',
          '#children': [
            {
              '#': 'title',
              '#view': 'h1',
              className: 'text-2xl font-bold text-gray-900 mb-4',
              '#content': 'Hello UnoCSS!'
            },
            {
              '#': 'button',
              '#view': 'button',
              className: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
              '#content': 'Click Me'
            }
          ]
        }
      ]
    }
  ]
}

// 渲染 Schema
await eficy.render(schema, '#root')
```

## 高级配置

### 完整配置选项

```typescript
import { createUnocssRuntimePlugin } from '@eficy/core-v3'

const unocssPlugin = createUnocssRuntimePlugin({
  // 样式注入位置
  injectPosition: 'head', // 'head' | 'body' | 'root'
  
  // 开发工具
  enableDevtools: true,
  enableHMR: false,
  
  // 类名提取
  enableClassnameExtraction: true,
  
  // 自定义类名收集器
  classNameCollector: (className: string) => {
    console.log('Collected class:', className)
  },
  
  // 自定义样式标签ID生成器
  generateId: () => 'my-unocss-styles',
  
  // UnoCSS 配置
  uno: {
    // 自定义主题
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        danger: '#ef4444'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    },
    
    // 快捷方式
    shortcuts: {
      'btn': 'px-4 py-2 rounded-md font-medium transition-colors',
      'btn-primary': 'btn bg-primary text-white hover:bg-blue-600',
      'card': 'bg-white rounded-lg shadow-md border border-gray-200 p-6'
    },
    
    // 自定义规则
    rules: [
      [/^animate-bounce-in$/, () => ({
        animation: 'bounceIn 0.6s ease-in-out'
      })],
      [/^glass$/, () => ({
        'backdrop-filter': 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      })]
    ],
    
    // 其他 UnoCSS 配置
    presets: [], // 额外的预设
    variants: [], // 自定义变体
    extractors: [], // 自定义提取器
    transformers: [], // 转换器
    safelist: [], // 安全列表
    blocklist: [] // 阻塞列表
  }
})
```

### 使用快捷方式和自定义规则

```typescript
const schema: IEficySchema = {
  views: [
    {
      '#': 'demo',
      '#view': 'div',
      className: 'p-8',
      '#children': [
        // 使用快捷方式
        {
          '#': 'primary-btn',
          '#view': 'button',
          className: 'btn-primary',
          '#content': 'Primary Button'
        },
        
        // 使用自定义规则
        {
          '#': 'glass-card',
          '#view': 'div',
          className: 'glass p-6 rounded-lg',
          '#content': 'Glass morphism effect'
        },
        
        // 使用动画
        {
          '#': 'animated-title',
          '#view': 'h1',
          className: 'text-3xl font-bold animate-bounce-in',
          '#content': 'Animated Title'
        }
      ]
    }
  ]
}
```

## API 参考

### UnocssRuntimePlugin 类

#### 构造函数

```typescript
constructor(config?: IUnocssRuntimeConfig)
```

#### 主要方法

```typescript
// 插件安装
async install(container: DependencyContainer): Promise<void>

// 插件卸载
async uninstall(container: DependencyContainer): Promise<void>

// 手动添加类名
addClassName(className: string): void

// 获取已收集的类名
getCollectedClasses(): string[]

// 清空收集的类名
clearCollectedClasses(): void

// 获取插件统计信息
getStats(): Record<string, any>

// 手动重新生成样式
async regenerateStyles(): Promise<void>
```

#### 生命周期钩子

```typescript
// 构建 Schema 节点时记录根节点
@BuildSchemaNode(10)
async onBuildSchemaNode(
  viewData: IViewData,
  context: IBuildSchemaNodeContext,
  next: () => Promise<EficyNode>
): Promise<EficyNode>

// 处理属性时提取 className
@ProcessProps(10)
async onProcessProps(
  props: Record<string, any>,
  eficyNode: EficyNode,
  context: IProcessPropsContext,
  next: () => Promise<Record<string, any>>
): Promise<Record<string, any>>

// 渲染时注入样式
@Render(100)
async onRender(
  eficyNode: EficyNode,
  context: IRenderContext,
  next: () => Promise<React.ReactElement>
): Promise<React.ReactElement>
```

### 配置接口

```typescript
interface IUnocssRuntimeConfig {
  // UnoCSS runtime 配置
  uno?: {
    presets?: any[]
    rules?: any[]
    theme?: Record<string, any>
    shortcuts?: Record<string, string | string[]>
    variants?: any[]
    extractors?: any[]
    transformers?: any[]
    content?: string[]
    safelist?: string[]
    blocklist?: string[]
  }
  
  // 插件特定配置
  injectPosition?: 'head' | 'body' | 'root'
  enableDevtools?: boolean
  enableHMR?: boolean
  enableClassnameExtraction?: boolean
  classNameCollector?: (className: string) => void
  generateId?: () => string
}
```

## 工作原理

### 1. 类名收集阶段

插件通过 `@ProcessProps` 钩子在属性处理阶段自动收集类名：

```typescript
// 支持的类名字段
const classFields = ['className', 'class', '#class']

// 提取并收集类名
classFields.forEach(field => {
  const value = props[field]
  if (value) {
    if (typeof value === 'string') {
      // 分割空格分隔的类名
      value.split(/\s+/).forEach(cls => {
        if (cls.trim()) {
          this.collectedClasses.add(cls.trim())
        }
      })
    } else if (Array.isArray(value)) {
      // 处理数组形式的类名
      value.filter(v => typeof v === 'string').forEach(cls => {
        this.collectedClasses.add(cls)
      })
    }
  }
})
```

### 2. 根节点识别

插件通过 `@BuildSchemaNode` 钩子识别根节点：

```typescript
// 只有没有父节点的节点才被认为是根节点
if (!context.parent && !this.rootNodeId) {
  this.rootNodeId = node['#']
}
```

### 3. 样式生成和注入

插件在根节点渲染时生成并注入样式：

```typescript
// 只在根节点且有收集到类名时注入
if (eficyNode['#'] === this.rootNodeId && !this.styleInjected && this.collectedClasses.size > 0) {
  // 使用 UnoCSS 生成样式
  const classArray = Array.from(this.collectedClasses)
  const result = await this.uno.generate(classArray.join(' '))
  
  if (result.css) {
    // 根据配置注入到不同位置
    this.injectStyles(result.css)
    this.styleInjected = true
  }
}
```

## 性能优化

### 1. 单次注入策略

- 只在根节点注入一次样式，避免重复处理
- 使用 `styleInjected` 标记防止重复注入

### 2. 智能收集

- 使用 `Set` 数据结构自动去重
- 只收集有效的类名，忽略空字符串和非字符串值

### 3. 延迟生成

- 只有在真正需要渲染时才生成 CSS
- 批量处理所有收集到的类名

## 调试和监控

### 获取插件统计信息

```typescript
const stats = unocssPlugin.getStats()
console.log('Plugin Statistics:', stats)

// 输出示例
{
  collectedClassesCount: 15,
  collectedClasses: ['p-4', 'bg-white', 'text-red-500', ...],
  styleInjected: true,
  rootNodeId: 'app',
  config: { ... }
}
```

### 启用调试日志

```typescript
const unocssPlugin = createUnocssRuntimePlugin({
  enableDevtools: true,
  classNameCollector: (className) => {
    console.log('[UnoCSS] Collected class:', className)
  }
})
```

### 开发工具集成

插件支持与浏览器开发工具集成：

- 生成的样式会出现在 `<head>` 中，可以在开发工具中查看
- 类名收集过程可以通过控制台日志跟踪
- 插件统计信息可以用于性能分析

## 最佳实践

### 1. 配置优化

```typescript
// 生产环境配置
const productionConfig = {
  injectPosition: 'head',
  enableDevtools: false,
  enableClassnameExtraction: true,
  uno: {
    // 只包含必要的预设和规则
    presets: [presetUno()],
    // 使用 blocklist 排除不需要的类
    blocklist: ['deprecated-class']
  }
}

// 开发环境配置
const developmentConfig = {
  injectPosition: 'head',
  enableDevtools: true,
  enableClassnameExtraction: true,
  classNameCollector: (className) => console.log('Collected:', className),
  uno: {
    // 包含完整的预设和开发工具
    presets: [presetUno(), presetIcons()],
    // 启用安全列表确保常用类总是可用
    safelist: ['text-red-500', 'bg-blue-100']
  }
}
```

### 2. 类名组织

```typescript
// 使用快捷方式组织常用样式
const unocssConfig = {
  shortcuts: {
    // 布局快捷方式
    'center': 'flex items-center justify-center',
    'full-screen': 'min-h-screen w-full',
    
    // 组件快捷方式
    'btn-base': 'px-4 py-2 rounded font-medium transition-colors',
    'btn-primary': 'btn-base bg-blue-500 text-white hover:bg-blue-600',
    'btn-secondary': 'btn-base bg-gray-200 text-gray-800 hover:bg-gray-300',
    
    // 卡片样式
    'card-base': 'bg-white rounded-lg shadow border border-gray-200',
    'card-hover': 'card-base hover:shadow-lg transition-shadow'
  }
}
```

### 3. 错误处理

```typescript
// 处理 UnoCSS 初始化失败
try {
  const unocssPlugin = createUnocssRuntimePlugin(config)
  eficy.registerPlugin(unocssPlugin)
} catch (error) {
  console.error('Failed to initialize UnoCSS plugin:', error)
  // 提供降级方案或错误提示
}

// 监听插件错误
eficy.getLifecycleEventEmitter().on('plugin-error', (error) => {
  if (error.pluginName === 'UnocssRuntimePlugin') {
    console.error('UnoCSS plugin error:', error)
    // 实现错误恢复逻辑
  }
})
```

## 限制和注意事项

### 1. 依赖要求

- 需要安装 `@unocss/core` 和 `@unocss/preset-uno`
- Node.js 环境需要支持动态导入

### 2. 浏览器兼容性

- 支持所有现代浏览器
- 在服务端渲染环境中会自动降级

### 3. 性能考虑

- 大量类名可能影响初始渲染性能
- 建议在生产环境中禁用开发工具功能
- 避免在循环中大量创建组件

### 4. 类名限制

- 只能从指定的属性字段收集类名（className、class、#class）
- 不支持动态生成的类名字符串
- 需要在组件渲染前确定所有类名

## 故障排除

### 常见问题

1. **样式没有生成**
   - 检查 UnoCSS 依赖是否正确安装
   - 确认插件已正确注册
   - 验证类名格式是否正确

2. **样式重复注入**
   - 确保只注册了一个插件实例
   - 检查根节点ID是否唯一

3. **类名收集不完整**
   - 确认 `enableClassnameExtraction` 为 true
   - 检查类名字段名称是否正确

### 调试步骤

1. 启用开发工具模式
2. 检查控制台日志
3. 查看插件统计信息
4. 验证DOM中的样式标签

## 示例项目

完整的使用示例请参考：
- [基础示例](./examples/unocss-runtime-example.tsx)
- [集成测试](./test/integration/UnocssPlugin.integration.spec.ts)
- [单元测试](./test/plugins/UnocssRuntimePlugin.unit.spec.ts)

---

这个插件为 Eficy Core V3 提供了强大的运行时 CSS 生成能力，让开发者可以享受 UnoCSS 的便利，同时保持 Eficy 框架的灵活性和性能优势。