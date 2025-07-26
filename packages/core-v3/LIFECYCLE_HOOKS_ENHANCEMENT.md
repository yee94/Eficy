# Eficy Core V3 生命周期钩子增强设计

## 📚 参考分析

通过分析 React 生命周期、amis 事件系统等主流框架，我们需要为 Eficy 设计更完整的生命周期钩子系统。

## 🎯 设计目标

1. **完整的组件生命周期覆盖**
2. **灵活的事件处理机制**
3. **可扩展的插件生命周期**
4. **性能优化相关的钩子**
5. **错误处理和调试支持**

## 🏗️ 生命周期钩子设计

### 1. 初始化阶段 (Initialization)

```typescript
// 框架初始化
@BeforeInit()
async onBeforeInit(context: IBeforeInitContext, next: () => Promise<void>): Promise<void>

@Init() 
async onInit(context: IInitContext, next: () => Promise<void>): Promise<void>

@AfterInit()
async onAfterInit(context: IAfterInitContext, next: () => Promise<void>): Promise<void>

// 配置加载
@BeforeConfigLoad()
async onBeforeConfigLoad(context: IConfigContext, next: () => Promise<void>): Promise<void>

@AfterConfigLoad()
async onAfterConfigLoad(context: IConfigContext, next: () => Promise<void>): Promise<void>
```

### 2. Schema 处理阶段 (Schema Processing)

```typescript
// Schema 解析
@BeforeSchemaProcess()
async onBeforeSchemaProcess(
  schema: IEficySchema, 
  context: ISchemaContext, 
  next: () => Promise<IEficySchema>
): Promise<IEficySchema>

@AfterSchemaProcess()
async onAfterSchemaProcess(
  schema: IEficySchema, 
  context: ISchemaContext, 
  next: () => Promise<IEficySchema>
): Promise<IEficySchema>

// Schema 验证
@ValidateSchema()
async onValidateSchema(
  schema: IEficySchema, 
  context: IValidationContext, 
  next: () => Promise<IValidationResult>
): Promise<IValidationResult>
```

### 3. ViewNode 生命周期 (ViewNode Lifecycle)

```typescript
// ViewNode 创建
@BeforeBuildViewNode()
async onBeforeBuildViewNode(
  viewData: IViewData, 
  context: IBuildContext, 
  next: () => Promise<ViewNode>
): Promise<ViewNode>

@BuildViewNode()  // 已有
async onBuildViewNode(
  viewData: IViewData, 
  context: IBuildContext, 
  next: () => Promise<ViewNode>
): Promise<ViewNode>

@AfterBuildViewNode()
async onAfterBuildViewNode(
  viewNode: ViewNode, 
  context: IBuildContext, 
  next: () => Promise<ViewNode>
): Promise<ViewNode>

// ViewNode 更新
@BeforeUpdateViewNode()
async onBeforeUpdateViewNode(
  viewNode: ViewNode, 
  newData: IViewData, 
  context: IUpdateContext, 
  next: () => Promise<void>
): Promise<void>

@AfterUpdateViewNode()
async onAfterUpdateViewNode(
  viewNode: ViewNode, 
  oldData: IViewData, 
  newData: IViewData, 
  context: IUpdateContext, 
  next: () => Promise<void>
): Promise<void>

// ViewNode 销毁
@BeforeDestroyViewNode()
async onBeforeDestroyViewNode(
  viewNode: ViewNode, 
  context: IDestroyContext, 
  next: () => Promise<void>
): Promise<void>

@AfterDestroyViewNode()
async onAfterDestroyViewNode(
  viewNode: ViewNode, 
  context: IDestroyContext, 
  next: () => Promise<void>
): Promise<void>
```

### 4. 渲染阶段 (Rendering)

```typescript
// 渲染前
@BeforeRender()  // 已有
async onBeforeRender(
  viewNode: ViewNode, 
  context: IRenderContext, 
  next: () => Promise<void>
): Promise<void>

// 组件解析
@ResolveComponent()
async onResolveComponent(
  componentName: string, 
  viewNode: ViewNode, 
  context: IComponentContext, 
  next: () => Promise<ComponentType>
): Promise<ComponentType>

// 属性处理
@BeforePropsProcess()
async onBeforePropsProcess(
  props: Record<string, any>, 
  viewNode: ViewNode, 
  context: IPropsContext, 
  next: () => Promise<Record<string, any>>
): Promise<Record<string, any>>

@AfterPropsProcess()
async onAfterPropsProcess(
  props: Record<string, any>, 
  viewNode: ViewNode, 
  context: IPropsContext, 
  next: () => Promise<Record<string, any>>
): Promise<Record<string, any>>

// 渲染后
@AfterRender()
async onAfterRender(
  element: ReactElement, 
  viewNode: ViewNode, 
  context: IRenderContext, 
  next: () => Promise<void>
): Promise<void>

// 挂载完成
@OnMount()
async onMount(
  element: HTMLElement, 
  viewNode: ViewNode, 
  context: IMountContext, 
  next: () => Promise<void>
): Promise<void>

// 卸载前
@BeforeUnmount()
async onBeforeUnmount(
  element: HTMLElement, 
  viewNode: ViewNode, 
  context: IUnmountContext, 
  next: () => Promise<void>
): Promise<void>
```

