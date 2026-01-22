# eficy

## 1.2.0-beta.0

### Minor Changes

- feat: implement $ suffix reactive protocol for smart JSX bypass

  - **$ 后缀协议**: `prop$={signal}` 明确标识响应式绑定
  - **智能旁路**: 静态节点直接透传 React，不包裹 EficyNode
  - **bind() 升级**: 返回 `{ value$, onChange }` 而非 `{ value, onChange }`

### Patch Changes

- Updated dependencies
  - @eficy/core-jsx@1.1.0-beta.0
  - @eficy/reactive@1.2.0-beta.0
  - @eficy/plugin-unocss@1.1.2-beta.0
  - @eficy/reactive-async@1.1.1-beta.0
  - @eficy/reactive-react@1.1.2-beta.0

## 1.1.0

### Minor Changes

- 39ada8a: 🎉 Eficy jsx is now available! Eficy is a no-compilation JSX rendering engine for React components. As LLMs become increasingly capable at generating HTML web pages, Eficy bridges the gap by providing a way to render React components without compilation barriers. Originally built as a low-code rendering engine, Eficy now fully supports JSX rendering in non-compilation environments, enabling LLMs to generate precise, concise pages with just one sentence.

### Patch Changes

- Updated dependencies [39ada8a]
  - @eficy/core-jsx@1.0.0
  - @eficy/plugin-unocss@1.1.0
  - @eficy/reactive@1.1.0
  - @eficy/reactive-async@1.1.0
  - @eficy/reactive-react@1.1.0

## 1.0.1

### Patch Changes

- b74eab7: feature: @eficy/core-jsx is now available! 🎉
- Updated dependencies [155c510]
- Updated dependencies [b74eab7]
  - @eficy/reactive@1.0.1
  - @eficy/reactive-react@1.0.1
  - @eficy/core-jsx@0.1.1
  - @eficy/reactive-async@1.0.1
  - @eficy/plugin-unocss@1.0.1
