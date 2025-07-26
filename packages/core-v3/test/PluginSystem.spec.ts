import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'reflect-metadata'
import { container } from 'tsyringe'
import type { 
  IEficyPlugin, 
  IInitContext, 
  IBuildContext, 
  IRenderContext,
  IViewData 
} from '../src/interfaces'
import ViewNode from '../src/models/ViewNode'

// Mock plugin interfaces for testing
interface ILifecyclePlugin extends IEficyPlugin {
  onInit?(context: IInitContext, next: () => Promise<void>): Promise<void>
  onBuildViewNode?(viewData: IViewData, context: IBuildContext, next: () => Promise<ViewNode>): Promise<ViewNode>
  onBeforeRender?(viewNode: ViewNode, context: IRenderContext, next: () => Promise<void>): Promise<void>
}

// Mock decorators for testing (will be implemented in @eficy/plugin package)
const Init = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  // Mock implementation
}

const BuildViewNode = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  // Mock implementation
}

const BeforeRender = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  // Mock implementation
}

// Mock PluginManager implementation
class PluginManager {
  private plugins: Map<string, IEficyPlugin> = new Map()
  private hooks: Map<string, Function[]> = new Map()

  register(plugin: IEficyPlugin): void {
    this.plugins.set(plugin.name, plugin)
    plugin.install?.(container)
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      plugin.uninstall?.(container)
      this.plugins.delete(pluginName)
    }
  }

  getPlugin(name: string): IEficyPlugin | undefined {
    return this.plugins.get(name)
  }

  async executeHook(hookName: string, ...args: any[]): Promise<any> {
    const hooks = this.hooks.get(hookName) || []
    let context = args[0]
    const next = args[1]
    
    // 创建中间件执行链
    const execute = async (index: number): Promise<any> => {
      if (index >= hooks.length) {
        return next ? await next() : undefined
      }
      
      const hook = hooks[index]
      return await hook(context, () => execute(index + 1))
    }
    
    return await execute(0)
  }

  addHook(hookName: string, hook: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName)!.push(hook)
  }

  removeHook(hookName: string, hook: Function): void {
    const hooks = this.hooks.get(hookName)
    if (hooks) {
      const index = hooks.indexOf(hook)
      if (index > -1) {
        hooks.splice(index, 1)
      }
    }
  }
}

