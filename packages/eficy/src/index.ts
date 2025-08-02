import { Eficy } from '@eficy/core-v3';
import { UnocssPlugin } from '@eficy/plugin-unocss';

// 预设插件列表
const presetPlugins = [UnocssPlugin];

/**
 * 创建预配置的 Eficy 实例
 * 自动注册常用插件：UnoCSS
 * @returns 配置好的 Eficy 实例
 */
export const create = async () => {
  const eficy = new Eficy();
  await Promise.all(presetPlugins.map((plugin) => eficy.install(plugin)));
  return eficy;
};

// 重新导出核心模块
export * from '@eficy/core-v3';

// 重新导出响应式模块
export * from '@eficy/reactive';
export * from '@eficy/reactive-async';
export * from '@eficy/reactive-react';

// 重新导出插件
export { UnocssPlugin } from '@eficy/plugin-unocss';
export type { UnocssPluginConfig } from '@eficy/plugin-unocss';

// 默认导出
export default { create, Eficy };

