import { DependencyContainer } from 'tsyringe';
import { BasePlugin } from '../BasePlugin';
import { TOKENS } from '../../container/tokens';

/**
 * 事件插件
 * 提供事件发布订阅功能
 */
export class EventPlugin extends BasePlugin {
  public readonly name = 'event';
  public readonly version = '1.0.0';
  public readonly singleton = true;

  private eventListeners = new Map<string, Set<Function>>();

  protected onInstall(container: DependencyContainer, options?: any): void {
    // 注册事件服务
    this.registerSingleton(TOKENS.EVENT_EMITTER, {
      on: this.on.bind(this),
      off: this.off.bind(this),
      emit: this.emit.bind(this),
      once: this.once.bind(this),
      clear: this.clear.bind(this),
      getListenerCount: this.getListenerCount.bind(this)
    });
  }

  protected onUninstall(container: DependencyContainer): void {
    this.eventListeners.clear();
  }

  /**
   * 订阅事件
   */
  private on(eventName: string, listener: Function): () => void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }

    const listeners = this.eventListeners.get(eventName)!;
    listeners.add(listener);

    // 返回取消订阅函数
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventName);
      }
    };
  }

  /**
   * 取消订阅事件
   */
  private off(eventName: string, listener?: Function): void {
    const listeners = this.eventListeners.get(eventName);
    if (!listeners) return;

    if (listener) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventName);
      }
    } else {
      this.eventListeners.delete(eventName);
    }
  }

  /**
   * 发布事件
   */
  private emit(eventName: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(eventName);
    if (!listeners) return;

    // 复制listeners数组，避免在执行过程中被修改
    const listenersArray = Array.from(listeners);
    
    for (const listener of listenersArray) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    }
  }

  /**
   * 一次性订阅事件
   */
  private once(eventName: string, listener: Function): () => void {
    const wrappedListener = (...args: any[]) => {
      this.off(eventName, wrappedListener);
      listener(...args);
    };

    return this.on(eventName, wrappedListener);
  }

  /**
   * 清空所有事件监听器
   */
  private clear(eventName?: string): void {
    if (eventName) {
      this.eventListeners.delete(eventName);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * 获取事件监听器数量
   */
  private getListenerCount(eventName: string): number {
    const listeners = this.eventListeners.get(eventName);
    return listeners ? listeners.size : 0;
  }

  /**
   * 获取所有事件名称
   */
  private getEventNames(): string[] {
    return Array.from(this.eventListeners.keys());
  }

  /**
   * 检查是否有指定事件的监听器
   */
  private hasListeners(eventName: string): boolean {
    return this.eventListeners.has(eventName) && this.eventListeners.get(eventName)!.size > 0;
  }
} 