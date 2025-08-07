# CI/CD 配置说明

本项目已配置完整的 CI/CD 发布流程，包括自动化测试、构建和发布。

## 🚀 快速开始

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

- `NPM_TOKEN`: npm 发布令牌
- `CODECOV_TOKEN`: Codecov 令牌（可选）

### 2. 使用 Changesets 发布

```bash
# 创建 changeset
pnpm changeset

# 提交 changeset
git add .changeset/
git commit -m "feat: add changeset for new features"
git push

# 手动发布（可选）
pnpm version
pnpm release
```

## 📋 工作流说明

### CI 工作流 (`.github/workflows/ci.yml`)

- **触发条件**: 推送到 master/develop 分支或 PR
- **功能**: 
  - 依赖安装和缓存
  - 构建所有包
  - 多 Node.js 版本测试 (16, 18, 20)
  - 类型检查（依赖构建产物）
  - 测试覆盖率报告
  - 上传构建产物

### PR 检查工作流 (`.github/workflows/pr-check.yml`)

- **触发条件**: 创建 PR 到 master/develop 分支
- **功能**:
  - 依赖安装和缓存
  - 构建所有包
  - 类型检查（依赖构建产物）
  - 单元测试
  - 安全审计

### 发布工作流 (`.github/workflows/release.yml`)

- **触发条件**: 推送到 master 分支或手动触发
- **功能**:
  - 依赖安装和缓存
  - 构建所有包
  - 类型检查（依赖构建产物）
  - 单元测试
  - 使用 Changesets 管理版本
  - 自动发布到 npm
  - 创建 GitHub Release

### Changesets PR 工作流 (`.github/workflows/changeset-pr.yml`)

- **触发条件**: 创建 PR 到 master 分支
- **功能**:
  - 检查 changesets
  - 自动创建版本 PR

## 🛠️ 脚本说明

### Changesets 命令

```bash
# 创建 changeset
pnpm changeset

# 创建版本 PR
pnpm version

# 发布到 npm
pnpm release
```

### 可用命令

- `changeset` - 创建 changeset
- `version` - 创建版本 PR
- `release` - 发布到 npm

## 📦 包管理

### 支持的包

- `@eficy/core` - 核心包
- `@eficy/reactive` - 响应式状态管理
- `@eficy/reactive-react` - React 集成
- `@eficy/reactive-async` - 异步响应式
- `@eficy/core-jsx` - JSX 运行时
- `@eficy/plugin-unocss` - UnoCSS 插件
- `@eficy/browser` - 浏览器运行时
- `@eficy/eficy` - 主包

### 版本管理

- 使用语义化版本控制 (Semantic Versioning)
- 所有包版本同步更新
- 支持预发布版本 (alpha, beta, rc)

## 🔧 配置说明

### Dependabot 配置 (`.github/dependabot.yml`)

- 每周一自动检查依赖更新
- 支持 npm 和 GitHub Actions 更新
- 自动创建 PR 并分配审核者

### 工作流配置

- 使用 pnpm 作为包管理器
- Node.js 18 作为主要版本
- 支持缓存优化构建速度
- 并行执行测试和构建

## 🚨 故障排除

### 常见问题

1. **发布失败**
   - 检查 NPM_TOKEN 是否正确
   - 确保所有测试通过
   - 检查版本号格式

2. **构建失败**
   - 检查依赖是否正确安装
   - 查看构建日志
   - 确保 TypeScript 类型检查通过

3. **测试失败**
   - 检查测试环境配置
   - 查看测试覆盖率报告
   - 确保所有依赖版本兼容

### 调试命令

```bash
# 本地测试构建
pnpm build

# 本地运行测试
pnpm test

# 检查类型
pnpm -r typecheck

# 检查格式
pnpm prettier --check .
```

## 📚 相关文档

- [发布指南](./RELEASE.md)
- [变更日志](./CHANGELOG.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📞 支持

如有问题，请：
1. 查看 GitHub Issues
2. 创建新的 Issue
3. 联系维护团队
