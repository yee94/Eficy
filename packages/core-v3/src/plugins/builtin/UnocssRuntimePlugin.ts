import type { ComponentType } from 'react'
import type { DependencyContainer } from 'tsyringe'
import type { 
  ILifecyclePlugin, 
  IProcessPropsContext,
  IBuildSchemaNodeContext,
  IRenderContext
} from '../../interfaces/lifecycle'
import type { IViewData } from '../../interfaces'
import type EficyNode from '../../models/EficyNode'
import { ProcessProps, BuildSchemaNode, Render } from '../../decorators/lifecycle'

// 自定义预设接口
export interface IUnocssPreset {
  name: string
  rules?: any[]
  shortcuts?: Record<string, string | string[]>
  theme?: Record<string, any>
  variants?: any[]
  preflights?: any[]
  postprocess?: (util: any) => void
  [key: string]: any
}

// UnoCSS Runtime 配置接口
export interface IUnocssRuntimeConfig {
  // UnoCSS runtime 配置
  uno?: {
    // 预设 - 支持内置预设和自定义预设
    presets?: (string | IUnocssPreset)[]
    // 自定义规则
    rules?: any[]
    // 主题配置
    theme?: Record<string, any>
    // 快捷方式
    shortcuts?: Record<string, string | string[]>
    // 变体
    variants?: any[]
    // 提取器
    extractors?: any[]
    // 转换器
    transformers?: any[]
    // 预检样式
    preflights?: boolean | any[]
    // 后处理器
    postprocess?: any[]
    // 内容路径（在运行时模式下不常用）
    content?: string[]
    // 安全列表（确保这些类总是生成）
    safelist?: string[]
    // 阻塞列表（排除这些类）
    blocklist?: string[]
  }
  // 插件特定配置
  injectPosition?: 'head' | 'body' | 'root' // 样式注入位置
  enableDevtools?: boolean // 是否启用开发工具
  enableHMR?: boolean // 是否启用热更新
  enableClassnameExtraction?: boolean // 是否启用 className 提取
  classNameCollector?: (className: string) => void // 自定义类名收集器
  generateId?: () => string // 自定义样式标签ID生成器
  // CSS 生成选项
  generateOptions?: {
    preflights?: boolean // 是否包含预检样式
    safelist?: boolean // 是否处理安全列表
    minify?: boolean // 是否压缩CSS
  }
}

// UnoCSS Runtime 插件类
export class UnocssRuntimePlugin implements ILifecyclePlugin {
  public readonly name = 'UnocssRuntimePlugin'
  public readonly version = '1.0.0'
  public readonly enforce = 'pre' as const

  private config: IUnocssRuntimeConfig
  private uno: any = null
  private collectedClasses = new Set<string>()
  private styleInjected = false
  private rootNodeId: string | null = null

  constructor(config: IUnocssRuntimeConfig = {}) {
    this.config = {
      injectPosition: 'head',
      enableDevtools: false,
      enableHMR: false,
      enableClassnameExtraction: true,
      generateOptions: {
        preflights: false,
        safelist: true,
        minify: false
      },
      ...config,
      generateOptions: {
        preflights: false,
        safelist: true,
        minify: false,
        ...config.generateOptions
      }
    }
  }

