# Eficy Core V3 生命周期钩子设计（简化版）

## 🎯 设计原则

基于中间件模式的 `next()` 调用方式，每个钩子内部可以通过 `next()` 的调用位置自然地实现前后逻辑，无需单独的 `before/after` 钩子。

```typescript
// 典型的钩子模式
@SomeHook()
async onSomeHook(args, next) {
  // before 逻辑
  console.log('执行前')
  
  const result = await next()  // 执行核心逻辑
  
  // after 逻辑  
  console.log('执行后')
  
  return result
}
```

## 🏗️ 核心生命周期钩子

### 1. 框架初始化
```typescript
@Init()
async onInit(context: IInitContext, next: () => Promise<void>): Promise<void>
```

### 2. Schema 处理
```typescript
@ProcessSchema()
async onProcessSchema(
  schema: IEficySchema, 
  context: ISchemaContext, 
  next: () => Promise<IEficySchema>
): Promise<IEficySchema>

@ValidateSchema()
async onValidateSchema(
  schema: IEficySchema, 
  context: IValidationContext, 
  next: () => Promise<IValidationResult>
): Promise<IValidationResult>
```

### 3. ViewNode 生命周期
```typescript
@BuildViewNode()  // 已有
async onBuildViewNode(
  viewData: IViewData, 
  context: IBuildContext, 
  next: () => Promise<ViewNode>
): Promise<ViewNode>

@UpdateViewNode()
async onUpdateViewNode(
  viewNode: ViewNode, 
  newData: IViewData, 
  context: IUpdateContext, 
  next: () => Promise<void>
): Promise<void>

@DestroyViewNode()
async onDestroyViewNode(
  viewNode: ViewNode, 
  context: IDestroyContext, 
  next: () => Promise<void>
): Promise<void>
```

### 4. 渲染阶段
```typescript
@Render()  // 重命名现有的 @BeforeRender
async onRender(
  viewNode: ViewNode, 
  context: IRenderContext, 
  next: () => Promise<ReactElement>
): Promise<ReactElement>

@ResolveComponent()
async onResolveComponent(
  componentName: string, 
  viewNode: ViewNode, 
  context: IComponentContext, 
  next: () => Promise<ComponentType>
): Promise<ComponentType>

@ProcessProps()
async onProcessProps(
  props: Record<string, any>, 
  viewNode: ViewNode, 
  context: IPropsContext, 
  next: () => Promise<Record<string, any>>
): Promise<Record<string, any>>

@Mount()
async onMount(
  element: HTMLElement, 
  viewNode: ViewNode, 
  context: IMountContext, 
  next: () => Promise<void>
): Promise<void>

@Unmount()
async onUnmount(
  element: HTMLElement, 
  viewNode: ViewNode, 
  context: IUnmountContext, 
  next: () => Promise<void>
): Promise<void>
```

### 5. 事件处理
```typescript
@HandleEvent()
async onHandleEvent(
  event: Event, 
  viewNode: ViewNode, 
  context: IEventContext, 
  next: () => Promise<any>
): Promise<any>

@BindEvent()
async onBindEvent(
  eventName: string, 
  handler: Function, 
  viewNode: ViewNode, 
  context: IEventContext, 
  next: () => Promise<void>
): Promise<void>
```

### 6. 数据处理
```typescript
@FetchData()
async onFetchData(
  request: IDataRequest, 
  context: IDataContext, 
  next: () => Promise<any>
): Promise<any>

@ValidateData()
async onValidateData(
  data: any, 
  rules: IValidationRule[], 
  context: IValidationContext, 
  next: () => Promise<IValidationResult>
): Promise<IValidationResult>

@ChangeData()
async onChangeData(
  oldData: any, 
  newData: any, 
  context: IDataChangeContext, 
  next: () => Promise<void>
): Promise<void>
```

