# Eficy 插件开发文档

## 概述

Eficy 插件系统是基于生命周期钩子和依赖注入构建的现代化可扩展架构。插件可以在框架的各个生命周期阶段介入执行，实现功能增强、数据处理、组件定制等功能。

## 核心架构

### 插件类型

Eficy 支持两种类型的插件：

1. **基础插件 (IEficyPlugin)** - 提供基本的安装/卸载功能
2. **生命周期插件 (ILifecyclePlugin)** - 支持生命周期钩子的高级插件

### 生命周期钩子类型

#### 异步流程钩子 (按序执行)
- `INIT` - 框架初始化
- `BUILD_SCHEMA_NODE` - Schema 节点构建
- `RESOLVE_COMPONENT` - 组件解析
- `PROCESS_PROPS` - 属性处理
- `RENDER` - 渲染阶段

#### 同步副作用钩子 (并行执行)
- `ON_MOUNT` - 组件挂载
- `ON_UNMOUNT` - 组件卸载
- `ON_HANDLE_EVENT` - 事件处理
- `ON_BIND_EVENT` - 事件绑定
- `ON_ERROR` - 错误处理

## 插件开发

### 1. 基础插件接口

```typescript
import type { IEficyPlugin } from '@eficy/core'

interface IEficyPlugin {
  name: string                    // 插件名称（唯一标识）
  version: string                 // 插件版本
  dependencies?: string[]         // 依赖的其他插件
  enforce?: 'pre' | 'post'       // 执行顺序：pre（最早）、post（最晚）、undefined（默认）
  
  install?(container: DependencyContainer): void    // 安装回调
  uninstall?(container: DependencyContainer): void  // 卸载回调
}
```

### 2. 生命周期插件开发

#### 装饰器方式 (推荐)

```typescript
import { 
  Init, 
  BuildSchemaNode, 
  ResolveComponent, 
  ProcessProps,
  Render,
  OnMount, 
  OnUnmount,
  OnHandleEvent,
  OnBindEvent,
  OnError 
} from '@eficy/core'
import type { ILifecyclePlugin } from '@eficy/core'

class MyPlugin implements ILifecyclePlugin {
  name = 'my-plugin'
  version = '1.0.0'
  enforce = 'pre' // 优先执行
  
  // 初始化钩子 - 优先级 100
  @Init(100)
  async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
    console.log('Plugin initializing...')
    // 执行自定义逻辑
    await this.setupPlugin(context)
    // 调用下一个钩子
    await next()
  }
  
  // Schema 节点构建钩子
  @BuildSchemaNode(50)
  async onBuildSchemaNode(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<EficyNode>
  ): Promise<EficyNode> {
    // 预处理 viewData
    const processedData = await this.processViewData(viewData)
    
    // 调用下一个钩子获取结果
    const node = await next()
    
    // 后处理节点
    return this.postProcessNode(node)
  }
  
  // 组件解析钩子
  @ResolveComponent(30)
  async onResolveComponent(
    componentName: string,
    eficyNode: EficyNode,
    context: IResolveComponentContext,
    next: () => Promise<ComponentType>
  ): Promise<ComponentType> {
    // 自定义组件解析逻辑
    if (componentName.startsWith('My')) {
      return this.resolveCustomComponent(componentName)
    }
    
    return await next()
  }
  
  // 属性处理钩子
  @ProcessProps(20)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    // 属性转换和增强
    const enhancedProps = {
      ...props,
      'data-plugin': this.name,
      'data-node-id': eficyNode.id
    }
    
    const result = await next()
    return { ...result, ...enhancedProps }
  }
  
  // 渲染钩子
  @Render(10)
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>
  ): Promise<ReactElement> {
    const element = await next()
    
    // 包装渲染结果
    return this.wrapElement(element, eficyNode)
  }
  
  // 挂载副作用钩子
  @OnMount(0)
  async onMount(
    element: Element,
    eficyNode: EficyNode,
    context: IMountContext,
    next: () => Promise<void>
  ): Promise<void> {
    // 挂载时的副作用操作
    this.trackMountEvent(element, eficyNode)
    await next()
  }
  
  // 错误处理钩子
  @OnError(100)
  async onError(
    error: Error,
    eficyNode: EficyNode | null,
    context: IErrorContext,
    next: () => Promise<ReactElement | void>
  ): Promise<ReactElement | void> {
    // 错误日志记录
    this.logError(error, eficyNode, context)
    
    // 如果是关键错误，提供降级方案
    if (context.severity === 'critical') {
      return this.createFallbackElement(error)
    }
    
    return await next()
  }
  
  // 私有方法
  private async setupPlugin(context: IInitContext): Promise<void> {
    // 插件初始化逻辑
  }
  
  private async processViewData(viewData: IViewData): Promise<IViewData> {
    // ViewData 处理逻辑
    return viewData
  }
  
  private postProcessNode(node: EficyNode): EficyNode {
    // 节点后处理逻辑
    return node
  }
  
  private resolveCustomComponent(componentName: string): ComponentType {
    // 自定义组件解析逻辑
    return () => React.createElement('div', null, componentName)
  }
  
  private wrapElement(element: ReactElement, node: EficyNode): ReactElement {
    // 元素包装逻辑
    return element
  }
  
  private trackMountEvent(element: Element, node: EficyNode): void {
    // 挂载事件跟踪
  }
  
  private logError(error: Error, node: EficyNode | null, context: IErrorContext): void {
    // 错误日志记录
    console.error(`[${this.name}] Error:`, error, { node, context })
  }
  
  private createFallbackElement(error: Error): ReactElement {
    // 创建降级元素
    return React.createElement('div', { 
      className: 'error-fallback' 
    }, `Error: ${error.message}`)
  }
}
```

