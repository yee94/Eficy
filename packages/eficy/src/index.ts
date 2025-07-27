import { Eficy } from '@eficy/core';
import { UnocssPlugin } from '@eficy/plugin-unocss';

const presetPlugins = [UnocssPlugin];

export const create = () => {
  const eficy = new Eficy();
  for (const plugin of presetPlugins) {
    eficy.registerPlugin(new plugin());
  }
  return eficy;
};
