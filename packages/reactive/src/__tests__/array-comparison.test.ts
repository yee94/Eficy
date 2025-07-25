import { describe, it, expect } from 'vitest';
import { 
  observable, 
  computed, 
  action,
  makeObservable,
  ObservableClass,
  effect
} from '../annotation';
import { 
  observableArray, 
  computed as createComputed, 
  effect as createEffect,
  action as createAction
} from '../index';

describe('Array Reactivity Comparison', () => {
  describe('Function-based API (baseline)', () => {
    it('should track array changes with function API', () => {
      // 使用函数式 API
      const items = observableArray<string>([]);
      
      const itemCount = createComputed(() => {
        console.log('Function API - Computing itemCount, items.length:', items.length);
        return items.length;
      });

      const addItem = createAction((item: string) => {
        console.log('Function API - Before addItem, items.length:', items.length);
        items.push(item);
        console.log('Function API - After addItem, items.length:', items.length);
      });

      // 建立 effect 来观察变化
      let effectCount = 0;
      let lastCount = 0;
      createEffect(() => {
        effectCount++;
        lastCount = itemCount();
        console.log(`Function API - Effect run ${effectCount}, itemCount: ${lastCount}`);
      });

      expect(effectCount).toBe(1);
      expect(lastCount).toBe(0);

      console.log('=== Function API - Adding first item ===');
      addItem('item1');
      
      console.log('Function API - After adding item1 - effectCount:', effectCount, 'lastCount:', lastCount);
      
      // 手动访问一下 itemCount 来强制重新计算
      const currentCount = itemCount();
      console.log('Function API - Manual access to itemCount:', currentCount);
      
      expect(currentCount).toBe(1); // 这个应该通过
      expect(effectCount).toBe(2); // 这个应该通过
    });
  });

  describe('Decorator-based API (problematic)', () => {
    it('should track array changes with decorator API', () => {
      // 使用装饰器 API
      class SimpleStore extends ObservableClass {
        @observable
        items: string[] = [];

        @computed
        get itemCount(): number {
          console.log('Decorator API - Computing itemCount, items.length:', this.items.length);
          return this.items.length;
        }

        @action
        addItem(item: string) {
          console.log('Decorator API - Before addItem, items.length:', this.items.length);
          this.items.push(item);
          console.log('Decorator API - After addItem, items.length:', this.items.length);
        }
      }

      const store = new SimpleStore();

      // 建立 effect 来观察变化
      let effectCount = 0;
      let lastCount = 0;
      effect(() => {
        effectCount++;
        lastCount = store.itemCount;
        console.log(`Decorator API - Effect run ${effectCount}, itemCount: ${lastCount}`);
      });

      expect(effectCount).toBe(1);
      expect(lastCount).toBe(0);

      console.log('=== Decorator API - Adding first item ===');
      store.addItem('item1');
      
      console.log('Decorator API - After adding item1 - effectCount:', effectCount, 'lastCount:', lastCount);
      
      // 手动访问一下 itemCount 来强制重新计算
      const currentCount = store.itemCount;
      console.log('Decorator API - Manual access to itemCount:', currentCount);
      
      expect(currentCount).toBe(1); // 这个可能失败
      expect(effectCount).toBe(2); // 这个可能失败
    });
  });

  describe('Direct observableArray access', () => {
    it('should track direct access to observableArray properties', () => {
      const items = observableArray<string>([]);

      // 直接访问 observableArray 的属性
      let effectCount = 0;
      let lastLength = 0;
      createEffect(() => {
        effectCount++;
        lastLength = items.length; // 直接访问 .length
        console.log(`Direct access - Effect run ${effectCount}, length: ${lastLength}`);
      });

      expect(effectCount).toBe(1);
      expect(lastLength).toBe(0);

      console.log('=== Direct access - Adding item ===');
      items.push('item1');
      
      expect(items.length).toBe(1);
      expect(effectCount).toBe(2); // 这个应该通过
      expect(lastLength).toBe(1);
    });

    it('should track array filter operations', () => {
      interface Todo {
        id: number;
        text: string;
        completed: boolean;
      }

      const todos = observableArray<Todo>([]);
      
      const activeCount = createComputed(() => {
        console.log('Direct filter - Computing activeCount, todos.length:', todos.length);
        const result = todos.filter(todo => !todo.completed).length;
        console.log('Direct filter - activeCount result:', result);
        return result;
      });

      let effectCount = 0;
      let lastActiveCount = 0;
      createEffect(() => {
        effectCount++;
        lastActiveCount = activeCount();
        console.log(`Direct filter - Effect run ${effectCount}, activeCount: ${lastActiveCount}`);
      });

      expect(effectCount).toBe(1);
      expect(lastActiveCount).toBe(0);

      console.log('=== Direct filter - Adding todo ===');
      todos.push({ id: 1, text: 'Learn', completed: false });
      
      expect(todos.length).toBe(1);
      expect(activeCount()).toBe(1);
      expect(effectCount).toBe(2); // 这个应该通过
      expect(lastActiveCount).toBe(1);
    });
  });
}); 