# 变更日志

本文档记录了 Eficy 项目的所有重要变更。

## [未发布]

### 新增
- 配置了完整的 CI/CD 发布流程
- 添加了 GitHub Actions 工作流
- 创建了自动化发布脚本
- 配置了 Dependabot 自动依赖更新

### 变更
- 优化了项目结构和构建流程

### 修复
- 修复了各种已知问题

## [2.0.0] - 2024-01-01

### 新增
- 初始版本发布
- 核心响应式系统
- React 集成支持
- JSX 运行时支持

### 变更
- 项目架构设计

### 修复
- 初始版本问题修复

---

## 版本说明

- **MAJOR**: 不兼容的 API 更改
- **MINOR**: 向后兼容的功能添加  
- **PATCH**: 向后兼容的错误修复

## 发布流程

1. 更新版本号
2. 更新 CHANGELOG.md
3. 提交更改
4. 创建标签
5. 推送标签触发自动发布

## 包列表

- `@eficy/core` - 核心包
- `@eficy/reactive` - 响应式状态管理
- `@eficy/reactive-react` - React 集成
- `@eficy/reactive-async` - 异步响应式
- `@eficy/core-jsx` - JSX 运行时
- `@eficy/plugin-unocss` - UnoCSS 插件
- `@eficy/browser` - 浏览器运行时
- `@eficy/eficy` - 主包
