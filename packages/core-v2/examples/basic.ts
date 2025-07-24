/**
 * Eficy Core v2.0 基础示例
 */

import { createEficy } from '../src';

// 创建 Eficy 实例
const eficy = createEficy();

// 配置组件库
eficy.config({
  defaultComponentMap: {
    // 自定义按钮组件
    Button: ({ children, onClick, type = 'default' }: any) => {
      const styles = {
        default: { background: '#f0f0f0', border: '1px solid #ccc' },
        primary: { background: '#1890ff', color: 'white', border: 'none' },
        danger: { background: '#ff4d4f', color: 'white', border: 'none' }
      };

      return React.createElement('button', {
        onClick,
        style: { 
          padding: '8px 16px', 
          borderRadius: '4px', 
          cursor: 'pointer',
          ...styles[type]
        }
      }, children);
    },

    // 自定义输入框组件
    Input: ({ value, onChange, placeholder }: any) => {
      return React.createElement('input', {
        value,
        onChange: (e: any) => onChange && onChange(e.target.value),
        placeholder,
        style: {
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          outline: 'none'
        }
      });
    },

    // 自定义卡片组件
    Card: ({ title, children }: any) => {
      return React.createElement('div', {
        style: {
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }, [
        title && React.createElement('h3', { 
          key: 'title',
          style: { margin: '0 0 16px 0', fontSize: '16px' } 
        }, title),
        children
      ]);
    }
  }
});

// 示例1: 基础渲染
export const basicExample = {
  '#view': 'Card',
  title: 'Eficy Core v2.0 基础示例',
  '#children': [
    {
      '#view': 'div',
      style: { marginBottom: '16px' },
      '#children': [
        {
          '#view': 'Button',
          type: 'primary',
          '#content': '主要按钮',
          onClick: () => alert('主要按钮被点击!')
        }
      ]
    },
    {
      '#view': 'div',
      style: { marginBottom: '16px' },
      '#children': [
        {
          '#view': 'Button',
          type: 'danger',
          '#content': '危险按钮',
          onClick: () => alert('危险按钮被点击!')
        }
      ]
    },
    {
      '#view': 'Input',
      placeholder: '请输入内容...',
      onChange: (value: string) => console.log('输入值:', value)
    }
  ]
};

// 示例2: 使用内置动作
export const actionExample = {
  '#view': 'Card',
  title: '动作系统示例',
  '#children': [
    {
      '#view': 'Button',
      type: 'primary',
      '#content': '显示成功消息',
      onClick: {
        action: 'success',
        data: { msg: '操作成功完成!' }
      }
    }
  ]
};

// 示例3: 响应式数据
export const reactiveExample = {
  views: [
    {
      '#': 'counter-card',
      '#view': 'Card',
      title: '响应式计数器',
      '#children': [
        {
          '#view': 'div',
          style: { textAlign: 'center', marginBottom: '16px' },
          '#content': '计数: ${models.counter.value}'
        },
        {
          '#view': 'div',
          style: { textAlign: 'center' },
          '#children': [
            {
              '#view': 'Button',
              '#content': '+1',
              onClick: {
                action: 'update',
                data: [{
                  '#': 'counter',
                  value: '${models.counter.value + 1}'
                }]
              }
            }
          ]
        }
      ]
    }
  ],
  data: {
    counter: {
      '#': 'counter',
      value: 0
    }
  }
};

// 示例4: 请求示例
export const requestExample = {
  views: [
    {
      '#view': 'Card',
      title: '请求示例',
      '#children': [
        {
          '#view': 'Button',
          type: 'primary',
          '#content': '获取数据',
          onClick: {
            action: 'request',
            data: {
              url: 'https://jsonplaceholder.typicode.com/posts/1',
              method: 'GET',
              format: (response: any) => ({
                action: 'success',
                data: { msg: `获取到标题: ${response.title}` }
              })
            }
          }
        }
      ]
    }
  ]
};

// 导出所有示例
export const examples = {
  basic: basicExample,
  action: actionExample,
  reactive: reactiveExample,
  request: requestExample
};

// 使用示例的函数
export function renderExample(exampleName: keyof typeof examples, container: string) {
  eficy.render(examples[exampleName], container);
}

// 默认导出
export default examples; 