# @eficy/plugin-unocss

UnoCSS plugin for @eficy/core-jsx - Automatically extracts and generates CSS styles from className attributes in Eficy components.

## 📖 概述

`@eficy/plugin-unocss` 是为 Eficy 框架 v3 设计的 UnoCSS 集成插件。它通过拦截组件渲染过程，自动提取 `className` 中的样式类，并使用 UnoCSS 生成对应的 CSS 样式，最终注入到页面中。该插件支持实时样式生成、缓存优化和自定义配置。

## ✨ 核心特性

### 🔍 自动样式提取

- **智能识别**: 自动从组件 props 中提取 `className` 属性
- **深度扫描**: 支持字符串、数组等多种 className 格式
- **实时收集**: 在组件渲染过程中实时收集样式类
- **去重处理**: 自动去除重复的样式类

### ⚡ 性能优化

- **智能缓存**: 基于样式类哈希的缓存机制，避免重复生成
- **按需生成**: 只生成实际使用的样式
- **异步处理**: 使用 `@eficy/reactive-async` 进行异步样式生成
- **防抖优化**: 1ms 防抖处理，避免频繁更新

### 🎨 UnoCSS 集成

- **完整支持**: 支持 UnoCSS 的所有特性和语法
- **预设集成**: 内置 Uno 和 Attributify 预设
- **自定义配置**: 支持完全自定义的 UnoCSS 配置
- **错误处理**: 优雅处理 CSS 生成失败的情况

### 🔌 插件化架构

- **生命周期钩子**: 集成到 Eficy 的插件生命周期系统
- **优先级控制**: 支持插件执行优先级设置
- **依赖注入**: 基于 tsyringe 的依赖注入支持
- **热插拔**: 支持插件的动态安装和卸载

## 📦 安装

```bash
npm install @eficy/plugin-unocss @unocss/core @unocss/preset-uno @unocss/preset-attributify
# 或
yarn add @eficy/plugin-unocss @unocss/core @unocss/preset-uno @unocss/preset-attributify
# 或
pnpm add @eficy/plugin-unocss @unocss/core @unocss/preset-uno @unocss/preset-attributify
```

## 🚀 快速开始

### 基础使用

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Eficy, EficyProvider } from '@eficy/core-jsx';
import { UnocssPlugin } from '@eficy/plugin-unocss';
import { signal } from '@eficy/reactive';

// 创建 Eficy 实例
const core = new Eficy();

// 安装 UnoCSS 插件
await core.install(UnocssPlugin);

// 应用组件
const App = () => {
  const count = signal(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Eficy + UnoCSS</h1>
        <p className="text-lg text-gray-600 mb-6">
          Count: <span className="font-semibold text-blue-600">{count}</span>
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors"
          onClick={() => (count.value += 1)}
        >
          Increment
        </button>
      </div>
    </div>
  );
};

// 渲染应用
const root = createRoot(document.getElementById('root'));
root.render(
  <EficyProvider core={core}>
    <App />
  </EficyProvider>,
);
```

### 自定义配置

```tsx
import { UnocssPlugin } from '@eficy/plugin-unocss';
import { presetWind } from '@unocss/preset-wind';