### 5. 事件处理 (Event Handling)

```typescript
// 事件绑定
@BeforeEventBind()
async onBeforeEventBind(
  eventName: string, 
  handler: Function, 
  viewNode: ViewNode, 
  context: IEventContext, 
  next: () => Promise<void>
): Promise<void>

@AfterEventBind()
async onAfterEventBind(
  eventName: string, 
  handler: Function, 
  viewNode: ViewNode, 
  context: IEventContext, 
  next: () => Promise<void>
): Promise<void>

// 事件触发
@BeforeEventTrigger()
async onBeforeEventTrigger(
  event: Event, 
  viewNode: ViewNode, 
  context: IEventTriggerContext, 
  next: () => Promise<any>
): Promise<any>

@AfterEventTrigger()
async onAfterEventTrigger(
  event: Event, 
  result: any, 
  viewNode: ViewNode, 
  context: IEventTriggerContext, 
  next: () => Promise<void>
): Promise<void>
```

### 6. 数据处理 (Data Processing)

```typescript
// 数据获取
@BeforeDataFetch()
async onBeforeDataFetch(
  request: IDataRequest, 
  context: IDataContext, 
  next: () => Promise<any>
): Promise<any>

@AfterDataFetch()
async onAfterDataFetch(
  data: any, 
  request: IDataRequest, 
  context: IDataContext, 
  next: () => Promise<any>
): Promise<any>

// 数据变更
@BeforeDataChange()
async onBeforeDataChange(
  oldData: any, 
  newData: any, 
  context: IDataChangeContext, 
  next: () => Promise<void>
): Promise<void>

@AfterDataChange()
async onAfterDataChange(
  oldData: any, 
  newData: any, 
  context: IDataChangeContext, 
  next: () => Promise<void>
): Promise<void>

// 数据验证
@ValidateData()
async onValidateData(
  data: any, 
  rules: IValidationRule[], 
  context: IValidationContext, 
  next: () => Promise<IValidationResult>
): Promise<IValidationResult>
```

### 7. 性能优化 (Performance)

```typescript
// 渲染优化
@ShouldUpdate()
async onShouldUpdate(
  viewNode: ViewNode, 
  newProps: any, 
  oldProps: any, 
  context: IUpdateContext, 
  next: () => Promise<boolean>
): Promise<boolean>

// 缓存管理
@BeforeCache()
async onBeforeCache(
  key: string, 
  data: any, 
  context: ICacheContext, 
  next: () => Promise<void>
): Promise<void>

@AfterCache()
async onAfterCache(
  key: string, 
  data: any, 
  context: ICacheContext, 
  next: () => Promise<void>
): Promise<void>

// 内存清理
@BeforeCleanup()
async onBeforeCleanup(
  context: ICleanupContext, 
  next: () => Promise<void>
): Promise<void>

@AfterCleanup()
async onAfterCleanup(
  context: ICleanupContext, 
  next: () => Promise<void>
): Promise<void>
```

### 8. 错误处理 (Error Handling)

```typescript
// 错误捕获
@OnError()
async onError(
  error: Error, 
  errorInfo: ErrorInfo, 
  context: IErrorContext, 
  next: () => Promise<void>
): Promise<void>

// 错误恢复
@OnErrorRecover()
async onErrorRecover(
  error: Error, 
  context: IErrorRecoverContext, 
  next: () => Promise<void>
): Promise<void>

// 错误边界
@ErrorBoundary()
async onErrorBoundary(
  error: Error, 
  errorInfo: ErrorInfo, 
  context: IErrorBoundaryContext, 
  next: () => Promise<ReactElement>
): Promise<ReactElement>
```

### 9. 调试和监控 (Debug & Monitoring)

```typescript
// 性能监控
@PerformanceMonitor()
async onPerformanceMonitor(
  metrics: IPerformanceMetrics, 
  context: IMonitorContext, 
  next: () => Promise<void>
): Promise<void>

// 调试信息
@Debug()
async onDebug(
  debugInfo: IDebugInfo, 
  context: IDebugContext, 
  next: () => Promise<void>
): Promise<void>

// 日志记录
@Log()
async onLog(
  level: LogLevel, 
  message: string, 
  context: ILogContext, 
  next: () => Promise<void>
): Promise<void>
```

## 📋 Context 接口定义