#### 接口方式

```typescript
class MyInterfacePlugin implements ILifecyclePlugin {
  name = 'my-interface-plugin'
  version = '1.0.0'
  
  async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
    // 初始化逻辑
    await next()
  }
  
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>
  ): Promise<ReactElement> {
    const element = await next()
    // 自定义渲染逻辑
    return element
  }
}
```

### 3. 插件注册和使用

```typescript
import { Eficy } from '@eficy/core'

// 创建 Eficy 实例
const eficy = new Eficy()

// 注册插件
const myPlugin = new MyPlugin()
eficy.registerPlugin(myPlugin)

// 启用生命周期钩子功能
eficy.enableLifecycleHooksFeature()

// 配置和使用
eficy.config({
  componentMap: { /* 组件映射 */ }
})

// 渲染 Schema
await eficy.render(schema, '#root')
```

### 4. 插件管理

```typescript
// 获取插件管理器
const pluginManager = eficy.getPluginManager()

// 获取插件
const plugin = pluginManager.getPlugin('my-plugin')

// 获取所有插件
const allPlugins = pluginManager.getAllPlugins()

// 获取钩子统计
const stats = pluginManager.getHookStats()

// 获取插件执行顺序
const order = pluginManager.getPluginExecutionOrder(HookType.RENDER)

// 卸载插件
eficy.unregisterPlugin('my-plugin')
```

## 实用示例

### 1. 主题插件

```typescript
class ThemePlugin implements ILifecyclePlugin {
  name = 'theme-plugin'
  version = '1.0.0'
  
  private theme = 'light'
  
  @ProcessProps(10)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const result = await next()
    
    // 为所有组件添加主题类名
    const themeClass = `theme-${this.theme}`
    const existingClass = result.className || ''
    
    return {
      ...result,
      className: existingClass ? `${existingClass} ${themeClass}` : themeClass
    }
  }
  
  setTheme(theme: string): void {
    this.theme = theme
  }
}
```

### 2. 国际化插件

```typescript
class I18nPlugin implements ILifecyclePlugin {
  name = 'i18n-plugin'
  version = '1.0.0'
  
  private messages: Record<string, Record<string, string>> = {}
  private currentLang = 'en'
  
  @ProcessProps(20)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const result = await next()
    
    // 翻译文本属性
    const translatedProps = { ...result }
    
    // 翻译特定属性
    if (translatedProps.title) {
      translatedProps.title = this.translate(translatedProps.title)
    }
    
    if (translatedProps.placeholder) {
      translatedProps.placeholder = this.translate(translatedProps.placeholder)
    }
    
    return translatedProps
  }
  
  @BuildSchemaNode(10)
  async onBuildSchemaNode(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<EficyNode>
  ): Promise<EficyNode> {
    // 翻译 #content
    if (viewData['#content'] && typeof viewData['#content'] === 'string') {
      viewData['#content'] = this.translate(viewData['#content'])
    }
    
    return await next()
  }
  
  private translate(key: string): string {
    return this.messages[this.currentLang]?.[key] || key
  }
  
  addMessages(lang: string, messages: Record<string, string>): void {
    this.messages[lang] = { ...this.messages[lang], ...messages }
  }
  
  setLanguage(lang: string): void {
    this.currentLang = lang
  }
}
```

### 3. 性能监控插件

```typescript
class PerformancePlugin implements ILifecyclePlugin {
  name = 'performance-plugin'
  version = '1.0.0'
  
  private renderTimes: Map<string, number> = new Map()
  
  @Render(1000) // 最高优先级
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>
  ): Promise<ReactElement> {
    const startTime = performance.now()
    
    try {
      const element = await next()
      return element
    } finally {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.renderTimes.set(eficyNode.id, duration)
      
      // 性能警告
      if (duration > 16) { // 超过一帧时间
        console.warn(`Slow render detected for node ${eficyNode.id}: ${duration}ms`)
      }
    }
  }
  
  @OnMount(0)
  async onMount(
    element: Element,
    eficyNode: EficyNode,
    context: IMountContext,
    next: () => Promise<void>
  ): Promise<void> {
    // 记录挂载性能
    const renderTime = this.renderTimes.get(eficyNode.id)
    if (renderTime) {
      console.log(`Node ${eficyNode.id} render time: ${renderTime}ms`)
    }
    
    await next()
  }
  
  getPerformanceReport(): Record<string, number> {
    return Object.fromEntries(this.renderTimes)
  }
}
```

