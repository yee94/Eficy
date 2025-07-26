# Eficy Core V3 重构设计方案

## 1. 项目重构目标

### 1.1 核心问题
- 清除 `plugin-decorator` 及 `lodash-decorators` 依赖
- EficySchema 主类需要真正成为 ViewNode Tree 的核心管理器
- RenderNode 需要完全具备响应式能力
- 构建基于 tsyringe 的现代化插件体系
- 全面采用 hooks 开发模式

### 1.2 设计原则
- **单一职责**：每个类和组件只负责单一功能
- **依赖注入**：基于 tsyringe 实现松耦合架构
- **响应式优先**：所有状态变更都应该是响应式的
- **类型安全**：完整的 TypeScript 类型支持
- **可扩展性**：插件体系支持灵活扩展

## 2. 架构设计

### 2.1 核心类重构

#### EficySchema 类（ViewNode Tree 管理器）
```typescript
class EficySchema extends ObservableClass {
  // 核心功能
  - ViewNode 树的构建和管理
  - 节点索引和快速查找
  - 树结构的更新和同步
  - 生命周期管理

  // 主要方法
  - buildTree(schema: IEficySchema): void  // 构建完整树结构
  - getNodeById(id: string): ViewNode     // 通过ID快速查找节点
  - updateNode(id: string, data: any): void // 更新指定节点
  - traverseTree(callback: Function): void  // 遍历整个树
  - rebuildIndex(): void                   // 重建索引
}
```

#### ViewNode 类（增强版）
```typescript
class ViewNode extends ObservableClass {
  // 新增功能
  - 父节点引用管理
  - 深度计算
  - 路径追踪
  - 子树更新优化

  // 优化的响应式能力
  - 细粒度属性更新
  - 计算属性缓存
  - 批量更新支持
}
```

### 2.2 响应式 RenderNode

#### 完全响应式的渲染组件
```typescript
const RenderNode = observer(memo(({ viewNode, componentMap }: IRenderNodeProps) => {
  // 使用响应式 hooks
  const shouldRender = useObserver(() => viewNode.shouldRender)
  const componentName = useObserver(() => viewNode['#view'])
  const props = useObserver(() => viewNode.props)
  
  // 响应式子节点渲染
  const children = useObserver(() => {
    if (viewNode['#children']) {
      return viewNode['#children'].map(child => (
        <RenderNode key={child.id} viewNode={child} componentMap={componentMap} />
      ))
    }
    return viewNode['#content']
  })

  // ... 渲染逻辑
}))
```

### 2.3 插件体系重构（@eficy/plugin 包）

#### 插件接口定义
```typescript
interface IEficyPlugin {
  name: string
  version: string
  dependencies?: string[]
  
  install(container: DependencyContainer): void
  uninstall?(container: DependencyContainer): void
}

// 生命周期装饰器
@injectable()
class ExamplePlugin implements IEficyPlugin {
  @Init()
  async onInit(context: IInitContext, next: () => Promise<void>) {
    // 初始化逻辑
    await next()
  }

  @BuildViewNode()
  async onBuildViewNode(
    viewData: IViewData,
    context: IBuildContext,
    next: () => Promise<ViewNode>
  ): Promise<ViewNode> {
    // 构建节点前的处理
    const node = await next()
    // 构建节点后的处理
    return node
  }

  @BeforeRender()
  async onBeforeRender(
    viewNode: ViewNode,
    context: IRenderContext,
    next: () => Promise<void>
  ) {
    // 渲染前处理
    await next()
  }
}
```

#### 插件管理器
```typescript
@singleton()
class PluginManager {
  private plugins: Map<string, IEficyPlugin> = new Map()
  private hooks: Map<string, Function[]> = new Map()

  register(plugin: IEficyPlugin): void
  unregister(pluginName: string): void
  getPlugin(name: string): IEficyPlugin | undefined
  executeHook(hookName: string, ...args: any[]): Promise<any>
}
```

## 3. 实现步骤

### 3.1 清理 Legacy 代码
- 移除所有 `plugin-decorator` 引用
- 移除 `lodash-decorators` 依赖
- 清理过时的插件实现

### 3.2 重构 EficySchema
- 实现完整的 ViewNode Tree 管理
- 建立节点索引系统
- 优化树结构操作

### 3.3 增强 RenderNode 响应式能力
- 使用 `useObserver` hooks 替代直接访问
- 实现细粒度的响应式更新
- 优化渲染性能

### 3.4 构建新插件体系
- 创建 @eficy/plugin 独立包
- 实现基于 tsyringe 的依赖注入
- 设计生命周期钩子系统

### 3.5 全面测试
- 单元测试覆盖所有核心功能
- 集成测试验证插件体系
- 性能测试确保响应式优化效果

## 4. 技术栈更新

### 4.1 新增依赖
```json
{
  "@eficy/plugin": "^1.0.0",
  "tsyringe": "^4.8.0",
  "reflect-metadata": "^0.2.2"
}
```

### 4.2 移除依赖
```json
{
  "plugin-decorator": "移除",
  "lodash-decorators": "移除"
}
```

## 5. API 兼容性

### 5.1 向后兼容
- 保持现有 Schema 格式兼容
- 保持主要 API 接口不变
- 提供迁移指南

### 5.2 新增 API
```typescript
// EficySchema 增强 API
schema.getNodeById(id: string): ViewNode
schema.findNodesByView(viewName: string): ViewNode[]
schema.traverseTree(callback: (node: ViewNode) => void): void

// 插件 API
eficy.use(plugin: IEficyPlugin): void
eficy.unuse(pluginName: string): void
eficy.getPlugin(name: string): IEficyPlugin
```

## 6. 性能优化

### 6.1 响应式优化
- 细粒度的属性监听
- 计算属性缓存
- 批量更新机制

### 6.2 渲染优化
- 虚拟滚动支持
- 组件懒加载
- 智能差异更新

## 7. 开发体验

### 7.1 TypeScript 支持
- 完整的类型定义
- 泛型支持
- 类型推导优化

### 7.2 调试支持
- 开发时错误边界
- 性能监控
- 调试工具集成

## 8. 迁移指南

### 8.1 插件迁移
```typescript
// 旧版插件
class OldPlugin extends BasePlugin {
  // ...
}

// 新版插件
@injectable()
class NewPlugin implements IEficyPlugin {
  @Init()
  async onInit(context: IInitContext, next: () => Promise<void>) {
    // 迁移逻辑
    await next()
  }
}
```

### 8.2 配置迁移
- 自动配置迁移工具
- 配置校验
- 错误提示和修复建议

## 9. 测试策略

### 9.1 单元测试
- ViewNode 类测试
- EficySchema 类测试
- RenderNode 组件测试
- 插件系统测试

### 9.2 集成测试
- 完整渲染流程测试
- 插件交互测试
- 性能基准测试

### 9.3 E2E 测试
- 真实场景模拟
- 浏览器兼容性测试
- 用户交互测试