```typescript
// 基础上下文
interface IBaseContext {
  eficy: Eficy
  timestamp: number
  requestId: string
  userId?: string
}

// 初始化上下文
interface IInitContext extends IBaseContext {
  config: IEficyConfig
  componentMap: Record<string, ComponentType>
}

// Schema 上下文
interface ISchemaContext extends IBaseContext {
  parentSchema?: IEficySchema
  depth: number
  path: string[]
}

// 构建上下文
interface IBuildContext extends IBaseContext {
  parent?: ViewNode
  schema: IEficySchema
  index: number
}

// 渲染上下文
interface IRenderContext extends IBaseContext {
  componentMap: Record<string, ComponentType>
  isSSR: boolean
  theme?: string
}

// 事件上下文
interface IEventContext extends IBaseContext {
  target: Element
  currentTarget: Element
  phase: 'capture' | 'bubble'
}

// 数据上下文
interface IDataContext extends IBaseContext {
  source: 'api' | 'cache' | 'local'
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

// 错误上下文
interface IErrorContext extends IBaseContext {
  component?: string
  stack: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

## 🎨 使用示例

### 性能监控插件
```typescript
@injectable()
class PerformancePlugin implements IEficyPlugin {
  name = 'performance-plugin'
  version = '1.0.0'

  @BeforeRender()
  async onBeforeRender(
    args: { viewNode: ViewNode, context: IRenderContext }, 
    next: () => Promise<void>
  ) {
    const startTime = performance.now()
    args.context.startTime = startTime
    await next()
  }

  @AfterRender()
  async onAfterRender(
    args: { element: ReactElement, viewNode: ViewNode, context: IRenderContext }, 
    next: () => Promise<void>
  ) {
    const endTime = performance.now()
    const duration = endTime - args.context.startTime
    
    if (duration > 100) {
      console.warn(`Slow render detected: ${args.viewNode['#']} took ${duration}ms`)
    }
    
    await next()
  }

  @PerformanceMonitor()
  async onPerformanceMonitor(
    args: { metrics: IPerformanceMetrics, context: IMonitorContext }, 
    next: () => Promise<void>
  ) {
    // 发送性能数据到监控系统
    await this.sendMetrics(args.metrics)
    await next()
  }
}
```

### 数据缓存插件
```typescript
@injectable()
class CachePlugin implements IEficyPlugin {
  name = 'cache-plugin'
  version = '1.0.0'
  private cache = new Map()

  @BeforeDataFetch()
  async onBeforeDataFetch(
    args: { request: IDataRequest, context: IDataContext }, 
    next: () => Promise<any>
  ) {
    const cacheKey = this.getCacheKey(args.request)
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    const result = await next()
    this.cache.set(cacheKey, result)
    return result
  }

  @BeforeCleanup()
  async onBeforeCleanup(
    args: { context: ICleanupContext }, 
    next: () => Promise<void>
  ) {
    this.cache.clear()
    await next()
  }
}
```

### 错误处理插件
```typescript
@injectable()
class ErrorHandlingPlugin implements IEficyPlugin {
  name = 'error-handling-plugin'
  version = '1.0.0'

  @OnError()
  async onError(
    args: { error: Error, errorInfo: ErrorInfo, context: IErrorContext }, 
    next: () => Promise<void>
  ) {
    // 记录错误日志
    console.error('Eficy Error:', args.error.message, args.errorInfo)
    
    // 发送错误报告
    await this.reportError(args.error, args.context)
    
    await next()
  }

  @ErrorBoundary()
  async onErrorBoundary(
    args: { error: Error, errorInfo: ErrorInfo, context: IErrorBoundaryContext }, 
    next: () => Promise<ReactElement>
  ) {
    // 返回自定义错误页面
    return React.createElement('div', {
      style: { padding: '20px', border: '1px solid red' }
    }, [
      React.createElement('h3', { key: 'title' }, 'Something went wrong'),
      React.createElement('p', { key: 'message' }, args.error.message),
      React.createElement('button', { 
        key: 'retry',
        onClick: () => window.location.reload()
      }, 'Retry')
    ])
  }
}
```

## 🔧 实现优先级

### 高优先级 (立即实现)
1. ✅ `@Init()` - 已实现
2. ✅ `@BuildViewNode()` - 已实现  
3. ✅ `@BeforeRender()` - 已实现
4. 🔥 `@AfterRender()` - 渲染完成后处理
5. 🔥 `@OnError()` - 错误处理
6. 🔥 `@OnMount()` - 组件挂载

### 中优先级 (后续版本)
7. `@BeforeDataFetch()` / `@AfterDataFetch()` - 数据处理
8. `@ShouldUpdate()` - 性能优化
9. `@ValidateData()` - 数据验证
10. `@ResolveComponent()` - 组件解析

### 低优先级 (扩展功能)
11. `@PerformanceMonitor()` - 性能监控
12. `@Debug()` / `@Log()` - 调试支持
13. `@BeforeCache()` / `@AfterCache()` - 缓存管理
14. 其他细粒度钩子

## 💡 设计优势

1. **完整性** - 覆盖组件完整生命周期
2. **灵活性** - 插件可选择性实现需要的钩子
3. **性能** - 支持性能监控和优化钩子
4. **调试** - 提供丰富的调试和监控能力
5. **扩展性** - 易于添加新的生命周期钩子
6. **一致性** - 统一的钩子命名和调用约定