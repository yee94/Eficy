/**
 * UnoCSS Runtime Plugin Usage Example
 * 
 * This example demonstrates how to use the UnoCSS Runtime plugin with Eficy Core V3
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Eficy, createUnocssRuntimePlugin } from '@eficy/core-v3'
import type { IEficySchema } from '@eficy/core-v3'

// Create Eficy instance
const eficy = new Eficy()

// Configure basic component mapping
eficy.config({
  componentMap: {
    // HTML elements are automatically registered
    // Custom components can be added here
  }
})

// Create and register UnoCSS Runtime plugin
const unocssPlugin = createUnocssRuntimePlugin({
  injectPosition: 'head', // Inject styles to document head
  enableDevtools: true,   // Enable development tools
  enableClassnameExtraction: true, // Enable automatic className extraction
  
  // Custom class name collector for debugging
  classNameCollector: (className: string) => {
    console.log('[UnoCSS] Collected class:', className)
  },
  
  // UnoCSS configuration
  uno: {
    // Use default presets with custom theme
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        danger: '#ef4444'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    },
    
    // Custom shortcuts
    shortcuts: {
      'btn': 'px-4 py-2 rounded-md font-medium transition-colors',
      'btn-primary': 'btn bg-primary text-white hover:bg-blue-600',
      'btn-secondary': 'btn bg-secondary text-white hover:bg-green-600',
      'btn-danger': 'btn bg-danger text-white hover:bg-red-600',
      'card': 'bg-white rounded-lg shadow-md border border-gray-200 p-6',
      'input-field': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
    },
    
    // Custom rules (optional)
    rules: [
      // Custom animation rule
      [/^animate-bounce-in$/, () => ({
        animation: 'bounceIn 0.6s ease-in-out'
      })],
      
      // Custom glass morphism effect
      [/^glass$/, () => ({
        'backdrop-filter': 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      })]
    ]
  }
})

// Register the plugin
eficy.registerPlugin(unocssPlugin)

// Define the schema with UnoCSS classes
const schema: IEficySchema = {
  views: [
    {
      '#': 'app',
      '#view': 'div',
      className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8',
      '#children': [
        {
          '#': 'container',
          '#view': 'div',
          className: 'max-w-4xl mx-auto px-4',
          '#children': [
            // Header
            {
              '#': 'header',
              '#view': 'header',
              className: 'text-center mb-12',
              '#children': [
                {
                  '#': 'title',
                  '#view': 'h1',
                  className: 'text-4xl font-bold text-gray-900 mb-4 animate-bounce-in',
                  '#content': 'UnoCSS Runtime Plugin Demo'
                },
                {
                  '#': 'subtitle',
                  '#view': 'p',
                  className: 'text-xl text-gray-600 max-w-2xl mx-auto',
                  '#content': 'This page demonstrates real-time UnoCSS compilation with Eficy Core V3. All styles are generated at runtime!'
                }
              ]
            },

            // Feature showcase
            {
              '#': 'features',
              '#view': 'div',
              className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12',
              '#children': [
                {
                  '#': 'feature-1',
                  '#view': 'div',
                  className: 'card hover:shadow-lg transition-shadow',
                  '#children': [
                    {
                      '#view': 'div',
                      className: 'w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4',
                      '#children': [
                        {
                          '#view': 'span',
                          className: 'text-white text-xl font-bold',
                          '#content': '⚡'
                        }
                      ]
                    },
                    {
                      '#view': 'h3',
                      className: 'text-lg font-semibold text-gray-900 mb-2',
                      '#content': 'Runtime Compilation'
                    },
                    {
                      '#view': 'p',
                      className: 'text-gray-600',
                      '#content': 'UnoCSS classes are extracted and compiled at runtime, no build step required.'
                    }
                  ]
                },
                {
                  '#': 'feature-2',
                  '#view': 'div',
                  className: 'card hover:shadow-lg transition-shadow',
                  '#children': [
                    {
                      '#view': 'div',
                      className: 'w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4',
                      '#children': [
                        {
                          '#view': 'span',
                          className: 'text-white text-xl font-bold',
                          '#content': '🎨'
                        }
                      ]
                    },
                    {
                      '#view': 'h3',
                      className: 'text-lg font-semibold text-gray-900 mb-2',
                      '#content': 'Custom Theme'
                    },
                    {
                      '#view': 'p',
                      className: 'text-gray-600',
                      '#content': 'Easily customize colors, spacing, and other design tokens through configuration.'
                    }
                  ]
                },
                {
                  '#': 'feature-3',
                  '#view': 'div',
                  className: 'card hover:shadow-lg transition-shadow',
                  '#children': [
                    {
                      '#view': 'div',
                      className: 'w-12 h-12 bg-danger rounded-lg flex items-center justify-center mb-4',
                      '#children': [
                        {
                          '#view': 'span',
                          className: 'text-white text-xl font-bold',
                          '#content': '🔧'
                        }
                      ]
                    },
                    {
                      '#view': 'h3',
                      className: 'text-lg font-semibold text-gray-900 mb-2',
                      '#content': 'Plugin Integration'
                    },
                    {
                      '#view': 'p',
                      className: 'text-gray-600',
                      '#content': 'Seamlessly integrates with Eficy\'s plugin system using lifecycle hooks.'
                    }
                  ]
                }
              ]
            },

            // Interactive demo
            {
              '#': 'demo-section',
              '#view': 'div',
              className: 'card mb-12',
              '#children': [
                {
                  '#view': 'h2',
                  className: 'text-2xl font-bold text-gray-900 mb-6',
                  '#content': 'Interactive Demo'
                },
                {
                  '#view': 'div',
                  className: 'space-y-4',
                  '#children': [
                    // Buttons showcase
                    {
                      '#view': 'div',
                      className: 'flex flex-wrap gap-4 mb-6',
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
                          className: 'btn-danger',
                          '#content': 'Danger Button'
                        },
                        {
                          '#view': 'button',
                          className: 'btn bg-purple-600 text-white hover:bg-purple-700',
                          '#content': 'Custom Purple'
                        }
                      ]
                    },

                    // Form demo
                    {
                      '#view': 'div',
                      className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                      '#children': [
                        {
                          '#view': 'div',
                          '#children': [
                            {
                              '#view': 'label',
                              className: 'block text-sm font-medium text-gray-700 mb-2',
                              '#content': 'Full Name'
                            },
                            {
                              '#view': 'input',
                              className: 'input-field',
                              type: 'text',
                              placeholder: 'Enter your name'
                            }
                          ]
                        },
                        {
                          '#view': 'div',
                          '#children': [
                            {
                              '#view': 'label',
                              className: 'block text-sm font-medium text-gray-700 mb-2',
                              '#content': 'Email Address'
                            },
                            {
                              '#view': 'input',
                              className: 'input-field',
                              type: 'email',
                              placeholder: 'Enter your email'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },

            // Glass morphism showcase
            {
              '#': 'glass-demo',
              '#view': 'div',
              className: 'glass rounded-xl p-8 text-center mb-12',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'text-2xl font-bold text-white mb-4',
                  '#content': 'Glass Morphism Effect'
                },
                {
                  '#view': 'p',
                  className: 'text-white/80 mb-6',
                  '#content': 'This section uses a custom UnoCSS rule for glass morphism effect'
                },
                {
                  '#view': 'div',
                  className: 'flex justify-center space-x-4',
                  '#children': [
                    {
                      '#view': 'div',
                      className: 'w-16 h-16 glass rounded-full flex items-center justify-center',
                      '#children': [
                        {
                          '#view': 'span',
                          className: 'text-2xl',
                          '#content': '✨'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      className: 'w-16 h-16 glass rounded-full flex items-center justify-center',
                      '#children': [
                        {
                          '#view': 'span',
                          className: 'text-2xl',
                          '#content': '🚀'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      className: 'w-16 h-16 glass rounded-full flex items-center justify-center',
                      '#children': [
                        {
                          '#view': 'span',
                          className: 'text-2xl',
                          '#content': '🎯'
                        }
                      ]
                    }
                  ]
                }
              ]
            },

            // Statistics section
            {
              '#': 'stats',
              '#view': 'div',
              className: 'bg-white rounded-xl shadow-lg p-8 text-center',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'text-xl font-bold text-gray-900 mb-4',
                  '#content': 'Plugin Statistics'
                },
                {
                  '#view': 'div',
                  id: 'stats-content',
                  className: 'grid grid-cols-2 md:grid-cols-4 gap-4',
                  '#children': [
                    {
                      '#view': 'div',
                      className: 'text-center',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-primary mb-1',
                          '#content': '0'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': 'Classes Collected'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      className: 'text-center',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-secondary mb-1',
                          '#content': '✓'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': 'Style Injected'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      className: 'text-center',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-purple-600 mb-1',
                          '#content': 'head'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': 'Injection Target'
                        }
                      ]
                    },
                    {
                      '#view': 'div',
                      className: 'text-center',
                      '#children': [
                        {
                          '#view': 'div',
                          className: 'text-2xl font-bold text-orange-600 mb-1',
                          '#content': 'v1.0'
                        },
                        {
                          '#view': 'div',
                          className: 'text-sm text-gray-600',
                          '#content': 'Plugin Version'
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
  ]
}

// Function to update statistics display
function updateStatistics() {
  const stats = unocssPlugin.getStats()
  console.log('UnoCSS Plugin Stats:', stats)
  
  // In a real application, you could update the DOM to show actual statistics
  // This is just for demonstration purposes
}

// Render the application
async function renderApp() {
  const container = document.getElementById('root')
  if (!container) {
    console.error('Root container not found')
    return
  }

  try {
    // Render the schema
    await eficy.render(schema, container)
    
    // Update statistics after render
    setTimeout(updateStatistics, 1000)
    
    console.log('✅ UnoCSS Runtime Plugin example rendered successfully!')
    console.log('📊 Check the browser dev tools to see the generated CSS in the <head>')
    console.log('🎨 All styles are generated at runtime from the className attributes in the schema')
    
  } catch (error) {
    console.error('❌ Failed to render example:', error)
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', renderApp)

// Export for potential external usage
export { eficy, unocssPlugin, schema, updateStatistics }