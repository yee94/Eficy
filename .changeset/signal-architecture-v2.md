---
"@eficy/core-jsx": minor
"@eficy/reactive": minor
"eficy": minor
---

feat: implement $ suffix reactive protocol for smart JSX bypass

- **$ 后缀协议**: `prop$={signal}` 明确标识响应式绑定
- **智能旁路**: 静态节点直接透传 React，不包裹 EficyNode
- **bind() 升级**: 返回 `{ value$, onChange }` 而非 `{ value, onChange }`
