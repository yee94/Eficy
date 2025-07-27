/**
 * UnoCSS Runtime Plugin 完整演示
 * 
 * 展示如何在浏览器运行时使用 UnoCSS 进行样式生成和注入
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Eficy, createUnocssRuntimePlugin } from '@eficy/core-v3'
import type { IEficySchema } from '@eficy/core-v3'

// 创建 UnoCSS Runtime 插件实例
const unocssPlugin = createUnocssRuntimePlugin({
  // 样式注入到 document head
  injectPosition: 'head',
  
  // 启用开发工具
  enableDevtools: true,
  
  // 启用类名自动提取
  enableClassnameExtraction: true,
  
  // 自定义类名收集器（用于调试）
  classNameCollector: (className: string) => {
    console.log(`[UnoCSS] 收集到类名: ${className}`)
  },
  
  // CSS 生成选项
  generateOptions: {
    preflights: false, // 不包含预检样式
    safelist: true,    // 处理安全列表
    minify: false      // 开发环境不压缩
  },
  
  // UnoCSS 配置
  uno: {
    // 使用内置预设
    presets: ['uno', 'attributify'],
    
    // 自定义规则（参考用户提供的网格规则）
    rules: [
      // 自定义网格列规则
      [
        /^grid-cols-(\d+)$/,
        ([, d]) => ({
          'grid-template-columns': Array.from({ length: Number(d) }, () => '1fr').join(' ')
        })
      ],
      // 自定义动画规则
      [
        /^animate-fade-in$/,
        () => ({
          animation: 'fadeIn 0.5s ease-in-out'
        })
      ]
    ],
    
    // 自定义主题
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444'
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      }
    },
    
    // 快捷方式
    shortcuts: {
      // 按钮快捷方式
      'btn-base': 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      'btn-primary': 'btn-base bg-primary text-white hover:bg-blue-600 focus:ring-primary',
      'btn-secondary': 'btn-base bg-secondary text-white hover:bg-green-600 focus:ring-secondary',
      'btn-accent': 'btn-base bg-accent text-white hover:bg-yellow-600 focus:ring-accent',
      'btn-danger': 'btn-base bg-danger text-white hover:bg-red-600 focus:ring-danger',
      
      // 卡片快捷方式
      'card': 'bg-white rounded-lg shadow-md border border-gray-200 p-6',
      'card-hover': 'card hover:shadow-lg transition-shadow duration-300',
      
      // 输入框快捷方式
      'input': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent',
      
      // 布局快捷方式
      'center': 'flex items-center justify-center',
      'full-screen': 'min-h-screen w-full'
    },
    
    // 安全列表 - 确保这些类总是生成
    safelist: [
      'text-primary',
      'bg-primary',
      'text-secondary',
      'bg-secondary'
    ]
  }
})

// 创建 Eficy 实例并注册插件
const eficy = new Eficy()
eficy.registerPlugin(unocssPlugin)

// 配置基础组件映射
eficy.config({
  componentMap: {
    // HTML 元素会自动注册，这里可以添加自定义组件
  }
})

// 定义演示 Schema
const demoSchema: IEficySchema = {
  views: [
    {
      '#': 'app',
      '#view': 'div',
      className: 'full-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8',
      '#children': [
        // 头部
        {
          '#': 'header',
          '#view': 'header',
          className: 'text-center mb-12',
          '#children': [
            {
              '#': 'title',
              '#view': 'h1',
              className: 'text-4xl font-bold text-gray-900 mb-4 animate-fade-in',
              '#content': 'UnoCSS Runtime Plugin 演示'
            },
            {
              '#': 'subtitle',
              '#view': 'p',
              className: 'text-xl text-gray-600 max-w-2xl mx-auto',
              '#content': '在浏览器运行时生成 UnoCSS 样式，实现真正的原子化 CSS 开发体验'
            }
          ]
        },

        // 主要内容区域
        {
          '#': 'main-content',
          '#view': 'main',
          className: 'max-w-6xl mx-auto',
          '#children': [
            // 特性展示
            {
              '#': 'features-section',
              '#view': 'section',
              className: 'mb-12',
              '#children': [
                {
                  '#': 'features-title',
                  '#view': 'h2',
                  className: 'text-2xl font-bold text-center mb-8',
                  '#content': '核心特性'
                },
                {
                  '#': 'features-grid',
                  '#view': 'div',
                  className: 'grid grid-cols-3 gap-6',
                  '#children': [
                    {
                      '#': 'feature-1',
                      '#view': 'div',
                      className: 'card-hover',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'center w-12 h-12 bg-primary rounded-lg mb-4 text-white text-xl font-bold',
                          '#content': '⚡'
                        },
                        {
                          '#view': 'h3',
                          className: 'text-lg font-semibold mb-2',
                          '#content': '运行时编译'
                        },
                        {
                          '#view': 'p',
                          className: 'text-gray-600',
                          '#content': '无需构建步骤，在浏览器中实时生成 CSS 样式'
                        }
                      ]
                    },
                    {
                      '#': 'feature-2',
                      '#view': 'div',
                      className: 'card-hover',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'center w-12 h-12 bg-secondary rounded-lg mb-4 text-white text-xl font-bold',
                          '#content': '🎯'
                        },
                        {
                          '#view': 'h3',
                          className: 'text-lg font-semibold mb-2',
                          '#content': '自动收集'
                        },
                        {
                          '#view': 'p',
                          className: 'text-gray-600',
                          '#content': '自动从组件属性中收集类名，智能生成所需样式'
                        }
                      ]
                    },
                    {
                      '#': 'feature-3',
                      '#view': 'div',
                      className: 'card-hover',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'center w-12 h-12 bg-accent rounded-lg mb-4 text-white text-xl font-bold',
                          '#content': '🔧'
                        },
                        {
                          '#view': 'h3',
                          className: 'text-lg font-semibold mb-2',
                          '#content': '完全可配置'
                        },
                        {
                          '#view': 'p',
                          className: 'text-gray-600',
                          '#content': '支持自定义规则、主题、快捷方式和预设配置'
                        }
                      ]
                    }
                  ]
                }
              ]
            },

            // 按钮演示
            {
              '#': 'buttons-demo',
              '#view': 'section',
              className: 'card mb-12',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'text-xl font-bold mb-6',
                  '#content': '按钮快捷方式演示'
                },
                {
                  '#view': 'div',
                  className: 'flex flex-wrap gap-4 mb-4',
                  '#children': [
                    {
                      '#view': 'button',
                      className: 'btn-primary',
                      '#content': 'Primary Button'
                    },
                    {
                      '#view': 'button',
                      className: 'btn-secondary',
                      '#content': 'Secondary Button'
                    },
                    {
                      '#view': 'button',
                      className: 'btn-accent',
                      '#content': 'Accent Button'
                    },
                    {
                      '#view': 'button',
                      className: 'btn-danger',
                      '#content': 'Danger Button'
                    }
                  ]
                },
                {
                  '#view': 'p',
                  className: 'text-sm text-gray-500',
                  '#content': '这些按钮使用自定义快捷方式定义，包含完整的交互状态'
                }
              ]
            },

            // 网格演示
            {
              '#': 'grid-demo',
              '#view': 'section',
              className: 'card mb-12',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'text-xl font-bold mb-6',
                  '#content': '自定义网格规则演示'
                },
                {
                  '#view': 'div',
                  className: 'space-y-4',
                  '#children': [
                    // 3列网格
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'h4',
                          className: 'text-sm font-medium mb-2 text-gray-700',
                          '#content': '3列网格 (grid-cols-3)'
                        },
                        {
                          '#view': 'div',
                          className: 'grid grid-cols-3 gap-2',
                          '#children': [
                            {
                              '#view': 'div',
                              className: 'bg-primary text-white text-center py-2 rounded',
                              '#content': '1'
                            },
                            {
                              '#view': 'div',
                              className: 'bg-secondary text-white text-center py-2 rounded',
                              '#content': '2'
                            },
                            {
                              '#view': 'div',
                              className: 'bg-accent text-white text-center py-2 rounded',
                              '#content': '3'
                            }
                          ]
                        }
                      ]
                    },
                    // 5列网格
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'h4',
                          className: 'text-sm font-medium mb-2 text-gray-700',
                          '#content': '5列网格 (grid-cols-5)'
                        },
                        {
                          '#view': 'div',
                          className: 'grid grid-cols-5 gap-2',
                          '#children': Array.from({ length: 5 }, (_, i) => ({
                            '#view': 'div',
                            className: `bg-blue-${300 + i * 100} text-white text-center py-2 rounded`,
                            '#content': (i + 1).toString()
                          }))
                        }
                      ]
                    }
                  ]
                }
              ]
            },

            // 表单演示
            {
              '#': 'form-demo',
              '#view': 'section',
              className: 'card mb-12',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'text-xl font-bold mb-6',
                  '#content': '表单输入演示'
                },
                {
                  '#view': 'div',
                  className: 'grid grid-cols-2 gap-6',
                  '#children': [
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'label',
                          className: 'block text-sm font-medium text-gray-700 mb-2',
                          '#content': '姓名'
                        },
                        {
                          '#view': 'input',
                          className: 'input',
                          type: 'text',
                          placeholder: '请输入您的姓名'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'label',
                          className: 'block text-sm font-medium text-gray-700 mb-2',
                          '#content': '邮箱'
                        },
                        {
                          '#view': 'input',
                          className: 'input',
                          type: 'email',
                          placeholder: '请输入您的邮箱'
                        }
                      ]
                    }
                  ]
                }
              ]
            },

            // 统计信息
            {
              '#': 'stats-section',
              '#view': 'section',
              className: 'card text-center',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'text-xl font-bold mb-6',
                  '#content': '插件运行统计'
                },
                {
                  '#view': 'div',
                  id: 'stats-display',
                  className: 'grid grid-cols-4 gap-4',
                  '#children': [
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-primary mb-1',
                          id: 'classes-count',
                          '#content': '0'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': '已收集类名'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-secondary mb-1',
                          id: 'injection-status',
                          '#content': '否'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': '样式已注入'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-accent mb-1',
                          '#content': 'head'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': '注入位置'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-danger mb-1',
                          '#content': 'v1.0'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': '插件版本'
                        }
                      ]
                    }
                  ]
                },
                {
                  '#view': 'div',
                  className: 'mt-6 pt-6 border-t border-gray-200',
                  '#children': [
                    {
                      '#view': 'button',
                      className: 'btn-primary mr-4',
                      id: 'refresh-stats',
                      '#content': '刷新统计'
                    },
                    {
                      '#view': 'button',
                      className: 'btn-secondary',
                      id: 'view-css',
                      '#content': '查看生成的CSS'
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

// 更新统计信息的函数
function updateStats() {
  const stats = unocssPlugin.getStats()
  
  // 更新显示
  const classesCountEl = document.getElementById('classes-count')
  const injectionStatusEl = document.getElementById('injection-status')
  
  if (classesCountEl) {
    classesCountEl.textContent = stats.collectedClassesCount.toString()
  }
  
  if (injectionStatusEl) {
    injectionStatusEl.textContent = stats.styleInjected ? '是' : '否'
  }
  
  console.log('UnoCSS Plugin Stats:', {
    收集的类名数量: stats.collectedClassesCount,
    收集的类名: stats.collectedClasses,
    样式已注入: stats.styleInjected,
    根节点ID: stats.rootNodeId
  })
}

// 查看生成的CSS
function viewGeneratedCSS() {
  const styleElement = document.getElementById('unocss-runtime')
  if (styleElement && styleElement.textContent) {
    console.log('Generated CSS:', styleElement.textContent)
    
    // 在新窗口中显示CSS
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>生成的 UnoCSS 样式</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
            </style>
          </head>
          <body>
            <h1>UnoCSS 运行时生成的样式</h1>
            <pre>${styleElement.textContent}</pre>
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  } else {
    alert('没有找到生成的CSS样式')
  }
}

// 主渲染函数
async function renderDemo() {
  console.log('🚀 开始渲染 UnoCSS Runtime Plugin 演示...')
  
  try {
    // 渲染 Schema 到页面
    await eficy.render(demoSchema, '#root')
    
    console.log('✅ 演示页面渲染成功!')
    
    // 添加事件监听器
    setTimeout(() => {
      const refreshButton = document.getElementById('refresh-stats')
      const viewCssButton = document.getElementById('view-css')
      
      if (refreshButton) {
        refreshButton.addEventListener('click', updateStats)
      }
      
      if (viewCssButton) {
        viewCssButton.addEventListener('click', viewGeneratedCSS)
      }
      
      // 初始化统计信息
      updateStats()
      
      console.log('📊 统计功能已激活')
      console.log('🎨 请打开浏览器开发者工具查看 <head> 中生成的 CSS 样式')
      console.log('🔍 所有收集的类名都会在控制台输出')
      
    }, 1000)
    
  } catch (error) {
    console.error('❌ 渲染演示失败:', error)
  }
}

// 等待页面加载完成后开始渲染
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderDemo)
} else {
  renderDemo()
}

// 导出供外部使用
export {
  eficy,
  unocssPlugin,
  demoSchema,
  updateStats,
  viewGeneratedCSS
}