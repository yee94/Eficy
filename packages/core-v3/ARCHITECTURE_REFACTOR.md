# EficyNodeStore 和 RenderNodeTree 架构重构

## 重构目标

1. **职责分离**：将 EficyNode 树管理和 RenderNode 映射分离到不同的类中
2. **去除不必要的响应式**：在树构建过程中减少不必要的 @observable 装饰器
3. **解耦设计**：让两个树类之间没有直接依赖关系
4. **统一管理**：通过 Eficy 主类统一管理两个树
5. **依赖注入**：使用 tsyringe 实现依赖注入，简化参数传递

## 新架构设计

### 1. EficyNodeStore - 纯粹的节点树管理

```typescript
@injectable()
class EficyNodeStore extends ObservableClass {
  @observable private rootNode: EficyNode | null = null
  private nodeMap: Record<string, EficyNode> = {}      // 移除 @observable
  private rootData: IViewData | null = null            // 移除 @observable
  
  // 专注于 EficyNode 的构建和管理
  build(views: IViewData | IViewData[]): void
  findNode(nodeId: string): EficyNode | null
  updateNode(nodeId: string, data: Partial<IViewData>): void
  addChild(parentId: string, childData: IViewData): EficyNode | null
  removeChild(parentId: string, childId: string): void
}
```

**特点：**
- 去掉了所有 RenderNode 相关的代码
- 减少了不必要的 @observable 装饰器，提高性能
- 专注于 EficyNode 的树结构管理
- 使用 @injectable 装饰器，支持依赖注入

### 2. RenderNodeTree - 专门的 React 元素映射管理

```typescript
@injectable()
class RenderNodeTree extends ObservableClass {
  @observable private renderNodeCache: Map<string, ReactElement> = new Map()
  @observable private renderNodeComponentRef: any = null
  
  constructor(
    @inject(ComponentRegistry) private componentRegistry: ComponentRegistry
  ) {
    super()
  }
  
  // 简化的 API，不再需要传递 componentMap
  buildFromEficyNode(rootNode: EficyNode, RenderNodeComponent: any): void
  findRenderNode(nodeId: string): ReactElement | null
  updateRenderNode(nodeId: string, eficyNode: EficyNode): void
  addRenderNode(eficyNode: EficyNode): ReactElement | null
  removeRenderNode(nodeId: string): void
}
```

**特点：**
- 专门处理 React 元素的构建和映射
- 通过依赖注入获取 ComponentRegistry，无需手动传递 componentMap
- 与 EficyNodeStore 完全解耦，没有直接依赖
- 使用 @injectable 和 @inject 装饰器

### 3. Eficy 主类 - 统一管理两个树

```typescript
class Eficy {
  private eficyNodeStore: EficyNodeStore | null = null
  private renderNodeTree: RenderNodeTree | null = null
  
  private setupContainer(): void {
    // 注册所有服务到 tsyringe 容器
    container.registerSingleton(ConfigService)
    container.registerSingleton(ComponentRegistry)
    container.registerSingleton(EficyNodeStore)
    container.registerSingleton(RenderNodeTree)
  }
  
  private schemaToNodeTree(schema: IEficySchema): EficyNodeStore {
    // 使用 tsyringe 解析实例
    const nodeTree = container.resolve(EficyNodeStore)
    nodeTree.build(schema.views)
    return nodeTree
  }
  
  private buildRenderNodeTree(eficyNodeStore: EficyNodeStore): RenderNodeTree {
    // 使用 tsyringe 解析实例，自动注入 ComponentRegistry
    const renderNodeTree = container.resolve(RenderNodeTree)
    const rootNode = eficyNodeStore.root
    
    if (rootNode) {
      // 不再需要传递 componentMap，由依赖注入自动提供
      renderNodeTree.buildFromEficyNode(rootNode, RenderNode)
    }
    
    return renderNodeTree
  }
}
```

**特点：**
- 同时管理 EficyNodeStore 和 RenderNodeTree
- 使用 tsyringe 容器管理所有依赖
- 简化的方法调用，无需手动传递依赖
- 保持原有的外部 API 不变，向后兼容

## 重构优势

