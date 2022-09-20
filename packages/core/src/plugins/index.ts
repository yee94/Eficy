import AntForm from './AntForm';
import { IPlugin } from '../interface';
import BasePlugin from './base';
import Events from './Events';
import Request from './Request';
import Reaction from './Reaction';
import TwoWayBind from './TwoWayBind';
import EficyInEficy from './EficyInEficy';
import AntTable from './AntTable';
import Action from './Actions';

/**
 * 框架内置插件
 */
const plugins: Record<string, new (options) => BasePlugin> = {
  base: BasePlugin,
  [Events.pluginName]: Events,
  [Action.pluginName]: Action,
  [Request.pluginName]: Request,
  [Reaction.pluginName]: Reaction,
  [TwoWayBind.pluginName]: TwoWayBind,
  [EficyInEficy.pluginName]: EficyInEficy,
  [AntForm.pluginName]: AntForm,
  [AntTable.pluginName]: AntTable,
};

/**
 * 内置默认加载插件
 */
export const buildInPlugins: IPlugin[] = [
  Events.pluginName,
  Action.pluginName,
  Request.pluginName,
  Reaction.pluginName,
  EficyInEficy.pluginName,
  TwoWayBind.pluginName,
];

export function install(plugin) {
  plugins[plugin.pluginName] = plugin;
}

export function pluginFactory(pluginOpt: IPlugin, runSet: Set<BasePlugin>): BasePlugin | null {
  if (typeof pluginOpt === 'string') {
    pluginOpt = [pluginOpt, {}];
  }
  const pluginName = pluginOpt[0];
  const pluginInstance: any = plugins[pluginName];

  if (pluginInstance.uniq && runSet.has(pluginInstance)) {
    return null;
  }

  runSet.add(pluginInstance);

  if (!pluginInstance) {
    throw new Error(`Not found plugin: ${pluginName}`);
  }

  return new pluginInstance(pluginOpt[1]);
}

export default plugins;
