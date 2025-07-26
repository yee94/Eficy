import { describe, it, expect, beforeEach } from 'vitest'
import { effect } from '@eficy/reactive'
import ViewNode from '../src/models/ViewNode'

describe('ViewNode', () => {
  let viewNode: ViewNode

  beforeEach(() => {
    viewNode = new ViewNode({
      '#': 'testNode',
      '#view': 'div',
      className: 'test-class',
      style: { color: 'red' }
    })
  })

  describe('基础属性', () => {
    it('应该正确初始化基础属性', () => {
      expect(viewNode['#']).toBe('testNode')
      expect(viewNode['#view']).toBe('div')
      expect(viewNode.id).toBeDefined()
      expect(typeof viewNode.id).toBe('string')
    })

    it('应该支持更新字段', () => {
      viewNode.updateField('className', 'new-class')
      expect(viewNode.props.className).toBe('new-class')
    })

    it('应该支持更新样式', () => {
      viewNode.updateField('style', { color: 'blue', fontSize: '14px' })
      expect(viewNode.props.style).toEqual({ color: 'blue', fontSize: '14px' })
    })
  })

  describe('响应式更新', () => {
    it('字段更新应该触发响应式变化', () => {
      let renderCount = 0
      let lastProps: any = {}

      // 模拟观察者
      const dispose = effect(() => {
        renderCount++
        lastProps = viewNode.props
      })

      expect(renderCount).toBe(1)

      // 更新属性
      viewNode.updateField('className', 'updated-class')
      expect(renderCount).toBe(2)
      expect(lastProps.className).toBe('updated-class')

      dispose()
    })

    it('计算属性应该正确响应依赖变化', () => {
      const props = viewNode.props
      expect(props.className).toBe('test-class')
      expect(props.style).toEqual({ color: 'red' })

      viewNode.updateField('className', 'new-class')
      const newProps = viewNode.props
      expect(newProps.className).toBe('new-class')
    })
  })

  describe('子节点管理', () => {
    it('应该支持添加子节点', () => {
      const childNode = new ViewNode({
        '#': 'child',
        '#view': 'span',
        '#content': 'child content'
      })

      viewNode.addChild(childNode)
      expect(viewNode['#children']).toHaveLength(1)
      expect(viewNode['#children'][0]).toBe(childNode)
    })

    it('应该支持移除子节点', () => {
      const childNode = new ViewNode({
        '#': 'child',
        '#view': 'span'
      })

      viewNode.addChild(childNode)
      expect(viewNode['#children']).toHaveLength(1)

      viewNode.removeChild('child')
      expect(viewNode['#children']).toHaveLength(0)
    })

    it('应该支持通过ID查找子节点', () => {
      const childNode = new ViewNode({
        '#': 'child',
        '#view': 'span'
      })

      viewNode.addChild(childNode)
      const foundChild = viewNode.findChild('child')
      expect(foundChild).toBe(childNode)
    })
  })

  describe('条件渲染', () => {
    it('应该支持 #if 条件渲染', () => {
      viewNode.updateField('#if', false)
      expect(viewNode.shouldRender).toBe(false)

      viewNode.updateField('#if', true)
      expect(viewNode.shouldRender).toBe(true)
    })

    it('默认情况下应该渲染', () => {
      expect(viewNode.shouldRender).toBe(true)
    })
  })

  describe('Props 计算', () => {
    it('应该正确计算传递给组件的props', () => {
      const props = viewNode.props
      
      // 不应该包含框架特殊字段
      expect(props['#']).toBeUndefined()
      expect(props['#view']).toBeUndefined()
      expect(props['#children']).toBeUndefined()
      
      // 应该包含组件props
      expect(props.className).toBe('test-class')
      expect(props.style).toEqual({ color: 'red' })
    })

    it('应该处理 #content 特殊字段', () => {
      viewNode.updateField('#content', 'Hello World')
      const props = viewNode.props
      
      expect(props.children).toBe('Hello World')
      expect(props['#content']).toBeUndefined()
    })
  })

  describe('序列化', () => {
    it('应该支持序列化为JSON', () => {
      const json = viewNode.toJSON()
      expect(json['#']).toBe('testNode')
      expect(json['#view']).toBe('div')
      expect(json.className).toBe('test-class')
    })

    it('应该支持从JSON反序列化', () => {
      const json = {
        '#': 'newNode',
        '#view': 'span',
        title: 'test title'
      }

      const newNode = ViewNode.fromJSON(json)
      expect(newNode['#']).toBe('newNode')
      expect(newNode['#view']).toBe('span')
      expect(newNode.props.title).toBe('test title')
    })
  })
}) 