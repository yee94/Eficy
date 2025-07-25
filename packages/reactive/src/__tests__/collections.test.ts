import { describe, it, expect, vi } from 'vitest';
import { effect } from '../core/signal';
import {
  observableMap,
  isObservableMap,
  observableSet,
  isObservableSet,
  observableWeakMap,
  isObservableWeakMap,
  observableWeakSet,
  isObservableWeakSet
} from '../observables/collections';

describe('Observable Collections', () => {
  describe('ObservableMap', () => {
    it('should create an observable map', () => {
      const map = observableMap<string, number>();
      expect(isObservableMap(map)).toBe(true);
      expect(map.size).toBe(0);
    });

    it('should initialize with entries', () => {
      const map = observableMap([['a', 1], ['b', 2]]);
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should trigger effects on size changes', () => {
      const map = observableMap<string, number>();
      const spy = vi.fn();

      effect(() => {
        spy(map.size);
      });

      expect(spy).toHaveBeenCalledWith(0);

      map.set('a', 1);
      expect(spy).toHaveBeenCalledWith(1);

      map.set('b', 2);
      expect(spy).toHaveBeenCalledWith(2);

      map.delete('a');
      expect(spy).toHaveBeenCalledWith(1);

      map.clear();
      expect(spy).toHaveBeenCalledWith(0);
    });

    it('should not trigger effect when setting same value', () => {
      const map = observableMap<string, number>();
      const spy = vi.fn();

      effect(() => {
        spy(map.size);
      });

      expect(spy).toHaveBeenCalledTimes(1); // 初始调用 (size = 0)
      spy.mockClear();

      map.set('a', 1); // 新增 key
      expect(spy).toHaveBeenCalledTimes(1); // size 变为 1

      spy.mockClear();
      map.set('a', 1); // Same value - 不应该触发
      expect(spy).not.toHaveBeenCalled();

      map.set('a', 2); // Different value - 但 size 还是 1，不会触发
      expect(spy).not.toHaveBeenCalled(); // size 没有变化

      map.set('b', 3); // 新增不同的 key
      expect(spy).toHaveBeenCalledTimes(1); // size 变为 2
    });

    it('should support all Map methods', () => {
      const map = observableMap([['a', 1], ['b', 2]]);

      expect(map.has('a')).toBe(true);
      expect(map.has('c')).toBe(false);

      expect(Array.from(map.keys())).toEqual(['a', 'b']);
      expect(Array.from(map.values())).toEqual([1, 2]);
      expect(Array.from(map.entries())).toEqual([['a', 1], ['b', 2]]);

      const spy = vi.fn();
      map.forEach(spy);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(1, 'a', expect.any(Object));
      expect(spy).toHaveBeenCalledWith(2, 'b', expect.any(Object));
    });

    it('should be iterable', () => {
      const map = observableMap([['a', 1], ['b', 2]]);
      const entries = Array.from(map);
      expect(entries).toEqual([['a', 1], ['b', 2]]);
    });

    it('should support observe method', () => {
      const map = observableMap<string, number>();
      const spy = vi.fn();

      const dispose = map.observe(spy);

      map.set('a', 1);
      expect(spy).toHaveBeenCalledWith({
        type: 'set',
        key: 'a',
        value: 1,
        oldValue: undefined
      });

      map.set('a', 2);
      expect(spy).toHaveBeenCalledWith({
        type: 'set',
        key: 'a',
        value: 2,
        oldValue: 1
      });

      map.delete('a');
      expect(spy).toHaveBeenCalledWith({
        type: 'delete',
        key: 'a',
        oldValue: 2
      });

      map.set('b', 3);
      map.clear();
      expect(spy).toHaveBeenCalledWith({ type: 'clear' });

      dispose();
      spy.mockClear();

      map.set('c', 4);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should convert to regular Map', () => {
      const observableMapInstance = observableMap([['a', 1], ['b', 2]]);
      const regularMap = observableMapInstance.toMap();

      expect(regularMap).toBeInstanceOf(Map);
      expect(regularMap).not.toBe(observableMapInstance);
      expect(Array.from(regularMap.entries())).toEqual([['a', 1], ['b', 2]]);
    });
  });

  describe('ObservableSet', () => {
    it('should create an observable set', () => {
      const set = observableSet<number>();
      expect(isObservableSet(set)).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should initialize with values', () => {
      const set = observableSet([1, 2, 3]);
      expect(set.size).toBe(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(4)).toBe(false);
    });

    it('should trigger effects on size changes', () => {
      const set = observableSet<number>();
      const spy = vi.fn();

      effect(() => {
        spy(set.size);
      });

      expect(spy).toHaveBeenCalledWith(0);

      set.add(1);
      expect(spy).toHaveBeenCalledWith(1);

      set.add(2);
      expect(spy).toHaveBeenCalledWith(2);

      set.delete(1);
      expect(spy).toHaveBeenCalledWith(1);

      set.clear();
      expect(spy).toHaveBeenCalledWith(0);
    });

    it('should not trigger effect when adding existing value', () => {
      const set = observableSet<number>();
      const spy = vi.fn();

      set.add(1);

      effect(() => {
        spy(set.size);
      });

      spy.mockClear();

      set.add(1); // Already exists
      expect(spy).not.toHaveBeenCalled();

      set.add(2); // New value
      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should support all Set methods', () => {
      const set = observableSet([1, 2, 3]);

      expect(set.has(1)).toBe(true);
      expect(set.has(4)).toBe(false);

      expect(Array.from(set.keys())).toEqual([1, 2, 3]);
      expect(Array.from(set.values())).toEqual([1, 2, 3]);
      expect(Array.from(set.entries())).toEqual([[1, 1], [2, 2], [3, 3]]);

      const spy = vi.fn();
      set.forEach(spy);
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith(1, 1, expect.any(Object));
    });

    it('should be iterable', () => {
      const set = observableSet([1, 2, 3]);
      const values = Array.from(set);
      expect(values).toEqual([1, 2, 3]);
    });

    it('should support observe method', () => {
      const set = observableSet<number>();
      const spy = vi.fn();

      const dispose = set.observe(spy);

      set.add(1);
      expect(spy).toHaveBeenCalledWith({ type: 'add', value: 1 });

      set.delete(1);
      expect(spy).toHaveBeenCalledWith({ type: 'delete', value: 1 });

      set.add(2);
      set.clear();
      expect(spy).toHaveBeenCalledWith({ type: 'clear' });

      dispose();
      spy.mockClear();

      set.add(3);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should convert to regular Set', () => {
      const observableSetInstance = observableSet([1, 2, 3]);
      const regularSet = observableSetInstance.toSet();

      expect(regularSet).toBeInstanceOf(Set);
      expect(regularSet).not.toBe(observableSetInstance);
      expect(Array.from(regularSet)).toEqual([1, 2, 3]);
    });
  });

  describe('ObservableWeakMap', () => {
    it('should create an observable weak map', () => {
      const weakMap = observableWeakMap<object, number>();
      expect(isObservableWeakMap(weakMap)).toBe(true);
    });

    it('should support WeakMap operations', () => {
      const weakMap = observableWeakMap<object, number>();
      const key1 = {};
      const key2 = {};

      expect(weakMap.has(key1)).toBe(false);

      weakMap.set(key1, 1);
      expect(weakMap.has(key1)).toBe(true);
      expect(weakMap.get(key1)).toBe(1);

      weakMap.set(key2, 2);
      expect(weakMap.get(key2)).toBe(2);

      expect(weakMap.delete(key1)).toBe(true);
      expect(weakMap.has(key1)).toBe(false);
      expect(weakMap.delete(key1)).toBe(false); // Already deleted
    });

    it('should support observe method', () => {
      const weakMap = observableWeakMap<object, number>();
      const key = {};
      const spy = vi.fn();

      const dispose = weakMap.observe(spy);

      weakMap.set(key, 1);
      expect(spy).toHaveBeenCalledWith({
        type: 'set',
        key,
        value: 1,
        oldValue: undefined
      });

      weakMap.set(key, 2);
      expect(spy).toHaveBeenCalledWith({
        type: 'set',
        key,
        value: 2,
        oldValue: 1
      });

      weakMap.delete(key);
      expect(spy).toHaveBeenCalledWith({
        type: 'delete',
        key,
        oldValue: 2
      });

      dispose();
      spy.mockClear();

      weakMap.set(key, 3);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ObservableWeakSet', () => {
    it('should create an observable weak set', () => {
      const weakSet = observableWeakSet<object>();
      expect(isObservableWeakSet(weakSet)).toBe(true);
    });

    it('should support WeakSet operations', () => {
      const weakSet = observableWeakSet<object>();
      const value1 = {};
      const value2 = {};

      expect(weakSet.has(value1)).toBe(false);

      weakSet.add(value1);
      expect(weakSet.has(value1)).toBe(true);

      weakSet.add(value1); // Adding again should not trigger notification
      expect(weakSet.has(value1)).toBe(true);

      weakSet.add(value2);
      expect(weakSet.has(value2)).toBe(true);

      expect(weakSet.delete(value1)).toBe(true);
      expect(weakSet.has(value1)).toBe(false);
      expect(weakSet.delete(value1)).toBe(false); // Already deleted
    });

    it('should support observe method', () => {
      const weakSet = observableWeakSet<object>();
      const value = {};
      const spy = vi.fn();

      const dispose = weakSet.observe(spy);

      weakSet.add(value);
      expect(spy).toHaveBeenCalledWith({ type: 'add', value });

      spy.mockClear();
      weakSet.add(value); // Should not trigger since already exists
      expect(spy).not.toHaveBeenCalled();

      weakSet.delete(value);
      expect(spy).toHaveBeenCalledWith({ type: 'delete', value });

      dispose();
      spy.mockClear();

      weakSet.add(value);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify observable collections', () => {
      expect(isObservableMap(observableMap())).toBe(true);
      expect(isObservableMap(new Map())).toBe(false);
      expect(isObservableMap({})).toBe(false);

      expect(isObservableSet(observableSet())).toBe(true);
      expect(isObservableSet(new Set())).toBe(false);
      expect(isObservableSet([])).toBe(false);

      expect(isObservableWeakMap(observableWeakMap())).toBe(true);
      expect(isObservableWeakMap(new WeakMap())).toBe(false);
      expect(isObservableWeakMap({})).toBe(false);

      expect(isObservableWeakSet(observableWeakSet())).toBe(true);
      expect(isObservableWeakSet(new WeakSet())).toBe(false);
      expect(isObservableWeakSet({})).toBe(false);
    });
  });
}); 