### 7. 性能和优化
```typescript
@ShouldUpdate()
async onShouldUpdate(
  viewNode: ViewNode, 
  newProps: any, 
  oldProps: any, 
  context: IUpdateContext, 
  next: () => Promise<boolean>
): Promise<boolean>

@Cache()
async onCache(
  key: string, 
  data: any, 
  context: ICacheContext, 
  next: () => Promise<any>
): Promise<any>

@Cleanup()
async onCleanup(
  context: ICleanupContext, 
  next: () => Promise<void>
): Promise<void>
```

### 8. 错误处理
```typescript
@Error()
async onError(
  error: Error, 
  errorInfo: ErrorInfo, 
  context: IErrorContext, 
  next: () => Promise<ReactElement | void>
): Promise<ReactElement | void>

@ErrorRecover()
async onErrorRecover(
  error: Error, 
  context: IErrorRecoverContext, 
  next: () => Promise<void>
): Promise<void>
```

### 9. 监控和调试
```typescript
@Monitor()
async onMonitor(
  metrics: IPerformanceMetrics, 
  context: IMonitorContext, 
  next: () => Promise<void>
): Promise<void>

@Debug()
async onDebug(
  debugInfo: IDebugInfo, 
  context: IDebugContext, 
  next: () => Promise<void>
): Promise<void>

@Log()
async onLog(
  level: LogLevel, 
  message: string, 
  data: any, 
  context: ILogContext, 
  next: () => Promise<void>
): Promise<void>
```

## 🎨 使用示例

### 渲染性能监控
```typescript
@injectable()
class PerformancePlugin implements IEficyPlugin {
  @Render()
  async onRender(
    args: { viewNode: ViewNode, context: IRenderContext }, 
    next: () => Promise<ReactElement>
  ) {
    const startTime = performance.now()
    
    // 执行渲染
    const element = await next()
    
    const duration = performance.now() - startTime
    if (duration > 100) {
      console.warn(`慢渲染警告: ${args.viewNode['#']} 耗时 ${duration}ms`)
    }
    
    return element
  }

  @Mount()
  async onMount(
    args: { element: HTMLElement, viewNode: ViewNode, context: IMountContext }, 
    next: () => Promise<void>
  ) {
    console.log(`组件挂载: ${args.viewNode['#']}`)
    
    await next()
    
    console.log(`组件挂载完成: ${args.viewNode['#']}`)
  }
}
```

### 数据缓存和请求优化
```typescript
@injectable()
class CachePlugin implements IEficyPlugin {
  private cache = new Map<string, any>()

  @FetchData()
  async onFetchData(
    args: { request: IDataRequest, context: IDataContext }, 
    next: () => Promise<any>
  ) {
    const cacheKey = this.getCacheKey(args.request)
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      console.log(`缓存命中: ${cacheKey}`)
      return this.cache.get(cacheKey)
    }
    
    console.log(`请求数据: ${args.request.url}`)
    
    // 执行实际请求
    const result = await next()
    
    // 缓存结果
    this.cache.set(cacheKey, result)
    console.log(`数据已缓存: ${cacheKey}`)
    
    return result
  }

  @Cleanup()
  async onCleanup(
    args: { context: ICleanupContext }, 
    next: () => Promise<void>
  ) {
    console.log('清理缓存')
    this.cache.clear()
    
    await next()
    
    console.log('清理完成')
  }
}
```