// 使用自定义 UnoCSS 配置
await core.install(UnocssPlugin, {
  config: {
    presets: [
      presetWind(), // 使用 Tailwind CSS 兼容预设
    ],
    rules: [
      // 自定义规则
      [
        'btn-custom',
        {
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '500',
          transition: 'all 0.2s ease-in-out',
        },
      ],
    ],
    shortcuts: [
      // 自定义快捷方式
      ['btn-primary', 'btn-custom bg-blue-500 text-white hover:bg-blue-600'],
      ['btn-secondary', 'btn-custom bg-gray-200 text-gray-800 hover:bg-gray-300'],
    ],
    theme: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
});
```

## 🛠️ API 文档

### UnocssPlugin 类

主要的插件类，实现了 `ILifecyclePlugin` 接口。

```typescript
@injectable()
export class UnocssPlugin implements ILifecyclePlugin {
  public readonly name = 'unocss-plugin';
  public readonly version = '1.0.0';
  public readonly enforce = 'pre';

  // 插件配置
  async initialize(config?: UnocssPluginConfig): Promise<void>;

  // 渲染钩子
  onRender(context: IRenderContext, next: () => ComponentType<any>): ComponentType<any>;

  // 根组件挂载钩子
  onRootMount(context: IRenderContext, next: () => ComponentType<any>): ComponentType<any>;

  // 获取 UnoCSS 生成器实例
  getGenerator(): UnoGenerator | null;

  // 获取收集到的样式类
  getCollectedClasses(): Set<string>;

  // 清理资源
  destroy(): void;
}
```

### UnocssPluginConfig 接口

```typescript
interface UnocssPluginConfig {
  config?: UserConfig; // UnoCSS 自定义配置
}
```

### 配置选项

UnoCSS 配置支持所有官方配置选项：

```typescript
{
  config: {
    // 预设
    presets: [
      presetUno(),
      presetAttributify(),
      presetWind(),
      // ... 其他预设
    ],

    // 自定义规则
    rules: [
      ['btn', { padding: '0.5rem 1rem' }],
      [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}px` })],
    ],

    // 快捷方式
    shortcuts: [
      ['btn', 'px-4 py-2 rounded'],
      ['btn-primary', 'btn bg-blue-500 text-white'],
    ],

    // 主题
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },

    // 变体
    variants: [
      // 自定义变体
    ],

    // 预检样式
    preflights: [
      // 自定义预检样式
    ],
  }
}
```

## 🔧 工作原理

### 1. 初始化阶段

```typescript
@Initialize()
async initialize(config: UnocssPluginConfig = {}) {
  // 创建 UnoCSS 生成器
  const generator = await createGenerator({
    presets: [
      presetUno({ preflight: false }),
      presetAttributify(),
    ],
    ...config.config,
  });

  // 初始化异步信号
  this.reactiveAsync = asyncSignal(
    () => this.generateCSS(),
    { manual: true, debounceWait: 1 }
  );
}
```

### 2. 样式收集阶段

```typescript
@Render(5) // 优先级为 5，确保早期执行
onRender(context: IRenderContext, next: () => ComponentType<any>) {
  // 收集 className 中的样式类
  if (context.props.className) {
    this.collectClassNames(context.props.className);
  }

  return next();
}
```

### 3. CSS 生成阶段

```typescript
private async generateCSS(): Promise<string | null> {
  const classArray = Array.from(this.collectedClasses).sort();
  const currentClassHash = classArray.join('|');

  // 检查缓存
  if (this.cssCache.has(currentClassHash)) {
    return this.cssCache.get(currentClassHash);
  }

  // 生成新的 CSS
  const result = await this.generator.generate(classArray.join(' '));
  const css = result.css;

  // 更新缓存
  if (css) {
    this.cssCache.set(currentClassHash, css);
  }

  return css;
}
```

### 4. 样式注入阶段

```typescript
@RootMount()
onRootMount() {
  // 触发 CSS 生成
  this.reactiveAsync.run();
}

// Unocss 组件负责实际的样式注入
export const Unocss = ({ generateCSS }) => {
  const inlineStyle = useObserver(() => generateCSS.data);

  if (!inlineStyle) {
    return null;
  }

  return <style dangerouslySetInnerHTML={{ __html: inlineStyle }} id="unocss-styles" />;
};
```

## 🎯 高级特性

### 动态样式支持

```tsx
const App = () => {
  const isDark = signal(false);
  const theme = computed(() => (isDark.value ? 'dark' : 'light'));

  return (
    <div className={`${theme.value}-theme min-h-screen transition-colors`}>
      <button
        className={`px-4 py-2 rounded ${isDark.value ? 'bg-white text-black' : 'bg-black text-white'}`}
        onClick={() => (isDark.value = !isDark.value)}
      >
        Toggle Theme
      </button>
    </div>
  );
};
```

### 条件样式类

```tsx
const StatusBadge = ({ status }) => {
  const statusClasses = computed(() => {
    switch (status.value) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  });

  return <span className={`px-2 py-1 rounded text-sm ${statusClasses.value}`}>{status}</span>;
};
```

### 响应式样式

```tsx
const ResponsiveCard = () => (
  <div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-2">Card Title</h3>
      <p className="text-gray-600 text-sm sm:text-base">Card content...</p>
    </div>
  </div>
);
```

## 🔍 最佳实践

### 1. 性能优化

```tsx
// ✅ 推荐：使用计算属性缓存复杂的样式计算
const complexClasses = computed(() => buildComplexClassString(props.value, state.value));

// ✅ 推荐：避免在渲染函数中创建新的样式字符串
const Component = () => {
  const baseClasses = 'px-4 py-2 rounded';
  const variantClasses = computed(() =>
    variant.value === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800',
  );

  return <button className={`${baseClasses} ${variantClasses.value}`}>Button</button>;
};
```

### 2. 类型安全

```typescript
// 定义样式类型
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children }) => {
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`rounded transition-colors ${variantClasses[variant]} ${sizeClasses[size]}`}>{children}</button>
  );
};
```

### 3. 主题支持

```tsx
// 定义主题配置
const lightTheme = {
  bg: 'bg-white',
  text: 'text-gray-900',
  border: 'border-gray-200',
};

const darkTheme = {
  bg: 'bg-gray-900',
  text: 'text-gray-100',
  border: 'border-gray-700',
};

const App = () => {
  const isDark = signal(false);
  const theme = computed(() => (isDark.value ? darkTheme : lightTheme));

  return (
    <div className={`min-h-screen transition-colors ${theme.value.bg} ${theme.value.text}`}>
      <div className={`border-b ${theme.value.border} p-4`}>
        <h1 className="text-2xl font-bold">Theme Example</h1>
      </div>
    </div>
  );
};
```

## 🧪 测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Eficy, EficyProvider } from '@eficy/core-jsx';
import { UnocssPlugin } from '@eficy/plugin-unocss';

describe('UnocssPlugin', () => {
  it('should generate CSS for className attributes', async () => {
    const core = new Eficy();
    await core.install(UnocssPlugin);

    const TestComponent = () => <div className="text-red-500 p-4">Test</div>;

    render(
      <EficyProvider core={core}>
        <TestComponent />
      </EficyProvider>,
    );

    // 检查是否生成了对应的 CSS
    const styleElement = document.getElementById('unocss-styles');
    expect(styleElement).toBeTruthy();
    expect(styleElement?.innerHTML).toContain('.text-red-500');
    expect(styleElement?.innerHTML).toContain('.p-4');
  });
});
```

## 🔧 故障排除

### 常见问题

1. **样式未生成**

   - 确保插件已正确安装
   - 检查 className 是否正确传递
   - 验证 UnoCSS 配置是否正确

2. **样式冲突**

   - 检查 CSS 优先级
   - 确保插件执行顺序正确
   - 使用 `!important` 或更具体的选择器

3. **性能问题**
   - 检查是否有大量动态样式类
   - 优化样式类的使用方式
   - 考虑使用 CSS 变量代替动态类

## 📦 相关包

- [`@eficy/core-jsx`](../core-jsx) - Eficy 核心框架
- [`@eficy/reactive`](../reactive) - 响应式系统
- [`@eficy/reactive-async`](../reactive-async) - 异步响应式支持
- [`@unocss/core`](https://github.com/unocss/unocss) - UnoCSS 核心库

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
