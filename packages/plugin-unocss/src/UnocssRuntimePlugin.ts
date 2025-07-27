import type { UnoGenerator, UserConfig } from '@unocss/core';

// 简化的配置接口
export interface UnocssRuntimeConfig {
  // UnoCSS 配置
  config?: UserConfig;
}

// 简化的 UnoCSS Runtime 插件
export class UnocssRuntimePlugin {
  private generator: UnoGenerator | null = null;
  private collectedClasses = new Set<string>();
  private styleInjected = false;
  private config: UnocssRuntimeConfig;

  constructor(config: UnocssRuntimeConfig = {}) {
    this.config = config;
  }

  /**
   * 初始化 UnoCSS 生成器
   */
  async init(): Promise<void> {
    try {
      const { createGenerator } = await import('@unocss/core');
      const { presetUno } = await import('@unocss/preset-uno');
      const { presetAttributify } = await import('@unocss/preset-attributify');

      const userConfig: UserConfig = {
        presets: [
          presetUno({
            preflight: false,
          }),
          presetAttributify({
            /* preset options */
          }),
        ],
        ...this.config.config,
      };

      this.generator = await createGenerator(userConfig);
    } catch (error) {
      console.error('[UnocssRuntimePlugin] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * 收集类名
   */
  collectClassNames(classNames: string | string[]): void {
    if (!this.generator) return;

    const classes = Array.isArray(classNames) ? classNames : [classNames];

    classes.forEach((className) => {
      if (className && typeof className === 'string') {
        className.split(/\s+/).forEach((cls) => {
          if (cls.trim()) {
            this.collectedClasses.add(cls.trim());
          }
        });
      }
    });
  }

  /**
   * 生成并注入样式
   */
  async generateAndInjectStyles(): Promise<void> {
    if (!this.generator || this.collectedClasses.size === 0 || this.styleInjected) {
      return;
    }

    try {
      const classArray = Array.from(this.collectedClasses);
      const result = await this.generator.generate(classArray.join(' '));

      if (result.css) {
        this.injectCSS(result.css);
        this.styleInjected = true;
      }
    } catch (error) {
      console.error('[UnocssRuntimePlugin] Failed to generate styles:', error);
    }
  }

  /**
   * 注入 CSS 到页面
   */
  private injectCSS(css: string): void {
    if (typeof document === 'undefined') return;

    const styleId = 'unocss-runtime';

    // 移除已存在的样式
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // 创建新的样式标签
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * 获取生成器实例
   */
  getGenerator(): UnoGenerator | null {
    return this.generator;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.collectedClasses.clear();
    this.styleInjected = false;
    this.generator = null;

    // 移除注入的样式
    if (typeof document !== 'undefined') {
      const style = document.getElementById('unocss-runtime');
      if (style) {
        style.remove();
      }
    }
  }
}

// 导出创建函数
export function createUnocssRuntimePlugin(config?: UnocssRuntimeConfig): UnocssRuntimePlugin {
  return new UnocssRuntimePlugin(config);
}

export default UnocssRuntimePlugin;
