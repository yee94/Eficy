import AntForm from './AntForm';
import { IPlugin } from '../interface';
import BasePlugin from './base';
import Events from './Events';
import Request from './Request';

const plugins: Record<string, new (options) => BasePlugin> = {
  [Events.pluginName]: Events,
  [Request.pluginName]: Request,
  [AntForm.pluginName]: AntForm,
};

export default plugins;

export const buildInPlugins: IPlugin[] = [Events.pluginName];

export function install(plugin) {
  plugins[plugin.pluginName] = plugin;
}

export function pluginFactory(pluginOpt: IPlugin): BasePlugin {
  if (typeof pluginOpt === 'string') {
    pluginOpt = [pluginOpt, {}];
  }
  const pluginName = pluginOpt[0];
  const pluginInstance = plugins[pluginName];
  if (!pluginInstance) {
    throw new Error(`Not found plugin: ${pluginName}`);
  }

  return new pluginInstance(pluginOpt[1]);
}
