import { createSignal, createComputed } from 'reactjs-signal';
import { effect } from 'alien-signals';
import { injectable } from 'tsyringe';
import type { ISignalManager, ISignal } from '../interfaces';

/**
 * 信号实现类
 */
class SignalImpl<T> implements ISignal<T> {
  constructor(private signalRef: ReturnType<typeof createSignal<T>>) {}

  get(): T {
    return this.signalRef();
  }

  set(value: T): void {
    this.signalRef(value);
  }

  update(fn: (prev: T) => T): void {
    this.signalRef(fn);
  }

  subscribe(listener: (value: T) => void): () => void {
    // reactjs-signal 基于 alien-signals，可以通过 effect 来监听变化
    return effect(() => {
      listener(this.signalRef());
    });
  }
}

/**
 * 计算信号实现类
 */
class ComputedSignalImpl<T> implements ISignal<T> {
  constructor(private computedRef: ReturnType<typeof createComputed<T>>) {}

  get(): T {
    return this.computedRef();
  }

  set(): void {
    throw new Error('Cannot set value of computed signal');
  }

  update(): void {
    throw new Error('Cannot update value of computed signal');
  }

  subscribe(listener: (value: T) => void): () => void {
    return effect(() => {
      listener(this.computedRef());
    });
  }
}

/**
 * 响应式信号管理器
 * 基于reactjs-signal实现，替代mobx
 */
@injectable()
export class SignalManager implements ISignalManager {
  /**
   * 创建响应式信号
   */
  createSignal<T>(initialValue: T): ISignal<T> {
    const signalRef = createSignal(initialValue);
    return new SignalImpl(signalRef);
  }

  /**
   * 创建计算信号
   */
  createComputed<T>(fn: () => T): ISignal<T> {
    const computedRef = createComputed(fn);
    return new ComputedSignalImpl(computedRef);
  }

  /**
   * 创建副作用
   */
  createEffect(fn: () => void | (() => void)): () => void {
    return effect(fn);
  }

  /**
   * 批量更新信号
   */
  batch(fn: () => void): void {
    // reactjs-signal 基于 alien-signals，会自动批量更新
    fn();
  }
} 