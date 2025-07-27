import type { ILifecyclePlugin, EficyNode, IInitContext, IProcessPropsContext, IRenderContext } from '@eficy/core';
import { Init, ProcessProps, Render } from '@eficy/core';
import type { UnoGenerator, UserConfig } from '@unocss/core';
import type { ReactElement } from 'react';

export interface UnocssPluginConfig {
  config?: UserConfig;
}

export class UnocssPlugin implements ILifecyclePlugin {
  public readonly name = 'unocss-plugin';
  public readonly version = '1.0.0';
  public readonly enforce = 'pre' as const;

  private generator: UnoGenerator | null = null;
  private collectedClasses = new Set<string>();
  private styleInjected = false;
  private config: UnocssPluginConfig;

  constructor(config: UnocssPluginConfig = {}) {
    this.config = config;
  }

  /**
   * 初始化钩子 - 设置 UnoCSS 生成器
   */
  @Init(100)
  async onInit(context: IInitContext, next: () => Promise<void>): Promise<void> {
    try {
      await this.initializeGenerator();
      await next();
    } catch (error) {
      console.error('[UnocssPlugin] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * 属性处理钩子 - 收集 className
   */
  @ProcessProps(10)
  async onProcessProps(
    props: Record<string, any>,
    eficyNode: EficyNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>,
  ): Promise<Record<string, any>> {
    // 收集 className 中的样式类
    if (props.className) {
      this.collectClassNames(props.className);
    }

    // 继续处理属性
    return await next();
  }

  /**
   * 渲染钩子 - 在根节点渲染时注入样式
   */
  @Render(5)
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>,
  ): Promise<ReactElement> {
    const element = await next();

    // 如果是根节点渲染，生成并注入样式
    // if (context.isRoot) {
    await this.generateAndInjectStyles();
    // }

    return element;
  }

  /**
   * 初始化 UnoCSS 生成器
   */
  private async initializeGenerator(): Promise<void> {
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
  }

  /**
   * 收集类名
   */
  private collectClassNames(classNames: string | string[] | null | undefined): void {
    if (!this.generator || !classNames) return;

    const classes = Array.isArray(classNames) ? classNames : [classNames];

    classes.forEach((className) => {
      if (className && typeof className === 'string') {
        className.split(/\s+/).forEach((cls) => {
          const trimmedCls = cls.trim();
          if (trimmedCls) {
            this.collectedClasses.add(trimmedCls);
          }
        });
      }
    });
  }

  /**
   * 生成并注入样式
   */
  private async generateAndInjectStyles(): Promise<void> {
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
      console.error('[UnocssPlugin] Failed to generate styles:', error);
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
export function createUnocssPlugin(config?: UnocssPluginConfig): UnocssPlugin {
  return new UnocssPlugin(config);
}

export default UnocssPlugin;
