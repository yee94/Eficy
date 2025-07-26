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
  Tabs
} from 'antd'
import { UserOutlined, StarOutlined, HeartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

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
    HeartOutlined
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