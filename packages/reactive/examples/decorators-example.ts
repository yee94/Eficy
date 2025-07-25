/**
 * @eficy/reactive 装饰器使用示例
 * 
 * 安装依赖：
 * npm install @eficy/reactive reflect-metadata
 * 
 * TypeScript 配置：
 * {
 *   "compilerOptions": {
 *     "experimentalDecorators": true,
 *     "emitDecoratorMetadata": true
 *   }
 * }
 */

import 'reflect-metadata';
import { 
  observable, 
  computed, 
  action, 
  makeObservable, 
  ObservableClass,
  effect 
} from '@eficy/reactive/annotation';

// ==================== 示例 1: 用户管理 ====================

class UserStore {
  @observable
  firstName = '';

  @observable
  lastName = '';

  @observable
  age = 0;

  @observable
  isLoggedIn = false;

  @computed
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  @computed
  get isAdult(): boolean {
    return this.age >= 18;
  }

  @computed
  get displayStatus(): string {
    if (!this.isLoggedIn) return 'Not logged in';
    return `${this.fullName} (${this.isAdult ? 'Adult' : 'Minor'})`;
  }

  @action
  login(firstName: string, lastName: string, age: number) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.isLoggedIn = true;
  }

  @action('logout user')
  logout() {
    this.firstName = '';
    this.lastName = '';
    this.age = 0;
    this.isLoggedIn = false;
  }

  @action
  updateProfile(updates: { firstName?: string; lastName?: string; age?: number }) {
    if (updates.firstName !== undefined) this.firstName = updates.firstName;
    if (updates.lastName !== undefined) this.lastName = updates.lastName;
    if (updates.age !== undefined) this.age = updates.age;
  }

  constructor() {
    makeObservable(this);
  }
}

// ==================== 示例 2: 购物车管理 (使用 ObservableClass) ====================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

class ShoppingCart extends ObservableClass {
  @observable
  items: CartItem[] = [];

  @observable
  discountPercent = 0;

  @computed
  get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  @computed
  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  @computed
  get discountAmount(): number {
    return this.subtotal * (this.discountPercent / 100);
  }

  @computed
  get total(): number {
    return this.subtotal - this.discountAmount;
  }

  @computed
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  @action
  addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const existingItem = this.items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items = [...this.items, { ...item, quantity }];
    }
  }

  @action
  removeItem(id: string) {
    this.items = this.items.filter(item => item.id !== id);
  }

  @action
  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    
    this.items = this.items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
  }

  @action
  applyDiscount(percent: number) {
    this.discountPercent = Math.max(0, Math.min(100, percent));
  }

  @action
  clear() {
    this.items = [];
    this.discountPercent = 0;
  }
}

// ==================== 示例 3: 复杂状态管理 ====================

class AppStore extends ObservableClass {
  @observable
  currentUser: UserStore | null = null;

  @observable
  cart = new ShoppingCart();

  @observable
  isLoading = false;

  @observable
  errorMessage = '';

  @computed
  get isUserLoggedIn(): boolean {
    return this.currentUser?.isLoggedIn ?? false;
  }

  @computed
  get cartSummary(): string {
    if (this.cart.isEmpty) return 'Cart is empty';
    return `${this.cart.totalItems} items, $${this.cart.total.toFixed(2)}`;
  }

  @computed
  get appStatus(): string {
    if (this.isLoading) return 'Loading...';
    if (this.errorMessage) return `Error: ${this.errorMessage}`;
    if (!this.isUserLoggedIn) return 'Please log in';
    return `Welcome ${this.currentUser!.fullName}! ${this.cartSummary}`;
  }

  @action
  setCurrentUser(user: UserStore) {
    this.currentUser = user;
  }

  @action
  setLoading(loading: boolean) {
    this.isLoading = loading;
    if (loading) {
      this.errorMessage = '';
    }
  }

  @action
  setError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
  }

  @action
  clearError() {
    this.errorMessage = '';
  }

  @action
  logout() {
    this.currentUser?.logout();
    this.currentUser = null;
    this.cart.clear();
  }
}

// ==================== 使用示例 ====================

function runExample() {
  console.log('🚀 @eficy/reactive 装饰器示例\n');

  // 创建实例
  const userStore = new UserStore();
  const appStore = new AppStore();

  // 设置响应式效果
  effect(() => {
    console.log('用户状态:', userStore.displayStatus);
  });

  effect(() => {
    console.log('购物车状态:', appStore.cartSummary);
  });

  effect(() => {
    console.log('应用状态:', appStore.appStatus);
  });

  console.log('\n--- 用户登录 ---');
  userStore.login('张', '三', 25);
  appStore.setCurrentUser(userStore);

  console.log('\n--- 添加商品到购物车 ---');
  appStore.cart.addItem({ id: '1', name: 'iPhone 15', price: 999 }, 1);
  appStore.cart.addItem({ id: '2', name: 'MacBook Pro', price: 2499 }, 1);

  console.log('\n--- 应用折扣 ---');
  appStore.cart.applyDiscount(10);

  console.log('\n--- 更新用户信息 ---');
  userStore.updateProfile({ firstName: '李', age: 30 });

  console.log('\n--- 模拟错误 ---');
  appStore.setError('网络连接失败');

  setTimeout(() => {
    console.log('\n--- 清除错误并设置加载状态 ---');
    appStore.clearError();
    appStore.setLoading(true);

    setTimeout(() => {
      console.log('\n--- 加载完成 ---');
      appStore.setLoading(false);
    }, 1000);
  }, 1000);
}

// 运行示例（如果直接执行此文件）
if (require.main === module) {
  runExample();
}

export { UserStore, ShoppingCart, AppStore, runExample }; 