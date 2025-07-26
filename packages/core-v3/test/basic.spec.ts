import { describe, it, expect } from 'vitest'
import ViewNode from '../src/models/ViewNode'
import ConfigService from '../src/services/ConfigService'
import ComponentRegistry from '../src/services/ComponentRegistry'

describe('基础功能测试', () => {
  it('ViewNode 应该能正确创建', () => {
    const viewNode = new ViewNode({
      '#': 'test',
      '#view': 'div',
      className: 'test-class'
    })

    expect(viewNode['#']).toBe('test')
    expect(viewNode['#view']).toBe('div')
    expect(viewNode.props.className).toBe('test-class')
  })

  it('ConfigService 应该能正确工作', () => {
    const configService = new ConfigService()
    
    configService.set('test.value', 'hello')
    expect(configService.get('test.value')).toBe('hello')
    
    configService.extend({ test: { extended: true } })
    expect(configService.get('test.extended')).toBe(true)
  })

  it('ComponentRegistry 应该能正确管理组件', () => {
    const registry = new ComponentRegistry()
    
    const TestComponent = () => null
    registry.register('TestComponent', TestComponent)
    
    expect(registry.get('TestComponent')).toBe(TestComponent)
    expect(registry.get('NonExistent')).toBe(null)
    
    const allComponents = registry.getAll()
    expect(allComponents.TestComponent).toBe(TestComponent)
  })
}) 