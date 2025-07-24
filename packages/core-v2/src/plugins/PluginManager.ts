import { injectable, inject } from 'tsyringe';
import { DIContainer } from '../container/DIContainer';
import { BasePlugin } from './BasePlugin';
import { IPluginConfig } from '../types';

@injectable()
export class PluginManager {
  private plugins: BasePlugin[] = [];
  private pluginRegistry = new Map<string, new (options?: any) => BasePlugin>();

  constructor(private container: DIContainer) {}

  registerPluginClass(name: string, pluginClass: new (options?: any) => BasePlugin): void {
    this.pluginRegistry.set(name, pluginClass);
  }

  installPlugin(config: IPluginConfig): void {
    const PluginClass = this.pluginRegistry.get(config.name);
    if (!PluginClass) {
      throw new Error(`Plugin ${config.name} is not registered`);
    }

    const plugin = new PluginClass(config.options);
    
    // Check if plugin with same name already exists
    const existingIndex = this.plugins.findIndex(p => p.name === plugin.name);
    if (existingIndex > -1) {
      // Uninstall existing plugin first
      this.plugins[existingIndex].uninstall();
      this.plugins.splice(existingIndex, 1);
    }

    plugin.install(this.container);
    this.plugins.push(plugin);
    
    // Sort by priority (higher priority first)
    this.plugins.sort((a, b) => b.priority - a.priority);
  }

  uninstallPlugin(name: string): boolean {
    const index = this.plugins.findIndex(plugin => plugin.name === name);
    if (index > -1) {
      this.plugins[index].uninstall();
      this.plugins.splice(index, 1);
      return true;
    }
    return false;
  }

  getPlugin(name: string): BasePlugin | undefined {
    return this.plugins.find(plugin => plugin.name === name);
  }

  hasPlugin(name: string): boolean {
    return this.plugins.some(plugin => plugin.name === name);
  }

  getInstalledPlugins(): BasePlugin[] {
    return [...this.plugins];
  }

  installPlugins(configs: IPluginConfig[]): void {
    // Sort configs by priority first
    const sortedConfigs = configs.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    sortedConfigs.forEach(config => {
      try {
        this.installPlugin(config);
      } catch (error) {
        console.error(`Failed to install plugin ${config.name}:`, error);
      }
    });
  }

  uninstallAllPlugins(): void {
    [...this.plugins].forEach(plugin => {
      plugin.uninstall();
    });
    this.plugins = [];
  }

  dispose(): void {
    this.uninstallAllPlugins();
    this.pluginRegistry.clear();
  }
}