import 'reflect-metadata'
import React, { useState, useEffect } from 'react'
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
    Paragraph
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
              '#content': '✅ 基于 @eficy/reactive 的现代化响应式系统'
            },
            {
              '#': 'feature2', 
              '#view': 'Text',
              '#content': '✅ 使用 tsyringe 依赖注入容器'
            },
            {
              '#': 'feature3',
              '#view': 'Text',
              '#content': '✅ React.memo 优化的独立节点渲染'
            },
            {
              '#': 'feature4',
              '#view': 'Text',
              '#content': '✅ 支持任意 React 组件库'
            }
          ]
        }
      ]
    }
  ]
}

// 响应式示例
const reactiveExample = {
  views: [
    {
      '#': 'reactive-demo',
      '#view': 'Card',
      title: '响应式数据演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'counter-display',
          '#view': 'Alert',
          message: '当前计数: 0',
          type: 'info',
          style: { marginBottom: 16 }
        },
        {
          '#': 'control-space',
          '#view': 'Space',
          '#children': [
            {
              '#': 'increment-btn',
              '#view': 'Button',
              type: 'primary',
              '#content': '增加计数',
              onClick: () => {
                // 这里演示响应式更新的概念
                message.success('在真实应用中，这里会触发响应式更新！')
              }
            },
            {
              '#': 'reset-btn',
              '#view': 'Button',
              '#content': '重置',
              onClick: () => {
                message.info('重置计数器')
              }
            }
          ]
        }
      ]
    }
  ]
}

// 表单示例
const formExample = {
  views: [
    {
      '#': 'form-demo',
      '#view': 'Card',
      title: '表单组件演示',
      style: { marginBottom: 16 },
      '#children': [
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
                  prefix: React.createElement(UserOutlined)
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
                  placeholder: '请输入年龄'
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
                  allowHalf: true
                }
              ]
            },
            {
              '#': 'submit-field',
              '#view': 'Form.Item',
              '#children': [
                {
                  '#': 'submit-btn',
                  '#view': 'Button',
                  type: 'primary',
                  htmlType: 'submit',
                  '#content': '提交表单',
                  onClick: () => {
                    message.success('表单提交成功！（演示）')
                  }
                }
              ]
            }
          ]
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

