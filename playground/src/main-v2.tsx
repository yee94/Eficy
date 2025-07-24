import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createEficy } from '@eficy/core-v2';
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
  message
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;
const { Option } = Select;

// 创建 Eficy v2 实例
const eficy = createEficy();

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
    
    // 表格组件
    Table,
    Tag,
    Divider,
    
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
    'Radio.Button': Radio.Button,
    Checkbox,
    'Checkbox.Group': Checkbox.Group,
    Rate,
    Row,
    Col,
    
    // 图标
    'Icons.UserOutlined': UserOutlined,
    
    // 原生HTML元素
    div: 'div',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    br: 'br',
    a: 'a'
  }
});

// 基础示例
const basicExample = {
  '#view': 'div',
  style: { padding: '20px' },
  '#children': [
    {
      '#view': 'Title',
      level: 1,
      '#content': 'Eficy Core v2.0 示例'
    },
    {
      '#view': 'Card',
      title: '基础组件渲染',
      style: { marginBottom: '16px' },
      '#children': [
        {
          '#view': 'Text',
          '#content': '🎉 Eficy Core v2.0 正在工作！'
        },
        {
          '#view': 'br'
        },
        {
          '#view': 'Button',
          type: 'primary',
          '#content': '点击测试',
          onClick: () => {
            console.log('Button clicked!');
            message.success('Hello from Eficy v2.0!');
          }
        }
      ]
    }
  ]
};

// Table 示例
const tableExample = {
  '#view': 'div',
  style: { padding: '20px' },
  '#children': [
    {
      '#view': 'Title',
      level: 2,
      '#content': 'Table 示例'
    },
    {
      '#view': 'Card',
      title: '用户列表',
      '#children': [
        {
          '#view': 'Table',
          columns: [
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: 'Age',
              dataIndex: 'age',
              key: 'age'
            },
            {
              title: 'Address',
              dataIndex: 'address',
              key: 'address'
            },
            {
              title: 'Tags',
              key: 'tags',
              dataIndex: 'tags',
              render: (tags) => (
                React.createElement('span', {}, 
                  tags.map((tag, index) => {
                    let color = tag.length > 5 ? 'geekblue' : 'green';
                    if (tag === 'loser') {
                      color = 'volcano';
                    }
                    return React.createElement(Tag, {
                      color,
                      key: index
                    }, tag.toUpperCase());
                  })
                )
              )
            }
          ],
          dataSource: [
            {
              key: '1',
              name: 'John Brown',
              age: 32,
              address: 'New York No. 1 Lake Park',
              tags: ['nice', 'developer'],
            },
            {
              key: '2',
              name: 'Jim Green',
              age: 42,
              address: 'London No. 1 Lake Park',
              tags: ['loser'],
            },
            {
              key: '3',
              name: 'Joe Black',
              age: 32,
              address: 'Sidney No. 1 Lake Park',
              tags: ['cool', 'teacher'],
            },
          ],
        }
      ]
    }
  ]
};