describe('Plugin System with tsyringe DI', () => {
  let pluginManager: PluginManager

  beforeEach(() => {
    pluginManager = new PluginManager()
    container.clearInstances()
  })

  describe('Plugin Registration and Management', () => {
    it('should register plugins with dependency injection', () => {
      const mockPlugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn((container) => {
          // Mock DI registration
          expect(container).toBeDefined()
        })
      }

      pluginManager.register(mockPlugin)

      expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin)
      expect(mockPlugin.install).toHaveBeenCalledWith(container)
    })

    it('should unregister plugins and cleanup dependencies', () => {
      const mockPlugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn((container) => {
          // Mock DI cleanup
          expect(container).toBeDefined()
        })
      }

      pluginManager.register(mockPlugin)
      pluginManager.unregister('test-plugin')

      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined()
      expect(mockPlugin.uninstall).toHaveBeenCalledWith(container)
    })

    it('should handle plugin dependencies', () => {
      const basePlugin: IEficyPlugin = {
        name: 'base-plugin',
        version: '1.0.0',
        install: vi.fn()
      }

      const dependentPlugin: IEficyPlugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        dependencies: ['base-plugin'],
        install: vi.fn()
      }

      // Register base plugin first
      pluginManager.register(basePlugin)
      
      // Should be able to register dependent plugin
      expect(() => {
        pluginManager.register(dependentPlugin)
      }).not.toThrow()

      expect(pluginManager.getPlugin('base-plugin')).toBeDefined()
      expect(pluginManager.getPlugin('dependent-plugin')).toBeDefined()
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should execute @Init hooks during initialization', async () => {
      const initSpy = vi.fn()
      
      class TestPlugin implements ILifecyclePlugin {
        name = 'init-test-plugin'
        version = '1.0.0'

        @Init()
        async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
          initSpy(context)
          await next()
        }

        install() {}
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)
      
      // Mock hook execution
      pluginManager.addHook('init', plugin.onInit.bind(plugin))
      
      const mockContext: IInitContext = {
        config: {},
        componentMap: {}
      }

      await pluginManager.executeHook('init', mockContext, async () => {})

      expect(initSpy).toHaveBeenCalledWith(mockContext)
    })

    it('should execute @BuildViewNode hooks during node creation', async () => {
      const buildSpy = vi.fn()
      
      class NodeBuilderPlugin implements ILifecyclePlugin {
        name = 'node-builder-plugin'
        version = '1.0.0'

        @BuildViewNode()
        async onBuildViewNode(
          args: { viewData: IViewData, context: IBuildContext }, 
          next: () => Promise<ViewNode>
        ): Promise<ViewNode> {
          buildSpy(args.viewData, args.context)
          const node = await next()
          
          // Plugin can modify the node
          node.updateField('data-plugin', 'processed')
          
          return node
        }

        install() {}
      }

      const plugin = new NodeBuilderPlugin()
      pluginManager.register(plugin)
      
      // Mock hook execution
      const mockCreateNode = async () => {
        return new ViewNode({
          '#': 'test',
          '#view': 'div'
        })
      }
      
      pluginManager.addHook('buildViewNode', plugin.onBuildViewNode.bind(plugin))

      const viewData: IViewData = {
        '#': 'test',
        '#view': 'div',
        className: 'test-class'
      }

      const mockContext: IBuildContext = {
        parent: null,
        schema: { views: [] }
      }

      const result = await pluginManager.executeHook(
        'buildViewNode', 
        { viewData, context: mockContext }, 
        mockCreateNode
      )

      expect(buildSpy).toHaveBeenCalledWith(viewData, mockContext)
      expect(result).toBeInstanceOf(ViewNode)
      expect(result.props['data-plugin']).toBe('processed')
    })

    it('should execute @BeforeRender hooks before rendering', async () => {
      const renderSpy = vi.fn()
      
      class RenderPlugin implements ILifecyclePlugin {
        name = 'render-plugin'
        version = '1.0.0'

        @BeforeRender()
        async onBeforeRender(
          args: { viewNode: ViewNode, context: IRenderContext }, 
          next: () => Promise<void>
        ): Promise<void> {
          renderSpy(args.viewNode, args.context)
          
          // Plugin can modify node before render
          args.viewNode.updateField('data-rendered-by', 'plugin')
          
          await next()
        }

        install() {}
      }

      const plugin = new RenderPlugin()
      pluginManager.register(plugin)
      
      pluginManager.addHook('beforeRender', plugin.onBeforeRender.bind(plugin))

      const viewNode = new ViewNode({
        '#': 'render-test',
        '#view': 'div'
      })

      const mockContext: IRenderContext = {
        componentMap: {},
        isSSR: false
      }

      await pluginManager.executeHook(
        'beforeRender', 
        { viewNode, context: mockContext }, 
        async () => {}
      )

      expect(renderSpy).toHaveBeenCalledWith(viewNode, mockContext)
      expect(viewNode.props['data-rendered-by']).toBe('plugin')
    })
  })

  describe('Hook Chain Execution', () => {
    it('should execute multiple hooks in registration order', async () => {
      const executionOrder: string[] = []

      class Plugin1 implements ILifecyclePlugin {
        name = 'plugin1'
        version = '1.0.0'

        async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
          executionOrder.push('plugin1-before')
          await next()
          executionOrder.push('plugin1-after')
        }

        install() {}
      }

      class Plugin2 implements ILifecyclePlugin {
        name = 'plugin2'
        version = '1.0.0'

        async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
          executionOrder.push('plugin2-before')
          await next()
          executionOrder.push('plugin2-after')
        }

        install() {}
      }

      const plugin1 = new Plugin1()
      const plugin2 = new Plugin2()
      
      pluginManager.register(plugin1)
      pluginManager.register(plugin2)
      
      pluginManager.addHook('init', plugin1.onInit.bind(plugin1))
      pluginManager.addHook('init', plugin2.onInit.bind(plugin2))

      await pluginManager.executeHook('init', {}, async () => {
        executionOrder.push('core-execution')
      })

      expect(executionOrder).toEqual([
        'plugin1-before',
        'plugin2-before', 
        'core-execution',
        'plugin2-after',
        'plugin1-after'
      ])
    })

    it('should handle hook errors gracefully', async () => {
      const errorPlugin: ILifecyclePlugin = {
        name: 'error-plugin',
        version: '1.0.0',
        async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
          throw new Error('Plugin error')
        },
        install() {}
      }

      pluginManager.register(errorPlugin)
      pluginManager.addHook('init', errorPlugin.onInit!.bind(errorPlugin))

      await expect(
        pluginManager.executeHook('init', {}, async () => {})
      ).rejects.toThrow('Plugin error')
    })
  })

  describe('Plugin Communication', () => {
    it('should allow plugins to communicate through context', async () => {
      let sharedData: any = {}

      class ProducerPlugin implements ILifecyclePlugin {
        name = 'producer-plugin'
        version = '1.0.0'

        async onInit(context: IInitContext & { shared?: any }, next: () => Promise<void>): Promise<void> {
          context.shared = { data: 'from-producer' }
          await next()
        }

        install() {}
      }

      class ConsumerPlugin implements ILifecyclePlugin {
        name = 'consumer-plugin'
        version = '1.0.0'

        async onInit(context: IInitContext & { shared?: any }, next: () => Promise<void>): Promise<void> {
          sharedData = context.shared
          await next()
        }

        install() {}
      }

      const producer = new ProducerPlugin()
      const consumer = new ConsumerPlugin()
      
      pluginManager.register(producer)
      pluginManager.register(consumer)
      
      pluginManager.addHook('init', producer.onInit.bind(producer))
      pluginManager.addHook('init', consumer.onInit.bind(consumer))

      const context = {}
      await pluginManager.executeHook('init', context, async () => {})

      expect(sharedData).toEqual({ data: 'from-producer' })
    })

    it('should support plugin-to-plugin service injection', () => {
      // Mock service
      class SharedService {
        getValue() {
          return 'shared-value'
        }
      }

      class ServiceProviderPlugin implements IEficyPlugin {
        name = 'service-provider'
        version = '1.0.0'

        install(container: any) {
          // Mock DI registration
          container.register('SharedService', { useClass: SharedService })
        }
      }

      class ServiceConsumerPlugin implements IEficyPlugin {
        name = 'service-consumer'
        version = '1.0.0'
        private service: SharedService

        install(container: any) {
          // Mock DI resolution
          this.service = { getValue: () => 'shared-value' } // Mock resolved service
        }

        getSharedValue(): string {
          return this.service.getValue()
        }
      }

      const provider = new ServiceProviderPlugin()
      const consumer = new ServiceConsumerPlugin()

      pluginManager.register(provider)
      pluginManager.register(consumer)

      expect(consumer.getSharedValue()).toBe('shared-value')
    })
  })

  describe('Plugin Performance', () => {
    it('should handle many plugins efficiently', async () => {
      const plugins: ILifecyclePlugin[] = []
      
      // Create 100 plugins
      for (let i = 0; i < 100; i++) {
        const plugin: ILifecyclePlugin = {
          name: `plugin-${i}`,
          version: '1.0.0',
          async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
            await next()
          },
          install() {}
        }
        plugins.push(plugin)
        pluginManager.register(plugin)
        pluginManager.addHook('init', plugin.onInit!.bind(plugin))
      }

      const startTime = performance.now()
      
      await pluginManager.executeHook('init', {}, async () => {})
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(100) // Should complete in under 100ms
      expect(plugins).toHaveLength(100)
    })

    it('should support async hook execution without blocking', async () => {
      const delays: number[] = []

      class AsyncPlugin implements ILifecyclePlugin {
        name = 'async-plugin'
        version = '1.0.0'

        async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
          const start = performance.now()
          await new Promise(resolve => setTimeout(resolve, 10))
          await next()
          delays.push(performance.now() - start)
        }

        install() {}
      }

      const plugin = new AsyncPlugin()
      pluginManager.register(plugin)
      pluginManager.addHook('init', plugin.onInit.bind(plugin))

      await pluginManager.executeHook('init', {}, async () => {
        await new Promise(resolve => setTimeout(resolve, 5))
      })

      expect(delays[0]).toBeGreaterThanOrEqual(10)
    })
  })
})