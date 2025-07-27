import EventEmitter3 from 'eventemitter3';
import { injectable } from 'tsyringe';
import type { 
  HookType, 
  AsyncFlowHookType,
  SyncSideEffectHookType,
  IInitContext, 
  IBuildSchemaNodeContext, 
  IRenderContext, 
  IMountContext, 
  IUnmountContext, 
  IResolveComponentContext, 
  IProcessPropsContext, 
  IHandleEventContext, 
  IBindEventContext, 
  IErrorContext 
} from '../interfaces/lifecycle';
import type { IViewData } from '../interfaces';
import type EficyNode from '../models/EficyNode';
import type { ReactElement } from 'react';

/**
 * 异步流程钩子事件名称 - 支持Promise，按序执行
 */
export const ASYNC_FLOW_EVENTS = {
  INIT: 'lifecycle:init',
  BUILD_SCHEMA_NODE: 'lifecycle:build-schema-node',
  RESOLVE_COMPONENT: 'lifecycle:resolve-component',
  PROCESS_PROPS: 'lifecycle:process-props',
  RENDER: 'lifecycle:render'
} as const;

/**
 * 同步副作用钩子事件名称 - fire and forget，并行执行
 */
export const SYNC_SIDE_EFFECT_EVENTS = {
  ON_MOUNT: 'lifecycle:onMount',
  ON_UNMOUNT: 'lifecycle:onUnmount',
  ON_HANDLE_EVENT: 'lifecycle:onHandleEvent',
  ON_BIND_EVENT: 'lifecycle:onBindEvent',
  ON_ERROR: 'lifecycle:onError'
} as const;

/**
 * 生命周期事件名称
 */
export const LIFECYCLE_EVENTS = {
  // 异步流程钩子
  ...ASYNC_FLOW_EVENTS,
  
  // 同步副作用钩子
  ...SYNC_SIDE_EFFECT_EVENTS
} as const;

/**
 * 异步流程钩子事件数据类型
 */
export interface IAsyncFlowEventData {
  [ASYNC_FLOW_EVENTS.INIT]: {
    context: IInitContext;
  };
  [ASYNC_FLOW_EVENTS.BUILD_SCHEMA_NODE]: {
    viewData: IViewData;
    context: IBuildSchemaNodeContext;
  };
  [ASYNC_FLOW_EVENTS.RENDER]: {
    viewNode: EficyNode;
    context: IRenderContext;
  };
  [ASYNC_FLOW_EVENTS.RESOLVE_COMPONENT]: {
    componentName: string;
    context: IResolveComponentContext;
  };
  [ASYNC_FLOW_EVENTS.PROCESS_PROPS]: {
    props: Record<string, any>;
    context: IProcessPropsContext;
  };
}

/**
 * 同步副作用钩子事件数据类型
 */
export interface ISyncSideEffectEventData {
  [SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT]: {
    context: IMountContext;
  };
  [SYNC_SIDE_EFFECT_EVENTS.ON_UNMOUNT]: {
    context: IUnmountContext;
  };
  [SYNC_SIDE_EFFECT_EVENTS.ON_HANDLE_EVENT]: {
    handler: Function;
    viewNode: EficyNode;
    context: IHandleEventContext;
  };
  [SYNC_SIDE_EFFECT_EVENTS.ON_BIND_EVENT]: {
    viewNode: EficyNode;
    context: IBindEventContext;
  };
  [SYNC_SIDE_EFFECT_EVENTS.ON_ERROR]: {
    error: Error;
    context: IErrorContext;
  };
}

/**
 * 生命周期事件数据类型
 */
export interface ILifecycleEventData extends IAsyncFlowEventData, ISyncSideEffectEventData {}

/**
 * 生命周期事件发射器
 * 提供Promise支持的异步流程钩子和fire-and-forget的同步副作用钩子
 */
@injectable()
export class LifecycleEventEmitter extends EventEmitter3 {
  private statistics: Record<string, number> = {};

  // ==================== 异步流程钩子方法 ====================
  
  /**
   * 发射初始化异步流程钩子
   */
  async emitAsyncInit(context: IInitContext): Promise<void> {
    this.incrementStats(ASYNC_FLOW_EVENTS.INIT);
    
    if (this.listenerCount(ASYNC_FLOW_EVENTS.INIT) === 0) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const listeners = this.listeners(ASYNC_FLOW_EVENTS.INIT);
      
      // 按序执行所有监听器
      const executeListeners = async () => {
        try {
          for (const listener of listeners) {
            await (listener as Function)({ context });
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      executeListeners();
    });
  }

  /**
   * 发射构建节点异步流程钩子
   */
  async emitAsyncBuildSchemaNode(viewData: IViewData, context: IBuildSchemaNodeContext): Promise<EficyNode> {
    this.incrementStats(ASYNC_FLOW_EVENTS.BUILD_SCHEMA_NODE);
    
    // 创建默认节点
    const EficyNodeClass = require('../models/EficyNode').default;
    let currentNode = new EficyNodeClass(viewData);
    
    if (this.listenerCount(ASYNC_FLOW_EVENTS.BUILD_SCHEMA_NODE) === 0) {
      return currentNode;
    }
    
    const listeners = this.listeners(ASYNC_FLOW_EVENTS.BUILD_SCHEMA_NODE);
    
    // 按序执行所有监听器，每个监听器可以修改节点
    for (const listener of listeners) {
      const result = await (listener as Function)({ viewData, context });
      if (result && typeof result === 'object' && result.constructor.name === 'EficyNode') {
        currentNode = result;
      }
    }
    
    return currentNode;
  }

  /**
   * 发射渲染异步流程钩子
   */
  async emitAsyncRender(viewNode: EficyNode, context: IRenderContext): Promise<ReactElement | null> {
    this.incrementStats(ASYNC_FLOW_EVENTS.RENDER);
    
    if (this.listenerCount(ASYNC_FLOW_EVENTS.RENDER) === 0) {
      return null; // 返回null表示需要外部提供默认渲染逻辑
    }
    
    const listeners = this.listeners(ASYNC_FLOW_EVENTS.RENDER);
    let currentElement: ReactElement | null = null;
    
    // 按序执行所有监听器，最后一个监听器的结果作为最终结果
    for (const listener of listeners) {
      const result = await (listener as Function)({ viewNode, context });
      if (result) {
        currentElement = result;
      }
    }
    
    return currentElement;
  }

  // ==================== 同步副作用钩子方法 ====================
  
  /**
   * 发射挂载同步副作用钩子 - 同步执行
   */
  emitSyncMount(context: IMountContext): void {
    this.incrementStats(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT);
    
    if (this.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT) > 0) {
      // 同步执行所有监听器
      this.emit(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT, { context });
    }
  }

