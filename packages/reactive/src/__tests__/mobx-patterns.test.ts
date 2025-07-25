import { describe, it, expect } from 'vitest';
import {
  observable,
  computed,
  action,
  makeObservable,
  ObservableClass
} from '../decorators';
import { effect } from '../core/signal';

describe('MobX Patterns Implementation', () => {
  
  describe('方案1: 装饰器 + 手动 makeObservable（暂时跳过）', () => {
    it.skip('should work with class using decorators and manual makeObservable', () => {
      // 暂时跳过，等简化后再实现
    });
  });

  describe('方案2: 现代装饰器（暂时跳过）', () => {
    it.skip('should work with accessor keyword', () => {
      // 暂时跳过，accessor 语法在当前环境不支持
    });
  });

  describe('方案3: 配置对象方式', () => {
    it('should work with configuration object', () => {
      class Doubler {
        value!: number;

        constructor(value: number) {
          makeObservable(this, {
            value: observable,
            double: computed,
            increment: action
          });
          this.value = value;
        }

        get double(): number {
          console.log('Computing double (config), value:', this.value);
          return this.value * 2;
        }

        increment() {
          console.log('Before increment (config), value:', this.value);
          this.value++;
          console.log('After increment (config), value:', this.value);
        }
      }

      const doubler = new Doubler(3);
      
      // 测试初始值
      expect(doubler.value).toBe(3);
      expect(doubler.double).toBe(6);

      // 测试 effect 响应性
      let effectRuns = 0;
      let lastDouble = 0;
      effect(() => {
        effectRuns++;
        lastDouble = doubler.double;
        console.log(`Config effect run ${effectRuns}, double: ${lastDouble}`);
      });

      expect(effectRuns).toBe(1);
      expect(lastDouble).toBe(6);

      // 测试 action
      console.log('=== Calling increment (config) ===');
      doubler.increment();

      expect(doubler.value).toBe(4);
      expect(doubler.double).toBe(8);
      expect(effectRuns).toBe(2);
      expect(lastDouble).toBe(8);
    });

    it('should work with array properties in config mode', () => {
      class TodoStore {
        todos!: { id: number; text: string; completed: boolean }[];

        constructor() {
          makeObservable(this, {
            todos: observable,
            activeCount: computed,
            addTodo: action
          });
          this.todos = [];
        }

        get activeCount(): number {
          console.log('Computing activeCount (config), todos.length:', this.todos.length);
          return this.todos.filter(todo => !todo.completed).length;
        }

        addTodo(text: string) {
          console.log('Before addTodo (config), todos.length:', this.todos.length);
          this.todos.push({
            id: Date.now(),
            text,
            completed: false
          });
          console.log('After addTodo (config), todos.length:', this.todos.length);
        }
      }

      const store = new TodoStore();

      // 测试 effect 响应性
      let effectRuns = 0;
      let lastActiveCount = 0;
      effect(() => {
        effectRuns++;
        lastActiveCount = store.activeCount;
        console.log(`Config effect run ${effectRuns}, activeCount: ${lastActiveCount}`);
      });

      expect(effectRuns).toBe(1);
      expect(lastActiveCount).toBe(0);

      // 添加 todo
      console.log('=== Adding todo (config) ===');
      store.addTodo('Learn config pattern');

      expect(store.todos.length).toBe(1);
      expect(store.activeCount).toBe(1);
      expect(effectRuns).toBe(2);
      expect(lastActiveCount).toBe(1);
    });
  });
}); 