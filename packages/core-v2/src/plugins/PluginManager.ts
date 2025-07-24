import { injectable, inject, DependencyContainer } from 'tsyringe';
import { TOKENS } from '../container/tokens';
import { IPlugin, IPluginConfig } from '../interfaces';

/**
 * 插件管理器
 * 基于tsyringe管理插件的生命周期
 */
@injectable()
export class PluginManager {
  private plugins = new Map<string, IPlugin>();
  private enabledPlugins = new Set<string>();

  constructor(
    @inject(TOKENS.CONFIG_SERVICE) private configService: any
  ) {}

  /**
   * 注册插件
   */
  register(plugin: IPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * 安装插件
   */
  install(pluginName: string, container: DependencyContainer, options?: any): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (plugin.singleton && this.enabledPlugins.has(pluginName)) {
      console.warn(`Plugin "${pluginName}" is singleton and already installed`);
      return;
    }

    plugin.install(container, options);
    this.enabledPlugins.add(pluginName);
  }

  /**
   * 卸载插件
   */
  uninstall(pluginName: string, container: DependencyContainer): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (plugin.uninstall) {
      plugin.uninstall(container);
    }
    this.enabledPlugins.delete(pluginName);
  }

  /**
   * 批量安装插件
   */
  installMany(configs: IPluginConfig[], container: DependencyContainer): void {
    for (const config of configs) {
      if (config.enabled !== false) {
        this.install(config.name, container, config.options);
      }
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(name: string): boolean {
    return this.enabledPlugins.has(name);
  }

  /**
   * 获取所有已安装的插件
   */
  getInstalledPlugins(): string[] {
    return Array.from(this.enabledPlugins);
  }

  /**
   * 获取所有注册的插件
   */
  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 清理所有插件
   */
  clear(container: DependencyContainer): void {
    for (const pluginName of this.enabledPlugins) {
      this.uninstall(pluginName, container);
    }
    this.plugins.clear();
    this.enabledPlugins.clear();
  }

  /**
   * 配置插件
   */
  configure(pluginName: string, options: any): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (plugin.configure) {
      plugin.configure(options);
    }
  }
} 