# Eficy Core V3 设计方案

## 概述

Eficy Core V3 是对现有框架的全面重构，采用现代化的技术栈和架构模式，实现高性能、可扩展的前端编排框架。

## 核心需求分析

### 1. 技术栈迁移
- **依赖注入**: 从无到 `tsyringe` 
- **响应式系统**: 从 `mobx` 迁移到 `@eficy/reactive` + `@eficy/reactive-react`
- **数据模型**: 从 `@vmojs/base` 迁移到纯手工构建
- **插件系统**: 从 `plugin-decorator` 迁移到基于 `tsyringe` 的新体系
- **UI组件**: 移除 `antd` 等组件库依赖，支持任意组件库

### 2. 架构改进
- **渲染方向**: 从由外向内改为由内向外构建 React Tree
- **性能优化**: 每个 `#view` 节点独立渲染，使用 `React.memo` 隔绝 rerender
- **响应式粒度**: ViewNode 字段更新时，仅依赖其的 RenderNode 响应

### 3. API 设计
- `Eficy.extend(options)`: 扩展组件库，支持配置递归覆盖
- `Eficy.config(options)`: 配置主实例
- 生命周期钩子: `@Init`, `@BuildViewNode` 等注解

## 详细设计方案

### 1. 依赖注入架构

```typescript
// 核心容器设计
@singleton()
class EficyContainer {
  @inject(ConfigService) private config: ConfigService
  @inject(ComponentRegistry) private componentRegistry: ComponentRegistry
  @inject(LifecycleManager) private lifecycle: LifecycleManager
  
  extend(options: ExtendOptions): this
  config(options: ConfigOptions): this
}

// 服务注册
container.register('EficyContainer', EficyContainer)
container.register('ConfigService', ConfigService)
container.register('ComponentRegistry', ComponentRegistry)
```

### 2. 响应式ViewNode设计

```typescript
// 使用 @eficy/reactive 重新设计 ViewNode
class ViewNode extends ObservableClass {
  @observable
  public '#view': string
  
  @observable
  public '#': string
  
  @observable
  public '#children': ViewNode[]
  
  @computed
  get props(): Record<string, any> {
    // 计算最终传递给组件的props
  }
  
  @action
  updateField(key: string, value: any): void {
    // 更新字段，触发响应式更新
  }
}
```

### 3. RenderNode 独立渲染

```typescript
// 每个视图节点的渲染组件
const RenderNode = observer(({ viewNode }: { viewNode: ViewNode }) => {
  const Component = useComponent(viewNode['#view'])
  const props = useObservableProps(viewNode)
  
  return React.createElement(Component, props, 
    viewNode['#children']?.map(child => 
      <RenderNode key={child['#']} viewNode={child} />
    )
  )
})

// 使用 memo 优化
export default React.memo(RenderNode)
```

### 4. 由内向外构建架构

```typescript
class TreeBuilder {
  // 新的构建策略：从叶子节点开始向上构建
  buildFromInside(schema: EficySchema): ReactElement {
    const leaves = this.findLeafNodes(schema.views)
    const tree = this.buildUpward(leaves)
    return tree
  }
  
  private buildUpward(nodes: ViewNode[]): ReactElement {
    // 由内向外递归构建
  }
}
```

### 5. 新插件系统设计

```typescript
// 生命周期装饰器
function Init(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 注册 Init 生命周期钩子
  LifecycleManager.register('init', target.constructor, propertyKey)
}

function BuildViewNode(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 注册 BuildViewNode 生命周期钩子
  LifecycleManager.register('buildViewNode', target.constructor, propertyKey)
}

// 插件基类
abstract class EficyPlugin {
  @Init
  async onInit(context: InitContext, next: () => Promise<void>): Promise<void> {
    // 插件初始化逻辑
    await next()
  }
  
  @BuildViewNode  
  async onBuildViewNode(
    context: BuildViewNodeContext, 
    next: () => Promise<void>
  ): Promise<void> {
    // ViewNode 构建逻辑
    await next()
  }
}
```

### 6. 配置管理系统

