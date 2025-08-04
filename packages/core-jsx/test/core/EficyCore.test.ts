/**
 * EficyCore 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Eficy } from '../../src/core/EficyCore';
import { ComponentType } from 'react';
import { ComponentRegistry } from '../../src/services/ComponentRegistry';
import { PluginManager } from '../../src/services/PluginManager';

describe('EficyCore', () => {
  let core: Eficy;

  beforeEach(() => {
    core = new Eficy();
  });

  describe('初始化', () => {
    it('应该正确创建核心实例', () => {
      expect(core).toBeInstanceOf(Eficy);
      expect(core.componentRegistry).toBeDefined();
      expect(core.pluginManager).toBeDefined();
      expect(core.eventEmitter).toBeDefined();
    });

    it('应该有可用的容器实例', () => {
      expect(core.container).toBeDefined();
    });
  });

  describe('组件管理', () => {
    it('应该能够注册单个组件', () => {
      const TestComponent: ComponentType<any> = () => null;

      core.registerComponent('TestComponent', TestComponent);

      expect(core.getComponent('TestComponent')).toBe(TestComponent);
    });

    it('应该能够批量注册组件', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      core.registerComponents({
        TestComponent,
        AnotherComponent,
      });

      expect(core.getComponent('TestComponent')).toBe(TestComponent);
      expect(core.getComponent('AnotherComponent')).toBe(AnotherComponent);
    });

    it('应该能够获取所有组件', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      core.registerComponent('TestComponent', TestComponent);
      core.registerComponent('AnotherComponent', AnotherComponent);

      const allComponents = core.getAllComponents();

      // ComponentRegistry 返回原始名称
      expect(allComponents['TestComponent']).toBe(TestComponent);
      expect(allComponents['AnotherComponent']).toBe(AnotherComponent);
      expect(Object.keys(allComponents)).toHaveLength(2);
    });

    it('获取不存在的组件应该返回 undefined', () => {
      expect(core.getComponent('NonExistentComponent')).toBeUndefined();
    });
  });

  describe('子实例创建', () => {
    it('应该能够创建子实例', () => {
      const child = core.createChild();

      expect(child).toBeInstanceOf(Eficy);
      expect(child).not.toBe(core);
    });

    it('子实例应该继承父实例的组件', () => {
      const TestComponent: ComponentType<any> = () => null;
      core.registerComponent('TestComponent', TestComponent);

      const child = core.createChild();

      expect(child.getComponent('TestComponent')).toBe(TestComponent);
    });

    it('子实例的组件修改不应该影响父实例', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      core.registerComponent('TestComponent', TestComponent);

      const child = core.createChild();
      child.registerComponent('AnotherComponent', AnotherComponent);

      expect(core.getComponent('AnotherComponent')).toBeUndefined();
      expect(child.getComponent('TestComponent')).toBe(TestComponent);
    });
  });

  describe('依赖注入', () => {
    it('应该能够解析服务', () => {
      const componentRegistry = core.resolve(ComponentRegistry);
      expect(componentRegistry).toBeDefined();
    });

    it('应该能够解析插件管理器', () => {
      const pluginManager = core.resolve(PluginManager);
      expect(pluginManager).toBeDefined();
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁实例', () => {
      expect(() => {
        core.dispose();
      }).not.toThrow();
    });

    it('销毁后事件发射器应该被清空', () => {
      const eventEmitter = core.eventEmitter;
      const originalRemoveAllListeners = eventEmitter.removeAllListeners;
      const mockRemoveAllListeners = vi.fn();
      eventEmitter.removeAllListeners = mockRemoveAllListeners;

      core.dispose();

      expect(mockRemoveAllListeners).toHaveBeenCalled();
    });
  });
});