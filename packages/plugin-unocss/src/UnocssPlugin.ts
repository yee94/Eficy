import type {
  ILifecyclePlugin,
  EficyNode,
  IInitContext,
  IProcessPropsContext,
  IRenderContext,
  IViewData,
  IBuildSchemaNodeContext,
} from '@eficy/core';
import { BuildSchemaNode, Init, ProcessProps, Render } from '@eficy/core';
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
  @BuildSchemaNode(10)
  async onBuildSchemaNode(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<EficyNode>,
  ): Promise<EficyNode> {
    // 收集 className 中的样式类
    if (viewData.className) {
      this.collectClassNames(viewData.className);
    }

    // 继续处理属性
    return await next();
  }

  /**
   * 渲染钩子 - 在根节点渲染时将样式与根节点一起返回
   */
  @Render(5)
  async onRender(
    eficyNode: EficyNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>,
  ): Promise<ReactElement> {
    const element = await next();

    // 判断是否是根节点：检查节点ID或key是否包含root标识
    const isRootNode = eficyNode.id === '__eficy_root';

    // 如果是根节点渲染，生成样式并包装在 Fragment 中一起返回
    if (isRootNode && this.collectedClasses.size > 0 && !this.styleInjected) {
      const css = await this.generateCSS();
      if (css) {
        const React = await import('react');
        this.styleInjected = true;

        return React.createElement(React.Fragment, null, [
          React.createElement('style', { key: 'unocss-style', dangerouslySetInnerHTML: { __html: css } }),
          element,
        ]);
      }
    }

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
    if (!classNames) return;

    const classes = Array.isArray(classNames) ? classNames : [classNames];
    classes.forEach((className) => {
      this.collectedClasses.add(className);
    });
  }

  /**
   * 生成 CSS 字符串
   */
  private async generateCSS(): Promise<string | null> {
    if (!this.generator || this.collectedClasses.size === 0) {
      return null;
    }

    try {
      const classArray = Array.from(this.collectedClasses);
      const result = await this.generator.generate(classArray.join(' '));
      return result.css || null;
    } catch (error) {
      console.error('[UnocssPlugin] Failed to generate styles:', error);
      return null;
    }
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
  }
}

// 导出创建函数
export function createUnocssPlugin(config?: UnocssPluginConfig): UnocssPlugin {
  return new UnocssPlugin(config);
}

export default UnocssPlugin;
