---
"@eficy/browser": patch
---

新增 `loadModule(url)` API，支持浏览器端动态加载含 JSX 的子模块文件。通过 fetch → Sucrase 编译 → Blob import 实现无需构建步骤的模块懒加载。
