/**
 * UnoCSS Runtime Plugin Tests (Runtime Generation Focus)
 * 
 * This test file focuses on testing the runtime CSS generation capabilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DependencyContainer, container } from 'tsyringe'
import EficyNode from '../../src/models/EficyNode'
import type { IViewData, IProcessPropsContext, IBuildSchemaNodeContext, IRenderContext } from '../../src/interfaces'
// Runtime CSS generation focused tests

// Create a runtime-focused test version of the plugin
class TestUnocssRuntimePlugin {
  public readonly name = 'UnocssRuntimePlugin'
  public readonly version = '1.0.0'
  public readonly enforce = 'pre' as const

  private config: any
  private uno: any = null
  private collectedClasses = new Set<string>()
  private styleInjected = false
  private rootNodeId: string | null = null

  constructor(config: any = {}) {
    this.config = {
      injectPosition: 'head',
      enableDevtools: false,
      enableHMR: false,
      enableClassnameExtraction: true,
      generateOptions: {
        preflights: false,
        safelist: true,
        minify: false
      },
      ...config,
      generateOptions: {
        preflights: false,
        safelist: true,
        minify: false,
        ...config.generateOptions
      }
    }
  }

  async install(container: DependencyContainer): Promise<void> {
    // Create a more realistic mock generator for runtime testing
    this.uno = this.createRuntimeGenerator()
  }

  async uninstall(container: DependencyContainer): Promise<void> {
    this.collectedClasses.clear()
    this.styleInjected = false
    this.rootNodeId = null
    this.uno = null
  }

  private createRuntimeGenerator(): any {
    return {
      generate: vi.fn(async (input: string, options?: any) => {
        // ealistic CSS generation
        const classes = input.split(/\s+/).filter(Boolean)
        const cssRules: string[] = []
        const matched = new Set<string>()

        for (const cls of classes) {
          // Simulate different types of CSS generation
          if (cls.startsWith('text-')) {
            const color = cls.replace('text-', '')
            cssRules.push(`.${cls} { color: var(--un-text-${color}); }`)
            matched.add(cls)
          } else if (cls.startsWith('bg-')) {
            const color = cls.replace('bg-', '')
            cssRules.push(`.${cls} { background-color: var(--un-bg-${color}); }`)
            matched.add(cls)
          } else if (cls.startsWith('p-')) {
            const size = cls.replace('p-', '')
            cssRules.push(`.${cls} { padding: ${size === '4' ? '1rem' : size + 'px'}; }`)
            matched.add(cls)
          } else if (cls.startsWith('m-')) {
            const size = cls.replace('m-', '')
            cssRules.push(`.${cls} { margin: ${size === '4' ? '1rem' : size + 'px'}; }`)
            matched.add(cls)
          } else if (cls.startsWith('grid-cols-')) {
            const cols = cls.replace('grid-cols-', '')
            const template = Array.from({ length: Number(cols) }, () => '1fr').join(' ')
            cssRules.push(`.${cls} { grid-template-columns: ${template}; }`)
            matched.add(cls)
          } else if (cls === 'flex') {
            cssRules.push(`.${cls} { display: flex; }`)
            matched.add(cls)
          } else if (cls === 'grid') {
            cssRules.push(`.${cls} { display: grid; }`)
            matched.add(cls)
          } else if (cls.includes('rounded')) {
            cssRules.push(`.${cls} { border-radius: 0.25rem; }`)
            matched.add(cls)
          } else {
            // Generic fallback
            cssRules.push(`.${cls} { /* Generated for ${cls} */ }`)
            matched.add(cls)
          }
        }

        return {
          css: cssRules.join('\n'),
          matched
        }
      })
    }
  }

  async onBuildSchemaNode(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<EficyNode>
  ): Promise<EficyNode> {
    const node = await next()
    
    if (!context.parent && !this.rootNodeId) {
      this.rootNodeId = node['#']
    }
    
    return node
  }

  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const processedProps = await next()
    
    if (!this.config.enableClassnameExtraction || !this.uno) {
      return processedProps
    }

    const classNames = this.extractClassNames(processedProps)
    
    if (classNames.length > 0) {
      classNames.forEach(className => {
        if (className && typeof className === 'string') {
          className.split(/\s+/).forEach(cls => {
            if (cls.trim()) {
              this.collectedClasses.add(cls.trim())
              
              if (this.config.classNameCollector) {
                this.config.classNameCollector(cls.trim())
              }
            }
          })
        }
      })
    }

    return processedProps
  }

  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<React.ReactElement>
  ): Promise<React.ReactElement> {
    const element = await next()
    
    if (eficyNode['#'] === this.rootNodeId && !this.styleInjected && this.collectedClasses.size > 0) {
      await this.injectStyles(element)
      this.styleInjected = true
    }
    
    return element
  }

  private extractClassNames(props: Record<string, any>): string[] {
    const classNames: string[] = []
    const classFields = ['className', 'class', '#class']
    
    classFields.forEach(field => {
      const value = props[field]
      if (value) {
        if (typeof value === 'string') {
          classNames.push(value)
        } else if (Array.isArray(value)) {
          classNames.push(...value.filter(v => typeof v === 'string'))
        }
      }
    })
    
    return classNames
  }

  private async injectStyles(rootElement: React.ReactElement): Promise<void> {
    if (!this.uno || this.collectedClasses.size === 0) {
      return
    }

    try {
      const classArray = Array.from(this.collectedClasses)
      
      // Handle safelist - merge with collected classes
      let allClasses = [...classArray]
      if (this.config.generateOptions?.safelist && this.config.uno?.safelist) {
        allClasses = [...allClasses, ...this.config.uno.safelist]
      }
      
      const generateOptions = {
        preflights: this.config.generateOptions?.preflights || false,
        safelist: this.config.generateOptions?.safelist !== false,
        minify: this.config.generateOptions?.minify || false
      }
      
      const result = await this.uno.generate(allClasses.join(' '), generateOptions)
      
      if (result.css) {
        let finalCss = result.css
        
        // Apply minification if enabled
        if (this.config.generateOptions?.minify) {
          finalCss = this.minifyCSS(finalCss)
        }
        
        this.injectToHead(finalCss)
      }
    } catch (error) {
      console.error('[UnocssRuntimePlugin] Failed to generate styles:', error)
    }
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon
      .replace(/\s*{\s*/g, '{') // Clean braces
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') // Clean semicolons
      .trim()
  }

  private injectToHead(css: string): void {
    if (typeof document !== 'undefined') {
      const styleId = 'unocss-runtime-test'
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
      
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = css
      document.head.appendChild(style)
    }
  }

  // Public API methods
  addClassName(className: string): void {
    if (className && typeof className === 'string') {
      className.split(/\s+/).forEach(cls => {
        if (cls.trim()) {
          this.collectedClasses.add(cls.trim())
        }
      })
    }
  }

  getCollectedClasses(): string[] {
    return Array.from(this.collectedClasses)
  }

  clearCollectedClasses(): void {
    this.collectedClasses.clear()
    this.styleInjected = false
  }

  getStats(): Record<string, any> {
    return {
      collectedClassesCount: this.collectedClasses.size,
      collectedClasses: Array.from(this.collectedClasses),
      styleInjected: this.styleInjected,
      rootNodeId: this.rootNodeId,
      config: this.config
    }
  }

  async regenerateStyles(): Promise<void> {
    if (this.uno && this.collectedClasses.size > 0) {
      this.styleInjected = false
      console.debug('[UnocssRuntimePlugin] Styles regeneration triggered')
    }
  }

  async generateCSS(classes: string | string[]): Promise<{ css: string; matched?: Set<string> } | null> {
    if (!this.uno) {
      console.warn('[UnocssRuntimePlugin] Generator not initialized')
      return null
    }

    try {
      let inputClasses = Array.isArray(classes) ? classes : classes.split(/\s+/)
      
      // Handle safelist - merge with input classes if enabled
      if (this.config.generateOptions?.safelist && this.config.uno?.safelist) {
        inputClasses = [...inputClasses, ...this.config.uno.safelist]
      }
      
      const input = inputClasses.join(' ')
      const generateOptions = {
        preflights: this.config.generateOptions?.preflights || false,
        safelist: this.config.generateOptions?.safelist !== false,
        minify: this.config.generateOptions?.minify || false
      }
      
      const result = await this.uno.generate(input, generateOptions)
      
      if (result.css && this.config.generateOptions?.minify) {
        result.css = this.minifyCSS(result.css)
      }
      
      return result
    } catch (error) {
      console.error('[UnocssRuntimePlugin] Failed to generate CSS:', error)
      return null
    }
  }

  getGenerator(): any {
    return this.uno
  }
}

describe('UnoCSS Runtime Plugin (Runtime Generation)', () => {
  let plugin: TestUnocssRuntimePlugin
  let mockContainer: DependencyContainer
  let mockDocument: any

  beforeEach(() => {
    mockContainer = container.createChildContainer()
    
    mockDocument = {
      head: {
        appendChild: vi.fn(),
      },
      getElementById: vi.fn(),
      createElement: vi.fn((tag: string) => ({
        id: '',
        textContent: '',
        remove: vi.fn()
      }))
    }
    
    global.document = mockDocument
    plugin = new TestUnocssRuntimePlugin()
  })

  afterEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    delete global.document
  })

  describe('Runtime CSS Generation', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should generate CSS for utility classes', async () => {
      const classes = 'text-red-500 bg-blue-100 p-4 m-2'
      const result = await plugin.generateCSS(classes)
      
      expect(result).toBeTruthy()
      expect(result!.css).toContain('.text-red-500')
      expect(result!.css).toContain('.bg-blue-100')
      expect(result!.css).toContain('.p-4')
      expect(result!.css).toContain('.m-2')
      expect(result!.matched?.size).toBe(4)
    })

    it('should handle grid-cols classes correctly', async () => {
      const classes = 'grid grid-cols-3 grid-cols-12'
      const result = await plugin.generateCSS(classes)
      
      expect(result).toBeTruthy()
      expect(result!.css).toContain('grid-template-columns: 1fr 1fr 1fr')
      expect(result!.css).toContain('grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr')
      expect(result!.matched?.has('grid-cols-3')).toBe(true)
      expect(result!.matched?.has('grid-cols-12')).toBe(true)
    })

    it('should handle flex and layout classes', async () => {
      const classes = 'flex grid rounded'
      const result = await plugin.generateCSS(classes)
      
      expect(result).toBeTruthy()
      expect(result!.css).toContain('display: flex')
      expect(result!.css).toContain('display: grid')
      expect(result!.css).toContain('border-radius: 0.25rem')
    })

    it('should process safelist classes', async () => {
      const pluginWithSafelist = new TestUnocssRuntimePlugin({
        uno: {
          safelist: ['text-blue-500', 'bg-red-100']
        },
        generateOptions: {
          safelist: true
        }
      })
      await pluginWithSafelist.install(mockContainer)

      const classes = 'text-red-500'
      const result = await pluginWithSafelist.generateCSS(classes)
      
      expect(result).toBeTruthy()
      expect(result!.css).toContain('.text-red-500')
      expect(result!.css).toContain('.text-blue-500')
      expect(result!.css).toContain('.bg-red-100')
    })

    it('should minify CSS when enabled', async () => {
      const pluginWithMinify = new TestUnocssRuntimePlugin({
        generateOptions: {
          minify: true
        }
      })
      await pluginWithMinify.install(mockContainer)

      const classes = 'text-red-500 bg-blue-100'
      const result = await pluginWithMinify.generateCSS(classes)
      
      expect(result).toBeTruthy()
      // Should not contain extra whitespace or comments
      expect(result!.css).not.toMatch(/\s{2,}/)
      expect(result!.css).not.toContain('/*')
      expect(result!.css.trim()).toBe(result!.css)
    })

    it('should handle empty input gracefully', async () => {
      const result1 = await plugin.generateCSS('')
      const result2 = await plugin.generateCSS([])
      
      expect(result1).toBeTruthy()
      expect(result1!.css).toBe('')
      expect(result2).toBeTruthy()
      expect(result2!.css).toBe('')
    })

    it('should handle invalid classes gracefully', async () => {
      const classes = 'invalid-class-that-does-not-exist'
      const result = await plugin.generateCSS(classes)
      
      expect(result).toBeTruthy()
      // Should still generate something (generic fallback)
      expect(result!.css).toContain('invalid-class-that-does-not-exist')
    })
  })

  describe('Runtime Collection and Generation Integration', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
      
      // Set up root node
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
    })

    it('should collect classes and generate styles in workflow', async () => {
      // Simulate collecting classes from multiple components
      const mockEficyNode1 = new EficyNode({ '#': 'node1', '#view': 'div' })
      const mockEficyNode2 = new EficyNode({ '#': 'node2', '#view': 'span' })
      
      const props1 = { className: 'text-red-500 bg-white' }
      const props2 = { className: 'p-4 grid-cols-3' }
      
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: {},
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      // Process props to collect classes
      await plugin.onProcessProps(props1, mockEficyNode1, context, vi.fn().mockResolvedValue(props1))
      await plugin.onProcessProps(props2, mockEficyNode2, context, vi.fn().mockResolvedValue(props2))

      // Verify classes were collected
      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('text-red-500')
      expect(collectedClasses).toContain('bg-white')
      expect(collectedClasses).toContain('p-4')
      expect(collectedClasses).toContain('grid-cols-3')

      // Simulate rendering root node (should trigger style injection)
      const rootNode = new EficyNode({ '#': 'root', '#view': 'div' })
      const renderContext: IRenderContext = {
        componentMap: {},
        isSSR: false,
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      
      const mockElement = { type: 'div', props: {} } as any
      await plugin.onRender(rootNode, renderContext, vi.fn().mockResolvedValue(mockElement))

      // Verify style injection
      expect(plugin.getStats().styleInjected).toBe(true)
      expect(mockDocument.createElement).toHaveBeenCalledWith('style')
      expect(mockDocument.head.appendChild).toHaveBeenCalled()
    })

    it('should handle class collection from different field names', async () => {
      const mockEficyNode = new EficyNode({ '#': 'node', '#view': 'div' })
      
      const props = {
        className: 'class-from-className',
        class: 'class-from-class',
        '#class': 'class-from-hash-class'
      }
      
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      await plugin.onProcessProps(props, mockEficyNode, context, vi.fn().mockResolvedValue(props))

      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('class-from-className')
      expect(collectedClasses).toContain('class-from-class')
      expect(collectedClasses).toContain('class-from-hash-class')
    })

    it('should handle array className format', async () => {
      const mockEficyNode = new EficyNode({ '#': 'node', '#view': 'div' })
      
      const props = {
        className: ['array-class-1', 'array-class-2'],
        '#class': ['hash-array-1', 'hash-array-2']
      }
      
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      await plugin.onProcessProps(props, mockEficyNode, context, vi.fn().mockResolvedValue(props))

      const collectedClasses = plugin.getCollectedClasses()
      expect(collectedClasses).toContain('array-class-1')
      expect(collectedClasses).toContain('array-class-2')
      expect(collectedClasses).toContain('hash-array-1')
      expect(collectedClasses).toContain('hash-array-2')
    })
  })

  describe('Configuration Options', () => {
    it('should respect generateOptions configuration', async () => {
      const customConfig = {
        generateOptions: {
          preflights: true,
          safelist: false,
          minify: true
        }
      }
      
      const customPlugin = new TestUnocssRuntimePlugin(customConfig)
      await customPlugin.install(mockContainer)

      expect(customPlugin.getStats().config.generateOptions.preflights).toBe(true)
      expect(customPlugin.getStats().config.generateOptions.safelist).toBe(false)
      expect(customPlugin.getStats().config.generateOptions.minify).toBe(true)
    })

    it('should use default generateOptions when not specified', () => {
      const plugin = new TestUnocssRuntimePlugin()
      
      expect(plugin.getStats().config.generateOptions.preflights).toBe(false)
      expect(plugin.getStats().config.generateOptions.safelist).toBe(true)
      expect(plugin.getStats().config.generateOptions.minify).toBe(false)
    })

    it('should disable class collection when configured', async () => {
      const pluginWithoutCollection = new TestUnocssRuntimePlugin({
        enableClassnameExtraction: false
      })
      await pluginWithoutCollection.install(mockContainer)

      const mockEficyNode = new EficyNode({ '#': 'node', '#view': 'div' })
      const props = { className: 'should-not-be-collected' }
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      await pluginWithoutCollection.onProcessProps(props, mockEficyNode, context, vi.fn().mockResolvedValue(props))

      expect(pluginWithoutCollection.getCollectedClasses()).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle generator not initialized', async () => {
      const uninitializedPlugin = new TestUnocssRuntimePlugin()
      // Don't call install()

      const result = await uninitializedPlugin.generateCSS('test-class')
      expect(result).toBeNull()
    })

    it('should handle CSS generation errors gracefully', async () => {
      await plugin.install(mockContainer)
      
      // Mock the generator to throw an error
      plugin.getGenerator().generate.mockRejectedValue(new Error('Generation failed'))

      const result = await plugin.generateCSS('test-class')
      expect(result).toBeNull()
    })

    it('should handle DOM not available (SSR)', async () => {
      // @ts-ignore
      delete global.document
      
      await plugin.install(mockContainer)
      plugin.addClassName('test-class')
      
      // Should not throw errors
      const rootNode = new EficyNode({ '#': 'root', '#view': 'div' })
      const renderContext: IRenderContext = {
        componentMap: {},
        isSSR: true,
        timestamp: Date.now(),
        requestId: 'test-request'
      }
      const mockElement = { type: 'div', props: {} } as any

      await expect(
        plugin.onRender(rootNode, renderContext, vi.fn().mockResolvedValue(mockElement))
      ).resolves.not.toThrow()
    })
  })

  describe('Advanced Features', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should provide generator access for advanced usage', () => {
      const generator = plugin.getGenerator()
      expect(generator).toBeTruthy()
      expect(typeof generator.generate).toBe('function')
    })

    it('should support manual style regeneration', async () => {
      plugin.addClassName('manual-class')
      
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation()
      
      await plugin.regenerateStyles()
      
      expect(consoleSpy).toHaveBeenCalledWith('[UnocssRuntimePlugin] Styles regeneration triggered')
      
      consoleSpy.mockRestore()
    })

    it('should handle custom class name collector', async () => {
      const customCollector = vi.fn()
      const pluginWithCollector = new TestUnocssRuntimePlugin({
        classNameCollector: customCollector
      })
      await pluginWithCollector.install(mockContainer)

      const mockEficyNode = new EficyNode({ '#': 'node', '#view': 'div' })
      const props = { className: 'collected-class' }
      const context: IProcessPropsContext = {
        component: 'div' as any,
        originalProps: props,
        timestamp: Date.now(),
        requestId: 'test-request'
      }

      await pluginWithCollector.onProcessProps(props, mockEficyNode, context, vi.fn().mockResolvedValue(props))

      expect(customCollector).toHaveBeenCalledWith('collected-class')
    })
  })

  describe('Performance and Optimization', () => {
    beforeEach(async () => {
      await plugin.install(mockContainer)
    })

    it('should handle large number of classes efficiently', async () => {
      const largeClassList = Array.from({ length: 100 }, (_, i) => `class-${i}`).join(' ')
      
      const startTime = performance.now()
      const result = await plugin.generateCSS(largeClassList)
      const endTime = performance.now()
      
      expect(result).toBeTruthy()
      expect(result!.matched?.size).toBe(100)
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
    })

    it('should deduplicate classes correctly', async () => {
      const duplicateClasses = 'text-red-500 bg-blue-100 text-red-500 bg-blue-100'
      const result = await plugin.generateCSS(duplicateClasses)
      
      expect(result).toBeTruthy()
      expect(result!.matched?.size).toBe(2) // Only unique classes
    })

    it('should handle empty and whitespace classes', async () => {
      const messyClasses = '  text-red-500   bg-blue-100  '
      const result = await plugin.generateCSS(messyClasses)
      
      expect(result).toBeTruthy()
      expect(result!.matched?.size).toBe(2)
      expect(result!.matched?.has('text-red-500')).toBe(true)
      expect(result!.matched?.has('bg-blue-100')).toBe(true)
    })
  })
})