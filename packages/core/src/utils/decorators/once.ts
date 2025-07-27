/**
 * @once() 装饰器
 * 确保被装饰的方法只执行一次，后续调用返回第一次执行的结果
 * 
 * @example
 * class Example {
 *   @once()
 *   expensiveOperation() {
 *     console.log('This will only run once');
 *     return Math.random();
 *   }
 * }
 */
export default function once() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    
    // 使用 WeakMap 来存储每个实例的缓存，避免内存泄漏
    const cacheMap = new WeakMap();
    const executedMap = new WeakMap();

    descriptor.value = function (...args: any[]) {
      // 如果已经执行过，直接返回缓存的结果
      if (executedMap.get(this)) {
        return cacheMap.get(this);
      }

      // 执行原方法并缓存结果
      const result = originalMethod.apply(this, args);
      cacheMap.set(this, result);
      executedMap.set(this, true);

      return result;
    };

    return descriptor;
  };
}
