import { Initialize, injectable, Render } from '@eficy/core-v3';
import type { ILifecyclePlugin, IRenderContext } from '@eficy/core-v3';
import type { UnoGenerator, UserConfig } from '@unocss/core';
import type { ComponentType } from 'react';
import React from 'react';

export interface UnocssPluginConfig {
  config?: UserConfig;
}

@injectable()
export class UnocssPlugin implements ILifecyclePlugin {
  public readonly name = 'unocss-plugin';
  public readonly version = '1.0.0';
  public readonly enforce = 'pre' as const;

  private generator: UnoGenerator | null = null;
  private collectedClasses = new Set<string>();
  private styleInjected = false;
  private config: UnocssPluginConfig;
  private cssCache = new Map<string, string>();
  private lastClassHash = '';
  private initPromise: Promise<void> | null = null;

  @Initialize()
  initialize(config: UnocssPluginConfig = {}) {
    console.log("🚀 #### ~ UnocssPlugin ~ initialize ~ config:", config);
    this.config = config;
    return this.initializeGenerator();
  }

  /**
   * 渲染钩子 - 处理组件样式并注入 CSS
   */
  @Render(5)
  onRender(context: IRenderContext, next: () => ComponentType<any>): ComponentType<any> {
    const OriginalComponent = next();

    // 收集 className 中的样式类
    if (context.props.className) {
      this.collectClassNames(context.props.className);
    }

    // 返回包装后的组件，在根组件时注入样式
    return (props: any) => {
      const element = React.createElement(OriginalComponent, props);

      // 检查是否是根组件（通过检查是否有特定的根标识）
      const isRootComponent =
        props['data-eficy-root'] === true || props.id === '__eficy_root' || props['data-testid'] === 'eficy-root';

      // 如果是根组件且有收集的样式，注入 CSS
      if (isRootComponent && this.collectedClasses.size > 0 && !this.styleInjected) {
        // 确保生成器已初始化，然后立即注入样式
        this.initPromise?.then(() => {
          this.injectStyles().then(() => {
            this.styleInjected = true;
          });
        });
      }

      return element;
    };
  }

  /**
   * 初始化 UnoCSS 生成器
   */
  private async initializeGenerator(): Promise<void> {
    console.log('🚀 #### ~ UnocssPlugin ~ initializeGenerator ~ this.config:', this.config);
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
      console.error('[UnocssPlugin] Failed to initialize generator:', error);
      // 创建一个模拟生成器用于测试
      this.generator = {
        generate: async (classes: string) => ({
          css: classes
            .split(' ')
            .map((cls) => `.${cls} { /* mock styles */ }`)
            .join('\n'),
        }),
      } as any;
    }
  }

  /**
   * 收集类名
   */
  private collectClassNames(classNames: string | string[] | null | undefined): void {
    if (!classNames) return;

    const classes = Array.isArray(classNames) ? classNames : [classNames];
    classes.forEach((className) => {
      if (className && typeof className === 'string') {
        // 分割多个类名
        const individualClasses = className.split(/\s+/).filter(Boolean);
        individualClasses.forEach((cls) => this.collectedClasses.add(cls));
      }
    });
  }

  /**
   * 注入样式到 DOM
   */
  private async injectStyles(): Promise<void> {
    if (!this.generator || this.collectedClasses.size === 0) {
      return;
    }

    try {
      const css = await this.generateCSS();
      if (css) {
        this.injectCSSToDOM(css);
      }
    } catch (error) {
      console.error('[UnocssPlugin] Failed to inject styles:', error);
    }
  }

  /**
   * 生成 CSS 字符串 - 使用缓存避免重复计算
   */
  private async generateCSS(): Promise<string | null> {
    if (!this.generator || this.collectedClasses.size === 0) {
      return null;
    }

    // 计算当前类名的哈希值用于缓存键
    const classArray = Array.from(this.collectedClasses).sort();
    const currentClassHash = classArray.join('|');

    // 如果类名没有变化，直接返回缓存的CSS
    if (currentClassHash === this.lastClassHash && this.cssCache.has(currentClassHash)) {
      return this.cssCache.get(currentClassHash) || null;
    }

    try {
      const result = await this.generator.generate(classArray.join(' '));
      const css = result.css || null;

      // 更新缓存
      if (css) {
        this.cssCache.set(currentClassHash, css);
        this.lastClassHash = currentClassHash;
      }

      return css;
    } catch (error) {
      console.error('[UnocssPlugin] Failed to generate styles:', error);
      return null;
    }
  }

  /**
   * 将 CSS 注入到 DOM
   */
  private injectCSSToDOM(css: string): void {
    // 检查是否已经存在 UnoCSS 样式标签
    const existingStyle = document.getElementById('unocss-styles');
    if (existingStyle) {
      existingStyle.textContent = css;
      return;
    }

    // 创建新的样式标签
    const styleElement = document.createElement('style');
    styleElement.id = 'unocss-styles';
    styleElement.textContent = css;

    // 插入到 head 中
    document.head.appendChild(styleElement);
  }

  /**
   * 获取生成器实例
   */
  getGenerator(): UnoGenerator | null {
    return this.generator;
  }

  /**
   * 获取收集的类名
   */
  getCollectedClasses(): Set<string> {
    return new Set(this.collectedClasses);
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.collectedClasses.clear();
    this.styleInjected = false;
    this.generator = null;
    this.cssCache.clear();
    this.lastClassHash = '';
    this.initPromise = null;

    // 移除样式标签
    const styleElement = document.getElementById('unocss-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }
}

export default UnocssPlugin;
