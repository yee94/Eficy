import { singleton, injectable, container } from 'tsyringe'
import type { 
  IEficyPlugin, 
  ILifecyclePlugin, 
  IHookRegistration,
  HookType 
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
    const proto = Object.getPrototypeOf(plugin)
    const hooks = getLifecycleHooks(proto)

    hooks.forEach((hookInfo: any) => {
      const { hookType, methodName, priority } = hookInfo
      
      // 创建钩子注册信息
      const method = plugin[methodName as keyof ILifecyclePlugin]
      if (typeof method === 'function') {
        const registration: IHookRegistration = {
          hookType,
          plugin,
          handler: method.bind(plugin),
          priority: priority || 0
        }
        
        // 添加到钩子映射
        if (!this.hooks.has(hookType)) {
          this.hooks.set(hookType, [])
        }
        this.hooks.get(hookType)!.push(registration)
        
        // 重新构建执行顺序
        this.rebuildHookExecutionOrder(hookType)
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
   * 重新构建钩子执行顺序
   */
  private rebuildHookExecutionOrder(hookType: HookType): void {
    const registrations = this.hooks.get(hookType) || []
    const sorted = sortHooksByPriority(registrations)
    const executors = sorted.map(reg => reg.handler)
    this.hookExecutionOrder.set(hookType, executors)
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