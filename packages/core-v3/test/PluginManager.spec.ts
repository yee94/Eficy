import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PluginManager } from '../src/services/PluginManager'
import { HookType, IEficyPlugin, ILifecyclePlugin, PluginEnforce } from '../src/interfaces/lifecycle'
import { Init, Render } from '../src/decorators/lifecycle'
import { container } from 'tsyringe'

describe('PluginManager', () => {
  let pluginManager: PluginManager
  
  beforeEach(() => {
    pluginManager = new PluginManager()
  })

  afterEach(() => {
    pluginManager.clear()
  })

  describe('Plugin Registration', () => {
    it('should register a basic plugin', () => {
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      }

      pluginManager.register(plugin)
      
      expect(pluginManager.getPlugin('test-plugin')).toBe(plugin)
      expect(pluginManager.getAllPlugins()).toHaveLength(1)
    })

    it('should not register plugin with duplicate name', () => {
      const plugin1: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      }
      const plugin2: IEficyPlugin = {
        name: 'test-plugin',
        version: '2.0.0'
      }

      pluginManager.register(plugin1)
      pluginManager.register(plugin2) // Should not register

      expect(pluginManager.getAllPlugins()).toHaveLength(1)
      expect(pluginManager.getPlugin('test-plugin')?.version).toBe('1.0.0')
    })

    it('should call install method when registering', () => {
      let installCalled = false
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {
          installCalled = true
        }
      }

      pluginManager.register(plugin)
      expect(installCalled).toBe(true)
    })
  })

  describe('Plugin Unregistration', () => {
    it('should unregister a plugin', () => {
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      }

      pluginManager.register(plugin)
      expect(pluginManager.getPlugin('test-plugin')).toBe(plugin)

      pluginManager.unregister('test-plugin')
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined()
      expect(pluginManager.getAllPlugins()).toHaveLength(0)
    })

    it('should call uninstall method when unregistering', () => {
      let uninstallCalled = false
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        uninstall: () => {
          uninstallCalled = true
        }
      }

      pluginManager.register(plugin)
      pluginManager.unregister('test-plugin')
      expect(uninstallCalled).toBe(true)
    })

    it('should handle unregistering non-existing plugin gracefully', () => {
      expect(() => {
        pluginManager.unregister('non-existing-plugin')
      }).not.toThrow()
    })
  })

  describe('Lifecycle Plugin Hooks', () => {
    class TestLifecyclePlugin implements ILifecyclePlugin {
      name: string
      version: string
      enforce?: PluginEnforce

      constructor(name: string, enforce?: PluginEnforce) {
        this.name = name
        this.version = '1.0.0'
        this.enforce = enforce
      }

      @Init()
      async onInit(context: any, next: () => Promise<void>): Promise<void> {
        await next()
      }
    }

    it('should register lifecycle hooks from plugin', () => {
      const plugin = new TestLifecyclePlugin('lifecycle-plugin')
      
      pluginManager.register(plugin)
      
      const stats = pluginManager.getHookStats()
      expect(stats[HookType.INIT]).toBe(1)
    })

    it('should execute hooks in order without enforce', async () => {
      const executionOrder: string[] = []
      
      class Plugin1 extends TestLifecyclePlugin {
        @Init()
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          executionOrder.push('plugin1-before')
          await next()
          executionOrder.push('plugin1-after')
        }
      }

      class Plugin2 extends TestLifecyclePlugin {
        @Init()
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          executionOrder.push('plugin2-before')
          await next()
          executionOrder.push('plugin2-after')
        }
      }

      const plugin1 = new Plugin1('plugin1')
      const plugin2 = new Plugin2('plugin2')

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      await pluginManager.executeHook(HookType.INIT, {}, () => Promise.resolve())

      expect(executionOrder).toEqual([
        'plugin1-before',
        'plugin2-before',
        'plugin2-after',
        'plugin1-after'
      ])
    })
  })

  describe('Plugin Enforce Configuration', () => {
    class TestEnforcePlugin implements ILifecyclePlugin {
      name: string
      version: string
      enforce?: PluginEnforce

      constructor(name: string, enforce?: PluginEnforce) {
        this.name = name
        this.version = '1.0.0'
        this.enforce = enforce
      }

      @Init()
      async onInit(context: any, next: () => Promise<void>): Promise<void> {
        await next()
      }
    }

    it('should sort plugins by enforce configuration', () => {
      const prePlugin = new TestEnforcePlugin('pre-plugin', 'pre')
      const normalPlugin = new TestEnforcePlugin('normal-plugin')
      const postPlugin = new TestEnforcePlugin('post-plugin', 'post')

      pluginManager.register(postPlugin) // 先注册post
      pluginManager.register(prePlugin)  // 再注册pre
      pluginManager.register(normalPlugin) // 最后注册normal

      const executionOrder = pluginManager.getPluginExecutionOrder(HookType.INIT)
      
      expect(executionOrder.map(p => p.name)).toEqual([
        'pre-plugin',
        'normal-plugin', 
        'post-plugin'
      ])
    })

    it('should sort by priority within same enforce level', () => {
      class HighPriorityPlugin extends TestEnforcePlugin {
        @Init(1) // high priority
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      class LowPriorityPlugin extends TestEnforcePlugin {
        @Init(10) // low priority
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      const highPriorityPlugin = new HighPriorityPlugin('high-priority')
      const lowPriorityPlugin = new LowPriorityPlugin('low-priority')

      pluginManager.register(lowPriorityPlugin)  // 先注册低优先级
      pluginManager.register(highPriorityPlugin) // 再注册高优先级

      const executionOrder = pluginManager.getPluginExecutionOrder(HookType.INIT)
      
      expect(executionOrder.map(p => p.name)).toEqual([
        'high-priority',
        'low-priority'
      ])
    })

    it('should sort by plugin name when enforce and priority are same', () => {
      const pluginB = new TestEnforcePlugin('plugin-b')
      const pluginA = new TestEnforcePlugin('plugin-a')

      pluginManager.register(pluginB) // 先注册B
      pluginManager.register(pluginA) // 再注册A

      const executionOrder = pluginManager.getPluginExecutionOrder(HookType.INIT)
      
      expect(executionOrder.map(p => p.name)).toEqual([
        'plugin-a',
        'plugin-b'
      ])
    })

    it('should handle complex sorting scenario', () => {
      class PreHighPlugin extends TestEnforcePlugin {
        @Init(1)
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      class PreLowPlugin extends TestEnforcePlugin {
        @Init(10)
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      class NormalHighPlugin extends TestEnforcePlugin {
        @Init(1)
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      class NormalMediumPlugin extends TestEnforcePlugin {
        @Init(5)
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      class PostHighPlugin extends TestEnforcePlugin {
        @Init(1)
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      class PostLowPlugin extends TestEnforcePlugin {
        @Init(10)
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }
      }

      const plugins = [
        new PostHighPlugin('post-high', 'post'),
        new PreLowPlugin('pre-low', 'pre'),
        new NormalMediumPlugin('normal-medium'),
        new PostLowPlugin('post-low', 'post'),
        new PreHighPlugin('pre-high', 'pre'),
        new NormalHighPlugin('normal-high')
      ]

      // 随机顺序注册
      const shuffledPlugins = [...plugins].sort(() => Math.random() - 0.5)
      shuffledPlugins.forEach(plugin => pluginManager.register(plugin))

      const executionOrder = pluginManager.getPluginExecutionOrder(HookType.INIT)
      
      // 期望的顺序：pre (priority 1, 10), normal (priority 1, 5), post (priority 1, 10)
      expect(executionOrder.map(p => p.name)).toEqual([
        'pre-high',     // pre, priority 1
        'pre-low',      // pre, priority 10
        'normal-high',  // normal, priority 1
        'normal-medium', // normal, priority 5
        'post-high',    // post, priority 1
        'post-low'      // post, priority 10
      ])
    })
  })

  describe('Hook Execution', () => {
    it('should execute hooks in middleware chain style', async () => {
      const executionOrder: string[] = []
      
      class ChainPlugin implements ILifecyclePlugin {
        name: string
        version: string
        
        constructor(name: string) {
          this.name = name
          this.version = '1.0.0'
        }

        @Init()
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          executionOrder.push(`${this.name}-start`)
          await next()
          executionOrder.push(`${this.name}-end`)
        }
      }

      const plugin1 = new ChainPlugin('plugin1')
      const plugin2 = new ChainPlugin('plugin2')

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      await pluginManager.executeHook(HookType.INIT, {}, () => {
        executionOrder.push('final')
        return Promise.resolve()
      })

      expect(executionOrder).toEqual([
        'plugin1-start',
        'plugin2-start',
        'final',
        'plugin2-end',
        'plugin1-end'
      ])
    })

    it('should handle empty hook execution', async () => {
      let finalCalled = false
      
      await pluginManager.executeHook(HookType.INIT, {}, () => {
        finalCalled = true
        return Promise.resolve()
      })

      expect(finalCalled).toBe(true)
    })
  })

  describe('Hook Statistics', () => {
    it('should return correct hook statistics', () => {
      class StatsPlugin implements ILifecyclePlugin {
        name: string
        version: string
        
        constructor(name: string) {
          this.name = name
          this.version = '1.0.0'
        }

        @Init()
        async onInit(context: any, next: () => Promise<void>): Promise<void> {
          await next()
        }

        @Render()
        async onRender(viewNode: any, context: any, next: () => Promise<any>): Promise<any> {
          return await next()
        }
      }

      const plugin1 = new StatsPlugin('plugin1')
      const plugin2 = new StatsPlugin('plugin2')

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      const stats = pluginManager.getHookStats()
      
      expect(stats[HookType.INIT]).toBe(2)
      expect(stats[HookType.RENDER]).toBe(2)
      expect(Object.keys(stats).length).toBe(2)
    })
  })

  describe('Plugin Cleanup', () => {
    it('should clear all plugins', () => {
      const plugin1: IEficyPlugin = { name: 'plugin1', version: '1.0.0' }
      const plugin2: IEficyPlugin = { name: 'plugin2', version: '1.0.0' }

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)
      
      expect(pluginManager.getAllPlugins()).toHaveLength(2)

      pluginManager.clear()
      
      expect(pluginManager.getAllPlugins()).toHaveLength(0)
      expect(pluginManager.getHookStats()).toEqual({})
    })
  })
})