import 'reflect-metadata'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Eficy } from '@eficy/core-v3'
import { 
  Button, 
  Input, 
  Card, 
  Space, 
  Typography, 
  Table, 
  Tag, 
  Divider,
  Form,
  Select,
  InputNumber,
  Switch,
  Slider,
  Radio,
  Checkbox,
  Rate,
  Row,
  Col,
  Alert,
  message,
  Tabs,
  Modal,
  List,
  Timeline,
  Collapse,
  Tree,
  Badge,
  Popover,
  Tooltip,
  Progress,
  Spin
} from 'antd'
import { UserOutlined, StarOutlined, HeartOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TabPane } = Tabs
const { Panel } = Collapse
const { TreeNode } = Tree

// 创建 Eficy V3 实例
const eficy = new Eficy()

// 工具函数：通过节点ID获取ViewNode并更新属性
const updateNodeData = (nodeId: string, updates: Record<string, any>) => {
  const schema = eficy.getSchema()
  if (schema) {
    const viewNode = schema.getViewModel(nodeId)
    if (viewNode) {
      Object.keys(updates).forEach(key => {
        viewNode.updateField(key, updates[key])
      })
    }
  }
}

// 工具函数：获取ViewNode的当前值
const getNodeData = (nodeId: string, field?: string) => {
  const schema = eficy.getSchema()
  if (schema) {
    const viewNode = schema.getViewModel(nodeId)
    if (viewNode) {
      return field ? viewNode[field] : viewNode
    }
  }
  return null
}

// 配置组件库
eficy.config({
  componentMap: {
    // 基础组件
    Button,
    Input,
    Card,
    Space,
    Title,
    Text,
    Alert,
    Divider,
    
    // 表格组件
    Table,
    Tag,
    
    // 表单组件
    Form,
    'Form.Item': Form.Item,
    Select,
    'Select.Option': Option,
    InputNumber,
    Switch,
    Slider,
    Radio,
    'Radio.Group': Radio.Group,
    Checkbox,
    'Checkbox.Group': Checkbox.Group,
    Rate,
    
    // 布局组件
    Row,
    Col,
    Tabs,
    'Tabs.TabPane': TabPane,
    
    // 图标组件
    UserOutlined,
    StarOutlined,
    HeartOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
    EyeOutlined,
    SearchOutlined,
    
    // 高级组件
    Modal,
    List,
    'List.Item': List.Item,
    'List.Item.Meta': List.Item.Meta,
    Timeline,
    'Timeline.Item': Timeline.Item,
    Collapse,
    'Collapse.Panel': Panel,
    Tree,
    'Tree.TreeNode': TreeNode,
    Badge,
    Popover,
    Tooltip,
    Progress,
    Spin,
    Paragraph,
    'Space.Compact': Space.Compact
  }
})

// V3 基础示例
const basicExample = {
  views: [
    {
      '#': 'welcome-card',
      '#view': 'Card',
      title: 'Welcome to Eficy Core V3! 🚀',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'description',
          '#view': 'Alert',
          message: '这是全新的 Eficy Core V3 演示，采用现代化架构和响应式系统！',
          type: 'success',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'features',
          '#view': 'Space',
          direction: 'vertical',
          size: 'middle',
          style: { width: '100%' },
          '#children': [
            {
              '#': 'feature1',
              '#view': 'Text',
              '#content': '✅ ViewNode 作为状态容器，无需外部状态管理'
            },
            {
              '#': 'feature2', 
              '#view': 'Text',
              '#content': '✅ 通过节点 ID 直接更新数据，简单直观'
            },
            {
              '#': 'feature3',
              '#view': 'Text',
              '#content': '✅ Schema 驱动的响应式更新机制'
            },
            {
              '#': 'feature4',
              '#view': 'Text',
              '#content': '✅ 支持任意 React 组件库集成'
            }
          ]
        }
      ]
    }
  ]
}

