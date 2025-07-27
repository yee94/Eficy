# Eficy Core V3 生命周期钩子实现报告

## 概述

本报告详细说明了 Eficy Core V3 中所有生命周期钩子装饰器的实现情况。经过全面的分析和实现，现在所有 10 个生命周期钩子都已完全实现并通过测试。

## 生命周期钩子完整实现清单

### ✅ 已实现的钩子（10/10）

| 钩子装饰器 | 钩子类型 | 实现位置 | 调用时机 | 测试用例 |
|-----------|----------|----------|----------|----------|
| `@Init` | `HookType.INIT` | `src/core/Eficy.ts:135` | Eficy 实例创建元素时 | ✅ 完整测试 |
| `@BuildSchemaNode` | `HookType.BUILD_SCHEMA_NODE` | `src/models/EficyNodeStore.ts:59` | 构建每个 EficyNode 时 | ✅ 完整测试 |
| `@Render` | `HookType.RENDER` | `src/models/RenderNodeTree.ts:101` | 创建每个 RenderNode 时 | ✅ 完整测试 |
| `@Mount` | `HookType.MOUNT` | `src/components/RenderNode.tsx:48` | 组件挂载到 DOM 时 | ✅ 完整测试 |
| `@Unmount` | `HookType.UNMOUNT` | `src/components/RenderNode.tsx:66` | 组件从 DOM 卸载时 | ✅ 完整测试 |
| `@ResolveComponent` | `HookType.RESOLVE_COMPONENT` | `src/components/RenderNode.tsx:95` | 解析组件名称时 | ✅ 完整测试 |
| `@ProcessProps` | `HookType.PROCESS_PROPS` | `src/components/RenderNode.tsx:122` | 处理组件属性时 | ✅ 完整测试 |
| `@HandleEvent` | `HookType.HANDLE_EVENT` | `src/utils/eventHandlers.ts:17` | 处理事件时 | ✅ 完整测试 |
| `@BindEvent` | `HookType.BIND_EVENT` | `src/utils/eventHandlers.ts:43` | 绑定事件时 | ✅ 完整测试 |
| `@Error` | `HookType.ERROR` | `src/components/RenderNode.tsx:178` | 错误处理时 | ✅ 完整测试 |

## 实现细节

### 1. 核心装饰器系统

**文件**: `src/decorators/lifecycle.ts`

- 使用 `reflect-metadata` 存储钩子元数据
- 支持优先级设置（`priority` 参数）
- 统一的装饰器工厂函数 `createLifecycleDecorator`

### 2. 插件管理系统

**文件**: `src/services/PluginManager.ts`

- 管理插件注册和卸载
- 支持钩子优先级排序
- 中间件模式的异步钩子执行链

### 3. 生命周期集成点

#### 3.1 应用程序级别钩子

- **@Init**: 在 `Eficy.createElement()` 开始时执行
- **@BuildSchemaNode**: 在 `EficyNodeStore.buildNodeWithHooks()` 中为每个节点执行
- **@Render**: 在 `RenderNodeTree.createRenderNode()` 中为每个渲染节点执行

#### 3.2 组件级别钩子

- **@Mount**: 在组件挂载到 DOM 时通过 `useEffect` 执行
- **@Unmount**: 在组件卸载时通过 `useEffect` 清理函数执行
- **@ResolveComponent**: 在解析组件名称时执行
- **@ProcessProps**: 在处理组件属性时执行

#### 3.3 事件处理钩子

- **@HandleEvent**: 通过 `wrapEventHandler` 包装所有事件处理函数
- **@BindEvent**: 通过 `bindEventHandler` 在事件绑定时执行

#### 3.4 错误处理钩子

- **@Error**: 在 `ErrorBoundary` 的 `onError` 回调中执行

### 4. 事件处理系统

**文件**: `src/utils/eventHandlers.ts`

- 自动检测和包装所有以 "on" 开头的事件处理属性
- 支持 `HandleEvent` 和 `BindEvent` 钩子
- 保持原始事件处理函数的语义

## 测试覆盖率

**文件**: `test/LifecycleHooks.spec.ts`

- **25 个测试用例**全部通过
- 涵盖所有 10 个生命周期钩子
- 包括装饰器注册、钩子执行、优先级排序、多钩子插件等场景

### 测试分类

