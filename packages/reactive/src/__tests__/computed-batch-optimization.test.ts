import { describe, it, expect, vi } from 'vitest';
import { signal, computed, effect } from '../core/signal';
import { 
  batchedSignal, 
  batchedEffect, 
  createStore, 
  derived, 
  createBatchScope 
} from '../core/computed-batch';

describe('Computed-Based Batch Optimization', () => {
  it('should demonstrate batchedSignal optimization', async () => {
    const count = batchedSignal(0);
    const name = batchedSignal('test');
    
    const spy = vi.fn();
    batchedEffect(() => {
      spy({ count: count(), name: name() });
    });
    
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith({ count: 0, name: 'test' });
    
    // 快速连续更新
    count(10);
    name('updated');
    count(20);
    
    // 等待微任务
    await new Promise(resolve => setTimeout(resolve, 0));
    
    console.log('batchedSignal effect 调用次数:', spy.mock.calls.length);
    
    // 应该只有一次额外的调用（批处理后）
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith({ count: 20, name: 'updated' });
  });

  it('should demonstrate createStore batch optimization', async () => {
    const store = createStore({
      count: 0,
      name: 'test',
      items: [1, 2, 3]
    });
    
    const spy = vi.fn();
    store.subscribe(spy);
    
    expect(spy).toHaveBeenCalledTimes(1);
    
    // 快速连续更新
    store.setState({ count: 10 });
    store.setState({ name: 'updated' });
    store.setState({ items: [4, 5, 6] });
    
    console.log('store subscribe 调用次数:', spy.mock.calls.length);
    
    // 等待微任务
    await new Promise(resolve => setTimeout(resolve, 0));
    
    console.log('微任务后 store subscribe 调用次数:', spy.mock.calls.length);
    
    expect(store.getState()).toEqual({
      count: 10,
      name: 'updated',
      items: [4, 5, 6]
    });
  });

  it('should demonstrate derived state optimization', () => {
    const data = signal({ items: [1, 2, 3, 4, 5], threshold: 3 });
    
    const filteredItems = derived(data, state => 
      state.items.filter(item => item > state.threshold)
    );
    
    const summary = derived(filteredItems, items => ({
      count: items.length,
      sum: items.reduce((sum, item) => sum + item, 0),
      average: items.length > 0 ? items.reduce((sum, item) => sum + item, 0) / items.length : 0
    }));
    
    const spy = vi.fn();
    effect(() => {
      spy(summary());
    });
    
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith({
      count: 2,
      sum: 9, // 4 + 5
      average: 4.5
    });
    
    // 更新数据
    data({ items: [1, 2, 3, 4, 5, 6, 7], threshold: 4 });
    
    console.log('derived state effect 调用次数:', spy.mock.calls.length);
    
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith({
      count: 3,
      sum: 18, // 5 + 6 + 7
      average: 6
    });
  });

  it('should test createBatchScope for manual control', async () => {
    const batchScope = createBatchScope();
    const count = signal(0);
    const name = signal('test');
    
    const spy = vi.fn();
    effect(() => {
      spy({ count: count(), name: name() });
    });
    
    expect(spy).toHaveBeenCalledTimes(1);
    
    // 手动批处理
    batchScope.queueUpdate(() => count(10));
    batchScope.queueUpdate(() => name('updated'));
    batchScope.queueUpdate(() => count(20));
    
    expect(batchScope.pending()).toBe(true);
    
    // 等待自动 flush
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(batchScope.pending()).toBe(false);
    console.log('manual batch effect 调用次数:', spy.mock.calls.length);
    
    // 验证最终状态
    expect(count()).toBe(20);
    expect(name()).toBe('updated');
  });

  it('should compare performance: normal vs batched', async () => {
    // 普通方式
    const normalCount = signal(0);
    const normalName = signal('test');
    
    const normalSpy = vi.fn();
    effect(() => {
      normalSpy({ count: normalCount(), name: normalName() });
    });
    
    // 批处理方式
    const batchedCount = batchedSignal(0);
    const batchedName = batchedSignal('test');
    
    const batchedSpy = vi.fn();
    batchedEffect(() => {
      batchedSpy({ count: batchedCount(), name: batchedName() });
    });
    
    // 初始状态
    expect(normalSpy).toHaveBeenCalledTimes(1);
    expect(batchedSpy).toHaveBeenCalledTimes(1);
    
    // 连续更新
    for (let i = 0; i < 5; i++) {
      normalCount(i);
      normalName(`test-${i}`);
      
      batchedCount(i);
      batchedName(`test-${i}`);
    }
    
    console.log('=== 性能对比 ===');
    console.log('普通方式 effect 调用次数:', normalSpy.mock.calls.length);
    console.log('批处理方式 effect 调用次数 (更新前):', batchedSpy.mock.calls.length);
    
    // 等待批处理
    await new Promise(resolve => setTimeout(resolve, 0));
    
    console.log('批处理方式 effect 调用次数 (更新后):', batchedSpy.mock.calls.length);
    
    // 验证最终状态一致
    expect(normalCount()).toBe(4);
    expect(batchedCount()).toBe(4);
    expect(normalName()).toBe('test-4');
    expect(batchedName()).toBe('test-4');
    
    // 批处理应该显著减少调用次数
    expect(batchedSpy.mock.calls.length).toBeLessThan(normalSpy.mock.calls.length);
  });
}); 