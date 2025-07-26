import 'reflect-metadata'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Eficy } from '@eficy/core-v3'

// 创建 Eficy V3 实例
const eficy = new Eficy()

// 最简单的示例 - 只使用原生HTML标签
const simpleExample = {
  views: [
    {
      '#': 'title',
      '#view': 'h1',
      style: { color: 'blue', textAlign: 'center' },
      '#content': '🚀 Eficy Core V3 Works!'
    },
    {
      '#': 'description',
      '#view': 'div',
      style: { 
        padding: '20px', 
        background: '#f0f0f0', 
        margin: '20px 0',
        borderRadius: '8px'
      },
      '#content': '这是 Eficy Core V3 的简单演示，使用原生 HTML 标签渲染。'
    },
    {
      '#': 'features',
      '#view': 'div',
      '#children': [
        {
          '#': 'feature1',
          '#view': 'p',
          '#content': '✅ 现代化响应式系统'
        },
        {
          '#': 'feature2',
          '#view': 'p',
          '#content': '✅ 依赖注入架构'
        },
        {
          '#': 'feature3',
          '#view': 'p',
          '#content': '✅ React.memo 性能优化'
        }
      ]
    },
    {
      '#': 'button',
      '#view': 'button',
      style: { 
        padding: '10px 20px', 
        background: '#1890ff', 
        color: 'white', 
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      },
      '#content': '点击测试',
      onClick: () => {
        alert('Eficy Core V3 按钮点击事件正常工作！')
      }
    }
  ]
}

// 条件渲染演示
const conditionalExample = {
  views: [
    {
      '#': 'time-based',
      '#view': 'div',
      style: { marginTop: '20px', padding: '15px', background: '#e6fffb', borderRadius: '4px' },
      '#children': [
        {
          '#': 'morning',
          '#view': 'p',
          '#content': '🌅 早上好！现在是上午时间',
          '#if': () => new Date().getHours() < 12
        },
        {
          '#': 'afternoon',
          '#view': 'p', 
          '#content': '🌞 下午好！现在是下午时间',
          '#if': () => new Date().getHours() >= 12
        },
        {
          '#': 'current-time',
          '#view': 'p',
          '#content': `⏰ 当前时间: ${new Date().toLocaleTimeString()}`,
          style: { fontWeight: 'bold' }
        }
      ]
    }
  ]
}

// 主应用组件
const App: React.FC = () => {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {eficy.createElement(simpleExample)}
      {eficy.createElement(conditionalExample)}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#fff7e6',
        borderRadius: '8px',
        border: '1px solid #ffd591'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🎯 技术亮点</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>基于 @eficy/reactive 的现代化响应式系统</li>
          <li>使用 tsyringe 依赖注入容器</li>
          <li>自动注册原生 HTML 标签，无需额外配置</li>
          <li>支持条件渲染和事件处理</li>
        </ul>
      </div>
    </div>
  )
}

// 渲染应用
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
} else {
  console.error('Root container not found')
} 