// EficySchema 树管理演示
const schemaTreeExample = {
  views: [
    {
      '#': 'schema-tree-demo',
      '#view': 'Card',
      title: 'EficySchema 树管理功能演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'tree-info',
          '#view': 'Alert',
          message: 'EficySchema 现在作为完整的 ViewNode Tree 管理器，支持节点索引、快速查找和树结构更新',
          type: 'info',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'tree-features',
          '#view': 'Collapse',
          '#children': [
            {
              '#': 'feature-panel-1',
              '#view': 'Collapse.Panel',
              header: '1. 节点索引和快速查找',
              key: '1',
              '#children': [
                {
                  '#': 'feature-1-content',
                  '#view': 'Paragraph',
                  '#content': 'EficySchema 为每个节点建立索引，支持通过 ID 快速查找：\n\n• schema.getViewModel(id): 根据 ID 获取 ViewNode\n• schema.viewDataMap: 获取所有节点的映射表\n• 支持 O(1) 时间复杂度的节点查找'
                }
              ]
            },
            {
              '#': 'feature-panel-2',
              '#view': 'Collapse.Panel',
              header: '2. 树结构更新和同步',
              key: '2',
              '#children': [
                {
                  '#': 'feature-2-content',
                  '#view': 'Paragraph',
                  '#content': '支持动态更新整个树结构：\n\n• schema.update(newData): 更新整个 Schema\n• 智能差异对比，最小化重新渲染\n• 保持节点状态和引用关系'
                }
              ]
            },
            {
              '#': 'feature-panel-3',
              '#view': 'Collapse.Panel',
              header: '3. 批量更新优化',
              key: '3',
              '#children': [
                {
                  '#': 'feature-3-content',
                  '#view': 'Paragraph',
                  '#content': '使用 @action 装饰器实现批量更新：\n\n• 自动批处理多个节点的更新\n• 减少不必要的重新渲染\n• 优化性能和用户体验'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// ViewNode 响应式更新演示
const viewNodeReactiveExample = {
  views: [
    {
      '#': 'reactive-viewnode-demo',
      '#view': 'Card',
      title: 'ViewNode 响应式更新演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'reactive-info',
          '#view': 'Alert',
          message: 'ViewNode 现在基于 @eficy/reactive 构建，支持细粒度的响应式属性更新',
          type: 'success',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'reactive-features',
          '#view': 'Timeline',
          '#children': [
            {
              '#': 'reactive-step-1',
              '#view': 'Timeline.Item',
              color: 'green',
              '#children': [
                {
                  '#': 'reactive-step-1-content',
                  '#view': 'div',
                  '#children': [
                    {
                      '#': 'step-1-title',
                      '#view': 'Text',
                      strong: true,
                      '#content': '细粒度属性监听',
                      style: { display: 'block', marginBottom: 8 }
                    },
                    {
                      '#': 'step-1-desc',
                      '#view': 'Text',
                      '#content': '每个 ViewNode 属性都是响应式的，使用 @observable 装饰器标记，变化时自动触发重新渲染'
                    }
                  ]
                }
              ]
            },
            {
              '#': 'reactive-step-2',
              '#view': 'Timeline.Item',
              color: 'blue',
              '#children': [
                {
                  '#': 'reactive-step-2-content',
                  '#view': 'div',
                  '#children': [
                    {
                      '#': 'step-2-title',
                      '#view': 'Text',
                      strong: true,
                      '#content': '计算属性缓存',
                      style: { display: 'block', marginBottom: 8 }
                    },
                    {
                      '#': 'step-2-desc',
                      '#view': 'Text',
                      '#content': '使用 @computed 装饰器的属性会自动缓存，只有依赖项变化时才重新计算，如 shouldRender 和 props'
                    }
                  ]
                }
              ]
            },
            {
              '#': 'reactive-step-3',
              '#view': 'Timeline.Item',
              color: 'orange',
              '#children': [
                {
                  '#': 'reactive-step-3-content',
                  '#view': 'div',
                  '#children': [
                    {
                      '#': 'step-3-title',
                      '#view': 'Text',
                      strong: true,
                      '#content': '不可变更新模式',
                      style: { display: 'block', marginBottom: 8 }
                    },
                    {
                      '#': 'step-3-desc',
                      '#view': 'Text',
                      '#content': '所有状态更新都采用不可变方式，确保数据流清晰可追踪，避免副作用'
                    }
                  ]
                }
              ]
            },
            {
              '#': 'reactive-step-4',
              '#view': 'Timeline.Item',
              color: 'purple',
              '#children': [
                {
                  '#': 'reactive-step-4-content',
                  '#view': 'div',
                  '#children': [
                    {
                      '#': 'step-4-title',
                      '#view': 'Text',
                      strong: true,
                      '#content': '子节点管理优化',
                      style: { display: 'block', marginBottom: 8 }
                    },
                    {
                      '#': 'step-4-desc',
                      '#view': 'Text',
                      '#content': '提供 addChild、removeChild 等方法，支持动态添加删除子节点，自动维护树结构完整性'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// 插件体系使用示例
const pluginSystemExample = {
  views: [
    {
      '#': 'plugin-system-demo',
      '#view': 'Card',
      title: '插件体系使用示例',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'plugin-info',
          '#view': 'Alert',
          message: '基于 tsyringe 依赖注入容器构建的现代化插件架构',
          type: 'warning',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'plugin-lifecycle',
          '#view': 'Row',
          gutter: [16, 16],
          '#children': [
            {
              '#': 'init-hook',
              '#view': 'Col',
              span: 8,
              '#children': [
                {
                  '#': 'init-card',
                  '#view': 'Card',
                  size: 'small',
                  title: '@Init 钩子',
                  '#children': [
                    {
                      '#': 'init-desc',
                      '#view': 'Text',
                      '#content': '在插件初始化时调用，用于设置初始状态和注册服务'
                    }
                  ]
                }
              ]
            },
            {
              '#': 'build-hook',
              '#view': 'Col',
              span: 8,
              '#children': [
                {
                  '#': 'build-card',
                  '#view': 'Card',
                  size: 'small',
                  title: '@BuildViewNode 钩子',
                  '#children': [
                    {
                      '#': 'build-desc',
                      '#view': 'Text',
                      '#content': '在 ViewNode 构建时调用，可以修改节点属性和行为'
                    }
                  ]
                }
              ]
            },
            {
              '#': 'render-hook',
              '#view': 'Col',
              span: 8,
              '#children': [
                {
                  '#': 'render-card',
                  '#view': 'Card',
                  size: 'small',
                  title: '@BeforeRender 钩子',
                  '#children': [
                    {
                      '#': 'render-desc',
                      '#view': 'Text',
                      '#content': '在组件渲染前调用，可以注入额外的 props 和逻辑'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          '#': 'plugin-features',
          '#view': 'List',
          header: '插件系统特性',
          bordered: true,
          style: { marginTop: 16 },
          dataSource: [
            '依赖注入容器管理插件生命周期',
            '插件间通信和服务共享机制',
            '支持插件依赖关系管理',
            '热插拔和动态加载支持',
            '完整的类型安全保证'
          ],
          renderItem: (item: string) => ({
            '#': `plugin-item-${item}`,
            '#view': 'List.Item',
            '#children': [
              {
                '#': `plugin-item-icon-${item}`,
                '#view': 'Badge',
                status: 'success',
                text: item
              }
            ]
          })
        }
      ]
    }
  ]
}

// 性能优化演示
const performanceExample = {
  views: [
    {
      '#': 'performance-demo',
      '#view': 'Card',
      title: '性能优化演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'perf-info',
          '#view': 'Alert',
          message: 'Eficy V3 采用多种性能优化技术，确保大型应用的流畅运行',
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
                      percent: 95,
                      format: () => '响应式'
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
                      percent: 88,
                      format: () => '渲染优化'
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
                      percent: 92,
                      format: () => '内存优化'
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
                      percent: 85,
                      format: () => '包体积'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          '#': 'perf-techniques',
          '#view': 'Collapse',
          style: { marginTop: 16 },
          '#children': [
            {
              '#': 'memo-panel',
              '#view': 'Collapse.Panel',
              header: 'React.memo 优化',
              key: '1',
              '#children': [
                {
                  '#': 'memo-content',
                  '#view': 'Text',
                  '#content': 'RenderNode 使用 React.memo 包装，只有 props 真正变化时才重新渲染，完全隔绝不必要的重渲染'
                }
              ]
            },
            {
              '#': 'batch-panel',
              '#view': 'Collapse.Panel',
              header: '批量更新机制',
              key: '2',
              '#children': [
                {
                  '#': 'batch-content',
                  '#view': 'Text',
                  '#content': '使用 @action 装饰器实现批量更新，多个状态变更会自动合并，减少渲染次数'
                }
              ]
            },
            {
              '#': 'computed-panel',
              '#view': 'Collapse.Panel',
              header: '计算属性缓存',
              key: '3',
              '#children': [
                {
                  '#': 'computed-content',
                  '#view': 'Text',
                  '#content': '@computed 装饰器的属性会自动缓存，只有依赖项变化时才重新计算，避免重复计算'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// 错误边界演示
const errorBoundaryExample = {
  views: [
    {
      '#': 'error-boundary-demo',
      '#view': 'Card',
      title: '错误边界演示',
      style: { marginBottom: 16 },
      '#children': [
        {
          '#': 'error-info',
          '#view': 'Alert',
          message: '使用 react-error-boundary 替代自定义错误边界，提供更好的错误处理体验',
          type: 'error',
          showIcon: true,
          style: { marginBottom: 16 }
        },
        {
          '#': 'error-features',
          '#view': 'Space',
          direction: 'vertical',
          size: 'middle',
          style: { width: '100%' },
          '#children': [
            {
              '#': 'error-isolation',
              '#view': 'Card',
              size: 'small',
              title: '错误隔离',
              '#children': [
                {
                  '#': 'error-isolation-desc',
                  '#view': 'Text',
                  '#content': '每个 RenderNode 都有独立的错误边界，单个组件错误不会影响整个应用'
                }
              ]
            },
            {
              '#': 'error-recovery',
              '#view': 'Card',
              size: 'small',
              title: '自动恢复',
              '#children': [
                {
                  '#': 'error-recovery-desc',
                  '#view': 'Text',
                  '#content': '提供 fallback 组件和重试机制，用户可以优雅地处理错误情况'
                }
              ]
            },
            {
              '#': 'error-reporting',
              '#view': 'Card',
              size: 'small',
              title: '错误报告',
              '#children': [
                {
                  '#': 'error-reporting-desc',
                  '#view': 'Text',
                  '#content': '支持错误信息收集和上报，便于开发者快速定位和修复问题'
                }
              ]
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
          Eficy Core V3 Playground
        </Title>
        
        <Tabs defaultActiveKey="basic" style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
          <TabPane tab="基础功能" key="basic">
            {eficy.createElement(basicExample)}
          </TabPane>
          
          <TabPane tab="响应式演示" key="reactive">
            {eficy.createElement(reactiveExample)}
          </TabPane>
          
          <TabPane tab="表单组件" key="form">
            {eficy.createElement(formExample)}
          </TabPane>
          
          <TabPane tab="条件渲染" key="conditional">
            {eficy.createElement(conditionalExample)}
          </TabPane>
          
          <TabPane tab="树管理" key="schema-tree">
            {eficy.createElement(schemaTreeExample)}
          </TabPane>
          
          <TabPane tab="ViewNode 响应式" key="viewnode-reactive">
            {eficy.createElement(viewNodeReactiveExample)}
          </TabPane>
          
          <TabPane tab="插件体系" key="plugin-system">
            {eficy.createElement(pluginSystemExample)}
          </TabPane>
          
          <TabPane tab="性能优化" key="performance">
            {eficy.createElement(performanceExample)}
          </TabPane>
          
          <TabPane tab="错误边界" key="error-boundary">
            {eficy.createElement(errorBoundaryExample)}
          </TabPane>
        </Tabs>
        
        <Card style={{ marginTop: 24 }}>
          <Title level={3}>技术特色</Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="现代化响应式">
                <Text>基于 @eficy/reactive 构建，提供细粒度的响应式更新</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="依赖注入">
                <Text>使用 tsyringe 实现现代化的依赖注入架构</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="性能优化">
                <Text>React.memo 优化的独立节点渲染，完全隔绝不必要的重渲染</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="组件库无关">
                <Text>支持任意 React 组件库，不再强依赖特定UI框架</Text>
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