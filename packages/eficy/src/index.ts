import { Eficy } from '@eficy/core';
import { UnocssPlugin } from '@eficy/plugin-unocss';

// 预设插件列表
const presetPlugins = [UnocssPlugin];

/**
 * 创建预配置的 Eficy 实例
 * 自动注册常用插件：UnoCSS
 * @returns 配置好的 Eficy 实例
 */
export const create = () => {
  const eficy = new Eficy();
  for (const plugin of presetPlugins) {
    eficy.registerPlugin(new plugin());
  }
  return eficy;
};

// 重新导出核心模块
export { Eficy } from '@eficy/core';
export type { 
  IViewData, 
  ILifecyclePlugin, 
  EficyNode, 
  IInitContext, 
  IProcessPropsContext, 
  IRenderContext 
} from '@eficy/core';

// 重新导出响应式模块
export {
  observable,
  computed,
  action,
  signal,
  effect,
  batch,
  watch,
  ref,
  ObservableClass,
  makeObservable
} from '@eficy/reactive';

export type {
  Signal,
  ComputedSignal
} from '@eficy/reactive';

// 重新导出插件
export { UnocssPlugin, createUnocssPlugin } from '@eficy/plugin-unocss';
export type { UnocssPluginConfig } from '@eficy/plugin-unocss';

// 默认导出
export default { create, Eficy };
