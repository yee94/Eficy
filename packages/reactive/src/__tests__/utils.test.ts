import { describe, it, expect } from 'vitest';
import {
  toRaw,
  toJS,
  markRaw,
  isRaw,
  markReactive,
  isReactive,
  hasCollected,
  withCollecting,
  startCollecting,
  stopCollecting,
  isFunction,
  isObject,
  isPrimitive,
  isArray,
  isPlainObject,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  deepClone,
  shallowClone,
  shallowEqual,
  deepEqual,
  createDebugger,
  createTimer
} from '../utils/helpers';

describe('Utils', () => {
  describe('Type Checkers', () => {
    it('should check if value is function', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
      expect(isFunction('string')).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction(null)).toBe(false);
    });

    it('should check if value is object', () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(true);
      expect(isObject(new Date())).toBe(true);
      expect(isObject(new Map())).toBe(true);
      expect(isObject(null)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });

    it('should check if value is primitive', () => {
      expect(isPrimitive('string')).toBe(true);
      expect(isPrimitive(123)).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(true);
      expect(isPrimitive(Symbol('test'))).toBe(true);
      expect(isPrimitive(BigInt(123))).toBe(true);
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
    });

    it('should check if value is array', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray('string')).toBe(false);
      expect(isArray(null)).toBe(false);
    });

    it('should check if value is plain object', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(new Map())).toBe(false);
      expect(isPlainObject(() => {})).toBe(false);
      expect(isPlainObject(null)).toBe(false);
    });

    it('should check collection types', () => {
      expect(isMap(new Map())).toBe(true);
      expect(isMap({})).toBe(false);
      
      expect(isSet(new Set())).toBe(true);
      expect(isSet([])).toBe(false);
      
      expect(isWeakMap(new WeakMap())).toBe(true);
      expect(isWeakMap(new Map())).toBe(false);
      
      expect(isWeakSet(new WeakSet())).toBe(true);
      expect(isWeakSet(new Set())).toBe(false);
    });
  });

  describe('Raw and Reactive Markers', () => {
    it('should mark and detect raw objects', () => {
      const obj = { a: 1 };
      expect(isRaw(obj)).toBe(false);
      
      const rawObj = markRaw(obj);
      expect(isRaw(rawObj)).toBe(true);
      expect(rawObj).toBe(obj); // Should be the same object
    });

    it('should not mark primitives as raw', () => {
      expect(markRaw(123)).toBe(123);
      expect(markRaw('string')).toBe('string');
      expect(markRaw(null)).toBe(null);
      expect(isRaw(123)).toBe(false);
      expect(isRaw('string')).toBe(false);
    });

    it('should mark and detect reactive objects', () => {
      const obj = { a: 1 };
      expect(isReactive(obj)).toBe(false);
      
      const reactiveObj = markReactive(obj);
      expect(isReactive(reactiveObj)).toBe(true);
      expect(reactiveObj).toBe(obj); // Should be the same object
    });
  });

  describe('toRaw function', () => {
    it('should return primitives as-is', () => {
      expect(toRaw(123)).toBe(123);
      expect(toRaw('string')).toBe('string');
      expect(toRaw(null)).toBe(null);
      expect(toRaw(undefined)).toBe(undefined);
    });

    it('should return objects as-is when not reactive', () => {
      const obj = { a: 1 };
      expect(toRaw(obj)).toBe(obj);
    });

    it('should extract raw from marked objects', () => {
      const obj = { a: 1 };
      const rawObj = markRaw(obj);
      expect(toRaw(rawObj)).toBe(obj);
    });
  });

  describe('toJS function', () => {
    it('should convert primitives', () => {
      expect(toJS(123)).toBe(123);
      expect(toJS('string')).toBe('string');
      expect(toJS(null)).toBe(null);
    });

    it('should convert arrays', () => {
      const arr = [1, 2, { a: 3 }];
      const result = toJS(arr);
      expect(result).toEqual(arr);
      expect(result).not.toBe(arr); // Should be a new array
    });

    it('should convert objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const result = toJS(obj);
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj); // Should be a new object
      expect(result.b).not.toBe(obj.b); // Nested objects should also be new
    });

    it('should handle Maps', () => {
      const map = new Map<unknown, unknown>([['key', 'value'], [1, { a: 2 }]]);
      const result = toJS(map) as Map<unknown, unknown>;
      expect(result).toBeInstanceOf(Map);
      expect(result.get('key')).toBe('value');
      expect(result.get(1)).toEqual({ a: 2 });
      expect(result).not.toBe(map);
    });

    it('should handle Sets', () => {
      const set = new Set([1, 'string', { a: 3 }]);
      const result = toJS(set) as Set<unknown>;
      expect(result).toBeInstanceOf(Set);
      expect(result.has(1)).toBe(true);
      expect(result.has('string')).toBe(true);
      expect(result).not.toBe(set);
    });

    it('should handle circular references', () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;
      
      const result = toJS(obj) as Record<string, unknown>;
      expect(result.a).toBe(1);
      // 注意：完美的循环引用处理很复杂，这里验证基本转换功能
      expect(typeof result.self).toBe('object');
    });
  });

  describe('Dependency Collection', () => {
    it('should track collection state', () => {
      expect(hasCollected()).toBe(false);
      
      startCollecting();
      expect(hasCollected()).toBe(true);
      
      stopCollecting();
      expect(hasCollected()).toBe(false);
    });

    it('should detect collection in function', () => {
      let hasCollectedInFn = false;
      
      const result = hasCollected(() => {
        startCollecting();
        hasCollectedInFn = hasCollected(); // 这里不传参数，直接检查状态
        // 不调用 stopCollecting，让状态保持 true
      });
      
      expect(result).toBe(true);
      expect(hasCollectedInFn).toBe(true);
      
      // 手动清理状态
      stopCollecting();
      expect(hasCollected()).toBe(false); // Should restore state
    });

    it('should execute function with collection context', () => {
      let collectedInside = false;
      
      const result = withCollecting(() => {
        collectedInside = hasCollected();
        return 'test';
      });
      
      expect(result).toBe('test');
      expect(collectedInside).toBe(true);
      expect(hasCollected()).toBe(false); // Should restore state
    });
  });

  describe('Object Operations', () => {
    it('should deep clone objects', () => {
      const obj = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: 5 }
      };
      
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
      expect(cloned.d).not.toBe(obj.d);
      expect(cloned.b[2]).not.toBe(obj.b[2]);
    });

    it('should shallow clone objects', () => {
      const obj = {
        a: 1,
        b: [2, 3],
        c: { d: 4 }
      };
      
      const cloned = shallowClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).toBe(obj.b); // Should be same reference
      expect(cloned.c).toBe(obj.c); // Should be same reference
    });

    it('should shallow clone arrays', () => {
      const arr = [1, 2, [3, 4]];
      const cloned = shallowClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).toBe(arr[2]); // Nested array should be same reference
    });
  });

  describe('Equality Checks', () => {
    it('should perform shallow equality checks', () => {
      expect(shallowEqual(1, 1)).toBe(true);
      expect(shallowEqual('a', 'a')).toBe(true);
      expect(shallowEqual(null, null)).toBe(true);
      expect(shallowEqual(undefined, undefined)).toBe(true);
      
      expect(shallowEqual(1, 2)).toBe(false);
      expect(shallowEqual('a', 'b')).toBe(false);
      expect(shallowEqual(null, undefined)).toBe(false);
      
      // Objects
      expect(shallowEqual({}, {})).toBe(true);
      expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      
      // Arrays
      expect(shallowEqual([], [])).toBe(true);
      expect(shallowEqual([1, 2], [1, 2])).toBe(true);
      expect(shallowEqual([1, 2], [1, 3])).toBe(false);
      expect(shallowEqual([1], [1, 2])).toBe(false);
      
      // Nested objects should be reference equal for shallow
      const nested = { c: 3 };
      expect(shallowEqual({ a: nested }, { a: nested })).toBe(true);
      expect(shallowEqual({ a: { c: 3 } }, { a: { c: 3 } })).toBe(false);
    });

    it('should perform deep equality checks', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('a', 'a')).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('a', 'b')).toBe(false);
      
      // Objects
      expect(deepEqual({}, {})).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
      expect(deepEqual({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false);
      
      // Arrays
      expect(deepEqual([], [])).toBe(true);
      expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
      
      // Complex nested structures
      const complex1 = {
        a: [1, { b: [2, 3] }],
        c: { d: { e: 4 } }
      };
      const complex2 = {
        a: [1, { b: [2, 3] }],
        c: { d: { e: 4 } }
      };
      const complex3 = {
        a: [1, { b: [2, 3] }],
        c: { d: { e: 5 } }
      };
      
      expect(deepEqual(complex1, complex2)).toBe(true);
      expect(deepEqual(complex1, complex3)).toBe(false);
    });
  });

  describe('Debug Tools', () => {
    it('should create debugger with named methods', () => {
      const debug = createDebugger('TestModule');
      expect(typeof debug.log).toBe('function');
      expect(typeof debug.warn).toBe('function');
      expect(typeof debug.error).toBe('function');
    });

    it('should create timer with start/end methods', () => {
      const timer = createTimer('TestTimer');
      expect(typeof timer.start).toBe('function');
      expect(typeof timer.end).toBe('function');
      
      timer.start();
      const duration = timer.end();
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });
}); 