# 🎯 reactive-v2 缺失功能清单与实现计划

## 📋 **功能差异总结**

相比于 reactive v1，v2 在以下方面还有差距：

### 🔴 **高优先级缺失功能**

#### 1. **工具函数集** (关键度: ⭐⭐⭐⭐⭐)
```typescript
// 需要实现的核心工具
export function raw<T>(target: T): T           // 获取原始对象
export function toJS<T>(values: T): T          // 转换为普通 JS
export function markRaw<T>(target: T): T       // 标记非响应式
export function hasCollected(fn?: () => void): boolean  // 依赖收集检测
```

**用途**: 
- `raw()` - 获取响应式对象的原始版本
- `toJS()` - 深度转换响应式对象为普通对象  
- `markRaw()` - 标记对象为非响应式，优化性能
- `hasCollected()` - 检测函数是否触发了依赖收集

#### 2. **observe 系统** (关键度: ⭐⭐⭐⭐)
```typescript
export function observe(
  target: object, 
  callback: (change: DataChange) => void,
  deep?: boolean
): Dispose
```

**用途**: 精细化监听对象变化，支持深度/浅层监听

#### 3. **完整的集合支持** (关键度: ⭐⭐⭐⭐)
```typescript
export function observableMap<K, V>(initialEntries?: [K, V][]): Map<K, V>
export function observableSet<T>(initialValues?: T[]): Set<T>
export function observableWeakMap<K, V>(): WeakMap<K, V>
export function observableWeakSet<T>(): WeakSet<T>
```

**用途**: 支持 ES6 集合的完整响应式

### 🟡 **中优先级缺失功能**

#### 4. **Tracker 类** (关键度: ⭐⭐⭐)
```typescript
export class Tracker {
  constructor(scheduler?: (reaction: Reaction) => void, name?: string)
  track<T>(fn: () => T): T
  dispose(): void
}
```

**用途**: 手动控制依赖收集和调度

#### 5. **autorun 增强** (关键度: ⭐⭐⭐)
```typescript
autorun.memo<T>(callback: () => T, dependencies?: any[]): T
autorun.effect(callback: () => void | Dispose, dependencies?: any[])
```

**用途**: 在 effect 内部进行记忆化和副作用管理

#### 6. **模型系统** (关键度: ⭐⭐⭐)
```typescript
export function define<T>(target: T, annotations?: Annotations<T>): T
export function model<T>(target: T): T  // 自动推断注解
```

**用途**: 更高级的模型定义和自动注解推断

### 🟢 **低优先级缺失功能**

#### 7. **高级注解** (关键度: ⭐⭐)
```typescript
observable.box      // 盒装响应式
observable.shallow  // 浅层响应式
observable.deep     // 深度响应式（默认）
```

#### 8. **contains 函数** (关键度: ⭐)
```typescript
export function contains(target: any, property: any): boolean
```

**用途**: 检查依赖包含关系

## 🚀 **实现路线图**

### **Phase 1: 核心工具函数** (预计 2-3 小时)
1. ✅ 实现 `raw()` 函数
2. ✅ 实现 `toJS()` 函数  
3. ✅ 实现 `markRaw()` 函数
4. ✅ 实现 `hasCollected()` 函数

### **Phase 2: 集合支持** (预计 3-4 小时)
1. ✅ 实现 `observableMap`
2. ✅ 实现 `observableSet`
3. ✅ 实现 `observableWeakMap`
4. ✅ 实现 `observableWeakSet`

### **Phase 3: observe 系统** (预计 2-3 小时)
1. ✅ 实现基础 `observe` 函数
2. ✅ 支持深度监听
3. ✅ 实现变化事件系统

### **Phase 4: 高级特性** (预计 4-5 小时)
1. ✅ 实现 `Tracker` 类
2. ✅ 增强 `autorun` 功能
3. ✅ 实现 `model` 系统

## 📊 **影响评估**

### **不实现的影响**:
- ❌ 缺少与 v1 的完全兼容性
- ❌ 某些高级用例无法支持
- ❌ 缺少细粒度的性能优化工具

### **实现后的收益**:
- ✅ 与 v1 API 完全兼容
- ✅ 支持更复杂的响应式场景
- ✅ 更好的性能调优能力
- ✅ 更完整的生态系统

## 🎯 **推荐策略**

### **立即实现** (关键核心)
```typescript
// 这 4 个函数是最核心的，建议立即实现
export function raw<T>(target: T): T
export function toJS<T>(values: T): T  
export function markRaw<T>(target: T): T
export function hasCollected(fn?: () => void): boolean
```

### **短期实现** (1-2 周内)
- `observe` 系统
- ES6 集合支持 (`Map`, `Set`, `WeakMap`, `WeakSet`)

### **中期实现** (1 个月内)  
- `Tracker` 类
- `autorun` 增强功能
- `model` 系统

### **长期实现** (按需)
- 高级注解系统
- `contains` 等辅助函数

## 💡 **实现建议**

1. **保持 API 兼容性**: 尽量与 v1 保持一致的 API
2. **基于 preact/signals-core**: 利用现有的优势
3. **渐进式实现**: 先实现核心功能，再扩展高级特性
4. **完整测试**: 每个功能都要有对应的测试用例
5. **性能优化**: 利用 v2 的批处理优势

## 🔄 **迁移路径**

对于 v1 用户，提供清晰的迁移指南：
- 核心 API 映射关系
- 功能差异说明  
- 迁移工具脚本
- 兼容性检查清单 