1. **装饰器注册测试** (10 个): 验证每个装饰器是否正确注册
2. **钩子执行测试** (10 个): 验证每个钩子在正确时机被调用
3. **集成测试** (3 个): 验证钩子在实际 Eficy 渲染流程中的工作
4. **高级特性测试** (2 个): 验证优先级排序和统计信息等功能

## 使用示例

### 创建一个完整的生命周期插件

```typescript
@injectable()
class FullLifecyclePlugin implements ILifecyclePlugin {
  name = 'full-lifecycle-plugin'
  version = '1.0.0'

  @Init(100)
  async onInit(context: IInitContext, next: () => Promise<void>) {
    console.log('插件初始化')
    await next()
  }

  @BuildSchemaNode(50)
  async onBuildSchemaNode(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<EficyNode>
  ) {
    console.log(`构建节点: ${viewData['#']}`)
    const node = await next()
    // 可以修改节点属性
    node.updateField('data-plugin', 'processed')
    return node
  }

  @Render(50)
  async onRender(
    viewNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>
  ) {
    console.log(`渲染节点: ${viewNode['#']}`)
    return await next()
  }

  @Mount()
  async onMount(
    element: Element,
    viewNode: EficyNode,
    context: IMountContext,
    next: () => Promise<void>
  ) {
    console.log(`挂载节点: ${viewNode['#']}`)
    element.setAttribute('data-mounted', 'true')
    await next()
  }

  @Unmount()
  async onUnmount(
    element: Element,
    viewNode: EficyNode,
    context: IUnmountContext,
    next: () => Promise<void>
  ) {
    console.log(`卸载节点: ${viewNode['#']}`)
    element.removeAttribute('data-mounted')
    await next()
  }

  @ResolveComponent(10)
  async onResolveComponent(
    componentName: string,
    viewNode: EficyNode,
    context: IResolveComponentContext,
    next: () => Promise<ComponentType>
  ) {
    // 提供自定义组件映射
    if (componentName === 'CustomButton') {
      return MyCustomButton
    }
    return await next()
  }

  @ProcessProps()
  async onProcessProps(
    props: Record<string, any>,
    viewNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ) {
    // 添加全局属性
    const enhancedProps = await next()
    return {
      ...enhancedProps,
      'data-plugin': 'processed',
      'data-timestamp': Date.now()
    }
  }

  @HandleEvent()
  async onHandleEvent(
    event: Event,
    viewNode: EficyNode,
    context: IHandleEventContext,
    next: () => Promise<any>
  ) {
    console.log(`处理事件: ${event.type}`)
    // 可以添加事件验证、日志记录等
    return await next()
  }

  @BindEvent()
  async onBindEvent(
    eventName: string,
    handler: Function,
    viewNode: EficyNode,
    context: IBindEventContext,
    next: () => Promise<void>
  ) {
    console.log(`绑定事件: ${eventName}`)
    await next()
  }

  @Error()
  async onError(
    error: Error,
    viewNode: EficyNode | null,
    context: IErrorContext,
    next: () => Promise<ReactElement | void>
  ) {
    console.error('插件错误处理:', error.message)
    // 可以添加错误上报、用户通知等
    return await next()
  }
}
```

### 注册和使用插件

```typescript
const eficy = new Eficy()
const plugin = new FullLifecyclePlugin()

// 注册插件
eficy.registerPlugin(plugin)

// 使用 Eficy 创建元素，所有钩子都会在适当时机被调用
const element = await eficy.createElement({
  views: [
    {
      '#': 'button',
      '#view': 'button',
      onClick: () => console.log('clicked!'),
      children: 'Click Me'
    }
  ]
})
```

## 性能考虑

1. **异步钩子执行**: 所有钩子都是异步执行，避免阻塞渲染
2. **优先级排序**: 高优先级钩子先执行，可以优化关键路径
3. **中间件模式**: 支持钩子链式调用，灵活性高
4. **缓存机制**: 钩子注册信息被缓存，避免重复计算

## 结论

Eficy Core V3 的生命周期钩子系统现已完全实现，提供了：

- ✅ **10 个完整的生命周期钩子**
- ✅ **25 个通过的测试用例**
- ✅ **完整的插件系统支持**
- ✅ **灵活的中间件模式**
- ✅ **优先级和异步执行支持**

该系统为 Eficy 提供了强大的扩展能力，允许开发者在渲染流程的各个关键节点插入自定义逻辑，实现诸如性能监控、错误处理、组件增强、事件拦截等高级功能。