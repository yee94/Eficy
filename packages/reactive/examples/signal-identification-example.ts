import { signal, computed } from '../src/core/signal';
import { isSignal } from '../src/utils/helpers';

// 示例：展示新的信号识别功能

console.log('=== 信号识别示例 ===\n');

// 创建信号
const count = signal(0);
const doubled = computed(() => count() * 2);

// 创建普通函数
const regularFunction = () => 42;
const arrowFunction = () => 'hello';
const namedFunction = function() { return 123; };

// 测试信号识别
console.log('信号识别结果:');
console.log('count (信号):', isSignal(count)); // true
console.log('doubled (计算信号):', isSignal(doubled)); // true
console.log('regularFunction (普通函数):', isSignal(regularFunction)); // false
console.log('arrowFunction (箭头函数):', isSignal(arrowFunction)); // false
console.log('namedFunction (命名函数):', isSignal(namedFunction)); // false
console.log('匿名函数:', isSignal(() => {})); // false

console.log('\n=== 对比旧的实现 ===');
console.log('旧实现 (typeof value === "function"):');
console.log('count:', typeof count === 'function'); // true
console.log('regularFunction:', typeof regularFunction === 'function'); // true - 误判！
console.log('arrowFunction:', typeof arrowFunction === 'function'); // true - 误判！

console.log('\n新实现 (带特殊标记):');
console.log('count:', isSignal(count)); // true
console.log('regularFunction:', isSignal(regularFunction)); // false - 正确！
console.log('arrowFunction:', isSignal(arrowFunction)); // false - 正确！

console.log('\n=== 信号功能测试 ===');
console.log('初始值 - count:', count()); // 0
console.log('初始值 - doubled:', doubled()); // 0

count(5);
console.log('更新后 - count:', count()); // 5
console.log('更新后 - doubled:', doubled()); // 10

console.log('\n✅ 新的 isSignal 函数能够准确区分信号和普通函数！'); 