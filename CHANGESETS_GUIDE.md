# Changesets 使用指南

## 什么是 Changesets？

Changesets 是一个专门为 monorepo 设计的版本管理工具，它可以：

- 自动管理版本号
- 生成 changelog
- 支持选择性发布
- 处理依赖关系

## 基本使用

### 1. 创建 Changeset

当你做了更改需要发布时：

```bash
pnpm changeset
```

这会启动一个交互式流程：

1. **选择包**：使用空格键选择需要发布的包
2. **选择版本类型**：
   - `major`：破坏性更改
   - `minor`：新功能
   - `patch`：错误修复
3. **输入描述**：描述这次更改的内容

### 2. 提交 Changeset

```bash
git add .changeset/
git commit -m "feat: add changeset for new features"
git push
```

### 3. 自动发布

当 PR 合并到 master 分支时：
1. GitHub Actions 会自动检测 changesets
2. 创建版本 PR
3. 合并版本 PR 后自动发布到 npm

## 手动发布

### 创建版本 PR

```bash
pnpm version
```

这会：
- 读取所有 changesets
- 更新版本号
- 生成 changelog
- 创建版本 PR

### 发布到 npm

```bash
pnpm release
```

这会：
- 发布所有包到 npm
- 创建 git 标签
- 清理 changesets

## 版本类型说明

### Major (主版本)
- 破坏性更改
- API 不兼容的更改
- 例如：移除功能、重命名 API

### Minor (次版本)
- 新功能
- 向后兼容的更改
- 例如：添加新 API、新功能

### Patch (补丁版本)
- 错误修复
- 性能优化
- 例如：修复 bug、优化性能

## 最佳实践

### 1. 及时创建 Changeset
- 每次功能开发完成后立即创建
- 不要等到发布时才创建

### 2. 清晰的描述
- 使用中文描述更改内容
- 列出具体的更改点
- 说明对用户的影响

### 3. 选择合适的版本类型
- 仔细考虑版本类型
- 遵循语义化版本控制

### 4. 测试发布
- 在发布前测试构建
- 确保所有测试通过

## 示例

### 创建 Changeset

```bash
$ pnpm changeset

🦋  Which packages would you like to include? ...
✔ @eficy/reactive
✔ @eficy/reactive-react
✔ @eficy/core-jsx

🦋  Which type of change is this for @eficy/reactive?
✔ minor - A new feature

🦋  What is the summary for this change?
✔ 添加了新的响应式 API

🦋  What is the summary for this change?
✔ 优化了 React 集成性能

🦋  What is the summary for this change?
✔ 更新了 JSX 运行时实现
```

### 生成的 Changeset 文件

```markdown
---
"@eficy/reactive": minor
"@eficy/reactive-react": minor
"@eficy/core-jsx": minor
---

添加了新的响应式 API

优化了 React 集成性能

更新了 JSX 运行时实现
```

## 故障排除

### 常见问题

1. **Changeset 文件格式错误**
   - 确保 YAML 格式正确
   - 检查包名是否正确

2. **版本冲突**
   - 检查依赖关系
   - 确保版本号合理

3. **发布失败**
   - 检查 NPM_TOKEN 配置
   - 确保包名唯一

## 更多信息

- [Changesets 官方文档](https://github.com/changesets/changesets)
- [语义化版本控制](https://semver.org/)
