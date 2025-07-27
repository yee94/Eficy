/**
 * UnoCSS Runtime Plugin Integration Tests
 * 
 * This test file tests the integration of the UnoCSS Plugin with the Eficy framework
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Eficy from '../../src/core/Eficy'
import type { IEficySchema, IViewData } from '../../src/interfaces'
import type { ILifecyclePlugin, IBuildSchemaNodeContext, IProcessPropsContext, IRenderContext } from '../../src/interfaces/lifecycle'
import type EficyNode from '../../src/models/EficyNode'
import { BuildSchemaNode, ProcessProps, Render } from '../../src/decorators/lifecycle'

// Mock UnoCSS modules for integration testing
vi.mock('@unocss/core', () => ({
  createGenerator: vi.fn(() => ({
    generate: vi.fn(async (input: string) => ({
      css: `
        .text-red-500 { color: rgb(239, 68, 68); }
        .bg-blue-100 { background-color: rgb(219, 234, 254); }
        .p-4 { padding: 1rem; }
        .rounded { border-radius: 0.25rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      `.trim(),
      matched: new Set(['text-red-500', 'bg-blue-100', 'p-4', 'rounded', 'shadow-lg'])
    }))
  }))
}))

vi.mock('@unocss/preset-uno', () => ({
  presetUno: vi.fn(() => ({ name: 'uno' }))
}))

// Create a properly integrated UnoCSS plugin for integration testing
class MockUnocssRuntimePlugin implements ILifecyclePlugin {
  public readonly name = 'UnocssRuntimePlugin'
  public readonly version = '1.0.0'
  public readonly enforce = 'pre' as const

  private collectedClasses = new Set<string>()
  private styleInjected = false
  private rootNodeId: string | null = null

  async install() {
    // Mock installation for integration testing
  }

  async uninstall() {
    this.collectedClasses.clear()
    this.styleInjected = false
    this.rootNodeId = null
  }

  // Use decorators to properly register lifecycle hooks
  @BuildSchemaNode(10)
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

  @ProcessProps(10)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const processedProps = await next()
    
    console.log('MockUnocssRuntimePlugin onProcessProps called:', {
      props,
      processedProps,
      className: processedProps.className,
      nodeId: eficyNode['#']
    })
    
    // Extract classes from className
    if (processedProps.className) {
      const classes = String(processedProps.className).split(/\s+/)
      classes.forEach(cls => {
        if (cls.trim()) {
          console.log('Collecting class:', cls.trim())
          this.collectedClasses.add(cls.trim())
        }
      })
    }

    console.log('Current collected classes:', Array.from(this.collectedClasses))
    return processedProps
  }

  @Render(100)
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<React.ReactElement>
  ): Promise<React.ReactElement> {
    const element = await next()
    
    // Inject styles for root node
    if (eficyNode['#'] === this.rootNodeId && !this.styleInjected && this.collectedClasses.size > 0) {
      this.injectStyles()
      this.styleInjected = true
    }
    
    return element
  }

  private injectStyles() {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('unocss-runtime')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      const style = document.createElement('style')
      style.id = 'unocss-runtime'
      style.textContent = `
        .text-red-500 { color: rgb(239, 68, 68); }
        .bg-blue-100 { background-color: rgb(219, 234, 254); }
        .p-4 { padding: 1rem; }
        .rounded { border-radius: 0.25rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      `
      document.head.appendChild(style)
    }
  }

  getStats() {
    return {
      collectedClassesCount: this.collectedClasses.size,
      collectedClasses: Array.from(this.collectedClasses),
      styleInjected: this.styleInjected,
      rootNodeId: this.rootNodeId
    }
  }
}

describe('UnoCSS Runtime Plugin Integration', () => {
  let eficy: Eficy
  let plugin: MockUnocssRuntimePlugin

  beforeEach(() => {
    eficy = new Eficy()
    plugin = new MockUnocssRuntimePlugin()
    
    // Register the plugin
    eficy.registerPlugin(plugin)
    
    // Configure basic component mapping
    eficy.config({
      componentMap: {
        // HTML elements are automatically available
      }
    })

    console.log('Registered plugins:', eficy.getPluginManager().getAllPlugins().map(p => p.name))
    console.log('Hook stats:', eficy.getPluginManager().getHookStats())
  })

  afterEach(async () => {
    await plugin.uninstall()
    
    // Clean up injected styles
    const existingStyle = document.getElementById('unocss-runtime')
    if (existingStyle) {
      existingStyle.remove()
    }
  })

  describe('Basic Integration', () => {
    it('should register plugin successfully', () => {
      const pluginManager = eficy.getPluginManager()
      const registeredPlugin = pluginManager.getPlugin('UnocssRuntimePlugin')
      
      expect(registeredPlugin).toBeDefined()
      expect(registeredPlugin?.name).toBe('UnocssRuntimePlugin')
    })

    it('should render schema with UnoCSS classes', async () => {
      const schema: IEficySchema = {
        views: [
          {
            '#': 'app',
            '#view': 'div',
            className: 'p-4 bg-blue-100',
            '#children': [
              {
                '#': 'title',
                '#view': 'h1',
                className: 'text-red-500 text-2xl',
                '#content': 'Hello UnoCSS!'
              }
            ]
          }
        ]
      }

      const element = await eficy.createElement(schema)
      render(element!)

      // Check if the content is rendered
      expect(screen.getByText('Hello UnoCSS!')).toBeInTheDocument()
      
      // Check if classes were collected
      const stats = plugin.getStats()
      expect(stats.collectedClasses).toContain('p-4')
      expect(stats.collectedClasses).toContain('bg-blue-100')
      expect(stats.collectedClasses).toContain('text-red-500')
      expect(stats.collectedClasses).toContain('text-2xl')
    })

    it('should inject styles to document head', async () => {
      const schema: IEficySchema = {
        views: [
          {
            '#': 'card',
            '#view': 'div',
            className: 'p-4 rounded shadow-lg',
            '#content': 'Styled Card'
          }
        ]
      }

      await eficy.createElement(schema)
      
      // Check if styles were injected
      const injectedStyle = document.getElementById('unocss-runtime')
      expect(injectedStyle).toBeTruthy()
      expect(injectedStyle?.textContent).toContain('.p-4')
      expect(injectedStyle?.textContent).toContain('.rounded')
      expect(injectedStyle?.textContent).toContain('.shadow-lg')
    })
  })

  describe('Complex Schema Integration', () => {
    it('should handle nested components with classes', async () => {
      const schema: IEficySchema = {
        views: [
          {
            '#': 'layout',
            '#view': 'div',
            className: 'min-h-screen bg-gray-100',
            '#children': [
              {
                '#': 'header',
                '#view': 'header',
                className: 'bg-white shadow-md p-6',
                '#children': [
                  {
                    '#': 'nav',
                    '#view': 'nav',
                    className: 'flex justify-between items-center',
                    '#children': [
                      {
                        '#': 'logo',
                        '#view': 'span',
                        className: 'text-xl font-bold text-blue-600',
                        '#content': 'My App'
                      },
                      {
                        '#': 'menu',
                        '#view': 'ul',
                        className: 'flex space-x-4',
                        '#children': [
                          {
                            '#': 'menu-item-1',
                            '#view': 'li',
                            '#children': [
                              {
                                '#': 'home-link',
                                '#view': 'a',
                                className: 'text-gray-700 hover:text-blue-600',
                                href: '#',
                                '#content': 'Home'
                              }
                            ]
                          },
                          {
                            '#': 'menu-item-2',
                            '#view': 'li',
                            '#children': [
                              {
                                '#': 'about-link',
                                '#view': 'a',
                                className: 'text-gray-700 hover:text-blue-600',
                                href: '#',
                                '#content': 'About'
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                '#': 'main',
                '#view': 'main',
                className: 'container mx-auto px-4 py-8',
                '#children': [
                  {
                    '#': 'hero',
                    '#view': 'section',
                    className: 'text-center mb-12',
                    '#children': [
                      {
                        '#': 'hero-title',
                        '#view': 'h1',
                        className: 'text-4xl font-bold text-gray-900 mb-4',
                        '#content': 'Welcome to UnoCSS Integration'
                      },
                      {
                        '#': 'hero-subtitle',
                        '#view': 'p',
                        className: 'text-xl text-gray-600 max-w-2xl mx-auto',
                        '#content': 'Experience real-time CSS generation with Eficy framework'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      const element = await eficy.createElement(schema)
      render(element!)

      // Check if nested content is rendered correctly
      expect(screen.getByText('My App')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Welcome to UnoCSS Integration')).toBeInTheDocument()
      expect(screen.getByText('Experience real-time CSS generation with Eficy framework')).toBeInTheDocument()

      // Check if all classes were collected
      const stats = plugin.getStats()
      const expectedClasses = [
        'min-h-screen', 'bg-gray-100', 'bg-white', 'shadow-md', 'p-6',
        'flex', 'justify-between', 'items-center', 'text-xl', 'font-bold',
        'text-blue-600', 'space-x-4', 'text-gray-700', 'hover:text-blue-600',
        'container', 'mx-auto', 'px-4', 'py-8', 'text-center', 'mb-12',
        'text-4xl', 'text-gray-900', 'mb-4', 'text-gray-600', 'max-w-2xl'
      ]

      expectedClasses.forEach(className => {
        expect(stats.collectedClasses).toContain(className)
      })
    })

    it('should handle conditional rendering with classes', async () => {
      const showAlert = true
      
      const schema: IEficySchema = {
        views: [
          {
            '#': 'container',
            '#view': 'div',
            className: 'p-8',
            '#children': [
              {
                '#': 'alert',
                '#view': 'div',
                '#if': showAlert,
                className: 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded',
                '#content': 'Success! Your changes have been saved.'
              },
              {
                '#': 'content',
                '#view': 'div',
                className: 'mt-4',
                '#children': [
                  {
                    '#': 'paragraph',
                    '#view': 'p',
                    className: 'text-gray-800',
                    '#content': 'This is the main content.'
                  }
                ]
              }
            ]
          }
        ]
      }

      const element = await eficy.createElement(schema)
      render(element!)

      // Check if conditional content is rendered
      expect(screen.getByText('Success! Your changes have been saved.')).toBeInTheDocument()
      expect(screen.getByText('This is the main content.')).toBeInTheDocument()

      // Check if conditional classes were collected
      const stats = plugin.getStats()
      expect(stats.collectedClasses).toContain('bg-green-100')
      expect(stats.collectedClasses).toContain('border-green-400')
      expect(stats.collectedClasses).toContain('text-green-700')
    })
  })

  describe('Plugin Statistics and Monitoring', () => {
    it('should provide accurate statistics', async () => {
      const schema: IEficySchema = {
        views: [
          {
            '#': 'stats-demo',
            '#view': 'div',
            className: 'p-4 bg-white rounded-lg shadow',
            '#children': [
              {
                '#': 'title',
                '#view': 'h2',
                className: 'text-2xl font-semibold mb-4',
                '#content': 'Statistics Demo'
              },
              {
                '#': 'grid',
                '#view': 'div',
                className: 'grid grid-cols-3 gap-4',
                '#children': [
                  {
                    '#': 'item-1',
                    '#view': 'div',
                    className: 'text-center p-2 bg-blue-50 rounded',
                    '#content': 'Item 1'
                  },
                  {
                    '#': 'item-2',
                    '#view': 'div',
                    className: 'text-center p-2 bg-green-50 rounded',
                    '#content': 'Item 2'
                  },
                  {
                    '#': 'item-3',
                    '#view': 'div',
                    className: 'text-center p-2 bg-red-50 rounded',
                    '#content': 'Item 3'
                  }
                ]
              }
            ]
          }
        ]
      }

      await eficy.createElement(schema)
      
      const stats = plugin.getStats()
      
      // Check statistics accuracy
      expect(stats.collectedClassesCount).toBeGreaterThan(0)
      expect(stats.collectedClasses).toContain('p-4')
      expect(stats.collectedClasses).toContain('bg-white')
      expect(stats.collectedClasses).toContain('rounded-lg')
      expect(stats.collectedClasses).toContain('shadow')
      expect(stats.collectedClasses).toContain('text-2xl')
      expect(stats.collectedClasses).toContain('font-semibold')
      expect(stats.collectedClasses).toContain('mb-4')
      expect(stats.collectedClasses).toContain('grid')
      expect(stats.collectedClasses).toContain('grid-cols-3')
      expect(stats.collectedClasses).toContain('gap-4')
      expect(stats.collectedClasses).toContain('text-center')
      expect(stats.collectedClasses).toContain('p-2')
      expect(stats.collectedClasses).toContain('bg-blue-50')
      expect(stats.collectedClasses).toContain('bg-green-50')
      expect(stats.collectedClasses).toContain('bg-red-50')
      expect(stats.collectedClasses).toContain('rounded')
      
      expect(stats.rootNodeId).toBe('stats-demo')
      expect(stats.styleInjected).toBe(true)
    })

    it('should track plugin lifecycle correctly', async () => {
      const initialStats = plugin.getStats()
      expect(initialStats.collectedClassesCount).toBe(0)
      expect(initialStats.styleInjected).toBe(false)
      expect(initialStats.rootNodeId).toBeNull()

      const schema: IEficySchema = {
        views: [
          {
            '#': 'lifecycle-test',
            '#view': 'div',
            className: 'p-8 bg-yellow-100',
            '#content': 'Lifecycle Test'
          }
        ]
      }

      await eficy.createElement(schema)
      
      const finalStats = plugin.getStats()
      expect(finalStats.collectedClassesCount).toBe(2)
      expect(finalStats.collectedClasses).toEqual(['p-8', 'bg-yellow-100'])
      expect(finalStats.styleInjected).toBe(true)
      expect(finalStats.rootNodeId).toBe('lifecycle-test')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large schemas efficiently', async () => {
      // Generate a large schema with many classes
      const generateItems = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
          '#': `item-${i}`,
          '#view': 'div',
          className: `p-${i % 4 + 1} m-${i % 3 + 1} bg-gray-${(i % 9 + 1) * 100}`,
          '#content': `Item ${i}`
        }))
      }

      const schema: IEficySchema = {
        views: [
          {
            '#': 'large-container',
            '#view': 'div',
            className: 'container mx-auto p-4',
            '#children': [
              {
                '#': 'grid-container',
                '#view': 'div',
                className: 'grid grid-cols-5 gap-2',
                '#children': generateItems(50) // 50 items
              }
            ]
          }
        ]
      }

      const startTime = performance.now()
      const element = await eficy.createElement(schema)
      const endTime = performance.now()
      
      render(element!)

      // Check performance (should complete within reasonable time)
      expect(endTime - startTime).toBeLessThan(1000) // Less than 1 second

      // Check if content is rendered
      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.getByText('Item 49')).toBeInTheDocument()

      // Check if classes were collected efficiently
      const stats = plugin.getStats()
      expect(stats.collectedClassesCount).toBeGreaterThan(50) // Should have many unique classes
    })

    it('should handle duplicate classes correctly', async () => {
      const schema: IEficySchema = {
        views: [
          {
            '#': 'duplicate-test',
            '#view': 'div',
            className: 'p-4 bg-white',
            '#children': [
              {
                '#': 'child-1',
                '#view': 'div',
                className: 'p-4 text-black', // p-4 is duplicate
                '#content': 'Child 1'
              },
              {
                '#': 'child-2',
                '#view': 'div',
                className: 'bg-white text-black', // bg-white and text-black are duplicates
                '#content': 'Child 2'
              }
            ]
          }
        ]
      }

      await eficy.createElement(schema)
      
      const stats = plugin.getStats()
      
      // Should not have duplicates in collected classes
      const uniqueClasses = Array.from(new Set(stats.collectedClasses))
      expect(stats.collectedClasses.length).toBe(uniqueClasses.length)
      
      // Should contain all unique classes
      expect(stats.collectedClasses).toContain('p-4')
      expect(stats.collectedClasses).toContain('bg-white')
      expect(stats.collectedClasses).toContain('text-black')
    })

    it('should handle empty and undefined classes gracefully', async () => {
      const schema: IEficySchema = {
        views: [
          {
            '#': 'empty-test',
            '#view': 'div',
            className: '', // Empty class
            '#children': [
              {
                '#': 'child-1',
                '#view': 'div',
                // No className property
                '#content': 'Child 1'
              },
              {
                '#': 'child-2',
                '#view': 'div',
                className: '   ', // Whitespace only
                '#content': 'Child 2'
              },
              {
                '#': 'child-3',
                '#view': 'div',
                className: 'valid-class',
                '#content': 'Child 3'
              }
            ]
          }
        ]
      }

      const element = await eficy.createElement(schema)
      render(element!)

      // Should render without errors
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()

      // Should only collect valid classes
      const stats = plugin.getStats()
      expect(stats.collectedClasses).toEqual(['valid-class'])
    })
  })
})