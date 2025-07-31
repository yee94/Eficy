# @eficy/reactive-async 测试文档

本目录包含了 `@eficy/reactive-async` 包的完整测试套件，使用 Vitest 作为测试框架。

## 测试文件结构

### 1. `setup.ts`
测试环境设置文件，包含：
- reflect-metadata 导入
- 浏览器 API 模拟（ResizeObserver, requestIdleCallback 等）
- fetch 和窗口事件模拟

### 2. `asyncSignal.test.ts`
核心 asyncSignal 功能测试，包含：
- 基础功能测试（创建、自动执行、错误处理）
- 手动模式测试
- 回调函数测试（onSuccess, onError, onBefore, onFinally）
- 数据修改测试（mutate）
- 刷新和取消功能测试
- 计算属性测试
- 初始数据和格式化结果测试

### 3. `advanced.test.ts`
高级功能测试，包含：
- 轮询功能测试
- 防抖和节流功能测试
- 重试机制测试
- 缓存功能测试
- 窗口焦点刷新测试
- 条件请求测试
- 依赖刷新测试
- 数据保鲜测试

### 4. `utils.test.ts`
工具函数测试，包含：
- debounce 防抖函数测试
- throttle 节流函数测试
- delay 延迟函数测试
- generateId 唯一ID生成测试
- isEqual 深度比较测试
- createCancelToken 取消令牌测试
- makeCancellable Promise 可取消测试

### 5. `cache.test.ts`
缓存管理器测试，包含：
- 基础缓存功能测试
- 缓存过期测试
- 缓存清理测试
- 缓存统计测试
- 缓存键管理测试
- 缓存性能测试

### 6. `integration.test.ts`
集成测试，包含：
- 与 Eficy 框架的集成测试
- Schema 渲染集成测试
- 事件处理集成测试
- 错误处理集成测试
- 数据修改集成测试
- 性能优化集成测试

## 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- --run src/__tests__/asyncSignal.test.ts

# 运行测试并显示覆盖率
npm test -- --coverage
```

## 测试覆盖范围

测试覆盖了以下主要功能：

1. **核心功能**
   - asyncSignal 创建和使用
   - 自动和手动请求模式
   - 错误处理和回调函数
   - 数据修改和刷新

2. **高级特性**
   - 轮询、防抖、节流
   - 重试机制和缓存
   - 条件请求和依赖刷新
   - 数据保鲜和窗口焦点刷新

3. **工具函数**
   - 防抖和节流实现
   - 深度比较和ID生成
   - 取消令牌和可取消Promise

4. **缓存系统**
   - 缓存设置和获取
   - 过期检查和清理
   - 性能优化

5. **框架集成**
   - 与 Eficy 的集成
   - Schema 渲染
   - 事件处理

## 测试最佳实践

1. **使用 vi.useFakeTimers()** 来模拟时间相关的功能
2. **使用 vi.clearAllMocks()** 在每个测试前清理模拟
3. **使用 try-catch** 来处理预期的异步错误
4. **使用 vi.advanceTimersByTime()** 来推进时间
5. **使用 await new Promise(resolve => setTimeout(resolve, 0))** 来等待异步操作

## 注意事项

- 某些测试可能需要根据实际的实现细节进行调整
- 时间相关的测试需要特别注意时间模拟的使用
- 错误处理测试需要正确处理未处理的 Promise 拒绝
- 缓存测试需要确保时间模拟正确工作 