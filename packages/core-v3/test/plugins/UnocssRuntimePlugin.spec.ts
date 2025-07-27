import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { DependencyContainer, container } from 'tsyringe'
import { UnocssRuntimePlugin, createUnocssRuntimePlugin } from '../../src/plugins/builtin/UnocssRuntimePlugin'
import type { IUnocssRuntimeConfig } from '../../src/plugins/builtin/UnocssRuntimePlugin'
import EficyNode from '../../src/models/EficyNode'
import type { IViewData, IProcessPropsContext, IBuildSchemaNodeContext, IRenderContext } from '../../src/interfaces'

describe('UnocssRuntimePlugin', () => {
  let plugin: UnocssRuntimePlugin
  let mockContainer: DependencyContainer
  let mockDocument: any

  beforeEach(() => {
    // 设置 mock container
    mockContainer = container.createChildContainer()
    
    // Mock document
    mockDocument = {
      head: {
        appendChild: vi.fn(),
      },
      body: {
        appendChild: vi.fn(),
      },
      getElementById: vi.fn(),
      createElement: vi.fn((tag: string) => ({
        id: '',
        textContent: '',
        remove: vi.fn()
      }))
    }
    
    // 设置全局 document
    global.document = mockDocument
    
    // 创建插件实例
    plugin = new UnocssRuntimePlugin()
  })

  afterEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    delete global.document
  })

  describe('Plugin Basic Properties', () => {
    it('should have correct plugin metadata', () => {
      expect(plugin.name).toBe('UnocssRuntimePlugin')
      expect(plugin.version).toBe('1.0.0')
      expect(plugin.enforce).toBe('pre')
    })

    it('should create plugin with factory function', () => {
      const config: IUnocssRuntimeConfig = {
        injectPosition: 'head',
        enableDevtools: true
      }
      const factoryPlugin = createUnocssRuntimePlugin(config)
      
      expect(factoryPlugin).toBeInstanceOf(UnocssRuntimePlugin)
      expect(factoryPlugin.name).toBe('UnocssRuntimePlugin')
    })
  })

  describe('Plugin Installation', () => {
    it('should install successfully with valid UnoCSS modules', async () => {
      await expect(plugin.install(mockContainer)).resolves.not.toThrow()
    })

    it('should throw error when UnoCSS modules are not available', async () => {
      // Mock import failure
      vi.doMock('@unocss/core', () => {
        throw new Error('Module not found')
      })
      
      const failingPlugin = new UnocssRuntimePlugin()
      await expect(failingPlugin.install(mockContainer)).rejects.toThrow()
    })

    it('should uninstall and cleanup properly', async () => {
      await plugin.install(mockContainer)
      
      // Add some mock collected classes
      plugin.addClassName('test-class another-class')
      expect(plugin.getCollectedClasses()).toHaveLength(2)
      
      await plugin.uninstall(mockContainer)
      
      expect(plugin.getCollectedClasses()).toHaveLength(0)
      expect(plugin.getStats().styleInjected).toBe(false)
    })
  })

  describe('Class Name Collection', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should extract className from props', async () => {
      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = {
        className: 'text-red-500 bg-blue-100',
        otherProp: 'value'
      }

      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      const result = await plugin.onProcessProps(props, mockEficyNode, context, next)

      expect(next).toHaveBeenCalled()
      expect(result).toEqual(props)
      expect(plugin.getCollectedClasses()).toContain('text-red-500')
      expect(plugin.getCollectedClasses()).toContain('bg-blue-100')
    })

    it('should extract class from different class fields', async () => {
      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = {
        className: 'class1',
        class: 'class2',
        '#class': 'class3',
      }

      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      await plugin.onProcessProps(props, mockEficyNode, context, next)

      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('class1')
      expect(collectedClasses).toContain('class2')
      expect(collectedClasses).toContain('class3')
    })

    it('should handle array of class names', async () => {
      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = {
        className: ['class1', 'class2'],
      }

      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      await plugin.onProcessProps(props, mockEficyNode, context, next)

      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('class1')
      expect(collectedClasses).toContain('class2')
    })

    it('should call custom className collector', async () => {
      const customCollector = vi.fn()
      const pluginWithCollector = new UnocssRuntimePlugin({
        classNameCollector: customCollector
      })
      await pluginWithCollector.install(mockContainer)

      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = { className: 'test-class' }
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      await pluginWithCollector.onProcessProps(props, mockEficyNode, context, next)

      expect(customCollector).toHaveBeenCalledWith('test-class')
    })

    it('should manually add class names', () => {
      plugin.addClassName('manual-class1 manual-class2')
      
      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('manual-class1')
      expect(collectedClasses).toContain('manual-class2')
    })

    it('should clear collected classes', () => {
      plugin.addClassName('test-class')
      expect(plugin.getCollectedClasses()).toHaveLength(1)
      
      plugin.clearCollectedClasses()
      expect(plugin.getCollectedClasses()).toHaveLength(0)
    })
  })

  describe('Root Node Identification', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should identify root node without parent', async () => {
      const viewData: IViewData = {
        '#': 'root-node',
        '#view': 'div'
      }

      const context: IBuildSchemaNodeContext = {
        parent: undefined, // 没有父节点，表示是根节点
        schema: { views: [viewData] },
        index: 0,
        path: [],
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const mockEficyNode = new EficyNode(viewData)
      const next = vi.fn().mockResolvedValue(mockEficyNode)
      
      const result = await plugin.onBuildSchemaNode(viewData, context, next)

      expect(next).toHaveBeenCalled()
      expect(result).toBe(mockEficyNode)
      expect(plugin.getStats().rootNodeId).toBe('root-node')
    })

    it('should not override root node if already set', async () => {
      // 先设置一个根节点
      const firstViewData: IViewData = {
        '#': 'first-root',
        '#view': 'div'
      }
      const firstContext: IBuildSchemaNodeContext = {
        parent: undefined,
        schema: { views: [firstViewData] },
        index: 0,
        path: [],
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const firstNode = new EficyNode(firstViewData)
      await plugin.onBuildSchemaNode(firstViewData, firstContext, vi.fn().mockResolvedValue(firstNode))

      // 尝试设置第二个根节点
      const secondViewData: IViewData = {
        '#': 'second-root',
        '#view': 'div'
      }
      const secondContext: IBuildSchemaNodeContext = {
        parent: undefined,
        schema: { views: [secondViewData] },
        index: 0,
        path: [],
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const secondNode = new EficyNode(secondViewData)
      await plugin.onBuildSchemaNode(secondViewData, secondContext, vi.fn().mockResolvedValue(secondNode))

      // 根节点ID应该还是第一个
      expect(plugin.getStats().rootNodeId).toBe('first-root')
    })
  })

  describe('Style Injection', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
      
      // 设置根节点
      const viewData: IViewData = { '#': 'root', '#view': 'div' }
      const context: IBuildSchemaNodeContext = {
        parent: undefined,
        schema: { views: [viewData] },
        index: 0,
        path: [],
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const rootNode = new EficyNode(viewData)
      await plugin.onBuildSchemaNode(viewData, context, vi.fn().mockResolvedValue(rootNode))
      
      // 添加一些类名
      plugin.addClassName('test-class')
    })

    it('should inject styles only for root node', async () => {
      const rootNode = new EficyNode({ '#': 'root', '#view': 'div' })
      const nonRootNode = new EficyNode({ '#': 'child', '#view': 'span' })
      
      const renderContext: IRenderContext = {
        componentMap: {},
        isSSR: false,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const mockElement = { type: 'div', props: {} } as any
      const next = vi.fn().mockResolvedValue(mockElement)

      // 对非根节点调用渲染
      await plugin.onRender(nonRootNode, renderContext, next)
      expect(plugin.getStats().styleInjected).toBe(false)

      // 对根节点调用渲染
      await plugin.onRender(rootNode, renderContext, next)
      expect(plugin.getStats().styleInjected).toBe(true)
    })

    it('should inject styles only once', async () => {
      const rootNode = new EficyNode({ '#': 'root', '#view': 'div' })
      const renderContext: IRenderContext = {
        componentMap: {},
        isSSR: false,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const mockElement = { type: 'div', props: {} } as any
      const next = vi.fn().mockResolvedValue(mockElement)

      // 第一次渲染
      await plugin.onRender(rootNode, renderContext, next)
      expect(plugin.getStats().styleInjected).toBe(true)

      // 重置 mock 调用计数
      mockDocument.createElement.mockClear()
      mockDocument.head.appendChild.mockClear()

      // 第二次渲染
      await plugin.onRender(rootNode, renderContext, next)
      
      // 应该没有再次调用样式注入相关方法
      expect(mockDocument.createElement).not.toHaveBeenCalled()
    })

    it('should not inject styles if no classes collected', async () => {
      // 清空收集的类名
      plugin.clearCollectedClasses()
      
      const rootNode = new EficyNode({ '#': 'root', '#view': 'div' })
      const renderContext: IRenderContext = {
        componentMap: {},
        isSSR: false,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const mockElement = { type: 'div', props: {} } as any
      const next = vi.fn().mockResolvedValue(mockElement)

      await plugin.onRender(rootNode, renderContext, next)
      
      expect(mockDocument.createElement).not.toHaveBeenCalled()
      expect(plugin.getStats().styleInjected).toBe(false)
    })
  })

  describe('Configuration Options', () => {
    it('should use default configuration', () => {
      const defaultPlugin = new UnocssRuntimePlugin()
      const stats = defaultPlugin.getStats()
      
      expect(stats.config.injectPosition).toBe('root')
      expect(stats.config.enableDevtools).toBe(false)
      expect(stats.config.enableHMR).toBe(false)
      expect(stats.config.enableClassnameExtraction).toBe(true)
    })

    it('should use custom configuration', () => {
      const config: IUnocssRuntimeConfig = {
        injectPosition: 'head',
        enableDevtools: true,
        enableHMR: true,
        enableClassnameExtraction: false,
        uno: {
          theme: { colors: { primary: '#blue' } }
        }
      }
      
      const customPlugin = new UnocssRuntimePlugin(config)
      const stats = customPlugin.getStats()
      
      expect(stats.config.injectPosition).toBe('head')
      expect(stats.config.enableDevtools).toBe(true)
      expect(stats.config.enableHMR).toBe(true)
      expect(stats.config.enableClassnameExtraction).toBe(false)
      expect(stats.config.uno.theme.colors.primary).toBe('#blue')
    })

    it('should not collect classes when extraction disabled', async () => {
      const plugin = new UnocssRuntimePlugin({
        enableClassnameExtraction: false
      })
      await plugin.install(mockContainer)

      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = { className: 'should-not-collect' }
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      await plugin.onProcessProps(props, mockEficyNode, context, next)

      expect(plugin.getCollectedClasses()).toHaveLength(0)
    })
  })

  describe('Plugin Statistics', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should provide correct statistics', () => {
      plugin.addClassName('class1 class2')
      
      const stats = plugin.getStats()
      
      expect(stats.collectedClassesCount).toBe(2)
      expect(stats.collectedClasses).toEqual(['class1', 'class2'])
      expect(stats.styleInjected).toBe(false)
      expect(stats.rootNodeId).toBeNull()
      expect(stats.config).toBeDefined()
    })

    it('should update statistics after operations', async () => {
      // 设置根节点
      const viewData: IViewData = { '#': 'root', '#view': 'div' }
      const context: IBuildSchemaNodeContext = {
        parent: undefined,
        schema: { views: [viewData] },
        index: 0,
        path: [],
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const rootNode = new EficyNode(viewData)
      await plugin.onBuildSchemaNode(viewData, context, vi.fn().mockResolvedValue(rootNode))
      
      plugin.addClassName('test-class')
      
      const stats = plugin.getStats()
      expect(stats.rootNodeId).toBe('root')
      expect(stats.collectedClassesCount).toBe(1)
    })
  })

  describe('Manual Control Methods', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should support manual style regeneration', async () => {
      plugin.addClassName('test-class')
      
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation()
      
      await plugin.regenerateStyles()
      
      expect(consoleSpy).toHaveBeenCalledWith('[UnocssRuntimePlugin] Styles regeneration triggered')
      
      consoleSpy.mockRestore()
    })

    it('should not regenerate styles if no uno instance', async () => {
      await plugin.uninstall(mockContainer)
      
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation()
      
      await plugin.regenerateStyles()
      
      expect(consoleSpy).not.toHaveBeenCalledWith('[UnocssRuntimePlugin] Styles regeneration triggered')
      
      consoleSpy.mockRestore()
    })

    it('should not regenerate styles if no classes collected', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation()
      
      await plugin.regenerateStyles()
      
      expect(consoleSpy).not.toHaveBeenCalledWith('[UnocssRuntimePlugin] Styles regeneration triggered')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should handle empty className gracefully', async () => {
      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = {
        className: '',
        class: null,
        '#class': undefined
      }

      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      await plugin.onProcessProps(props, mockEficyNode, context, next)

      expect(plugin.getCollectedClasses()).toHaveLength(0)
    })

    it('should handle malformed class names', () => {
      plugin.addClassName('  class1   class2  ')
      
      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('class1')
      expect(collectedClasses).toContain('class2')
      expect(collectedClasses).not.toContain('')
    })

    it('should handle non-string class names', async () => {
      const mockEficyNode = new EficyNode({
        '#': 'test-node',
        '#view': 'div'
      })

      const props = {
        className: 123,
        class: { invalid: 'object' },
        '#class': ['valid-class', null, undefined, 456]
      }

      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      const next = vi.fn().mockResolvedValue(props)
      await plugin.onProcessProps(props, mockEficyNode, context, next)

      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('valid-class')
      expect(collectedClasses).not.toContain('123')
      expect(collectedClasses).not.toContain('456')
    })
  })

  describe('Document Availability', () => {
    it('should handle server-side rendering (no document)', async () => {
      // @ts-ignore
      delete global.document
      
      await plugin.install(mockContainer)
      plugin.addClassName('test-class')
      
      // 设置根节点
      const viewData: IViewData = { '#': 'root', '#view': 'div' }
      const context: IBuildSchemaNodeContext = {
        parent: undefined,
        schema: { views: [viewData] },
        index: 0,
        path: [],
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const rootNode = new EficyNode(viewData)
      await plugin.onBuildSchemaNode(viewData, context, vi.fn().mockResolvedValue(rootNode))
      
      // 渲染时应该不会抛出错误
      const renderContext: IRenderContext = {
        componentMap: {},
        isSSR: true,
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const mockElement = { type: 'div', props: {} } as any
      const next = vi.fn().mockResolvedValue(mockElement)

      await expect(plugin.onRender(rootNode, renderContext, next)).resolves.not.toThrow()
    })
  })
})