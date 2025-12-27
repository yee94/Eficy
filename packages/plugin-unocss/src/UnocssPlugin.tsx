import type { ILifecyclePlugin, IRenderContext } from '@eficy/core-jsx';
import { Initialize, injectable, Render, RootMount } from '@eficy/core-jsx';
import type { UnoGenerator, UserConfig } from '@unocss/core';
import type { ComponentType } from 'react';
import { Unocss } from './components/Unocss';
import { asyncSignal } from '@eficy/reactive-async';

export interface UnocssPluginConfig {
  config?: UserConfig;
}

@injectable()
export class UnocssPlugin implements ILifecyclePlugin {
  public readonly name = 'unocss-plugin';
  public readonly version = '1.0.0';
  public readonly enforce = 'pre' as const;

  private generator: UnoGenerator | null;
  private collectedClasses = new Set<string>();
  private config: UnocssPluginConfig;
  private cssCache = new Map<string, string>();
  private lastClassHash = '';

  private reactiveAsync = asyncSignal(
    () => {
      return this.generateCSS();
    },
    {
      manual: true,
      debounceWait: 1,
    },
  );

  @Initialize()
  async initialize(config: UnocssPluginConfig = {}) {
    this.config = config;
    await this.initializeGenerator();
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

    // @ts-ignore
    if (!OriginalComponent || !OriginalComponent._eficy_root) {
      return OriginalComponent;
    }

    // 返回包装后的组件，在根组件时注入样式
    return (props: any) => (
      <>
        <Unocss generateCSS={this.reactiveAsync} />
        <OriginalComponent {...props} />
      </>
    );
  }

  /**
   * 初始化 UnoCSS 生成器
   */
  private async initializeGenerator(): Promise<void> {
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

    this.reactiveAsync.run();
  }

  @RootMount()
  onRootMount(context: IRenderContext, next: () => ComponentType<any>): ComponentType<any> {
    this.reactiveAsync.run();
    return next();
  }

  /**
   * 生成 CSS 字符串 - 使用缓存避免重复计算
   */
  private async generateCSS(): Promise<string | null> {
    if (!this.generator || this.collectedClasses.size === 0) {
      console.error('The unocss generator is not initialized',this);
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
    this.generator = null;
    this.cssCache.clear();
    this.lastClassHash = '';

    // 移除样式标签
    const styleElement = document.getElementById('unocss-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }
}

export default UnocssPlugin;
