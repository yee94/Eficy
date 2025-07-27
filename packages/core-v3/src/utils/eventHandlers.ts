import type EficyNode from '../models/EficyNode';
import type { LifecycleEventEmitter } from '../services/LifecycleEventEmitter';
import type { IHandleEventContext, IBindEventContext } from '../interfaces/lifecycle';

/**
 * 包装事件处理函数，添加生命周期钩子支持
 */
export function wrapEventHandler(
  originalHandler: Function,
  eventName: string,
  viewNode: EficyNode,
  lifecycleEventEmitter?: LifecycleEventEmitter
): Function {
  return function wrappedHandler(event: Event) {
    if (lifecycleEventEmitter) {
      // 创建 HandleEvent 上下文
      const handleEventContext: IHandleEventContext = {
        timestamp: Date.now(),
        requestId: `handle-event-${viewNode.id}-${Date.now()}`,
        eventType: event.type,
        target: event.target as Element
      };

      // 发射同步副作用钩子 - fire and forget
      lifecycleEventEmitter.emitSyncHandleEvent(originalHandler, viewNode, handleEventContext);
    }
    
    // 执行原始处理函数
    return originalHandler.call(this, event);
  };
}

/**
 * 绑定事件处理函数，添加生命周期钩子支持
 */
export function bindEventHandler(
  viewNode: EficyNode,
  lifecycleEventEmitter: LifecycleEventEmitter
): void {
  // 创建 BindEvent 上下文
  const bindEventContext: IBindEventContext = {
    timestamp: Date.now(),
    requestId: `bind-event-${viewNode.id}-${Date.now()}`,
    eventType: 'bind',
    element: undefined as any // 在绑定阶段没有具体的element
  };

  // 发射同步副作用钩子 - fire and forget
  lifecycleEventEmitter.emitSyncBindEvent(viewNode, bindEventContext);
}

/**
 * 处理组件 props 中的事件处理函数
 */
export function processEventHandlers(
  props: Record<string, any>,
  viewNode: EficyNode,
  lifecycleEventEmitter?: LifecycleEventEmitter
): Record<string, any> {
  const processedProps = { ...props };
  
  // 查找所有以 "on" 开头的属性（事件处理函数）
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase(); // onClick -> click
      processedProps[key] = wrapEventHandler(value, eventName, viewNode, lifecycleEventEmitter);
    }
  }
  
  // 如果有 lifecycleEventEmitter，绑定事件
  if (lifecycleEventEmitter) {
    bindEventHandler(viewNode, lifecycleEventEmitter);
  }
  
  return processedProps;
}