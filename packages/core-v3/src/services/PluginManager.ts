import { singleton, injectable, container } from 'tsyringe'
import type { 
  IEficyPlugin, 
  ILifecyclePlugin, 
  IHookRegistration,
  IPluginWeight,
  HookType,
  PluginEnforce 
} from '../interfaces/lifecycle'
import { 
  getLifecycleHooks, 
  sortHooksByPriority 
} from '../decorators/lifecycle'

@singleton()
export class PluginManager {
  private plugins: Map<string, IEficyPlugin> = new Map()
  private hooks: Map<HookType, IHookRegistration[]> = new Map()
  private hookExecutionOrder: Map<HookType, ((...args: any[]) => Promise<any>)[]> = new Map()
  private pluginWeights: Map<string, number> = new Map() // 插件权重缓存

  /**
   * 注册插件
   */
  register(plugin: IEficyPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`)
      return
    }

    // 注册插件
    this.plugins.set(plugin.name, plugin)
    
    // 执行插件安装
    if (plugin.install) {
      plugin.install(container)
    }

    // 如果是生命周期插件，注册其钩子
    if (this.isLifecyclePlugin(plugin)) {
      this.registerLifecycleHooks(plugin as ILifecyclePlugin)
      // 重新排序所有钩子以应用enforce配置
      this.reorderAllHooks()
    }

    // Plugin registered successfully
  }

  /**
   * 卸载插件
   */
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.warn(`Plugin ${pluginName} not found`)
      return
    }

    // 移除钩子注册
    if (this.isLifecyclePlugin(plugin)) {
      this.unregisterLifecycleHooks(plugin as ILifecyclePlugin)
    }

    // 执行插件卸载
    if (plugin.uninstall) {
      plugin.uninstall(container)
    }

    // 移除插件
    this.plugins.delete(pluginName)
    
    // Plugin unregistered successfully
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): IEficyPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): IEficyPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 执行钩子链
   */
  async executeHook(hookType: HookType, ...args: any[]): Promise<any> {
    const executors = this.hookExecutionOrder.get(hookType) || []
    
    if (executors.length === 0) {
      // 如果没有钩子，执行默认的 next 函数
      const next = args[args.length - 1]
      if (typeof next === 'function') {
        return await next()
      }
      return
    }

    // 创建中间件执行链
    const execute = async (index: number): Promise<any> => {
      if (index >= executors.length) {
        // 执行原始的 next 函数
        const next = args[args.length - 1]
        if (typeof next === 'function') {
          return await next()
        }
        return
      }
      
      const executor = executors[index]
      const context = args.slice(0, -1) // 除了 next 函数之外的所有参数
      
      return await executor(...context, () => execute(index + 1))
    }
    
    return await execute(0)
  }

  /**
   * 检查是否为生命周期插件
   */
  private isLifecyclePlugin(plugin: IEficyPlugin): boolean {
    const proto = Object.getPrototypeOf(plugin)
    const hooks = getLifecycleHooks(proto)
    return hooks.length > 0
  }

  /**
   * 注册生命周期钩子
   */
  private registerLifecycleHooks(plugin: ILifecyclePlugin): void {
    // 收集所有钩子信息，避免重复
    const allHooks = new Map<string, any>()
    
    // 从原型链收集钩子，最终子类的方法会覆盖父类的方法
    let currentProto = Object.getPrototypeOf(plugin)
    while (currentProto && currentProto !== Object.prototype) {
      const hooks = getLifecycleHooks(currentProto)
      hooks.forEach((hookInfo: any) => {
        const key = `${hookInfo.hookType}-${hookInfo.methodName}`
        if (!allHooks.has(key)) {
          allHooks.set(key, hookInfo)
        }
      })
      currentProto = Object.getPrototypeOf(currentProto)
    }

    // 注册所有唯一的钩子
    allHooks.forEach((hookInfo: any) => {
      const { hookType, methodName, priority } = hookInfo
      
      // 创建钩子注册信息
      const method = plugin[methodName as keyof ILifecyclePlugin]
      if (typeof method === 'function') {
        const registration: IHookRegistration = {
          hookType,
          plugin,
          handler: method.bind(plugin),
          priority: priority || 0,
          enforce: plugin.enforce // 继承插件的enforce配置
        }
        
        // 添加到钩子映射
        if (!this.hooks.has(hookType)) {
          this.hooks.set(hookType, [])
        }
        this.hooks.get(hookType)!.push(registration)
      }
    })
  }

  /**
   * 卸载生命周期钩子
   */
  private unregisterLifecycleHooks(plugin: ILifecyclePlugin): void {
    // 从所有钩子类型中移除该插件的钩子
    for (const [hookType, registrations] of this.hooks.entries()) {
      const filtered = registrations.filter(reg => reg.plugin !== plugin)
      this.hooks.set(hookType, filtered)
      this.rebuildHookExecutionOrder(hookType)
    }
  }

  /**
   * 重新构建钩子执行顺序 - 支持enforce配置
   */
  private rebuildHookExecutionOrder(hookType: HookType): void {
    const registrations = this.hooks.get(hookType) || []
    const sorted = this.sortHooksByEnforceAndPriority(registrations)
    const executors = sorted.map(reg => reg.handler)
    this.hookExecutionOrder.set(hookType, executors)
  }

  /**
   * 重新排序所有钩子
   */
  private reorderAllHooks(): void {
    for (const hookType of this.hooks.keys()) {
      this.rebuildHookExecutionOrder(hookType)
    }
  }

  /**
   * 按照enforce配置和优先级排序钩子
   */
  private sortHooksByEnforceAndPriority(registrations: IHookRegistration[]): IHookRegistration[] {
    return registrations.sort((a, b) => {
      // 1. 首先按enforce排序：pre < undefined < post
      const enforceOrder = { 'pre': 0, undefined: 1, 'post': 2 }
      const aEnforce = enforceOrder[a.enforce || undefined]
      const bEnforce = enforceOrder[b.enforce || undefined]
      
      if (aEnforce !== bEnforce) {
        return aEnforce - bEnforce
      }
      
      // 2. 相同enforce级别内按priority排序（小的优先）
      const aPriority = a.priority || 0
      const bPriority = b.priority || 0
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // 3. 如果priority也相同，按插件名称排序保证稳定性
      return a.plugin.name.localeCompare(b.plugin.name)
    })
  }

  /**
   * 获取钩子统计信息
   */
  getHookStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    
    for (const [hookType, registrations] of this.hooks.entries()) {
      stats[hookType] = registrations.length
    }
    
    return stats
  }

  /**
   * 获取插件执行顺序信息
   */
  getPluginExecutionOrder(hookType: HookType): Array<{name: string, enforce?: PluginEnforce, priority: number}> {
    const registrations = this.hooks.get(hookType) || []
    const sorted = this.sortHooksByEnforceAndPriority(registrations)
    
    return sorted.map(reg => ({
      name: reg.plugin.name,
      enforce: reg.enforce,
      priority: reg.priority || 0
    }))
  }

  /**
   * 清理所有插件
   */
  clear(): void {
    // 卸载所有插件
    for (const pluginName of this.plugins.keys()) {
      this.unregister(pluginName)
    }
    
    // 清理数据结构
    this.plugins.clear()
    this.hooks.clear()
    this.hookExecutionOrder.clear()
  }
}