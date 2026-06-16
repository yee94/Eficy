# 变更日志

本文档记录了 Eficy 项目的所有重要变更。

## [1.2.4] - 2026-06-16

### 新增
- `@eficy/browser`: 新增 `loadModule(url)` API，支持浏览器端动态加载含 JSX 的子模块文件（fetch → Sucrase 编译 → Blob import）

### 变更
- 更新 Skill 文档（eficy-shadcn）：添加 loadModule 使用说明，版本号同步至 1.2.4
- 更新 LLM 提示词文件（llm_shadcn.txt、llm_asc.txt）：版本号同步至 1.2.4

### 修复
- 修复 Skill 示例文件中版本号不一致问题（basic.html/product-form.html/user-management.html 统一至 1.2.4）

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
