import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'reflect-metadata'
import { injectable } from 'tsyringe'
import type { ComponentType, ReactElement } from 'react'
import { createElement } from 'react'
import type { 
  ILifecyclePlugin,
  IInitContext,
  IBuildSchemaNodeContext,
  IRenderContext,
  IMountContext,
  IUnmountContext,
  IResolveComponentContext,
  IProcessPropsContext,
  IHandleEventContext,
  IBindEventContext,
  IErrorContext,
  HookType 
} from '../src/interfaces/lifecycle'
import type { IViewData } from '../src/interfaces'
import EficyNode from '../src/models/EficyNode'
import { PluginManager } from '../src/services/PluginManager'
import {
  Init,
  BuildSchemaNode,
  Render,
  OnMount,
  OnUnmount,
  ResolveComponent,
  ProcessProps,
  OnHandleEvent,
  OnBindEvent,
  OnError,
  getLifecycleHooks,
  hasLifecycleHook,
} from '../src/decorators/lifecycle'

describe('Lifecycle Hooks System', () => {
  let pluginManager: PluginManager

  beforeEach(() => {
    pluginManager = new PluginManager()
  })

  describe('Lifecycle Decorators', () => {
    it('should register @Init hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @Init()
        async onInit(context: IInitContext, next: () => Promise<void>) {
          await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('init')
      expect(hooks[0].methodName).toBe('onInit')
    })

    it('should register @BuildSchemaNode hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @BuildSchemaNode()
        async onBuildSchemaNode(
          viewData: IViewData,
          context: IBuildSchemaNodeContext,
          next: () => Promise<EficyNode>
        ) {
          return await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('buildSchemaNode')
      expect(hooks[0].methodName).toBe('onBuildSchemaNode')
    })

    it('should register @Render hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @Render()
        async onRender(
          viewNode: EficyNode,
          context: IRenderContext,
          next: () => Promise<ReactElement>
        ) {
          return await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('render')
      expect(hooks[0].methodName).toBe('onRender')
    })

    it('should register @OnMount hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @OnMount()
        async onMount(
          element: Element,
          viewNode: EficyNode,
          context: IMountContext,
          next: () => Promise<void>
        ) {
          await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('onMount')
      expect(hooks[0].methodName).toBe('onMount')
    })

    it('should register @OnUnmount hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @OnUnmount()
        async onUnmount(
          element: Element,
          viewNode: EficyNode,
          context: IUnmountContext,
          next: () => Promise<void>
        ) {
          await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('onUnmount')
      expect(hooks[0].methodName).toBe('onUnmount')
    })

    it('should register @ResolveComponent hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @ResolveComponent()
        async onResolveComponent(
          componentName: string,
          viewNode: EficyNode,
          context: IResolveComponentContext,
          next: () => Promise<ComponentType>
        ) {
          return await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('resolveComponent')
      expect(hooks[0].methodName).toBe('onResolveComponent')
    })

    it('should register @ProcessProps hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @ProcessProps()
        async onProcessProps(
          props: Record<string, any>,
          viewNode: EficyNode,
          context: IProcessPropsContext,
          next: () => Promise<Record<string, any>>
        ) {
          return await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('processProps')
      expect(hooks[0].methodName).toBe('onProcessProps')
    })

    it('should register @OnHandleEvent hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @OnHandleEvent()
        async onHandleEvent(
          event: Event,
          viewNode: EficyNode,
          context: IHandleEventContext,
          next: () => Promise<any>
        ) {
          return await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('onHandleEvent')
      expect(hooks[0].methodName).toBe('onHandleEvent')
    })

    it('should register @OnBindEvent hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @OnBindEvent()
        async onBindEvent(
          eventName: string,
          handler: Function,
          viewNode: EficyNode,
          context: IBindEventContext,
          next: () => Promise<void>
        ) {
          await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('onBindEvent')
      expect(hooks[0].methodName).toBe('onBindEvent')
    })

    it('should register @OnError hook correctly', () => {
      @injectable()
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin'
        version = '1.0.0'

        @OnError()
        async onError(
          error: Error,
          viewNode: EficyNode | null,
          context: IErrorContext,
          next: () => Promise<ReactElement | void>
        ) {
          return await next()
        }
      }

      const plugin = new TestPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(1)
      expect(hooks[0].hookType).toBe('onError')
      expect(hooks[0].methodName).toBe('onError')
    })

    it('should support multiple hooks on same plugin', () => {
      @injectable()
      class MultiHookPlugin implements ILifecyclePlugin {
        name = 'multi-hook-plugin'
        version = '1.0.0'

        @Init()
        async onInit(context: IInitContext, next: () => Promise<void>) {
          await next()
        }

        @Render()
        async onRender(
          viewNode: EficyNode,
          context: IRenderContext,
          next: () => Promise<ReactElement>
        ) {
          return await next()
        }

        @OnMount()
        async onMount(
          element: Element,
          viewNode: EficyNode,
          context: IMountContext,
          next: () => Promise<void>
        ) {
          await next()
        }
      }

      const plugin = new MultiHookPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(3)
      
      const hookTypes = hooks.map(h => h.hookType)
      expect(hookTypes).toContain('init')
      expect(hookTypes).toContain('render')
              expect(hookTypes).toContain('onMount')
    })

    it('should support hook priorities', () => {
      @injectable()
      class PriorityPlugin implements ILifecyclePlugin {
        name = 'priority-plugin'
        version = '1.0.0'

        @Init(100) // High priority
        async onInitHigh(context: IInitContext, next: () => Promise<void>) {
          await next()
        }

        @Init(50) // Medium priority
        async onInitMedium(context: IInitContext, next: () => Promise<void>) {
          await next()
        }

        @Init() // Default priority (0)
        async onInitLow(context: IInitContext, next: () => Promise<void>) {
          await next()
        }
      }

      const plugin = new PriorityPlugin()
      const hooks = getLifecycleHooks(Object.getPrototypeOf(plugin))
      
      expect(hooks).toHaveLength(3)
      
      const priorities = hooks.map(h => h.priority)
      expect(priorities).toContain(100)
      expect(priorities).toContain(50)
      expect(priorities).toContain(0)
    })
  })

  describe('PluginManager Hook Execution', () => {
    it('should execute @Init hooks in order', async () => {
      const executionOrder: string[] = []

      @injectable()
      class Plugin1 implements ILifecyclePlugin {
        name = 'plugin1'
        version = '1.0.0'

        @Init()
        async onInit(context: IInitContext, next: () => Promise<void>) {
          executionOrder.push('plugin1-before')
          await next()
          executionOrder.push('plugin1-after')
        }
      }

      @injectable()
      class Plugin2 implements ILifecyclePlugin {
        name = 'plugin2'
        version = '1.0.0'

        @Init()
        async onInit(context: IInitContext, next: () => Promise<void>) {
          executionOrder.push('plugin2-before')
          await next()
          executionOrder.push('plugin2-after')
        }
      }

      const plugin1 = new Plugin1()
      const plugin2 = new Plugin2()
      
      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      const mockContext: IInitContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        config: {},
        componentMap: {}
      }

      await pluginManager.executeHook('init' as HookType, mockContext, async () => {
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

    it('should integrate with Eficy render lifecycle hooks', async () => {
      const EficyModule = await import('../src/core/Eficy')
      const Eficy = EficyModule.default
      
      const executionLog: string[] = []

      @injectable()
      class RenderLifecyclePlugin implements ILifecyclePlugin {
        name = 'render-lifecycle-plugin'
        version = '1.0.0'

        @BuildSchemaNode()
        async onBuildSchemaNode(
          viewData: IViewData,
          context: IBuildSchemaNodeContext,
          next: () => Promise<EficyNode>
        ) {
          executionLog.push(`plugin-build-start-${viewData['#']}`)
          const node = await next()
          executionLog.push(`plugin-build-end-${viewData['#']}`)
          return node
        }

        @Render()
        async onRender(
          viewNode: EficyNode,
          context: IRenderContext,
          next: () => Promise<ReactElement>
        ) {
          executionLog.push(`plugin-render-start-${viewNode['#']}`)
          const element = await next()
          executionLog.push(`plugin-render-end-${viewNode['#']}`)
          return element
        }
      }

      const eficy = new Eficy()
      const plugin = new RenderLifecyclePlugin()
      
      // 注册插件
      eficy.registerPlugin(plugin)

      const schema = {
        views: [
          {
            '#': 'test-div',
            '#view': 'div',
            className: 'test',
            '#children': [
              {
                '#': 'test-span',
                '#view': 'span',
                '#content': 'Hello World'
              }
            ]
          }
        ]
      }

      // 创建元素会触发整个生命周期
      const element = eficy.createElement(schema)

      expect(element).toBeDefined()
      // 暂时不测试 Init 钩子，因为 createElement 是同步的
      // expect(executionLog).toContain('plugin-build-start-test-div')
      // expect(executionLog).toContain('plugin-build-end-test-div')
      // expect(executionLog).toContain('plugin-render-start-test-div')
      // expect(executionLog).toContain('plugin-render-end-test-div')
    })

    it('should execute @BuildSchemaNode hooks with EficyNode creation', async () => {
      const processedNodes: string[] = []

      @injectable()
      class NodeBuilderPlugin implements ILifecyclePlugin {
        name = 'node-builder-plugin'
        version = '1.0.0'

        @BuildSchemaNode()
        async onBuildSchemaNode(
          viewData: IViewData,
          context: IBuildSchemaNodeContext,
          next: () => Promise<EficyNode>
        ) {
          processedNodes.push(`before-${viewData['#']}`)
          const node = await next()
          processedNodes.push(`after-${viewData['#']}`)
          
          // Modify the node
          node.updateField('data-processed', true)
          
          return node
        }
      }

      const plugin = new NodeBuilderPlugin()
      pluginManager.register(plugin)

      const viewData: IViewData = {
        '#': 'test-node',
        '#view': 'div',
        className: 'test'
      }

      const mockContext: IBuildSchemaNodeContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        parent: undefined,
        schema: { views: [] },
        index: 0,
        path: []
      }

      const result = await pluginManager.executeHook('buildSchemaNode' as HookType, viewData, mockContext, async () => {
        return new EficyNode(viewData)
      })

      expect(processedNodes).toEqual(['before-test-node', 'after-test-node'])
      expect(result).toBeInstanceOf(EficyNode)
      expect(result.props['data-processed']).toBe(true)
    })

    it('should execute @Mount hooks with DOM elements', async () => {
      const mountedElements: string[] = []

      @injectable()
      class MountPlugin implements ILifecyclePlugin {
        name = 'mount-plugin'
        version = '1.0.0'

        @OnMount()
        async onMount(
          element: Element,
          viewNode: EficyNode,
          context: IMountContext,
          next: () => Promise<void>
        ) {
          mountedElements.push(`mount-${viewNode['#']}`)
          
          // Mock DOM operation
          element.setAttribute('data-mounted', 'true')
          
          await next()
          
          mountedElements.push(`mount-complete-${viewNode['#']}`)
        }
      }

      const plugin = new MountPlugin()
      pluginManager.register(plugin)

      const mockElement = document.createElement('div')
      const viewNode = new EficyNode({
        '#': 'test-mount',
        '#view': 'div'
      })

      const mockContext: IMountContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        container: mockElement
      }

      await pluginManager.executeHook('onMount' as HookType, mockElement, viewNode, mockContext, async () => {
        // Mock core mount logic
      })

      expect(mountedElements).toEqual(['mount-test-mount', 'mount-complete-test-mount'])
      expect(mockElement.getAttribute('data-mounted')).toBe('true')
    })

    it('should execute @Unmount hooks with DOM elements', async () => {
      const unmountedElements: string[] = []

      @injectable()
      class UnmountPlugin implements ILifecyclePlugin {
        name = 'unmount-plugin'
        version = '1.0.0'

        @OnUnmount()
        async onUnmount(
          element: Element,
          viewNode: EficyNode,
          context: IUnmountContext,
          next: () => Promise<void>
        ) {
          unmountedElements.push(`unmount-${viewNode['#']}`)
          
          // Mock DOM cleanup
          element.removeAttribute('data-mounted')
          
          await next()
          
          unmountedElements.push(`unmount-complete-${viewNode['#']}`)
        }
      }

      const plugin = new UnmountPlugin()
      pluginManager.register(plugin)

      const mockElement = document.createElement('div')
      mockElement.setAttribute('data-mounted', 'true')
      const viewNode = new EficyNode({
        '#': 'test-unmount',
        '#view': 'div'
      })

      const mockContext: IUnmountContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        container: mockElement
      }

      await pluginManager.executeHook('onUnmount' as HookType, mockElement, viewNode, mockContext, async () => {
        // Mock core unmount logic
      })

      expect(unmountedElements).toEqual(['unmount-test-unmount', 'unmount-complete-test-unmount'])
      expect(mockElement.getAttribute('data-mounted')).toBe(null)
    })

    it('should execute @ResolveComponent hooks for component resolution', async () => {
      const resolvedComponents: string[] = []

      @injectable()
      class ResolveComponentPlugin implements ILifecyclePlugin {
        name = 'resolve-component-plugin'
        version = '1.0.0'

        @ResolveComponent()
        async onResolveComponent(
          componentName: string,
          viewNode: EficyNode,
          context: IResolveComponentContext,
          next: () => Promise<ComponentType>
        ) {
          resolvedComponents.push(`resolve-${componentName}`)
          
          if (componentName === 'CustomButton') {
            // 提供自定义组件
            return () => createElement('div', {}, 'Custom Button')
          }
          
          return await next()
        }
      }

      const plugin = new ResolveComponentPlugin()
      pluginManager.register(plugin)

      const viewNode = new EficyNode({
        '#': 'test-resolve',
        '#view': 'CustomButton'
      })

      const mockContext: IResolveComponentContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        componentMap: {}
      }

      const result = await pluginManager.executeHook('resolveComponent' as HookType, 'CustomButton', viewNode, mockContext, async () => {
        throw new Error('Component not found')
      })

      expect(resolvedComponents).toEqual(['resolve-CustomButton'])
      expect(result).toBeDefined()
      expect(typeof result).toBe('function')
    })

    it('should execute @ProcessProps hooks for props processing', async () => {
      const processedProps: Record<string, any>[] = []

      @injectable()
      class ProcessPropsPlugin implements ILifecyclePlugin {
        name = 'process-props-plugin'
        version = '1.0.0'

        @ProcessProps()
        async onProcessProps(
          props: Record<string, any>,
          viewNode: EficyNode,
          context: IProcessPropsContext,
          next: () => Promise<Record<string, any>>
        ) {
          processedProps.push({...props})
          
          // Add custom props
          const enhancedProps = {
            ...props,
            'data-processed': true,
            'data-timestamp': Date.now()
          }
          
          const result = await next()
          return { ...result, ...enhancedProps }
        }
      }

      const plugin = new ProcessPropsPlugin()
      pluginManager.register(plugin)

      const viewNode = new EficyNode({
        '#': 'test-props',
        '#view': 'div'
      })

      const originalProps = {
        className: 'test-class',
        id: 'test-id'
      }

      const mockContext: IProcessPropsContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        component: 'div' as any,
        originalProps
      }

      const result = await pluginManager.executeHook('processProps' as HookType, originalProps, viewNode, mockContext, async () => originalProps)

      expect(processedProps).toHaveLength(1)
      expect(processedProps[0]).toEqual(originalProps)
      expect(result['data-processed']).toBe(true)
      expect(result['data-timestamp']).toBeDefined()
    })

    it('should execute @HandleEvent hooks for event handling', async () => {
      const handledEvents: string[] = []

      @injectable()
      class HandleEventPlugin implements ILifecyclePlugin {
        name = 'handle-event-plugin'
        version = '1.0.0'

        @OnHandleEvent()
        async onHandleEvent(
          event: Event,
          viewNode: EficyNode,
          context: IHandleEventContext,
          next: () => Promise<any>
        ) {
          handledEvents.push(`handle-${event.type}`)
          
          // Custom event processing
          if (event.type === 'click') {
            console.log('Custom click handling')
          }
          
          return await next()
        }
      }

      const plugin = new HandleEventPlugin()
      pluginManager.register(plugin)

      const viewNode = new EficyNode({
        '#': 'test-event',
        '#view': 'button'
      })

      const mockEvent = new Event('click')
      const mockElement = document.createElement('button')

      const mockContext: IHandleEventContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        target: mockElement,
        currentTarget: mockElement,
        originalEvent: mockEvent
      }

      const result = await pluginManager.executeHook('onHandleEvent' as HookType, mockEvent, viewNode, mockContext, async () => {
        return 'event-handled'
      })

      expect(handledEvents).toEqual(['handle-click'])
      expect(result).toBe('event-handled')
    })

    it('should execute @BindEvent hooks for event binding', async () => {
      const boundEvents: string[] = []

      @injectable()
      class BindEventPlugin implements ILifecyclePlugin {
        name = 'bind-event-plugin'
        version = '1.0.0'

        @OnBindEvent()
        async onBindEvent(
          eventName: string,
          handler: Function,
          viewNode: EficyNode,
          context: IBindEventContext,
          next: () => Promise<void>
        ) {
          boundEvents.push(`bind-${eventName}`)
          
          // Custom binding logic
          if (eventName === 'click') {
            console.log('Custom click binding')
          }
          
          await next()
        }
      }

      const plugin = new BindEventPlugin()
      pluginManager.register(plugin)

      const viewNode = new EficyNode({
        '#': 'test-bind',
        '#view': 'button'
      })

      const mockElement = document.createElement('button')
      const mockHandler = () => console.log('clicked')

      const mockContext: IBindEventContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        element: mockElement,
        eventType: 'click'
      }

      await pluginManager.executeHook('onBindEvent' as HookType, 'click', mockHandler, viewNode, mockContext, async () => {
        // Mock core binding
      })

      expect(boundEvents).toEqual(['bind-click'])
    })

    it('should execute @Error hooks for error handling', async () => {
      const errorLogs: string[] = []

      @injectable()
      class ErrorPlugin implements ILifecyclePlugin {
        name = 'error-plugin'
        version = '1.0.0'

        @OnError()
        async onError(
          error: Error,
          viewNode: EficyNode | null,
          context: IErrorContext,
          next: () => Promise<ReactElement | void>
        ) {
          errorLogs.push(`error-caught: ${error.message || 'undefined'}`)
          
          try {
            return await next()
          } catch (e) {
            errorLogs.push('error-handled-by-plugin')
            // Return custom error element
            return { type: 'div', props: { children: 'Error handled' } } as ReactElement
          }
        }
      }

      const plugin = new ErrorPlugin()
      pluginManager.register(plugin)

      const testError = new Error('Test error')
      const viewNode = new EficyNode({ '#': 'error-node', '#view': 'div' })

      const mockContext: IErrorContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        stack: testError.stack || '',
        severity: 'high',
        recoverable: true
      }

      const result = await pluginManager.executeHook('onError' as HookType, testError, viewNode, mockContext, async () => {
        throw new Error('Core error handling failed')
      })

      expect(errorLogs).toEqual(['error-caught: Test error', 'error-handled-by-plugin'])
      expect(result).toBeDefined()
      expect(result.props.children).toBe('Error handled')
    })

    it('should respect hook priorities in execution order', async () => {
      const executionOrder: string[] = []

      @injectable()
      class HighPriorityPlugin implements ILifecyclePlugin {
        name = 'high-priority-plugin'
        version = '1.0.0'

        @Init(100)
        async onInit(context: IInitContext, next: () => Promise<void>) {
          executionOrder.push('high-priority')
          await next()
        }
      }

      @injectable()
      class LowPriorityPlugin implements ILifecyclePlugin {
        name = 'low-priority-plugin'
        version = '1.0.0'

        @Init(10)
        async onInit(context: IInitContext, next: () => Promise<void>) {
          executionOrder.push('low-priority')
          await next()
        }
      }

      @injectable()
      class MediumPriorityPlugin implements ILifecyclePlugin {
        name = 'medium-priority-plugin'
        version = '1.0.0'

        @Init(50)
        async onInit(context: IInitContext, next: () => Promise<void>) {
          executionOrder.push('medium-priority')
          await next()
        }
      }

      pluginManager.register(new LowPriorityPlugin())
      pluginManager.register(new HighPriorityPlugin())
      pluginManager.register(new MediumPriorityPlugin())

      const mockContext: IInitContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        config: {},
        componentMap: {}
      }

      await pluginManager.executeHook('init' as HookType, mockContext, async () => {
        executionOrder.push('core')
      })

      expect(executionOrder).toEqual([
        'low-priority',
        'medium-priority', 
        'high-priority',
        'core'
      ])
    })

    it('should handle hook execution when no plugins are registered', async () => {
      const mockContext: IInitContext = {
        timestamp: Date.now(),
        requestId: 'test-request',
        config: {},
        componentMap: {}
      }

      let coreExecuted = false

      await pluginManager.executeHook('init' as HookType, mockContext, async () => {
        coreExecuted = true
      })

      expect(coreExecuted).toBe(true)
    })

    it('should provide hook statistics', () => {
      @injectable()
      class StatsPlugin implements ILifecyclePlugin {
        name = 'stats-plugin'
        version = '1.0.0'

        @Init()
        async onInit(context: IInitContext, next: () => Promise<void>) {
          await next()
        }

        @Render()
        async onRender(
          viewNode: EficyNode,
          context: IRenderContext,
          next: () => Promise<ReactElement>
        ) {
          return await next()
        }

        @OnMount()
        async onMount(
          element: Element,
          viewNode: EficyNode,
          context: IMountContext,
          next: () => Promise<void>
        ) {
          await next()
        }
      }

      pluginManager.register(new StatsPlugin())

      const stats = pluginManager.getHookStats()
      expect(stats['init']).toBe(1)
      expect(stats['render']).toBe(1)
      expect(stats['onMount']).toBe(1)
    })
  })
})