### 1. **性能提升**
```typescript
// 之前：所有属性都是响应式的
@observable private nodeMap: Record<string, EficyNode> = {}
@observable private renderNodeCache: Map<string, ReactElement> = new Map()

// 之后：只有必要的属性才是响应式的
private nodeMap: Record<string, EficyNode> = {}  // 树构建时不需要响应式
@observable private renderNodeCache: Map<string, ReactElement> = new Map()  // 渲染时需要响应式
```

### 2. **依赖注入简化代码**
```typescript
// 之前：需要手动传递依赖
renderNodeTree.buildFromEficyNode(rootNode, componentMap, RenderNode)

// 之后：依赖自动注入
renderNodeTree.buildFromEficyNode(rootNode, RenderNode)

// RenderNodeTree 内部自动获取 ComponentRegistry
constructor(@inject(ComponentRegistry) private componentRegistry: ComponentRegistry) {
  super()
}

createRenderNode(eficyNode: EficyNode): ReactElement {
  // 从注入的 ComponentRegistry 获取组件映射
  const componentMap = this.componentRegistry.getAll()
  // ...
}
```

### 3. **职责清晰**
- **EficyNodeStore**: 纯粹的数据结构管理，专注于节点的增删改查
- **RenderNodeTree**: 专门的视图层管理，自动获取组件映射，处理 React 元素构建
- **Eficy**: 业务逻辑协调，使用依赖注入统一管理所有服务
- **tsyringe**: 依赖注入容器，统一管理所有服务的生命周期

### 4. **易于扩展和测试**
```typescript
// 测试时可以轻松模拟依赖
beforeEach(() => {
  container.clearInstances()
  container.registerSingleton(ComponentRegistry)
  container.registerSingleton(EficyNodeStore)
  container.registerSingleton(RenderNodeTree)
  
  // 配置测试用的组件映射
  const componentRegistry = container.resolve(ComponentRegistry)
  componentRegistry.extend(testComponentMap)
})

// 测试 RenderNodeTree 时自动获得正确的依赖
const renderNodeTree = container.resolve(RenderNodeTree)
renderNodeTree.buildFromEficyNode(rootNode, RenderNode) // 无需传递 componentMap
```

### 5. **类型安全的依赖注入**
```typescript
// 通过 TypeScript 装饰器保证类型安全
constructor(
  @inject(ComponentRegistry) private componentRegistry: ComponentRegistry
) {
  super()
}

// 编译时就能确保依赖的正确性
```

## 使用示例

### 基础使用（与之前完全兼容）
```typescript
const eficy = new Eficy()
eficy.config({ componentMap: myComponents })

const element = eficy.createElement({
  views: [
    { '#': 'button', '#view': 'Button', text: 'Click me' }
  ]
})
```

### 高级使用（依赖注入的好处）
```typescript
// 直接从容器获取服务实例
const nodeTree = container.resolve(EficyNodeStore)
nodeTree.build(viewData)

const renderTree = container.resolve(RenderNodeTree)
renderTree.buildFromEficyNode(nodeTree.root!, RenderNode) // 自动获取 componentMap

// 统一配置组件注册
const componentRegistry = container.resolve(ComponentRegistry)
componentRegistry.extend(newComponents)

// 所有依赖该服务的实例都会自动获得更新
```

### 测试友好
```typescript
// 在测试中可以轻松替换依赖
beforeEach(() => {
  container.clearInstances()
  
  // 注册测试专用的组件注册表
  container.registerInstance(ComponentRegistry, mockComponentRegistry)
  
  // 测试时 RenderNodeTree 会自动使用模拟的依赖
  const renderTree = container.resolve(RenderNodeTree)
})
```

## 总结

这次重构实现了：
- ✅ 职责分离，代码结构更清晰
- ✅ 性能优化，减少不必要的响应式开销
- ✅ 解耦设计，两个树类独立可测试
- ✅ 统一管理，外部 API 保持兼容
- ✅ 依赖注入，简化参数传递和依赖管理
- ✅ 类型安全，编译时确保依赖正确性
- ✅ 易于扩展，每个类都可以独立演进
- ✅ 测试友好，可以轻松模拟和替换依赖

新的架构使用 tsyringe 依赖注入框架，不仅提供了更好的代码组织和性能，还为后续的功能扩展和维护提供了更加坚实的基础。依赖注入使得各个组件之间的耦合度更低，测试更容易，代码更加模块化和可维护。 