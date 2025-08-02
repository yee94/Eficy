import 'reflect-metadata';
import { HookType } from '../constants';

// 元数据键
const LIFECYCLE_HOOKS_KEY = Symbol('lifecycle_hooks');

// 生命周期钩子装饰器工厂
function createLifecycleDecorator(hookType: HookType) {
  return function (priority: number = 0) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // 获取已有的钩子列表
      const existingHooks = Reflect.getMetadata(LIFECYCLE_HOOKS_KEY, target) || [];

      // 添加新的钩子信息
      const hookInfo = {
        hookType,
        methodName: propertyKey,
        priority,
        handler: descriptor.value.bind(target),
      };

      // 保存钩子信息到元数据
      Reflect.defineMetadata(LIFECYCLE_HOOKS_KEY, [...existingHooks, hookInfo], target);

      return descriptor;
    } as any;
  };
}

// 导出装饰器（只保留 Render）
export const Render = createLifecycleDecorator(HookType.RENDER);
export const Initialize = createLifecycleDecorator(HookType.INITIALIZE);

// 获取类的生命周期钩子
export function getLifecycleHooks(target: any) {
  return Reflect.getMetadata(LIFECYCLE_HOOKS_KEY, target) || [];
}

// 检查是否有指定类型的钩子
export function hasLifecycleHook(target: any, hookType: HookType): boolean {
  const hooks = getLifecycleHooks(target);
  return hooks.some((hook: any) => hook.hookType === hookType);
}

// 获取指定类型的钩子
export function getLifecycleHooksByType(target: any, hookType: HookType) {
  const hooks = getLifecycleHooks(target);
  return hooks.filter((hook: any) => hook.hookType === hookType);
}

// 按优先级排序钩子
export function sortHooksByPriority(hooks: any[]) {
  return hooks.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}