### 错误处理和恢复
```typescript
@injectable()
class ErrorHandlingPlugin implements IEficyPlugin {
  @Error()
  async onError(
    args: { error: Error, errorInfo: ErrorInfo, context: IErrorContext }, 
    next: () => Promise<ReactElement | void>
  ) {
    // 记录错误
    console.error('捕获到错误:', args.error.message)
    this.reportError(args.error, args.context)
    
    // 尝试默认错误处理
    try {
      return await next()
    } catch (e) {
      // 如果默认处理也失败，返回自定义错误页面
      return React.createElement('div', {
        style: { padding: '20px', border: '2px solid red', borderRadius: '8px' }
      }, [
        React.createElement('h3', { key: 'title' }, '⚠️ 出现错误'),
        React.createElement('p', { key: 'message' }, args.error.message),
        React.createElement('button', { 
          key: 'retry',
          onClick: () => window.location.reload(),
          style: { marginTop: '10px', padding: '5px 10px' }
        }, '重新加载')
      ])
    }
  }

  @BuildViewNode()
  async onBuildViewNode(
    args: { viewData: IViewData, context: IBuildContext }, 
    next: () => Promise<ViewNode>
  ) {
    try {
      // 执行节点构建
      return await next()
    } catch (error) {
      console.error(`构建节点失败: ${args.viewData['#']}`, error)
      
      // 返回一个错误节点
      return new ViewNode({
        '#': args.viewData['#'] + '_error',
        '#view': 'div',
        '#content': `构建失败: ${args.viewData['#']}`,
        style: { color: 'red', border: '1px dashed red', padding: '10px' }
      })
    }
  }
}
```

### 组件解析和替换
```typescript
@injectable()
class ComponentResolverPlugin implements IEficyPlugin {
  @ResolveComponent()
  async onResolveComponent(
    args: { componentName: string, viewNode: ViewNode, context: IComponentContext }, 
    next: () => Promise<ComponentType>
  ) {
    const { componentName } = args
    
    // 自定义组件映射
    if (componentName === 'CustomButton') {
      console.log('解析自定义按钮组件')
      return CustomButtonComponent
    }
    
    // 组件别名处理
    if (componentName === 'Btn') {
      args.componentName = 'Button'
    }
    
    // 执行默认解析
    const Component = await next()
    
    // 组件包装
    if (componentName.startsWith('Async')) {
      return React.lazy(() => Promise.resolve({ default: Component }))
    }
    
    return Component
  }

  @ProcessProps()
  async onProcessProps(
    args: { props: Record<string, any>, viewNode: ViewNode, context: IPropsContext }, 
    next: () => Promise<Record<string, any>>
  ) {
    // 属性预处理
    if (args.props.size && typeof args.props.size === 'string') {
      args.props.size = args.props.size.toLowerCase()
    }
    
    // 执行默认属性处理
    const processedProps = await next()
    
    // 属性后处理 - 添加通用属性
    return {
      ...processedProps,
      'data-eficy-id': args.viewNode['#'],
      'data-eficy-component': args.viewNode['#view']
    }
  }
}
```

## 🔧 实现优先级

### 第一阶段（核心功能）
1. ✅ `@Init()` - 已实现
2. ✅ `@BuildViewNode()` - 已实现  
3. 🔄 `@Render()` - 重命名现有的 `@BeforeRender()`
4. 🆕 `@Mount()` - 组件挂载
5. 🆕 `@Error()` - 错误处理

### 第二阶段（数据和事件）
6. `@FetchData()` - 数据请求
7. `@HandleEvent()` - 事件处理
8. `@ValidateData()` - 数据验证
9. `@ChangeData()` - 数据变更
10. `@ResolveComponent()` - 组件解析

### 第三阶段（性能和扩展）
11. `@ShouldUpdate()` - 更新控制
12. `@Cache()` - 缓存管理
13. `@ProcessProps()` - 属性处理
14. `@Monitor()` - 性能监控
15. 其他扩展钩子

## 💡 设计优势

1. **简洁性** - 去除冗余的 before/after 钩子
2. **灵活性** - 单个钩子内部控制前后逻辑
3. **一致性** - 统一的中间件模式
4. **可读性** - 钩子名称直接表达用途
5. **扩展性** - 易于添加新的生命周期钩子
6. **性能** - 减少钩子调用次数

通过这种设计，插件开发者可以在一个钩子内部灵活控制执行逻辑，既简化了API，又保持了强大的扩展能力。