import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Eficy from '../src/core/Eficy'

// 简单的测试组件
const testComponents = {
  TestDiv: ({ children, className, style }: any) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  TestButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  TestInput: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  )
}

describe('Schema 渲染', () => {
  describe('基础渲染', () => {
    it('应该渲染简单的组件', () => {
      const schema = {
        views: [
          {
            '#': 'simple',
            '#view': 'TestDiv',
            className: 'test-class',
            '#content': 'Hello World'
          }
        ]
      }

      const eficy = new Eficy()
      eficy.config({ componentMap: testComponents })
      
      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('Hello World')).toBeInTheDocument()
      expect(screen.getByText('Hello World')).toHaveClass('test-class')
    })

    it('应该支持原生HTML标签', () => {
      const schema = {
        views: [
          {
            '#': 'native',
            '#view': 'div',
            className: 'native-div',
            '#content': 'Native HTML'
          }
        ]
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('Native HTML')).toBeInTheDocument()
      expect(screen.getByText('Native HTML')).toHaveClass('native-div')
    })

    it('应该处理样式属性', () => {
      const schema = {
        views: [
          {
            '#': 'styled',
            '#view': 'div',
            style: { color: 'red', fontSize: '16px' },
            '#content': 'Styled content'
          }
        ]
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      render(element)
      
      const styledElement = screen.getByText('Styled content')
      expect(styledElement).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' })
    })
  })

  describe('嵌套渲染', () => {
    it('应该渲染嵌套的子组件', () => {
      const schema = {
        views: [
          {
            '#': 'parent',
            '#view': 'TestDiv',
            className: 'parent',
            '#children': [
              {
                '#': 'child1',
                '#view': 'span',
                '#content': 'Child 1'
              },
              {
                '#': 'child2',
                '#view': 'span', 
                '#content': 'Child 2'
              }
            ]
          }
        ]
      }

      const eficy = new Eficy()
      eficy.config({ componentMap: testComponents })
      
      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      
      const parent = screen.getByText('Child 1').parentElement
      expect(parent).toHaveClass('parent')
    })

    it('应该支持深度嵌套', () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            '#children': [
              {
                '#': 'level1',
                '#view': 'TestDiv',
                className: 'level-1',
                '#children': [
                  {
                    '#': 'level2',
                    '#view': 'span',
                    className: 'level-2',
                    '#content': 'Deep nested'
                  }
                ]
              }
            ]
          }
        ]
      }

      const eficy = new Eficy()
      eficy.config({ componentMap: testComponents })
      
      const element = eficy.createElement(schema)
      render(element)
      
      const deepElement = screen.getByText('Deep nested')
      expect(deepElement).toBeInTheDocument()
      expect(deepElement).toHaveClass('level-2')
      expect(deepElement.parentElement).toHaveClass('level-1')
    })
  })

  describe('条件渲染', () => {
    it('应该支持 #if 条件渲染', () => {
      const schema = {
        views: [
          {
            '#': 'visible',
            '#view': 'div',
            '#if': true,
            '#content': 'Visible content'
          },
          {
            '#': 'hidden',
            '#view': 'div', 
            '#if': false,
            '#content': 'Hidden content'
          }
        ]
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('Visible content')).toBeInTheDocument()
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
    })

    it('应该支持函数式条件渲染', () => {
      const schema = {
        views: [
          {
            '#': 'conditional',
            '#view': 'div',
            '#if': () => new Date().getHours() < 24, // 总是true
            '#content': 'Function condition'
          }
        ]
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('Function condition')).toBeInTheDocument()
    })
  })

  describe('多视图渲染', () => {
    it('应该渲染多个顶级视图', () => {
      const schema = {
        views: [
          {
            '#': 'view1',
            '#view': 'div',
            '#content': 'First view'
          },
          {
            '#': 'view2', 
            '#view': 'div',
            '#content': 'Second view'
          },
          {
            '#': 'view3',
            '#view': 'div',
            '#content': 'Third view'
          }
        ]
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('First view')).toBeInTheDocument()
      expect(screen.getByText('Second view')).toBeInTheDocument()
      expect(screen.getByText('Third view')).toBeInTheDocument()
    })
  })

  describe('配置扩展', () => {
    it('应该支持扩展组件库', () => {
      const baseComponents = {
        TestDiv: ({ children }: any) => <div className="base">{children}</div>
      }

      const extendedComponents = {
        TestButton: ({ children }: any) => <button className="extended">{children}</button>
      }

      const eficy = new Eficy()
      eficy.config({ componentMap: baseComponents })
      eficy.extend({ componentMap: extendedComponents })

      const schema = {
        views: [
          {
            '#': 'base',
            '#view': 'TestDiv',
            '#content': 'Base component'
          },
          {
            '#': 'extended',
            '#view': 'TestButton',
            '#content': 'Extended component'
          }
        ]
      }

      const element = eficy.createElement(schema)
      render(element)
      
      expect(screen.getByText('Base component')).toBeInTheDocument()
      expect(screen.getByText('Extended component')).toBeInTheDocument()
      expect(screen.getByText('Base component')).toHaveClass('base')
      expect(screen.getByText('Extended component')).toHaveClass('extended')
    })

    it('应该支持配置覆盖', () => {
      const originalComponents = {
        TestDiv: ({ children }: any) => <div className="original">{children}</div>
      }

      const overrideComponents = {
        TestDiv: ({ children }: any) => <div className="override">{children}</div>
      }

      const eficy = new Eficy()
      eficy.config({ componentMap: originalComponents })
      eficy.extend({ componentMap: overrideComponents })

      const schema = {
        views: [
          {
            '#': 'test',
            '#view': 'TestDiv',
            '#content': 'Test content'
          }
        ]
      }

      const element = eficy.createElement(schema)
      render(element)
      
      const testElement = screen.getByText('Test content')
      expect(testElement).toHaveClass('override')
      expect(testElement).not.toHaveClass('original')
    })
  })

  describe('错误处理', () => {
    it('组件不存在时应该显示错误信息', () => {
      const schema = {
        views: [
          {
            '#': 'missing',
            '#view': 'NonExistentComponent',
            '#content': 'Should show error'
          }
        ]
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      render(element)
      
      // 应该显示错误信息而不是崩溃
      expect(screen.getByText(/Component.*not found/i)).toBeInTheDocument()
    })

    it('空schema应该返回空内容', () => {
      const schema = {
        views: []
      }

      const eficy = new Eficy()
      const element = eficy.createElement(schema)
      
      expect(element).toBe(null)
    })

    it('无效schema应该抛出错误', () => {
      const eficy = new Eficy()
      
      expect(() => {
        eficy.createElement(null as any)
      }).toThrow()

      expect(() => {
        eficy.createElement({} as any)
      }).toThrow()
    })
  })
}) 