### 4. 表单验证插件

```typescript
class ValidationPlugin implements ILifecyclePlugin {
  name = 'validation-plugin'
  version = '1.0.0'
  
  private validators: Map<string, (value: any) => string | null> = new Map()
  
  @ProcessProps(15)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const result = await next()
    
    // 为表单字段添加验证
    if (result.validate && this.validators.has(result.validate)) {
      const validator = this.validators.get(result.validate)!
      const originalOnChange = result.onChange
      
      result.onChange = (value: any) => {
        const error = validator(value)
        if (error) {
          console.error(`Validation error for ${eficyNode.id}: ${error}`)
        }
        
        if (originalOnChange) {
          originalOnChange(value)
        }
      }
    }
    
    return result
  }
  
  addValidator(name: string, validator: (value: any) => string | null): void {
    this.validators.set(name, validator)
  }
}
```

## 最佳实践

### 1. 插件设计原则

- **单一职责**：每个插件专注于一个特定功能
- **最小侵入**：尽量减少对原有逻辑的影响
- **向前兼容**：考虑版本升级的兼容性
- **错误处理**：妥善处理异常情况

### 2. 性能优化

- **按需执行**：只在必要时执行逻辑
- **缓存结果**：缓存计算结果避免重复计算
- **异步处理**：使用异步操作避免阻塞
- **资源清理**：及时清理不需要的资源

### 3. 调试技巧

```typescript
// 开发模式下的调试代码
if (process.env.NODE_ENV === 'development') {
  console.log(`[${this.name}] Hook ${hookType} executed`, { context, result })
}
```

### 4. 测试策略

```typescript
import { render } from '@testing-library/react'
import { Eficy } from '@eficy/core'

describe('MyPlugin', () => {
  let eficy: Eficy
  let plugin: MyPlugin
  
  beforeEach(() => {
    eficy = new Eficy()
    plugin = new MyPlugin()
    eficy.registerPlugin(plugin)
    eficy.enableLifecycleHooksFeature()
  })
  
  it('should enhance props', async () => {
    const schema = {
      views: [{
        '#': 'test',
        '#view': 'div',
        title: 'Test Title'
      }]
    }
    
    const element = await eficy.createElement(schema)
    // 验证插件效果
  })
})
```

## 常见问题

### Q: 如何处理插件依赖？
A: 使用 `dependencies` 字段声明依赖，确保依赖插件先加载。

### Q: 如何控制插件执行顺序？
A: 使用 `enforce` 字段和装饰器的优先级参数控制执行顺序。

### Q: 如何在插件间共享数据？
A: 通过依赖注入容器注册共享服务，或使用 Context API。

### Q: 如何处理插件冲突？
A: 合理设计插件接口，使用命名空间避免冲突，必要时提供冲突检测机制。

## 插件执行时序图

```
┌─────────────────────────────────────────────────────────────────┐
│                         Eficy 插件生命周期                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INIT                                                           │
│    ↓                                                            │
│  BUILD_SCHEMA_NODE (for each view)                              │
│    ↓                                                            │
│  RESOLVE_COMPONENT                                              │
│    ↓                                                            │
│  PROCESS_PROPS                                                  │
│    ↓                                                            │
│  RENDER                                                         │
│    ↓                                                            │
│  ON_MOUNT (副作用，并行执行)                                        │
│    │                                                            │
│    └── ON_BIND_EVENT (事件绑定时)                                 │
│    │                                                            │
│    └── ON_HANDLE_EVENT (事件触发时)                               │
│    │                                                            │
│    └── ON_ERROR (错误发生时)                                      │
│    │                                                            │
│  ON_UNMOUNT (组件卸载时)                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 插件优先级和执行顺序

### Enforce 配置
- `pre`: 最早执行
- `undefined` (默认): 中等优先级
- `post`: 最晚执行

### 优先级排序
1. 按 `enforce` 排序：pre → undefined → post
2. 相同 `enforce` 内按 `priority` 排序（数值小的优先）
3. 相同 `priority` 按插件名称字母序排序

### 示例
```typescript
// 执行顺序：A → C → B → D
const pluginA = { name: 'A', enforce: 'pre', priority: 0 }
const pluginB = { name: 'B', enforce: undefined, priority: 10 }
const pluginC = { name: 'C', enforce: 'pre', priority: 20 }
const pluginD = { name: 'D', enforce: 'post', priority: 0 }
```

这份文档为 Eficy 插件开发提供了完整的指导，从基础概念到高级用法，从实用示例到最佳实践，帮助开发者快速上手并构建强大的插件系统。