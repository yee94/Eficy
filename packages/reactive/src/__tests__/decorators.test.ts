import { describe, it, expect, vi } from 'vitest';
import { Observable, Computed, Action, makeObservable, ObservableClass } from '../index';
import { effect } from '../core/signal';

describe('Decorators', () => {
  describe('@Observable', () => {
    it('should make class properties reactive', () => {
      class User {
        @Observable
        name = 'John';

        @Observable
        age = 25;
      }

      const user = new User();
      makeObservable(user);

      let effectCount = 0;
      let lastValues: any = {};

      effect(() => {
        effectCount++;
        lastValues = { name: user.name, age: user.age };
      });

      expect(effectCount).toBe(1);
      expect(lastValues).toEqual({ name: 'John', age: 25 });

      // 修改属性应该触发 effect
      user.name = 'Jane';
      expect(effectCount).toBe(2);
      expect(lastValues).toEqual({ name: 'Jane', age: 25 });

      user.age = 30;
      expect(effectCount).toBe(3);
      expect(lastValues).toEqual({ name: 'Jane', age: 30 });
    });

    it('should support initial values', () => {
      class Store {
        @Observable('default value')
        message!: string;

        @Observable(0)
        count!: number;
      }

      const store = new Store();
      makeObservable(store);

      expect(store.message).toBe('default value');
      expect(store.count).toBe(0);
    });

    it('should work with ObservableClass base class', () => {
      class Counter extends ObservableClass {
        @Observable
        count = 0;

        @Observable
        name = 'Counter';
      }

      const counter = new Counter();

      let renderCount = 0;
      let lastState: any = {};

      effect(() => {
        renderCount++;
        lastState = { count: counter.count, name: counter.name };
      });

      expect(renderCount).toBe(1);
      expect(lastState).toEqual({ count: 0, name: 'Counter' });

      counter.count = 5;
      expect(renderCount).toBe(2);
      expect(lastState).toEqual({ count: 5, name: 'Counter' });
    });
  });

  describe('@Computed', () => {
    it('should create computed properties', () => {
      class Person {
        @Observable
        firstName = 'John';

        @Observable
        lastName = 'Doe';

        @Computed
        get fullName(): string {
          return `${this.firstName} ${this.lastName}`;
        }
      }

      const person = new Person();
      makeObservable(person);

      expect(person.fullName).toBe('John Doe');

      // 修改依赖应该更新计算值
      person.firstName = 'Jane';
      expect(person.fullName).toBe('Jane Doe');

      person.lastName = 'Smith';
      expect(person.fullName).toBe('Jane Smith');
    });

    it('should cache computed values', () => {
      let computeCount = 0;

      class Calculator {
        @Observable
        a = 1;

        @Observable
        b = 2;

        @Computed
        get sum(): number {
          computeCount++;
          return this.a + this.b;
        }
      }

      const calc = new Calculator();
      makeObservable(calc);

      // 第一次访问
      expect(calc.sum).toBe(3);
      expect(computeCount).toBe(1);

      // 重复访问不应该重新计算
      expect(calc.sum).toBe(3);
      expect(computeCount).toBe(1);

      // 修改依赖后重新计算
      calc.a = 10;
      expect(calc.sum).toBe(12);
      expect(computeCount).toBe(2);
    });

    it('should work with complex computed chains', () => {
      class Store {
        @Observable
        items = ['apple', 'banana'];

        @Observable
        filter = '';

        @Computed
        get filteredItems(): string[] {
          return this.items.filter((item) => item.toLowerCase().includes(this.filter.toLowerCase()));
        }

        @Computed
        get itemCount(): number {
          return this.filteredItems.length;
        }

        @Computed
        get summary(): string {
          return `Found ${this.itemCount} items`;
        }
      }

      const store = new Store();
      makeObservable(store);

      expect(store.filteredItems).toEqual(['apple', 'banana']);
      expect(store.itemCount).toBe(2);
      expect(store.summary).toBe('Found 2 items');

      store.filter = 'app';
      expect(store.filteredItems).toEqual(['apple']);
      expect(store.itemCount).toBe(1);
      expect(store.summary).toBe('Found 1 items');
    });
  });

  describe('@Action', () => {
    it('should mark methods as actions', () => {
      class Counter {
        @Observable
        count = 0;

        @Action
        increment() {
          this.count++;
        }

        @Action
        add(value: number) {
          this.count += value;
        }

        @Action('reset counter')
        reset() {
          this.count = 0;
        }
      }

      const counter = new Counter();
      makeObservable(counter);

      let effectCount = 0;
      effect(() => {
        effectCount++;
        counter.count; // 读取以建立依赖
      });

      expect(effectCount).toBe(1);

      counter.increment();
      expect(counter.count).toBe(1);
      expect(effectCount).toBe(2);

      counter.add(5);
      expect(counter.count).toBe(6);
      expect(effectCount).toBe(3);

      counter.reset();
      expect(counter.count).toBe(0);
      expect(effectCount).toBe(4);
    });

    it('should batch multiple updates in actions', () => {
      class UserStore {
        @Observable
        firstName = '';

        @Observable
        lastName = '';

        @Observable
        age = 0;

        @Action
        updateUser(first: string, last: string, userAge: number) {
          this.firstName = first;
          this.lastName = last;
          this.age = userAge;
        }
      }

      const store = new UserStore();
      makeObservable(store);

      let effectCount = 0;
      effect(() => {
        effectCount++;
        // 读取所有属性以建立依赖
        store.firstName;
        store.lastName;
        store.age;
      });

      expect(effectCount).toBe(1);

      // action 中的多个更新应该被批处理
      store.updateUser('John', 'Doe', 25);

      expect(store.firstName).toBe('John');
      expect(store.lastName).toBe('Doe');
      expect(store.age).toBe(25);

      // 应该只触发一次 effect（批处理）
      expect(effectCount).toBe(2);
    });
  });

  describe('Real-world examples', () => {
    it('should work with a complete User class example', () => {
      class User extends ObservableClass {
        @Observable
        name = '';

        @Observable
        email = '';

        @Observable
        age = 0;

        @Computed
        get isAdult(): boolean {
          return this.age >= 18;
        }

        @Computed
        get displayName(): string {
          return this.name || this.email.split('@')[0] || 'Anonymous';
        }

        @Action
        updateProfile(name: string, email: string, age: number) {
          this.name = name;
          this.email = email;
          this.age = age;
        }

        @Action('clear user data')
        clear() {
          this.name = '';
          this.email = '';
          this.age = 0;
        }
      }

      const user = new User();

      // 测试初始状态
      expect(user.name).toBe('');
      expect(user.isAdult).toBe(false);
      expect(user.displayName).toBe('Anonymous');

      // 测试更新
      user.updateProfile('John Doe', 'john@example.com', 25);

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(25);
      expect(user.isAdult).toBe(true);
      expect(user.displayName).toBe('John Doe');

      // 测试清除
      user.clear();

      expect(user.name).toBe('');
      expect(user.email).toBe('');
      expect(user.age).toBe(0);
      expect(user.isAdult).toBe(false);
      expect(user.displayName).toBe('Anonymous');
    });

    it('should work with a TodoStore example', () => {
      interface Todo {
        id: number;
        text: string;
        completed: boolean;
      }

      class TodoStore extends ObservableClass {
        @Observable
        todos: Todo[] = [];

        @Observable
        filter: 'all' | 'active' | 'completed' = 'all';

        @Computed
        get filteredTodos(): Todo[] {
          switch (this.filter) {
            case 'active':
              return this.todos.filter((todo) => !todo.completed);
            case 'completed':
              return this.todos.filter((todo) => todo.completed);
            default:
              return this.todos;
          }
        }

        @Computed
        get activeCount(): number {
          return this.todos.filter((todo) => !todo.completed).length;
        }

        @Computed
        get completedCount(): number {
          return this.todos.filter((todo) => todo.completed).length;
        }

        @Action
        addTodo(text: string) {
          // 新范式：重新赋值整个数组以触发更新
          this.todos = [
            ...this.todos,
            {
              id: Date.now() + Math.random(), // 确保唯一性
              text,
              completed: false,
            },
          ];
        }

        @Action
        toggleTodo(id: number) {
          // 新范式：重新赋值整个数组
          this.todos = this.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
        }

        @Action
        setFilter(filter: 'all' | 'active' | 'completed') {
          this.filter = filter;
        }

        @Action
        clearCompleted() {
          // 新范式：重新赋值整个数组
          this.todos = this.todos.filter((todo) => !todo.completed);
        }
      }

      const store = new TodoStore();

      // 测试初始状态
      expect(store.activeCount).toBe(0);
      expect(store.completedCount).toBe(0);

      // 添加 todos
      store.addTodo('Learn TypeScript');
      store.addTodo('Build awesome app');

      expect(store.todos.length).toBe(2);
      expect(store.activeCount).toBe(2);
      expect(store.completedCount).toBe(0);

      // 完成第一个 todo
      const firstTodoId = store.todos[0].id;
      store.toggleTodo(firstTodoId);

      expect(store.activeCount).toBe(1);
      expect(store.completedCount).toBe(1);

      // 测试筛选
      store.setFilter('completed');
      expect(store.filteredTodos.length).toBe(1);
      expect(store.filteredTodos[0].completed).toBe(true);

      store.setFilter('active');
      expect(store.filteredTodos.length).toBe(1);
      expect(store.filteredTodos[0].completed).toBe(false);

      // 清除已完成的
      store.clearCompleted();
      expect(store.todos.length).toBe(1);
      expect(store.activeCount).toBe(1);
      expect(store.completedCount).toBe(0);
    });
  });

  describe('Integration with effects', () => {
    it('should properly track dependencies across decorators', () => {
      class ReactiveStore extends ObservableClass {
        @Observable
        input = '';

        @Observable
        multiplier = 1;

        @Computed
        get processedInput(): string {
          return this.input.toUpperCase();
        }

        @Computed
        get finalResult(): string {
          return this.processedInput.repeat(this.multiplier);
        }

        @Action
        updateInput(value: string) {
          this.input = value;
        }

        @Action
        setMultiplier(value: number) {
          this.multiplier = value;
        }
      }

      const store = new ReactiveStore();

      let effectCallCount = 0;
      let lastResult = '';

      effect(() => {
        effectCallCount++;
        lastResult = store.finalResult;
      });

      expect(effectCallCount).toBe(1);
      expect(lastResult).toBe('');

      store.updateInput('hello');
      expect(effectCallCount).toBe(2);
      expect(lastResult).toBe('HELLO');

      store.setMultiplier(3);
      expect(effectCallCount).toBe(3);
      expect(lastResult).toBe('HELLOHELLOHELLO');

      // 连续的 action 调用
      store.updateInput('world');
      expect(effectCallCount).toBe(4);
      expect(lastResult).toBe('WORLDWORLDWORLD');
    });
  });
});
