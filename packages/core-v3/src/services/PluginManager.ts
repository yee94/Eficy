/**
 * PluginManager - 插件管理器服务
 */

import { injectable } from 'tsyringe';

export interface Plugin {
  name: string;
  version: string;
  install?: (context: any) => void | Promise<void>;
  uninstall?: (context: any) => void | Promise<void>;
}

@injectable()
export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private installed = new Set<string>();
  
  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin name must be a non-empty string');
    }
    
    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginManager] Plugin "${plugin.name}" already registered, overwriting`);
    }
    
    this.plugins.set(plugin.name, plugin);
  }
  
  /**
   * 安装插件
   */
  async install(name: string, context?: any): Promise<void> {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }
    
    if (this.installed.has(name)) {
      console.warn(`[PluginManager] Plugin "${name}" already installed`);
      return;
    }
    
    try {
      if (plugin.install) {
        await plugin.install(context);
      }
      
      this.installed.add(name);
      console.log(`[PluginManager] Plugin "${name}" installed successfully`);
    } catch (error) {
      console.error(`[PluginManager] Failed to install plugin "${name}":`, error);
      throw error;
    }
  }
  
  /**
   * 卸载插件
   */
  async uninstall(name: string, context?: any): Promise<void> {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }
    
    if (!this.installed.has(name)) {
      console.warn(`[PluginManager] Plugin "${name}" not installed`);
      return;
    }
    
    try {
      if (plugin.uninstall) {
        await plugin.uninstall(context);
      }
      
      this.installed.delete(name);
      console.log(`[PluginManager] Plugin "${name}" uninstalled successfully`);
    } catch (error) {
      console.error(`[PluginManager] Failed to uninstall plugin "${name}":`, error);
      throw error;
    }
  }
  
  /**
   * 检查插件是否已安装
   */
  isInstalled(name: string): boolean {
    return this.installed.has(name);
  }
  
  /**
   * 获取插件信息
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
  
  /**
   * 获取所有已注册的插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * 获取所有已安装的插件名称
   */
  getInstalledPlugins(): string[] {
    return Array.from(this.installed);
  }
  
  /**
   * 批量安装插件
   */
  async installAll(context?: any): Promise<void> {
    const plugins = Array.from(this.plugins.keys());
    
    for (const name of plugins) {
      if (!this.installed.has(name)) {
        try {
          await this.install(name, context);
        } catch (error) {
          console.error(`[PluginManager] Failed to install plugin "${name}" during batch install:`, error);
        }
      }
    }
  }
  
  /**
   * 批量卸载插件
   */
  async uninstallAll(context?: any): Promise<void> {
    const installedPlugins = Array.from(this.installed);
    
    for (const name of installedPlugins) {
      try {
        await this.uninstall(name, context);
      } catch (error) {
        console.error(`[PluginManager] Failed to uninstall plugin "${name}" during batch uninstall:`, error);
      }
    }
  }
  
  /**
   * 获取插件统计信息
   */
  getStats(): {
    total: number;
    installed: number;
    uninstalled: number;
  } {
    const total = this.plugins.size;
    const installed = this.installed.size;
    
    return {
      total,
      installed,
      uninstalled: total - installed
    };
  }
  
  /**
   * 清理所有插件
   */
  dispose(): void {
    // 卸载所有已安装的插件（同步版本）
    const installedPlugins = Array.from(this.installed);
    
    installedPlugins.forEach(name => {
      const plugin = this.plugins.get(name);
      if (plugin?.uninstall) {
        try {
          // 如果是同步函数，直接调用
          const result = plugin.uninstall({});
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`[PluginManager] Error during plugin "${name}" cleanup:`, error);
            });
          }
        } catch (error) {
          console.error(`[PluginManager] Error during plugin "${name}" cleanup:`, error);
        }
      }
    });
    
    this.installed.clear();
    this.plugins.clear();
  }
}