```typescript
@singleton()
class ConfigService {
  private config: EficyConfig = {
    componentMap: {},
    plugins: [],
    defaultProps: {},
    // ...
  }
  
  extend(options: ExtendOptions): void {
    // 递归合并配置
    this.config = deepMerge(this.config, options)
  }
  
  set(options: ConfigOptions): void {
    // 设置配置
    this.config = { ...this.config, ...options }
  }
}
```

## 详细实现计划

### Phase 1: 基础架构 (核心模块)

1. **依赖注入容器设置**
   - 设置 tsyringe 容器
   - 定义核心服务接口
   - 实现基础服务类

2. **新的 ViewNode 模型**
   - 使用 @eficy/reactive 重写 ViewNode
   - 移除 @vmojs/base 依赖
   - 实现响应式字段更新

3. **RenderNode 组件**
   - 实现独立的渲染组件
   - 使用 React.memo 优化
   - 集成 @eficy/reactive-react

### Phase 2: 渲染引擎 (核心渲染)

1. **新的 Resolver**
   - 重写渲染解析器
   - 实现由内向外构建
   - 支持条件渲染 (#if)

2. **组件注册系统**
   - 组件库注册机制
   - 动态组件解析
   - 组件Props处理

### Phase 3: 生命周期与插件 (扩展性)

1. **生命周期管理器**
   - 定义生命周期钩子
   - 实现装饰器注册
   - 支持异步钩子链

2. **插件系统**
   - 插件基类设计
   - 插件注册与管理
   - 插件间通信机制

### Phase 4: 高级功能 (完整性)

1. **配置管理**
   - 全局配置服务
   - 配置合并策略
   - 配置验证

2. **性能优化**
   - 渲染性能监控
   - 缓存策略
   - 懒加载支持

## 测试策略

### 1. 单元测试覆盖
- **ViewNode 模型测试**: 响应式更新、字段管理
- **RenderNode 组件测试**: 渲染隔离、memo 优化
- **依赖注入测试**: 服务注册、依赖解析
- **生命周期测试**: 钩子执行、异步处理

### 2. 集成测试
- **Schema 渲染测试**: 完整渲染流程
- **插件系统测试**: 插件加载、生命周期
- **配置管理测试**: 配置合并、扩展

### 3. 性能测试
- **渲染性能**: 大量节点渲染时间
- **更新性能**: 部分更新响应时间
- **内存使用**: 长时间运行内存泄漏

## 技术选型说明

### 1. ahooks 使用
```typescript
// 替换原生 React hooks
import { useCallback, useMemo } from 'ahooks'

// 组件内使用
const Component = () => {
  const memoizedValue = useMemo(() => computeExpensiveValue(), [deps])
  const memoizedCallback = useCallback(() => doSomething(), [deps])
}
```

### 2. lodash 工具函数
```typescript
import { merge, cloneDeep, isObject, get, set } from 'lodash'

// 配置合并
const mergedConfig = merge(baseConfig, userConfig)

// 深拷贝
const newViewNode = cloneDeep(originalViewNode)
```

### 3. nanoid 唯一标识
```typescript
import { nanoid } from 'nanoid'

// ViewNode 唯一标识生成
class ViewNode {
  public readonly id: string = nanoid()
}
```

## 迁移策略

### 1. 向后兼容
- 保持 Schema 格式兼容
- 保持主要 API 兼容
- 提供迁移工具

### 2. 渐进式迁移
- 核心功能优先
- 插件功能其次
- 高级功能最后

### 3. 文档与示例
- 迁移指南
- 新特性示例
- 性能对比

## 风险评估

### 1. 技术风险
- **响应式系统迁移**: @eficy/reactive 与 mobx 行为差异
- **插件兼容性**: 新插件系统与旧系统不兼容
- **性能影响**: 架构变化可能影响性能

### 2. 缓解措施
- **全面测试**: 确保功能完整性
- **性能监控**: 持续监控性能指标
- **文档完善**: 详细的迁移和使用文档

## 总结

Eficy Core V3 通过现代化的技术栈和架构设计，将提供更好的性能、更强的扩展性和更好的开发体验。核心改进包括依赖注入、新的响应式系统、优化的渲染策略和灵活的插件体系。 