  /**
   * 发射卸载同步副作用钩子 - 同步执行
   */
  emitSyncUnmount(context: IUnmountContext): void {
    this.incrementStats(SYNC_SIDE_EFFECT_EVENTS.ON_UNMOUNT);
    
    if (this.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_UNMOUNT) > 0) {
      // 同步执行所有监听器
      this.emit(SYNC_SIDE_EFFECT_EVENTS.ON_UNMOUNT, { context });
    }
  }

  /**
   * 发射组件解析异步流程钩子
   */
  async emitAsyncResolveComponent(componentName: string, context: IResolveComponentContext): Promise<any> {
    this.incrementStats(ASYNC_FLOW_EVENTS.RESOLVE_COMPONENT);
    
    if (this.listenerCount(ASYNC_FLOW_EVENTS.RESOLVE_COMPONENT) === 0) {
      return null;
    }
    
    const listeners = this.listeners(ASYNC_FLOW_EVENTS.RESOLVE_COMPONENT);
    let resolvedComponent: any = null;
    
    // 按序执行所有监听器，第一个返回有效结果的监听器胜出
    for (const listener of listeners) {
      const result = await (listener as Function)({ componentName, context });
      if (result) {
        resolvedComponent = result;
        break; // 找到组件后停止执行后续监听器
      }
    }
    
    return resolvedComponent;
  }

  /**
   * 发射属性处理异步流程钩子
   */
  async emitAsyncProcessProps(props: Record<string, any>, context: IProcessPropsContext): Promise<Record<string, any>> {
    this.incrementStats(ASYNC_FLOW_EVENTS.PROCESS_PROPS);
    
    if (this.listenerCount(ASYNC_FLOW_EVENTS.PROCESS_PROPS) === 0) {
      return props;
    }
    
    const listeners = this.listeners(ASYNC_FLOW_EVENTS.PROCESS_PROPS);
    let currentProps = { ...props };
    
    // 按序执行所有监听器，每个监听器可以修改属性
    for (const listener of listeners) {
      const result = await (listener as Function)({ props: currentProps, context });
      if (result && typeof result === 'object') {
        currentProps = { ...currentProps, ...result };
      }
    }
    
    return currentProps;
  }

  /**
   * 发射事件处理同步副作用钩子 - fire and forget
   */
  emitSyncHandleEvent(handler: Function, viewNode: EficyNode, context: IHandleEventContext): Function {
    this.incrementStats(SYNC_SIDE_EFFECT_EVENTS.ON_HANDLE_EVENT);
    
    if (this.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_HANDLE_EVENT) > 0) {
      // 并行执行所有监听器，不等待结果
      setImmediate(() => {
        this.emit(SYNC_SIDE_EFFECT_EVENTS.ON_HANDLE_EVENT, { handler, viewNode, context });
      });
    }
    
    // 直接返回原始处理器，不等待副作用完成
    return handler;
  }

  /**
   * 发射事件绑定同步副作用钩子 - fire and forget
   */
  emitSyncBindEvent(viewNode: EficyNode, context: IBindEventContext): void {
    this.incrementStats(SYNC_SIDE_EFFECT_EVENTS.ON_BIND_EVENT);
    
    if (this.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_BIND_EVENT) > 0) {
      // 并行执行所有监听器，不等待结果
      setImmediate(() => {
        this.emit(SYNC_SIDE_EFFECT_EVENTS.ON_BIND_EVENT, { viewNode, context });
      });
    }
  }

  /**
   * 发射错误同步副作用钩子 - fire and forget
   */
  emitSyncError(error: Error, context: IErrorContext): void {
    this.incrementStats(SYNC_SIDE_EFFECT_EVENTS.ON_ERROR);
    
    if (this.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_ERROR) > 0) {
      // 并行执行所有监听器，不等待结果
      setImmediate(() => {
        this.emit(SYNC_SIDE_EFFECT_EVENTS.ON_ERROR, { error, context });
      });
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics(): Record<string, number> {
    return { ...this.statistics };
  }

  /**
   * 重置统计信息
   */
  resetStatistics(): void {
    this.statistics = {};
  }

  /**
   * 增加统计计数
   */
  private incrementStats(event: string): void {
    this.statistics[event] = (this.statistics[event] || 0) + 1;
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.removeAllListeners();
    this.resetStatistics();
  }
}