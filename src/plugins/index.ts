import AntForm from './AntForm';
import { IPlugin } from '../interface';
import BasePlugin from './base';

const plugins: Record<string, new (options) => BasePlugin> = {
  [AntForm.pluginName]: AntForm,
};

export default plugins;

export function install(plugin) {
  plugins[plugin.pluginName] = plugin;
}

export function makePlugin(pluginOpt: IPlugin): BasePlugin {
  if (typeof pluginOpt === 'string') {
    pluginOpt = [pluginOpt, {}];
  }
  const pluginName = pluginOpt[0];
  const pluginInstance = plugins[pluginName];
  if (!pluginInstance) {
    throw new Error(`Not found plugin: ${pluginName}`);
  }
  console.log(pluginInstance);

  return new pluginInstance(pluginOpt[1]);
}