// 响应式计数器示例 - 使用 ViewNode 状态
const reactiveExample = {
  views: [
    {
      '#': 'reactive-demo',
      '#view': 'Card',
      title: '响应式数据演示 - ViewNode 状态管理',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'counter-state',
          // 这个节点存储计数器状态
          count: 0,
          '#view': 'div',
          style: { display: 'none' } // 隐藏的状态节点
        },
        {
          '#': 'counter-display',
          '#view': 'Alert',
          message: () => {
            const count = getNodeData('counter-state', 'count') || 0
            return `当前计数: ${count}`
          },
          type: () => {
            const count = getNodeData('counter-state', 'count') || 0
            return count > 10 ? 'warning' : count > 5 ? 'success' : 'info'
          },
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'count-stats',
          '#view': 'Row',
          gutter: [16, 16],
          style: { marginBottom: 16 },
          '#children': [
            {
              '#': 'count-progress',
              '#view': 'Col',
              span: 12,
              '#children': [
                {
                  '#': 'progress-card',
                  '#view': 'Card',
                  size: 'small',
                  title: '计数进度',
                  '#children': [
                    {
                      '#': 'count-progress-bar',
                      '#view': 'Progress',
                      percent: () => {
                        const count = getNodeData('counter-state', 'count') || 0
                        return Math.min(100, (count / 20) * 100)
                      },
                      status: () => {
                        const count = getNodeData('counter-state', 'count') || 0
                        return count >= 20 ? 'success' : 'active'
                      }
                    }
                  ]
                }
              ]
            },
            {
              '#': 'count-badge',
              '#view': 'Col',
              span: 12,
              '#children': [
                {
                  '#': 'badge-card',
                  '#view': 'Card',
                  size: 'small',
                  title: '状态徽章',
                  '#children': [
                    {
                      '#': 'status-badge',
                      '#view': 'Badge',
                      count: () => getNodeData('counter-state', 'count') || 0,
                      overflowCount: 99,
                      showZero: true,
                      '#children': [
                        {
                          '#': 'badge-icon',
                          '#view': 'div',
                          style: { width: 40, height: 40, background: '#f0f0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
                          '#content': '🎯'
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
          '#': 'control-space',
          '#view': 'Space',
          size: 'large',
          '#children': [
            {
              '#': 'increment-btn',
              '#view': 'Button',
              type: 'primary',
              icon: React.createElement(PlusOutlined),
              '#content': '增加计数',
              onClick: () => {
                const currentCount = getNodeData('counter-state', 'count') || 0
                const newCount = currentCount + 1
                updateNodeData('counter-state', { count: newCount })
                message.success(`计数已增加到 ${newCount}！`)
              }
            },
            {
              '#': 'decrement-btn',
              '#view': 'Button',
              '#content': '减少计数',
              disabled: () => (getNodeData('counter-state', 'count') || 0) <= 0,
              onClick: () => {
                const currentCount = getNodeData('counter-state', 'count') || 0
                const newCount = Math.max(0, currentCount - 1)
                updateNodeData('counter-state', { count: newCount })
                message.info(`计数已减少到 ${newCount}`)
              }
            },
            {
              '#': 'reset-btn',
              '#view': 'Button',
              danger: true,
              '#content': '重置',
              onClick: () => {
                updateNodeData('counter-state', { count: 0 })
                message.success('计数器已重置！')
              }
            }
          ]
        },
        {
          '#': 'reactive-tips',
          '#view': 'Alert',
          message: '💡 提示：所有状态都存储在 ViewNode 中，通过节点 ID 直接更新，无需外部状态管理！',
          type: 'info',
          showIcon: true,
          style: { marginTop: 16 }
        }
      ]
    }
  ]
}

// 表单示例 - ViewNode 双向绑定
const formExample = {
  views: [
    {
      '#': 'form-demo',
      '#view': 'Card',
      title: 'ViewNode 双向绑定表单演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'user-data',
          // 用户数据状态节点
          userName: '',
          userAge: 25,
          userRating: 4,
          isVip: false,
          '#view': 'div',
          style: { display: 'none' }
        },
        {
          '#': 'profile-preview',
          '#view': 'Alert',
          message: () => {
            const userData = getNodeData('user-data')
            if (!userData) return '用户资料预览：加载中...'
            
            const name = userData.userName || '未设置'
            const age = userData.userAge || 25
            const rating = userData.userRating || 4
            const isVip = userData.isVip
            const level = rating >= 4 ? '高级用户' : '普通用户'
            
            return `用户资料预览：${name} | ${age}岁 | 评分${rating}⭐ | ${level} ${isVip ? '(VIP)' : ''}`
          },
          type: 'success',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'demo-form',
          '#view': 'Form',
          layout: 'vertical',
          '#children': [
            {
              '#': 'name-field',
              '#view': 'Form.Item',
              label: '姓名',
              '#children': [
                {
                  '#': 'name-input',
                  '#view': 'Input',
                  placeholder: '请输入姓名',
                  prefix: React.createElement(UserOutlined),
                  value: () => getNodeData('user-data', 'userName') || '',
                  onChange: (e: any) => {
                    updateNodeData('user-data', { userName: e.target.value })
                  }
                }
              ]
            },
            {
              '#': 'age-field',
              '#view': 'Form.Item',
              label: '年龄',
              '#children': [
                {
                  '#': 'age-input',
                  '#view': 'InputNumber',
                  min: 1,
                  max: 120,
                  placeholder: '请输入年龄',
                  value: () => getNodeData('user-data', 'userAge') || 25,
                  onChange: (value: number) => {
                    updateNodeData('user-data', { userAge: value || 0 })
                  }
                }
              ]
            },
            {
              '#': 'rating-field',
              '#view': 'Form.Item',
              label: '评分',
              '#children': [
                {
                  '#': 'rating',
                  '#view': 'Rate',
                  allowHalf: true,
                  value: () => getNodeData('user-data', 'userRating') || 4,
                  onChange: (value: number) => {
                    updateNodeData('user-data', { userRating: value })
                  }
                }
              ]
            },
            {
              '#': 'vip-field',
              '#view': 'Form.Item',
              label: 'VIP 会员',
              '#children': [
                {
                  '#': 'vip-switch',
                  '#view': 'Switch',
                  checked: () => getNodeData('user-data', 'isVip') || false,
                  onChange: (checked: boolean) => {
                    updateNodeData('user-data', { isVip: checked })
                  },
                  checkedChildren: 'VIP',
                  unCheckedChildren: '普通'
                }
              ]
            }
          ]
        },
        {
          '#': 'binding-tips',
          '#view': 'Alert',
          message: '💡 提示：表单数据直接存储在 ViewNode 中，修改后立即反映到预览！这就是 ViewNode 双向绑定的威力！',
          type: 'info',
          showIcon: true,
          style: { marginTop: 16 }
        }
      ]
    }
  ]
}

// TODO管理示例 - Schema 动态更新
const todoExample = {
  views: [
    {
      '#': 'todo-demo',
      '#view': 'Card',
      title: 'Schema 动态更新 - TODO 管理',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'todo-data',
          // TODO数据状态节点
          todos: [
            { id: 1, text: '学习 Eficy V3', completed: false },
            { id: 2, text: '构建响应式应用', completed: true }
          ],
          '#view': 'div',
          style: { display: 'none' }
        },
        {
          '#': 'todo-stats',
          '#view': 'Row',
          gutter: [16, 16],
          style: { marginBottom: 16 },
          '#children': [
            {
              '#': 'total-stat',
              '#view': 'Col',
              span: 8,
              '#children': [
                {
                  '#': 'total-card',
                  '#view': 'Card',
                  size: 'small',
                  '#children': [
                    {
                      '#': 'total-stat-content',
                      '#view': 'div',
                      style: { textAlign: 'center' },
                      '#children': [
                        {
                          '#': 'total-number',
                          '#view': 'div',
                          style: { fontSize: '24px', fontWeight: 'bold', color: '#1890ff' },
                          '#content': () => {
                            const todos = getNodeData('todo-data', 'todos') || []
                            return todos.length.toString()
                          }
                        },
                        {
                          '#': 'total-label',
                          '#view': 'div',
                          '#content': '总任务'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              '#': 'active-stat',
              '#view': 'Col',
              span: 8,
              '#children': [
                {
                  '#': 'active-card',
                  '#view': 'Card',
                  size: 'small',
                  '#children': [
                    {
                      '#': 'active-stat-content',
                      '#view': 'div',
                      style: { textAlign: 'center' },
                      '#children': [
                        {
                          '#': 'active-number',
                          '#view': 'div',
                          style: { fontSize: '24px', fontWeight: 'bold', color: '#52c41a' },
                          '#content': () => {
                            const todos = getNodeData('todo-data', 'todos') || []
                            return todos.filter((todo: any) => !todo.completed).length.toString()
                          }
                        },
                        {
                          '#': 'active-label',
                          '#view': 'div',
                          '#content': '待完成'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              '#': 'completed-stat',
              '#view': 'Col',
              span: 8,
              '#children': [
                {
                  '#': 'completed-card',
                  '#view': 'Card',
                  size: 'small',
                  '#children': [
                    {
                      '#': 'completed-stat-content',
                      '#view': 'div',
                      style: { textAlign: 'center' },
                      '#children': [
                        {
                          '#': 'completed-number',
                          '#view': 'div',
                          style: { fontSize: '24px', fontWeight: 'bold', color: '#faad14' },
                          '#content': () => {
                            const todos = getNodeData('todo-data', 'todos') || []
                            return todos.filter((todo: any) => todo.completed).length.toString()
                          }
                        },
                        {
                          '#': 'completed-label',
                          '#view': 'div',
                          '#content': '已完成'
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
          '#': 'add-todo-section',
          '#view': 'Space.Compact',
          style: { width: '100%', marginBottom: 16 },
          '#children': [
            {
              '#': 'todo-input',
              '#view': 'Input',
              placeholder: '输入新任务...',
              onPressEnter: (e: any) => {
                if (e.target.value.trim()) {
                  const todos = getNodeData('todo-data', 'todos') || []
                  const newTodo = {
                    id: Date.now(),
                    text: e.target.value.trim(),
                    completed: false
                  }
                  updateNodeData('todo-data', { todos: [...todos, newTodo] })
                  e.target.value = ''
                  message.success('任务已添加！')
                }
              }
            },
            {
              '#': 'add-todo-btn',
              '#view': 'Button',
              type: 'primary',
              icon: React.createElement(PlusOutlined),
              onClick: () => {
                const input = document.querySelector('input[placeholder="输入新任务..."]') as HTMLInputElement
                if (input && input.value.trim()) {
                  const todos = getNodeData('todo-data', 'todos') || []
                  const newTodo = {
                    id: Date.now(),
                    text: input.value.trim(),
                    completed: false
                  }
                  updateNodeData('todo-data', { todos: [...todos, newTodo] })
                  input.value = ''
                  message.success('任务已添加！')
                }
              },
              '#content': '添加'
            }
          ]
        },
        {
          '#': 'todo-list',
          '#view': 'List',
          dataSource: () => getNodeData('todo-data', 'todos') || [],
          renderItem: (item: any) => ({
            '#': `todo-item-${item.id}`,
            '#view': 'List.Item',
            actions: [
              {
                '#': `toggle-btn-${item.id}`,
                '#view': 'Button',
                size: 'small',
                type: item.completed ? 'default' : 'primary',
                onClick: () => {
                  const todos = getNodeData('todo-data', 'todos') || []
                  const updatedTodos = todos.map((todo: any) =>
                    todo.id === item.id ? { ...todo, completed: !todo.completed } : todo
                  )
                  updateNodeData('todo-data', { todos: updatedTodos })
                  message.success(item.completed ? '任务标记为未完成' : '任务完成！')
                },
                '#content': item.completed ? '撤销' : '完成'
              },
              {
                '#': `delete-btn-${item.id}`,
                '#view': 'Button',
                size: 'small',
                danger: true,
                icon: React.createElement(DeleteOutlined),
                onClick: () => {
                  const todos = getNodeData('todo-data', 'todos') || []
                  const filteredTodos = todos.filter((todo: any) => todo.id !== item.id)
                  updateNodeData('todo-data', { todos: filteredTodos })
                  message.success('任务已删除')
                }
              }
            ],
            '#children': [
              {
                '#': `todo-content-${item.id}`,
                '#view': 'List.Item.Meta',
                title: {
                  '#': `todo-title-${item.id}`,
                  '#view': 'span',
                  style: { 
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#999' : '#000'
                  },
                  '#content': item.text
                },
                description: item.completed ? '已完成' : '待完成'
              }
            ]
          })
        },
        {
          '#': 'schema-tips',
          '#view': 'Alert',
          message: '💡 提示：所有 TODO 数据都存储在 ViewNode 中，增删改操作直接更新 Schema，实现动态数据管理！',
          type: 'info',
          showIcon: true,
          style: { marginTop: 16 }
        }
      ]
    }
  ]
}

// 条件渲染示例
const conditionalExample = {
  views: [
    {
      '#': 'conditional-demo',
      '#view': 'Card',
      title: '条件渲染演示',
      '#children': [
        {
          '#': 'morning-greeting',
          '#view': 'Alert',
          message: '早上好！当前时间小于12点',
          type: 'success',
          '#if': () => new Date().getHours() < 12
        },
        {
          '#': 'afternoon-greeting',
          '#view': 'Alert',
          message: '下午好！当前时间大于等于12点',
          type: 'warning',
          '#if': () => new Date().getHours() >= 12
        },
        {
          '#': 'time-info',
          '#view': 'Text',
          '#content': `当前时间: ${new Date().toLocaleTimeString()}`,
          style: { display: 'block', marginTop: 16 }
        }
      ]
    }
  ]
}

// 动态节点管理示例
const dynamicNodesExample = {
  views: [
    {
      '#': 'dynamic-demo',
      '#view': 'Card',
      title: 'ViewNode 动态节点管理',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'nodes-data',
          // 动态节点数据
          dynamicNodes: [
            { id: 'node-1', title: '默认节点 1', type: 'info' },
            { id: 'node-2', title: '默认节点 2', type: 'success' }
          ],
          '#view': 'div',
          style: { display: 'none' }
        },
        {
          '#': 'node-controls',
          '#view': 'Space',
          style: { marginBottom: 16 },
          '#children': [
            {
              '#': 'add-node-btn',
              '#view': 'Button',
              type: 'primary',
              icon: React.createElement(PlusOutlined),
              onClick: () => {
                const nodes = getNodeData('nodes-data', 'dynamicNodes') || []
                const types = ['info', 'success', 'warning', 'error']
                const randomType = types[Math.floor(Math.random() * types.length)]
                const newNode = {
                  id: `node-${Date.now()}`,
                  title: `动态节点 ${nodes.length + 1}`,
                  type: randomType
                }
                updateNodeData('nodes-data', { dynamicNodes: [...nodes, newNode] })
                message.success('节点已添加！')
              },
              '#content': '添加节点'
            },
            {
              '#': 'node-count',
              '#view': 'Badge',
              count: () => {
                const nodes = getNodeData('nodes-data', 'dynamicNodes') || []
                return nodes.length
              },
              '#children': [
                {
                  '#': 'count-text',
                  '#view': 'Text',
                  '#content': '当前节点数量'
                }
              ]
            }
          ]
        },
        {
          '#': 'dynamic-nodes-list',
          '#view': 'Space',
          direction: 'vertical',
          style: { width: '100%' },
          '#children': () => {
            const nodes = getNodeData('nodes-data', 'dynamicNodes') || []
            return nodes.map((node: any) => ({
              '#': `dynamic-node-${node.id}`,
              '#view': 'Alert',
              message: node.title,
              type: node.type,
              showIcon: true,
              closable: true,
              onClose: () => {
                const currentNodes = getNodeData('nodes-data', 'dynamicNodes') || []
                const filteredNodes = currentNodes.filter((n: any) => n.id !== node.id)
                updateNodeData('nodes-data', { dynamicNodes: filteredNodes })
                message.success('节点已删除')
              },
              action: {
                '#': `node-action-${node.id}`,
                '#view': 'Button',
                size: 'small',
                type: 'text',
                icon: React.createElement(EditOutlined),
                onClick: () => {
                  message.info(`编辑节点: ${node.title}`)
                }
              }
            }))
          }
        },
        {
          '#': 'dynamic-tips',
          '#view': 'Alert',
          message: '💡 提示：通过修改 ViewNode 数据，可以动态增删节点，Schema 会自动响应更新！',
          type: 'info',
          showIcon: true,
          style: { marginTop: 16 }
        }
      ]
    }
  ]
}

// 性能监控示例
const performanceExample = {
  views: [
    {
      '#': 'performance-demo',
      '#view': 'Card',
      title: 'ViewNode 性能监控演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'performance-data',
          // 性能数据状态
          metrics: {
            responsive: 95,
            render: 88,
            memory: 92,
            bundle: 85
          },
          '#view': 'div',
          style: { display: 'none' }
        },
        {
          '#': 'perf-info',
          '#view': 'Alert',
          message: 'ViewNode 本身就是状态容器，无需外部状态管理，性能更优！',
          type: 'info',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'perf-metrics',
          '#view': 'Row',
          gutter: [16, 16],
          '#children': [
            {
              '#': 'responsive-metric',
              '#view': 'Col',
              span: 6,
              '#children': [
                {
                  '#': 'responsive-card',
                  '#view': 'Card',
                  '#children': [
                    {
                      '#': 'responsive-progress',
                      '#view': 'Progress',
                      type: 'circle',
                      percent: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        return Math.round(metrics?.responsive || 95)
                      },
                      format: () => '响应式',
                      strokeColor: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        const value = metrics?.responsive || 95
                        return value > 90 ? '#52c41a' : '#faad14'
                      }
                    }
                  ]
                }
              ]
            },
            {
              '#': 'render-metric',
              '#view': 'Col',
              span: 6,
              '#children': [
                {
                  '#': 'render-card',
                  '#view': 'Card',
                  '#children': [
                    {
                      '#': 'render-progress',
                      '#view': 'Progress',
                      type: 'circle',
                      percent: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        return Math.round(metrics?.render || 88)
                      },
                      format: () => '渲染优化',
                      strokeColor: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        const value = metrics?.render || 88
                        return value > 85 ? '#52c41a' : '#faad14'
                      }
                    }
                  ]
                }
              ]
            },
            {
              '#': 'memory-metric',
              '#view': 'Col',
              span: 6,
              '#children': [
                {
                  '#': 'memory-card',
                  '#view': 'Card',
                  '#children': [
                    {
                      '#': 'memory-progress',
                      '#view': 'Progress',
                      type: 'circle',
                      percent: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        return Math.round(metrics?.memory || 92)
                      },
                      format: () => '内存优化',
                      strokeColor: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        const value = metrics?.memory || 92
                        return value > 88 ? '#52c41a' : '#faad14'
                      }
                    }
                  ]
                }
              ]
            },
            {
              '#': 'bundle-metric',
              '#view': 'Col',
              span: 6,
              '#children': [
                {
                  '#': 'bundle-card',
                  '#view': 'Card',
                  '#children': [
                    {
                      '#': 'bundle-progress',
                      '#view': 'Progress',
                      type: 'circle',
                      percent: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        return Math.round(metrics?.bundle || 85)
                      },
                      format: () => '包体积',
                      strokeColor: () => {
                        const metrics = getNodeData('performance-data', 'metrics')
                        const value = metrics?.bundle || 85
                        return value > 80 ? '#52c41a' : '#faad14'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          '#': 'manual-trigger',
          '#view': 'Space',
          style: { marginTop: 16 },
          '#children': [
            {
              '#': 'trigger-update-btn',
              '#view': 'Button',
              type: 'primary',
              icon: React.createElement(SearchOutlined),
              onClick: () => {
                const currentMetrics = getNodeData('performance-data', 'metrics') || {}
                const newMetrics = {
                  responsive: Math.max(80, Math.min(100, currentMetrics.responsive + (Math.random() - 0.5) * 10)),
                  render: Math.max(70, Math.min(100, currentMetrics.render + (Math.random() - 0.5) * 8)),
                  memory: Math.max(75, Math.min(100, currentMetrics.memory + (Math.random() - 0.5) * 6)),
                  bundle: Math.max(70, Math.min(100, currentMetrics.bundle + (Math.random() - 0.5) * 5))
                }
                updateNodeData('performance-data', { metrics: newMetrics })
                message.success('性能指标已更新！')
              },
              '#content': '模拟性能变化'
            }
          ]
        }
      ]
    }
  ]
}

// 主应用组件
const App: React.FC = () => {
  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 32 }}>
          Eficy Core V3 - ViewNode State Management
        </Title>
        
        <Tabs defaultActiveKey="reactive" style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
          <TabPane tab="基础功能" key="basic">
            {eficy.createElement(basicExample)}
          </TabPane>
          
          <TabPane tab="ViewNode 状态" key="reactive">
            {eficy.createElement(reactiveExample)}
          </TabPane>
          
          <TabPane tab="双向绑定" key="form">
            {eficy.createElement(formExample)}
          </TabPane>
          
          <TabPane tab="TODO管理" key="todo">
            {eficy.createElement(todoExample)}
          </TabPane>
          
          <TabPane tab="动态节点" key="dynamic">
            {eficy.createElement(dynamicNodesExample)}
          </TabPane>
          
          <TabPane tab="条件渲染" key="conditional">
            {eficy.createElement(conditionalExample)}
          </TabPane>
          
          <TabPane tab="性能监控" key="performance">
            {eficy.createElement(performanceExample)}
          </TabPane>
        </Tabs>
        
        <Card style={{ marginTop: 24 }}>
          <Title level={3}>ViewNode 状态管理优势</Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="无需外部状态">
                <Text>ViewNode 本身就是状态容器，无需引入额外的状态管理库</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="直观的API">
                <Text>通过节点 ID 直接获取和更新数据，API 简单易懂</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="自动响应式">
                <Text>数据变化自动触发视图更新，无需手动订阅</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Schema 驱动">
                <Text>完全基于 Schema 配置，支持动态生成和更新</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

// 渲染应用
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}