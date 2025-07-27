# Eficy Core V3 Playground 使用指南

## 🚀 快速开始

Eficy Core V3 Playground 提供了多种演示方式来展示新架构的功能。

### 安装依赖

```bash
cd playground
pnpm install
```

### 启动方式

#### 1. 简化演示（推荐）
最简单的方式，只使用原生 HTML 标签：

```bash
npx vite simple-v3.html --port=9899 --open --host
```

访问: http://localhost:9899

#### 2. 完整演示
包含 Ant Design 组件的完整功能演示：

```bash
npx vite index-v3.html --port=9898 --open --host
```

访问: http://localhost:9898

#### 3. 通过 npm scripts

```bash
# 启动 V3 完整演示
npm run dev:v3

# 启动原版演示
npm run dev
```

## 📁 文件说明

### V3 相关文件

- `src/simple-v3.tsx` - 简化的 V3 演示，只使用原生 HTML 标签
- `src/main-v3.tsx` - 完整的 V3 演示，包含 Ant Design 组件
- `index-v3.html` - V3 演示的 HTML 入口
- `simple-v3.html` - 简化演示的 HTML 入口

### 传统文件

- `src/main.tsx` - 原版 Eficy 演示
- `src/main-v2.tsx` - V2 版本演示
- `index.html` - 原版 HTML 入口

## 🎯 V3 核心特性演示

### 1. 现代化架构
- ✅ 基于 `@eficy/reactive` 的响应式系统
- ✅ 使用 `tsyringe` 依赖注入容器
- ✅ 面向对象的设计模式

### 2. 性能优化
- ✅ React.memo 优化的独立节点渲染
- ✅ 细粒度响应式更新
- ✅ 由内向外的构建策略

### 3. 易用性
- ✅ 自动注册常用 HTML 标签
- ✅ 支持任意 React 组件库
- ✅ 向后兼容的 Schema 格式

## 💡 示例代码

### 基础使用

```typescript
import { Eficy } from '@eficy/core'

// 创建实例
const eficy = new Eficy()

// 配置组件库（可选）
eficy.config({
  componentMap: {
    Button: MyButton,
    Input: MyInput
  }
})

// 创建 Schema
const schema = {
  views: [
    {
      '#': 'greeting',
      '#view': 'h1',
      '#content': 'Hello Eficy V3!',
      style: { color: 'blue' }
    }
  ]
}

// 渲染
const element = eficy.createElement(schema)
```

### 条件渲染

```typescript
const schema = {
  views: [
    {
      '#': 'time-greeting',
      '#view': 'div',
      '#if': () => new Date().getHours() < 12,
      '#content': '早上好！'
    }
  ]
}
```

### 扩展配置

```typescript
// 基础配置
eficy.config({ componentMap: baseComponents })

// 扩展配置（递归合并）
eficy.extend({ componentMap: extraComponents })
```

## 🔧 开发调试

### 控制台查看

在浏览器控制台中，你可以访问：
- `window.eficy` - Eficy 实例（如果有的话）
- React DevTools - 查看组件树结构

### 热重载

Vite 开发服务器支持热重载，修改代码后会自动刷新。

## 🆚 版本对比

| 功能 | V1/V2 | V3 |
|------|-------|-----|
| 响应式系统 | MobX | @eficy/reactive |
| 依赖注入 | 无 | tsyringe |
| 数据模型 | @vmojs/base | 纯手工构建 |
| 性能优化 | 有限 | React.memo + 细粒度响应式 |
| 组件库依赖 | 强依赖 antd | 支持任意组件库 |

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **端口被占用**
   ```bash
   # 更换端口
   npx vite --port=9900
   ```

3. **模块找不到**
   ```bash
   # 确保在正确的工作区目录
   cd playground
   pnpm install
   ```

### 获取帮助

如果遇到问题，请查看：
- 浏览器控制台错误信息
- 终端错误日志
- [项目文档](../packages/core/README.md)

---

享受 Eficy Core V3 带来的现代化开发体验！ 🎉 