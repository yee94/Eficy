import { describe, it, expect, beforeEach } from 'vitest'
import { effect } from '@eficy/reactive'
import EficyNode from '../src/models/EficyNode'

describe('EficyNode', () => {
  let eficyNode: EficyNode

  beforeEach(() => {
    eficyNode = new EficyNode({
      '#': 'testNode',
      '#view': 'div',
      className: 'test-class',
      style: { color: 'red' }
    })
  })

  describe('基础属性', () => {
    it('应该正确初始化基础属性', () => {
      expect(eficyNode['#']).toBe('testNode')
      expect(eficyNode['#view']).toBe('div')
      expect(eficyNode.id).toBeDefined()
      expect(typeof eficyNode.id).toBe('string')
    })

    it('应该支持更新字段', () => {
      eficyNode.updateField('className', 'new-class')
      expect(eficyNode.props.className).toBe('new-class')
    })

    it('应该支持更新样式', () => {
      eficyNode.updateField('style', { color: 'blue', fontSize: '14px' })
      expect(eficyNode.props.style).toEqual({ color: 'blue', fontSize: '14px' })
    })
  })

  describe('响应式更新', () => {
    it('字段更新应该触发响应式变化', () => {
      let renderCount = 0
      let lastProps: any = {}

      // 模拟观察者
      const dispose = effect(() => {
        renderCount++
        lastProps = eficyNode.props
      })

      expect(renderCount).toBe(1)

      // 更新属性
      eficyNode.updateField('className', 'updated-class')
      expect(renderCount).toBe(2)
      expect(lastProps.className).toBe('updated-class')

      dispose()
    })

    it('计算属性应该正确响应依赖变化', () => {
      const props = eficyNode.props
      expect(props.className).toBe('test-class')
      expect(props.style).toEqual({ color: 'red' })

      eficyNode.updateField('className', 'new-class')
      const newProps = eficyNode.props
      expect(newProps.className).toBe('new-class')
    })
  })

  describe('子节点管理', () => {
    it('应该支持添加子节点', () => {
      const childNode = new EficyNode({
        '#': 'child',
        '#view': 'span',
        '#content': 'child content'
      })

      eficyNode.addChild(childNode)
      expect(eficyNode['#children']).toHaveLength(1)
      expect(eficyNode['#children'][0]).toBe(childNode)
    })

    it('应该支持移除子节点', () => {
      const childNode = new EficyNode({
        '#': 'child',
        '#view': 'span'
      })

      eficyNode.addChild(childNode)
      expect(eficyNode['#children']).toHaveLength(1)

      eficyNode.removeChild('child')
      expect(eficyNode['#children']).toHaveLength(0)
    })

    it('应该支持通过ID查找子节点', () => {
      const childNode = new EficyNode({
        '#': 'child',
        '#view': 'span'
      })

      eficyNode.addChild(childNode)
      const foundChild = eficyNode.findChild('child')
      expect(foundChild).toBe(childNode)
    })
  })

  describe('条件渲染', () => {
    it('应该支持 #if 条件渲染', () => {
      eficyNode.updateField('#if', false)
      expect(eficyNode.shouldRender).toBe(false)

      eficyNode.updateField('#if', true)
      expect(eficyNode.shouldRender).toBe(true)
    })

    it('默认情况下应该渲染', () => {
      expect(eficyNode.shouldRender).toBe(true)
    })
  })

  describe('Props 计算', () => {
    it('应该正确计算传递给组件的props', () => {
      const props = eficyNode.props
      
      // 不应该包含框架特殊字段
      expect(props['#']).toBeUndefined()
      expect(props['#view']).toBeUndefined()
      expect(props['#children']).toBeUndefined()
      
      // 应该包含组件props
      expect(props.className).toBe('test-class')
      expect(props.style).toEqual({ color: 'red' })
    })

    it('应该处理 #content 特殊字段', () => {
      eficyNode.updateField('#content', 'Hello World')
      const props = eficyNode.props
      
      expect(eficyNode.children).toBe('Hello World')
      expect(props['#content']).toBeUndefined()
    })
  })

  describe('序列化', () => {
    it('应该支持序列化为JSON', () => {
      const json = eficyNode.toJSON()
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

      const newNode = EficyNode.fromJSON(json)
      expect(newNode['#']).toBe('newNode')
      expect(newNode['#view']).toBe('span')
      expect(newNode.props.title).toBe('test title')
    })
  })
}) 