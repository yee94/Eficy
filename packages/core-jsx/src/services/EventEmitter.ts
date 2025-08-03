/**
 * EventEmitter - 事件发射器服务
 */

import { injectable } from 'tsyringe';

export type EventListener<T = any> = (data: T) => void;

@injectable()
export class EventEmitter {
  private events = new Map<string, Set<EventListener>>();
  
  /**
   * 监听事件
   */
  on<T = any>(event: string, listener: EventListener<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    const listeners = this.events.get(event)!;
    listeners.add(listener);
    
    // 返回取消监听的函数
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    };
  }
  
  /**
   * 监听事件（一次性）
   */
  once<T = any>(event: string, listener: EventListener<T>): () => void {
    const onceListener: EventListener<T> = (data) => {
      listener(data);
      off();
    };
    
    const off = this.on(event, onceListener);
    return off;
  }
  
  /**
   * 取消监听事件
   */
  off<T = any>(event: string, listener: EventListener<T>): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }
  
  /**
   * 发射事件
   */
  emit<T = any>(event: string, data?: T): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[EventEmitter] Error in listener for event "${event}":`, error);
        }
      });
    }
  }
  
  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.size : 0;
  }
  
  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
  
  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  /**
   * 获取事件统计信息
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.events.forEach((listeners, event) => {
      stats[event] = listeners.size;
    });
    
    return stats;
  }
}