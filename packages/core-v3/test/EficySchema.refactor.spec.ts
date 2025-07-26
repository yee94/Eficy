import { describe, it, expect, beforeEach } from 'vitest'
import EficySchema from '../src/models/EficySchema'
import ViewNode from '../src/models/ViewNode'
import type { IEficySchema, IViewData } from '../src/interfaces'

describe('EficySchema - Refactored as ViewNode Tree Manager', () => {
  let schema: EficySchema

  const mockSchema: IEficySchema = {
    views: [
      {
        '#': 'root',
        '#view': 'div',
        className: 'container',
        '#children': [
          {
            '#': 'header',
            '#view': 'h1',
            '#content': 'Hello World'
          },
          {
            '#': 'content',
            '#view': 'div',
            '#children': [
              {
                '#': 'button1',
                '#view': 'button',
                '#content': 'Click Me',
                onClick: () => console.log('clicked')
              },
              {
                '#': 'button2',
                '#view': 'button',
                '#content': 'Cancel'
              }
            ]
          }
        ]
      },
      {
        '#': 'footer',
        '#view': 'footer',
        '#content': 'Footer Content'
      }
    ]
  }

  beforeEach(() => {
    schema = new EficySchema(mockSchema)
  })

  describe('Tree Building and Management', () => {
    it('should build complete ViewNode tree structure', () => {
      expect(schema.views).toHaveLength(2)
      expect(schema.views[0]['#']).toBe('root')
      expect(schema.views[1]['#']).toBe('footer')
      
      // 验证树结构
      const rootNode = schema.views[0]
      expect(rootNode['#children']).toHaveLength(2)
      expect(rootNode['#children'][0]['#']).toBe('header')
      expect(rootNode['#children'][1]['#']).toBe('content')
    })

    it('should maintain proper parent-child relationships', () => {
      const rootNode = schema.views[0]
      const headerNode = rootNode['#children'][0]
      const contentNode = rootNode['#children'][1]
      
      expect(headerNode instanceof ViewNode).toBe(true)
      expect(contentNode instanceof ViewNode).toBe(true)
      expect(contentNode['#children']).toHaveLength(2)
    })

    it('should build complete node index map', () => {
      const viewDataMap = schema.viewDataMap
      
      // 验证所有节点都在索引中
      expect(viewDataMap['root']).toBeDefined()
      expect(viewDataMap['header']).toBeDefined()
      expect(viewDataMap['content']).toBeDefined()
      expect(viewDataMap['button1']).toBeDefined()
      expect(viewDataMap['button2']).toBeDefined()
      expect(viewDataMap['footer']).toBeDefined()
      
      // 验证索引指向正确的节点
      expect(viewDataMap['root']['#view']).toBe('div')
      expect(viewDataMap['header']['#view']).toBe('h1')
      expect(viewDataMap['button1']['#content']).toBe('Click Me')
    })
  })

  describe('Node Lookup and Navigation', () => {
    it('should find nodes by ID through getViewModel', () => {
      const rootNode = schema.getViewModel('root')
      expect(rootNode).toBeDefined()
      expect(rootNode!['#view']).toBe('div')
      
      const headerNode = schema.getViewModel('header')
      expect(headerNode).toBeDefined()
      expect(headerNode!['#content']).toBe('Hello World')
      
      const button1 = schema.getViewModel('button1')
      expect(button1).toBeDefined()
      expect(button1!['#view']).toBe('button')
    })

    it('should support nested node lookup with dot notation', () => {
      // 这个功能需要在重构中实现
      const button1 = schema.getViewModel('root.content.button1')
      expect(button1).toBeDefined()
      expect(button1!['#content']).toBe('Click Me')
    })

    it('should return null for non-existent nodes', () => {
      const nonExistent = schema.getViewModel('nonexistent')
      expect(nonExistent).toBeNull()
    })
  })

  describe('Tree Updates and Synchronization', () => {
    it('should update specific nodes while maintaining tree structure', () => {
      const updateData: IEficySchema = {
        views: [
          {
            '#': 'header',
            '#content': 'Updated Header',
            style: { color: 'blue' }
          }
        ]
      }
      
      schema.update(updateData)
      
      const headerNode = schema.getViewModel('header')
      expect(headerNode!['#content']).toBe('Updated Header')
      expect(headerNode!.props.style).toEqual({ color: 'blue' })
      
      // 验证其他节点未受影响
      const rootNode = schema.getViewModel('root')
      expect(rootNode!.props.className).toBe('container')
    })

    it('should handle node addition to existing tree', () => {
      const updateData: IEficySchema = {
        views: [
          {
            '#': 'content',
            '#children': [
              {
                '#': 'button1',
                '#view': 'button',
                '#content': 'Click Me'
              },
              {
                '#': 'button2',
                '#view': 'button',
                '#content': 'Cancel'
              },
              {
                '#': 'newButton',
                '#view': 'button',
                '#content': 'New Button',
                className: 'new-btn'
              }
            ]
          }
        ]
      }
      
      schema.update(updateData)
      
      const contentNode = schema.getViewModel('content')
      expect(contentNode!['#children']).toHaveLength(3)
      
      const newButton = schema.getViewModel('newButton')
      expect(newButton).toBeDefined()
      expect(newButton!['#content']).toBe('New Button')
      expect(newButton!.props.className).toBe('new-btn')
    })

    it('should handle node removal from tree', () => {
      const updateData: IEficySchema = {
        views: [
          {
            '#': 'content',
            '#children': [
              {
                '#': 'button1',
                '#view': 'button',
                '#content': 'Click Me'
              }
              // button2 被移除
            ]
          }
        ]
      }
      
      schema.update(updateData)
      
      const contentNode = schema.getViewModel('content')
      expect(contentNode!['#children']).toHaveLength(1)
      
      const button2 = schema.getViewModel('button2')
      expect(button2).toBeNull()
      
      const button1 = schema.getViewModel('button1')
      expect(button1).toBeDefined()
    })

    it('should rebuild index after tree modifications', () => {
      const initialCount = Object.keys(schema.viewDataMap).length
      
      // 添加新节点
      const updateData: IEficySchema = {
        views: [
          {
            '#': 'newRoot',
            '#view': 'section',
            '#content': 'New Section'
          }
        ]
      }
      
      schema.update(updateData)
      
      // 验证索引已更新
      const newCount = Object.keys(schema.viewDataMap).length
      expect(newCount).toBeGreaterThan(initialCount)
      expect(schema.viewDataMap['newRoot']).toBeDefined()
    })
  })

  describe('Tree Traversal', () => {
    it('should traverse entire tree and execute callback for each node', () => {
      const visitedNodes: string[] = []
      const mockTraverse = (callback: (node: ViewNode) => void) => {
        // 这个功能需要在重构中实现
        schema.views.forEach(view => {
          const traverse = (node: ViewNode) => {
            callback(node)
            node['#children'].forEach(child => traverse(child))
          }
          traverse(view)
        })
      }
      
      mockTraverse((node: ViewNode) => {
        visitedNodes.push(node['#'])
      })
      
      expect(visitedNodes).toContain('root')
      expect(visitedNodes).toContain('header')
      expect(visitedNodes).toContain('content')
      expect(visitedNodes).toContain('button1')
      expect(visitedNodes).toContain('button2')
      expect(visitedNodes).toContain('footer')
    })

    it('should support conditional traversal', () => {
      const buttonNodes: ViewNode[] = []
      const mockTraverse = (predicate: (node: ViewNode) => boolean) => {
        schema.views.forEach(view => {
          const traverse = (node: ViewNode) => {
            if (predicate(node)) {
              buttonNodes.push(node)
            }
            node['#children'].forEach(child => traverse(child))
          }
          traverse(view)
        })
      }
      
      mockTraverse((node: ViewNode) => node['#view'] === 'button')
      
      expect(buttonNodes).toHaveLength(2)
      expect(buttonNodes[0]['#']).toBe('button1')
      expect(buttonNodes[1]['#']).toBe('button2')
    })
  })

  describe('Performance and Optimization', () => {
    it('should handle large tree structures efficiently', () => {
      const largeSchema: IEficySchema = {
        views: []
      }
      
      // 生成大量节点
      for (let i = 0; i < 1000; i++) {
        largeSchema.views.push({
          '#': `node${i}`,
          '#view': 'div',
          '#content': `Content ${i}`
        })
      }
      
      const startTime = performance.now()
      const largeSchemInstance = new EficySchema(largeSchema)
      const endTime = performance.now()
      
      expect(largeSchemInstance.views).toHaveLength(1000)
      expect(Object.keys(largeSchemInstance.viewDataMap)).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })

    it('should maintain responsive updates for deep tree structures', () => {
      const deepSchema: IEficySchema = {
        views: [
          {
            '#': 'level0',
            '#view': 'div',
            '#children': [
              {
                '#': 'level1',
                '#view': 'div',
                '#children': [
                  {
                    '#': 'level2',
                    '#view': 'div',
                    '#children': [
                      {
                        '#': 'level3',
                        '#view': 'div',
                        '#content': 'Deep Content'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
      
      const deepSchemaInstance = new EficySchema(deepSchema)
      
      // 更新深层节点
      const updateData: IEficySchema = {
        views: [
          {
            '#': 'level3',
            '#content': 'Updated Deep Content',
            className: 'updated'
          }
        ]
      }
      
      const startTime = performance.now()
      deepSchemaInstance.update(updateData)
      const endTime = performance.now()
      
      const level3Node = deepSchemaInstance.getViewModel('level3')
      expect(level3Node!['#content']).toBe('Updated Deep Content')
      expect(level3Node!.props.className).toBe('updated')
      expect(endTime - startTime).toBeLessThan(10) // 更新应该很快
    })
  })
})