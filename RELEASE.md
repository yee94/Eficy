# 发布指南

本文档描述了如何使用 Changesets 发布 Eficy 项目的各个包。

## 发布流程

### 1. 使用 Changesets（推荐）

Changesets 是一个专门为 monorepo 设计的版本管理工具，可以更好地管理版本和发布。

#### 创建 Changeset

当你做了更改需要发布时：

```bash
# 创建 changeset
pnpm changeset
```

这会启动一个交互式流程：
1. 选择需要发布的包
2. 选择版本类型（major/minor/patch）
3. 输入更改描述

#### 发布流程

1. **创建 Changeset**：
   ```bash
   pnpm changeset
   ```

2. **提交 Changeset**：
   ```bash
   git add .changeset/
   git commit -m "feat: add changeset for new features"
   git push
   ```

3. **自动发布**：
   - 当 PR 合并到 master 分支时
   - GitHub Actions 会自动创建版本 PR
   - 合并版本 PR 后会自动发布到 npm

#### 手动发布

如果需要手动发布：

```bash
# 创建版本 PR
pnpm version

# 发布到 npm
pnpm release
```

### 2. 手动发布

如果需要手动发布：

```bash
# 查看当前版本
pnpm release:status

# 更新版本
pnpm version

# 发布所有包
pnpm release
```

## 版本管理

### 版本号格式

使用语义化版本控制 (Semantic Versioning)：

- `MAJOR.MINOR.PATCH`
- 例如：`2.1.0`

### 版本更新策略

- **MAJOR**: 不兼容的 API 更改
- **MINOR**: 向后兼容的功能添加
- **PATCH**: 向后兼容的错误修复

## 包列表

以下包会被自动发布：

- `@eficy/core` - 核心包
- `@eficy/reactive` - 响应式状态管理
- `@eficy/reactive-react` - React 集成
- `@eficy/reactive-async` - 异步响应式
- `@eficy/core-jsx` - JSX 运行时
- `@eficy/plugin-unocss` - UnoCSS 插件
- `@eficy/browser` - 浏览器运行时
- `@eficy/eficy` - 主包

## 配置要求

### GitHub Secrets

需要在 GitHub 仓库中配置以下 secrets：

- `NPM_TOKEN`: npm 发布令牌
- `CODECOV_TOKEN`: Codecov 令牌（可选）

### npm 配置

确保已登录 npm：

```bash
npm login
```

## 故障排除

### 发布失败

1. 检查 npm 令牌是否正确
2. 确保所有测试通过
3. 检查版本号格式
4. 查看 GitHub Actions 日志

### 版本冲突

如果遇到版本冲突：

```bash
# 检查当前版本
npm run release:status

# 手动更新特定包
cd packages/[package-name]
npm version [new-version]
```

## 最佳实践

1. **测试**: 发布前确保所有测试通过
2. **文档**: 更新 CHANGELOG.md
3. **标签**: 使用语义化版本标签
4. **审查**: 发布前审查所有更改
5. **回滚**: 准备回滚计划

## 联系信息

如有问题，请创建 GitHub Issue 或联系维护团队。
