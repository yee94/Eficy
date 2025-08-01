/**
 * PluginManager 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManager, type Plugin } from '@eficy/core-v3/services/PluginManager';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('插件注册', () => {
    it('应该能够注册插件', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);

      expect(manager.getPlugin('test-plugin')).toBe(plugin);
    });

    it('应该拒绝无效的插件名称', () => {
      expect(() => {
        manager.register({
          name: '',
          version: '1.0.0'
        });
      }).toThrow('Plugin name must be a non-empty string');

      expect(() => {
        manager.register({
          name: null as any,
          version: '1.0.0'
        });
      }).toThrow('Plugin name must be a non-empty string');
    });

    it('重复注册应该覆盖并警告', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const plugin1: Plugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      const plugin2: Plugin = {
        name: 'test-plugin',
        version: '2.0.0'
      };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getPlugin('test-plugin')).toBe(plugin2);
      expect(consoleWarn).toHaveBeenCalledWith(
        '[PluginManager] Plugin "test-plugin" already registered, overwriting'
      );

      consoleWarn.mockRestore();
    });
  });

  describe('插件安装', () => {
    it('应该能够安装插件', async () => {
      const installSpy = vi.fn();
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: installSpy
      };

      manager.register(plugin);
      await manager.install('test-plugin', { context: 'test' });

      expect(installSpy).toHaveBeenCalledWith({ context: 'test' });
      expect(manager.isInstalled('test-plugin')).toBe(true);
    });

    it('应该能够安装没有 install 方法的插件', async () => {
      const plugin: Plugin = {
        name: 'simple-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      
      await expect(manager.install('simple-plugin')).resolves.not.toThrow();
      expect(manager.isInstalled('simple-plugin')).toBe(true);
    });

    it('应该拒绝安装不存在的插件', async () => {
      await expect(manager.install('nonexistent')).rejects.toThrow(
        'Plugin "nonexistent" not found'
      );
    });

    it('应该处理安装错误', async () => {
      const plugin: Plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        install: () => {
          throw new Error('Install failed');
        }
      };

      manager.register(plugin);

      await expect(manager.install('error-plugin')).rejects.toThrow('Install failed');
      expect(manager.isInstalled('error-plugin')).toBe(false);
    });

    it('重复安装应该警告', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      await manager.install('test-plugin');
      await manager.install('test-plugin');

      expect(consoleWarn).toHaveBeenCalledWith(
        '[PluginManager] Plugin "test-plugin" already installed'
      );

      consoleWarn.mockRestore();
    });
  });

  describe('插件卸载', () => {
    it('应该能够卸载插件', async () => {
      const uninstallSpy = vi.fn();
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        uninstall: uninstallSpy
      };

      manager.register(plugin);
      await manager.install('test-plugin');
      await manager.uninstall('test-plugin', { context: 'test' });

      expect(uninstallSpy).toHaveBeenCalledWith({ context: 'test' });
      expect(manager.isInstalled('test-plugin')).toBe(false);
    });

    it('应该能够卸载没有 uninstall 方法的插件', async () => {
      const plugin: Plugin = {
        name: 'simple-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      await manager.install('simple-plugin');
      
      await expect(manager.uninstall('simple-plugin')).resolves.not.toThrow();
      expect(manager.isInstalled('simple-plugin')).toBe(false);
    });

    it('应该拒绝卸载不存在的插件', async () => {
      await expect(manager.uninstall('nonexistent')).rejects.toThrow(
        'Plugin "nonexistent" not found'
      );
    });

    it('卸载未安装的插件应该警告', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      await manager.uninstall('test-plugin');

      expect(consoleWarn).toHaveBeenCalledWith(
        '[PluginManager] Plugin "test-plugin" not installed'
      );

      consoleWarn.mockRestore();
    });
  });

  describe('批量操作', () => {
    it('应该能够批量安装所有插件', async () => {
      const plugin1: Plugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: Plugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      await manager.installAll();

      expect(manager.isInstalled('plugin1')).toBe(true);
      expect(manager.isInstalled('plugin2')).toBe(true);
    });

    it('应该能够批量卸载所有插件', async () => {
      const plugin1: Plugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: Plugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);
      await manager.installAll();

      await manager.uninstallAll();

      expect(manager.isInstalled('plugin1')).toBe(false);
      expect(manager.isInstalled('plugin2')).toBe(false);
    });

    it('批量安装应该处理单个插件错误', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const goodPlugin: Plugin = { name: 'good-plugin', version: '1.0.0' };
      const badPlugin: Plugin = {
        name: 'bad-plugin',
        version: '1.0.0',
        install: () => {
          throw new Error('Install failed');
        }
      };

      manager.register(goodPlugin);
      manager.register(badPlugin);

      await manager.installAll();

      expect(manager.isInstalled('good-plugin')).toBe(true);
      expect(manager.isInstalled('bad-plugin')).toBe(false);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('查询方法', () => {
    it('应该返回所有已注册的插件', () => {
      const plugin1: Plugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: Plugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      const plugins = manager.getAllPlugins();

      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
      expect(plugins).toHaveLength(2);
    });

    it('应该返回所有已安装的插件名称', async () => {
      const plugin1: Plugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: Plugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);
      await manager.install('plugin1');

      const installedPlugins = manager.getInstalledPlugins();

      expect(installedPlugins).toContain('plugin1');
      expect(installedPlugins).not.toContain('plugin2');
      expect(installedPlugins).toHaveLength(1);
    });

    it('应该返回正确的统计信息', async () => {
      const plugin1: Plugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: Plugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);
      await manager.install('plugin1');

      const stats = manager.getStats();

      expect(stats).toEqual({
        total: 2,
        installed: 1,
        uninstalled: 1
      });
    });
  });

  describe('清理', () => {
    it('应该能够清理所有插件', async () => {
      const uninstallSpy = vi.fn();
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        uninstall: uninstallSpy
      };

      manager.register(plugin);
      await manager.install('test-plugin');

      manager.dispose();

      expect(manager.getAllPlugins()).toHaveLength(0);
      expect(manager.getInstalledPlugins()).toHaveLength(0);
    });

    it('应该处理清理时的异步卸载错误', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const plugin: Plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        uninstall: () => Promise.reject(new Error('Uninstall failed'))
      };

      manager.register(plugin);
      await manager.install('error-plugin');

      expect(() => manager.dispose()).not.toThrow();

      // 等待异步错误处理
      await new Promise(resolve => setTimeout(resolve, 10));

      consoleError.mockRestore();
    });
  });
});