// Form 示例
const formExample = {
  '#view': 'div',
  style: { padding: '20px' },
  '#children': [
    {
      '#view': 'Title',
      level: 2,
      '#content': 'Form 示例'
    },
    {
      '#view': 'Alert',
      message: 'Form 示例展示',
      type: 'info',
      showIcon: true,
      style: { marginBottom: '16px' }
    },
    {
      '#view': 'Card',
      title: '用户信息表单',
      '#children': [
        {
          '#view': 'Form',
          name: 'userForm',
          labelCol: { span: 6 },
          wrapperCol: { span: 14 },
          onFinish: (values) => {
            console.log('Form values:', values);
            message.success('Form submitted successfully!');
          },
          initialValues: {
            email: 'test@example.com',
            age: 25,
            active: true,
            experience: 40,
            gender: 'male',
            skills: ['A', 'B'],
            rating: 4
          },
          '#children': [
            {
              '#view': 'Form.Item',
              name: 'email',
              label: 'E-mail',
              rules: [
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ],
              '#children': [
                {
                  '#view': 'Input',
                  placeholder: 'Enter your email'
                },
              ],
            },
            {
              '#view': 'Form.Item',
              name: 'country',
              label: 'Country',
              rules: [{ required: true, message: 'Please select your country!' }],
              '#children': [
                {
                  '#view': 'Select',
                  placeholder: 'Please select a country',
                  '#children': [
                    {
                      '#view': 'Select.Option',
                      value: 'china',
                      '#content': 'China',
                    },
                    {
                      '#view': 'Select.Option',
                      value: 'usa',
                      '#content': 'U.S.A',
                    },
                    {
                      '#view': 'Select.Option',
                      value: 'japan',
                      '#content': 'Japan',
                    },
                  ],
                },
              ],
            },
            {
              '#view': 'Form.Item',
              label: 'Age',
              name: 'age',
              '#children': [
                {
                  '#view': 'InputNumber',
                  min: 1,
                  max: 120,
                  placeholder: 'Enter your age',
                },
              ],
            },
            {
              '#view': 'Form.Item',
              label: 'Active',
              name: 'active',
              valuePropName: 'checked',
              '#children': [
                {
                  '#view': 'Switch',
                },
              ],
            },
            {
              '#view': 'Form.Item',
              name: 'experience',
              label: 'Experience',
              '#children': [
                {
                  '#view': 'Slider',
                  marks: {
                    0: 'Beginner',
                    25: 'Junior',
                    50: 'Mid',
                    75: 'Senior',
                    100: 'Expert',
                  },
                },
              ],
            },
            {
              '#view': 'Form.Item',
              name: 'gender',
              label: 'Gender',
              '#children': [
                {
                  '#view': 'Radio.Group',
                  '#children': [
                    {
                      '#view': 'Radio',
                      value: 'male',
                      '#content': 'Male',
                    },
                    {
                      '#view': 'Radio',
                      value: 'female',
                      '#content': 'Female',
                    },
                    {
                      '#view': 'Radio',
                      value: 'other',
                      '#content': 'Other',
                    },
                  ],
                },
              ],
            },
            {
              '#view': 'Form.Item',
              name: 'skills',
              label: 'Skills',
              '#children': [
                {
                  '#view': 'Checkbox.Group',
                  style: { width: '100%' },
                  '#children': [
                    {
                      '#view': 'Row',
                      '#children': [
                        {
                          '#view': 'Col',
                          span: 8,
                          '#children': [
                            {
                              '#view': 'Checkbox',
                              value: 'A',
                              '#content': 'JavaScript',
                            },
                          ],
                        },
                        {
                          '#view': 'Col',
                          span: 8,
                          '#children': [
                            {
                              '#view': 'Checkbox',
                              value: 'B',
                              '#content': 'React',
                            },
                          ],
                        },
                        {
                          '#view': 'Col',
                          span: 8,
                          '#children': [
                            {
                              '#view': 'Checkbox',
                              value: 'C',
                              '#content': 'Node.js',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              '#view': 'Form.Item',
              name: 'rating',
              label: 'Rating',
              '#children': [
                {
                  '#view': 'Rate',
                  allowHalf: true,
                },
              ],
            },
            {
              '#view': 'Form.Item',
              wrapperCol: { span: 14, offset: 6 },
              '#children': [
                {
                  '#view': 'Button',
                  type: 'primary',
                  htmlType: 'submit',
                  style: { marginRight: '8px' },
                  '#content': 'Submit',
                },
                {
                  '#view': 'Button',
                  htmlType: 'reset',
                  '#content': 'Reset',
                },
              ],
            },
          ],
        }
      ]
    }
  ]
};

// 渲染示例
function App() {
  const [currentExample, setCurrentExample] = React.useState('basic');

  const examples = {
    basic: basicExample,
    table: tableExample,
    form: formExample
  };

  const renderExample = () => {
    try {
      const element = eficy.createElement(examples[currentExample]);
      console.log(element);
      return element;
    } catch (error) {
      console.error('渲染错误:', error);
      return (
        <div style={{ padding: '20px', color: 'red', border: '1px solid #ff4d4f', borderRadius: '6px', backgroundColor: '#fff2f0' }}>
          <h3>渲染错误</h3>
          <p>{error instanceof Error ? error.message : '未知错误'}</p>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', color: '#1890ff' }}>错误详情</summary>
            <pre style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', overflow: 'auto' }}>
              {error instanceof Error ? error.stack : String(error)}
            </pre>
          </details>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={1}>Eficy Core v2.0 Playground</Title>
      <Card title="示例选择" style={{ marginBottom: '20px' }}>
        <Space>
          <Button 
            type={currentExample === 'basic' ? 'primary' : 'default'}
            onClick={() => setCurrentExample('basic')}
          >
            基础示例
          </Button>
          <Button 
            type={currentExample === 'table' ? 'primary' : 'default'}
            onClick={() => setCurrentExample('table')}
          >
            Table 示例
          </Button>
          <Button 
            type={currentExample === 'form' ? 'primary' : 'default'}
            onClick={() => setCurrentExample('form')}
          >
            Form 示例
          </Button>
        </Space>
      </Card>
      
      <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', backgroundColor: '#fafafa' }}>
        {renderExample()}
      </div>
      
      <Card title="技术栈信息" style={{ marginTop: '20px' }} size="small">
        <Space direction="vertical">
          <Text>🚀 Eficy Core v2.0 - 新一代前端编排框架</Text>
          <Text>📦 基于 ReactJS Signal 的响应式系统</Text>
          <Text>�� TypeScript + TSyringe 依赖注入</Text>
          <Text>🎨 Ant Design 5.x 组件库</Text>
          <Text>✅ 完整的 Table 和 Form 组件支持</Text>
        </Space>
      </Card>
    </div>
  );
}

// 启动应用
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}
