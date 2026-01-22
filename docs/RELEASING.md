# Eficy 发布指南

本文档介绍如何使用 Changesets 和 GitHub Actions 发布 Eficy 包。

## 目录

- [发布流程概览](#发布流程概览)
- [NPM Trusted Publishing 配置](#npm-trusted-publishing-配置)
- [正式版本发布](#正式版本发布)
- [Beta 预发布](#beta-预发布)
- [手动发布](#手动发布)
- [故障排除](#故障排除)

## 发布流程概览

```
添加 changeset → 合并到 master → 自动创建 Version PR → 合并 PR → 自动发布到 npm
```

## NPM Trusted Publishing 配置

从 2025 年起，npm 强制要求使用以下方式之一进行发布：

1. **Trusted Publishing (OIDC)** - 推荐方式
2. **Granular Access Token** (启用 bypass 2FA)

### 配置 Trusted Publishing (推荐)

1. 登录 [npmjs.com](https://www.npmjs.com)
2. 进入包设置页面 → **Trusted Publisher**
3. 添加 GitHub Actions 配置：

   - Organization/User: `yee94`
   - Repository: `Eficy`
   - Workflow filename: `release.yml`

4. 确保 GitHub Actions 有 `id-token: write` 权限（已在 workflow 中配置）

### 使用 Granular Access Token (备选)

如果无法使用 Trusted Publishing：

1. 在 npm 创建 Granular Access Token
2. 勾选 **Bypass 2FA for automation**
3. 设置包访问权限为 Read and Write
4. 添加到 GitHub Secrets: `NPM_TOKEN`

## 正式版本发布

### 1. 创建 Changeset

```bash
pnpm changeset
```

选择：

- 要发布的包
- 版本类型 (patch/minor/major)
- 变更描述

### 2. 提交并推送

```bash
git add .changeset/*.md
git commit -m "chore: add changeset"
git push
```

### 3. 自动化流程

推送到 `master` 后，GitHub Actions 会：

1. 运行测试和类型检查
2. 如有 changeset，创建 "Version Packages" PR
3. 合并 PR 后自动发布到 npm
4. 创建 GitHub Release

## Beta 预发布

### 方式一：推送到预发布分支

```bash
git checkout -b beta
git push -u origin beta
```

支持的分支：`beta`, `alpha`, `next`

### 方式二：手动进入预发布模式

```bash
# 进入 beta 模式
pnpm changeset pre enter beta

# 添加 changeset
pnpm changeset

# 版本更新
pnpm changeset version

# 提交并推送
git add .
git commit -m "chore: version packages (beta)"
git push

# 发布 beta 版本
pnpm changeset publish --tag beta
git push --follow-tags
```

### 方式三：GitHub Actions 手动触发

1. 进入 Actions → Release Beta
2. 点击 "Run workflow"
3. 选择预发布标签 (beta/alpha/next/rc)

### 退出预发布模式

```bash
pnpm changeset pre exit
git add .changeset/pre.json
git commit -m "chore: exit prerelease mode"
git push
```

## 手动发布

### 本地发布正式版

```bash
pnpm build
pnpm changeset version
pnpm changeset publish
git push --follow-tags
```

### 本地发布 Beta

```bash
pnpm build
pnpm changeset pre enter beta
pnpm changeset version
pnpm changeset publish --tag beta
git push --follow-tags
```

## Snapshot 发布

用于测试未正式发布的改动：

```bash
pnpm changeset version --snapshot preview
pnpm changeset publish --tag preview
```

生成版本如：`1.0.1-preview-20260122`

## 故障排除

### npm 发布失败：E404 Not Found

**原因**：Token 过期或权限不足

**解决**：

1. 使用 Trusted Publishing（无需 token）
2. 或更新 NPM_TOKEN 并确保启用 bypass 2FA

### changeset version 无变化

**原因**：没有待发布的 changeset

**解决**：

```bash
pnpm changeset
```

### 预发布版本号异常

**原因**：可能处于预发布模式

**检查**：

```bash
cat .changeset/pre.json
```

**退出预发布**：

```bash
pnpm changeset pre exit
```

### GitHub Actions 权限错误

**原因**：缺少必要权限

**解决**：确保 workflow 包含：

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write
```

## 相关链接

- [Changesets 文档](https://github.com/changesets/changesets)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
