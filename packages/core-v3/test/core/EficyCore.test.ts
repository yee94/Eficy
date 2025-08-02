/**
 * EficyCore 核心类测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Eficy } from '@eficy/core-v3';
import { ComponentRegistry } from '../../src/services/ComponentRegistry';
import { PluginManager } from '../../src/services/PluginManager';
import { EventEmitter } from '../../src/services/EventEmitter';

describe('EficyCore', () => {
  let core: Eficy;

  beforeEach(() => {
    core = new Eficy();
  });

  describe('初始化', () => {
    it('应该正确创建核心实例', () => {
      expect(core).toBeDefined();
      expect(core.componentRegistry).toBeInstanceOf(ComponentRegistry);
      expect(core.pluginManager).toBeInstanceOf(PluginManager);
      expect(core.eventEmitter).toBeInstanceOf(EventEmitter);
    });

    it('应该有可用的容器实例', () => {
      expect(core.container).toBeDefined();
      expect(typeof core.resolve).toBe('function');
    });
  });

  describe('组件管理', () => {
    const TestComponent = () => null;
    const AnotherComponent = () => null;

    it('应该能够注册单个组件', () => {
      core.registerComponent('TestComponent', TestComponent);
      
      expect(core.getComponent('TestComponent')).toBe(TestComponent);
    });

    it('应该能够批量注册组件', () => {
      const components = {
        TestComponent,
        AnotherComponent
      };

      core.registerComponents(components);

      expect(core.getComponent('TestComponent')).toBe(TestComponent);
      expect(core.getComponent('AnotherComponent')).toBe(AnotherComponent);
    });

    it('应该能够获取所有组件', () => {
      core.registerComponent('TestComponent', TestComponent);
      core.registerComponent('AnotherComponent', AnotherComponent);

      const allComponents = core.getAllComponents();

      // ComponentRegistry 会自动添加 e- 前缀
      expect(allComponents['e-TestComponent']).toBe(TestComponent);
      expect(allComponents['e-AnotherComponent']).toBe(AnotherComponent);
      expect(Object.keys(allComponents)).toHaveLength(2);
    });

    it('获取不存在的组件应该返回 undefined', () => {
      expect(core.getComponent('NonExistent')).toBeUndefined();
    });
  });

  describe('子实例创建', () => {
    it('应该能够创建子实例', () => {
      const child = core.createChild();

      expect(child).toBeInstanceOf(Eficy);
      expect(child).not.toBe(core);
    });

    it('子实例应该继承父实例的组件', () => {
      const TestComponent = () => null;
      core.registerComponent('TestComponent', TestComponent);

      const child = core.createChild();

      expect(child.getComponent('TestComponent')).toBe(TestComponent);
    });

    it('子实例的组件修改不应该影响父实例', () => {
      const ParentComponent = () => null;
      const ChildComponent = () => null;

      core.registerComponent('SharedComponent', ParentComponent);
      
      const child = core.createChild();
      child.registerComponent('SharedComponent', ChildComponent);

      expect(core.getComponent('SharedComponent')).toBe(ParentComponent);
      expect(child.getComponent('SharedComponent')).toBe(ChildComponent);
    });
  });

  describe('依赖注入', () => {
    class TestService {
      getName() {
        return 'TestService';
      }
    }

    it('应该能够注册和解析服务', () => {
      core.register('TestService', { useClass: TestService });
      
      const service = core.resolve<TestService>('TestService');
      
      expect(service).toBeInstanceOf(TestService);
      expect(service.getName()).toBe('TestService');
    });

    it('应该能够注册单例服务', () => {
      core.registerSingleton(TestService);
      
      const service1 = core.resolve(TestService);
      const service2 = core.resolve(TestService);
      
      expect(service1).toBe(service2);
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁实例', () => {
      const TestComponent = () => null;
      core.registerComponent('TestComponent', TestComponent);

      expect(core.getComponent('TestComponent')).toBe(TestComponent);

      core.dispose();

      // 销毁后组件注册表应该被清空
      expect(core.getAllComponents()).toEqual({});
    });

    it('销毁后事件发射器应该被清空', () => {
      const mockListener = () => {};
      core.eventEmitter.on('test', mockListener);

      expect(core.eventEmitter.listenerCount('test')).toBe(1);

      core.dispose();

      expect(core.eventEmitter.listenerCount('test')).toBe(0);
    });
  });
});