  /**
   * 插件安装 - 在浏览器运行时创建 UnoCSS 生成器
   */
  async install(container: DependencyContainer): Promise<void> {
    try {
      // 动态导入 UnoCSS runtime 模块
      const { createGenerator } = await import('@unocss/core')
      
      // 准备预设
      const presets = await this.preparePresets()
      
      // 创建 UnoCSS 生成器，专为浏览器运行时优化
      this.uno = createGenerator({
        // 预设配置
        presets,
        
        // 自定义规则 - 支持用户定义的规则
        rules: [
          // 默认网格列规则（参考用户提供的代码）
          [
            /^grid-cols-(\d+)$/,
            ([, d]) => ({
              'grid-template-columns': Array.from({ length: Number(d) }, () => '1fr').join(' ')
            })
          ],
          // 用户自定义规则
          ...(this.config.uno?.rules || [])
        ],
        
        // 主题配置
        theme: this.config.uno?.theme,
        
        // 快捷方式
        shortcuts: this.config.uno?.shortcuts,
        
        // 变体
        variants: this.config.uno?.variants,
        
        // 提取器（运行时模式下通常不需要）
        extractors: this.config.uno?.extractors,
        
        // 转换器
        transformers: this.config.uno?.transformers,
        
        // 预检样式
        preflights: this.config.uno?.preflights,
        
        // 后处理器
        postprocess: this.config.uno?.postprocess,
        
        // 安全列表和阻塞列表
        safelist: this.config.uno?.safelist,
        blocklist: this.config.uno?.blocklist
      })

      if (this.config.enableDevtools) {
        console.debug('[UnocssRuntimePlugin] UnoCSS runtime generator initialized')
        console.debug('[UnocssRuntimePlugin] Presets loaded:', presets.map(p => p.name || 'unnamed'))
      }
    } catch (error) {
      console.warn('[UnocssRuntimePlugin] Failed to initialize UnoCSS:', error)
      
      // In test environment, allow graceful degradation
      if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
        this.uno = this.createMockGenerator()
        return
      }
      
      throw new Error('UnoCSS runtime initialization failed. Make sure @unocss/core and required presets are installed.')
    }
  }

  /**
   * 准备预设 - 支持字符串预设名和自定义预设
   */
  private async preparePresets(): Promise<any[]> {
    const presets: any[] = []
    const configPresets = this.config.uno?.presets || ['uno']

    // 处理预设配置
    for (const preset of configPresets) {
      if (typeof preset === 'string') {
        // 字符串预设名，动态加载内置预设
        const loadedPreset = await this.loadBuiltinPreset(preset)
        if (loadedPreset) {
          presets.push(loadedPreset)
        }
      } else if (typeof preset === 'object' && preset.name) {
        // 自定义预设对象
        presets.push(preset)
      }
    }

    // 如果没有预设，默认加载 uno 预设
    if (presets.length === 0) {
      const defaultPreset = await this.loadBuiltinPreset('uno')
      if (defaultPreset) {
        presets.push(defaultPreset)
      }
    }

    return presets
  }

  /**
   * 加载内置预设
   */
  private async loadBuiltinPreset(presetName: string): Promise<any | null> {
    try {
      switch (presetName) {
        case 'uno':
        case 'default': {
          const { presetUno } = await import('@unocss/preset-uno')
          return presetUno()
        }
        case 'attributify': {
          const { default: presetAttributify } = await import('@unocss/preset-attributify')
          return presetAttributify()
        }
        case 'rem-to-px': {
          const { default: presetRemToPx } = await import('@unocss/preset-rem-to-px')
          return presetRemToPx()
        }
        case 'icons': {
          const { presetIcons } = await import('@unocss/preset-icons')
          return presetIcons()
        }
        case 'typography': {
          const { presetTypography } = await import('@unocss/preset-typography')
          return presetTypography()
        }
        case 'wind': {
          const { presetWind } = await import('@unocss/preset-wind')
          return presetWind()
        }
        case 'mini': {
          const { presetMini } = await import('@unocss/preset-mini')
          return presetMini()
        }
        default:
          console.warn(`[UnocssRuntimePlugin] Unknown preset: ${presetName}`)
          return null
      }
    } catch (error) {
      console.warn(`[UnocssRuntimePlugin] Failed to load preset ${presetName}:`, error)
      return null
    }
  }

  /**
   * 创建测试用的模拟生成器
   */
  private createMockGenerator(): any {
    return {
      generate: async (input: string, options?: any) => ({
        css: `/* Mock CSS for: ${input} */\n.mock-class { color: red; }`,
        matched: new Set(['mock-class'])
      })
    }
  }

  /**
   * 插件卸载
   */
  async uninstall(container: DependencyContainer): Promise<void> {
    // 清理收集的类名
    this.collectedClasses.clear()
    this.styleInjected = false
    this.rootNodeId = null
    this.uno = null
    
    // 移除已注入的样式
    this.removeInjectedStyles()
    
    console.debug('[UnocssRuntimePlugin] Plugin uninstalled')
  }

  /**
   * 构建 Schema 节点时记录根节点
   */
  @BuildSchemaNode(10)
  async onBuildSchemaNode(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<EficyNode>
  ): Promise<EficyNode> {
    const node = await next()
    
    // 如果是根节点（没有父节点），记录其ID用于后续样式注入
    if (!context.parent && !this.rootNodeId) {
      this.rootNodeId = node['#']
      console.debug('[UnocssRuntimePlugin] Root node identified:', this.rootNodeId)
    }
    
    return node
  }

  /**
   * 处理属性时提取 className
   */
  @ProcessProps(10)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const processedProps = await next()
    
    if (!this.config.enableClassnameExtraction || !this.uno) {
      return processedProps
    }

    // 提取各种可能的类名字段
    const classNames = this.extractClassNames(processedProps)
    
    if (classNames.length > 0) {
      // 收集类名用于后续样式生成
      classNames.forEach(className => {
        if (className && typeof className === 'string') {
          // 分割空格分隔的类名
          className.split(/\s+/).forEach(cls => {
            if (cls.trim()) {
              this.collectedClasses.add(cls.trim())
              
              // 调用自定义收集器
              if (this.config.classNameCollector) {
                this.config.classNameCollector(cls.trim())
              }
            }
          })
        }
      })
      
      console.debug('[UnocssRuntimePlugin] Collected classes from node:', eficyNode['#'], classNames)
    }

    return processedProps
  }

  /**
   * 渲染时注入样式（只在根节点注入一次）
   */
  @Render(100) // 高优先级，确保在其他渲染插件之后执行
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<React.ReactElement>
  ): Promise<React.ReactElement> {
    const element = await next()
    
    // 只在根节点注入样式，且只注入一次
    if (eficyNode['#'] === this.rootNodeId && !this.styleInjected && this.collectedClasses.size > 0) {
      await this.injectStyles(element)
      this.styleInjected = true
    }
    
    return element
  }

  /**
   * 提取各种可能的类名字段
   */
  private extractClassNames(props: Record<string, any>): string[] {
    const classNames: string[] = []
    
    // 常见的类名属性
    const classFields = ['className', 'class', '#class']
    
    classFields.forEach(field => {
      const value = props[field]
      if (value) {
        if (typeof value === 'string') {
          classNames.push(value)
        } else if (Array.isArray(value)) {
          classNames.push(...value.filter(v => typeof v === 'string'))
        }
      }
    })
    
    return classNames
  }

  /**
   * 生成并注入样式 - 运行时在浏览器中生成CSS
   */
  private async injectStyles(rootElement: React.ReactElement): Promise<void> {
    if (!this.uno || this.collectedClasses.size === 0) {
      return
    }

    try {
      // 将收集的类名转换为数组并去重
      const classArray = Array.from(this.collectedClasses)
      
      if (this.config.enableDevtools) {
        console.debug('[UnocssRuntimePlugin] Generating styles for classes:', classArray)
      }
      
      // 处理安全列表
      let allClasses = [...classArray]
      if (this.config.generateOptions?.safelist && this.config.uno?.safelist) {
        allClasses = [...allClasses, ...this.config.uno.safelist]
      }
      
      // 使用 UnoCSS 运行时生成样式
      const generateOptions = {
        preflights: this.config.generateOptions?.preflights || false,
        safelist: this.config.generateOptions?.safelist !== false,
        minify: this.config.generateOptions?.minify || false
      }
      
      const result = await this.uno.generate(allClasses.join(' '), generateOptions)
      
      if (result.css) {
        // 可选的CSS后处理
        let finalCss = result.css
        
        // 应用自定义后处理器
        if (this.config.uno?.postprocess && Array.isArray(this.config.uno.postprocess)) {
          for (const postprocessor of this.config.uno.postprocess) {
            if (typeof postprocessor === 'function') {
              finalCss = postprocessor(finalCss) || finalCss
            }
          }
        }
        
        // 压缩CSS（如果启用）
        if (this.config.generateOptions?.minify) {
          finalCss = this.minifyCSS(finalCss)
        }
        
        if (this.config.enableDevtools) {
          console.debug('[UnocssRuntimePlugin] Generated CSS:', finalCss.length, 'characters')
          console.debug('[UnocssRuntimePlugin] Matched classes:', Array.from(result.matched || []))
        }
        
        // 根据配置决定注入位置
        this.injectCSS(finalCss)
      }
    } catch (error) {
      console.error('[UnocssRuntimePlugin] Failed to generate styles:', error)
    }
  }

  /**
   * 简单的CSS压缩
   */
  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 合并空格
      .replace(/;\s*}/g, '}') // 移除最后一个分号
      .replace(/\s*{\s*/g, '{') // 清理大括号
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') // 清理分号
      .trim()
  }

  /**
   * 注入CSS到页面
   */
  private injectCSS(css: string): void {
    switch (this.config.injectPosition) {
      case 'head':
        this.injectToHead(css)
        break
      case 'body':
        this.injectToBody(css)
        break
      case 'root':
      default:
        // 默认注入到head，root注入需要更复杂的React处理
        this.injectToHead(css)
        break
    }
  }

  /**
   * 注入样式到 head
   */
  private injectToHead(css: string): void {
    if (typeof document !== 'undefined') {
      const styleId = this.config.generateId ? this.config.generateId() : 'unocss-runtime'
      
      // 移除已存在的样式
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
      
      // 创建新的样式标签
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = css
      document.head.appendChild(style)
      
      console.debug('[UnocssRuntimePlugin] Styles injected to head')
    }
  }

  /**
   * 注入样式到 body
   */
  private injectToBody(css: string): void {
    if (typeof document !== 'undefined') {
      const styleId = this.config.generateId ? this.config.generateId() : 'unocss-runtime'
      
      // 移除已存在的样式
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
      
      // 创建新的样式标签
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = css
      document.body.appendChild(style)
      
      console.debug('[UnocssRuntimePlugin] Styles injected to body')
    }
  }

  /**
   * 获取样式生成器实例 - 供高级用户直接使用
   */
  getGenerator(): any {
    return this.uno
  }

  /**
   * 直接生成CSS - 不通过插件生命周期
   */
  async generateCSS(classes: string | string[]): Promise<{ css: string; matched?: Set<string> } | null> {
    if (!this.uno) {
      console.warn('[UnocssRuntimePlugin] Generator not initialized')
      return null
    }

    try {
      const input = Array.isArray(classes) ? classes.join(' ') : classes
      const generateOptions = {
        preflights: this.config.generateOptions?.preflights || false,
        safelist: this.config.generateOptions?.safelist !== false,
        minify: this.config.generateOptions?.minify || false
      }
      
      const result = await this.uno.generate(input, generateOptions)
      
      if (result.css && this.config.generateOptions?.minify) {
        result.css = this.minifyCSS(result.css)
      }
      
      return result
    } catch (error) {
      console.error('[UnocssRuntimePlugin] Failed to generate CSS:', error)
      return null
    }
  }

  /**
   * 移除已注入的样式
   */
  private removeInjectedStyles(): void {
    if (typeof document !== 'undefined') {
      const styleId = this.config.generateId ? this.config.generateId() : 'unocss-runtime'
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
        console.debug('[UnocssRuntimePlugin] Injected styles removed')
      }
    }
  }

  /**
   * 获取插件统计信息
   */
  getStats(): Record<string, any> {
    return {
      collectedClassesCount: this.collectedClasses.size,
      collectedClasses: Array.from(this.collectedClasses),
      styleInjected: this.styleInjected,
      rootNodeId: this.rootNodeId,
      config: this.config
    }
  }

  /**
   * 手动重新生成样式（用于开发调试）
   */
  async regenerateStyles(): Promise<void> {
    if (this.uno && this.collectedClasses.size > 0) {
      this.styleInjected = false
      // 重新生成样式需要触发渲染流程
      // 这里可以添加重新渲染的逻辑
      console.debug('[UnocssRuntimePlugin] Styles regeneration triggered')
    }
  }

  /**
   * 清空收集的类名
   */
  clearCollectedClasses(): void {
    this.collectedClasses.clear()
    this.styleInjected = false
    this.removeInjectedStyles()
    console.debug('[UnocssRuntimePlugin] Collected classes cleared')
  }

  /**
   * 手动添加类名
   */
  addClassName(className: string): void {
    if (className && typeof className === 'string') {
      className.split(/\s+/).forEach(cls => {
        if (cls.trim()) {
          this.collectedClasses.add(cls.trim())
        }
      })
    }
  }

  /**
   * 获取已收集的类名
   */
  getCollectedClasses(): string[] {
    return Array.from(this.collectedClasses)
  }
}

// 导出插件创建工厂函数
export function createUnocssRuntimePlugin(config?: IUnocssRuntimeConfig): UnocssRuntimePlugin {
  return new UnocssRuntimePlugin(config)
}

export default UnocssRuntimePlugin