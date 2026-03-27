# @eficy/browser

在浏览器中直接使用 Eficy，无需编译步骤。

## 特性

- 🚀 **零编译** - 直接在浏览器中运行 JSX
- ⚡ **响应式** - 内置信号系统支持
- 🎯 **简单易用** - 类似 Babel Standalone 的使用方式
- 🔧 **可扩展** - 支持自定义组件和插件

## 安装

```bash
npm install @eficy/browser
```

## 快速开始

### 1. 基础用法

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Eficy Browser Demo</title>
    <script src="https://unpkg.com/@eficy/browser/dist/standalone.js"></script>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/eficy">
      function App() {
        const count = signal(0);

        return (
          <div>
            <h1>Hello, Eficy!</h1>
            <p>Count: {count}</p>
            <button onClick={() => count.value += 1}>
              Increment
            </button>
          </div>
        );
      }

      // 渲染到 DOM
      EficyBrowser.render(App, document.getElementById('root'));
    </script>
  </body>
</html>
```

### 2. 使用 CDN

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Eficy Browser Demo</title>
    <script src="https://unpkg.com/@eficy/browser@latest/dist/index.iife.js"></script>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/eficy">
      function Counter() {
        const count = signal(0);

        return (
          <div>
            <h2>Counter: {count}</h2>
            <button onClick={() => count.value += 1}>+</button>
            <button onClick={() => count.value -= 1}>-</button>
          </div>
        );
      }

      EficyBrowser.render(Counter, document.getElementById('root'));
    </script>
  </body>
</html>
```

### 3. 模块化使用

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Eficy Browser Demo</title>
  </head>
  <body>
    <div id="root"></div>

    <script type="module">
      import { initEficyBrowser, renderJSX } from 'https://unpkg.com/@eficy/browser@latest/dist/index.js';

      // 初始化
      const eficy = initEficyBrowser();

      // JSX 代码
      const jsxCode = `
      import { signal } from '@eficy/browser';
      
      function App() {
        const name = signal('World');
        
        return (
          <div>
            <h1>Hello, {name}!</h1>
            <input 
              value={name.value} 
              onChange={(e) => name.value = e.target.value}
              placeholder="Enter your name"
            />
          </div>
        );
      }
      
      export default App;
    `;

      // 渲染
      renderJSX(jsxCode, document.getElementById('root'));
    </script>
  </body>
</html>
```

## API 参考

### 全局对象 (IIFE)

当使用 IIFE 版本时，会创建全局的 `EficyBrowser` 对象：

```javascript
// 初始化
EficyBrowser.init();

// 渲染组件
EficyBrowser.render(Component, container);

// 编译 JSX
const compiled = EficyBrowser.compile(jsxCode);
```

### 模块化 API

#### `initEficyBrowser(options?)`

初始化 Eficy 浏览器实例。

```javascript
import { initEficyBrowser } from '@eficy/browser';

const eficy = initEficyBrowser({
  components: {
    // 自定义组件
    MyComponent: () => <div>Custom Component</div>,
  },
});
```

#### `renderJSX(jsxCode, container)`

将 JSX 代码渲染到指定容器。

```javascript
import { renderJSX } from '@eficy/browser';

const jsxCode = `
  function App() {
    return <div>Hello World</div>;
  }
  export default App;
`;

await renderJSX(jsxCode, document.getElementById('root'));
```

#### `compileJSX(code)`

编译 JSX 代码为 JavaScript。

```javascript
import { compileJSX } from '@eficy/browser';

const jsxCode = `
  function App() {
    return <div>Hello World</div>;
  }
`;

const compiled = compileJSX(jsxCode);
console.log(compiled);
```

#### `registerComponent(name, component)`

注册自定义组件。

```javascript
import { registerComponent } from '@eficy/browser';

registerComponent('MyButton', ({ children, onClick }) => <button onClick={onClick}>{children}</button>);
```

## 响应式系统

@eficy/browser 内置了响应式系统，支持信号（Signals）：

```javascript
import { signal, computed, effect } from '@eficy/browser';

function App() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  effect(() => {
    console.log('Count changed:', count.value);
  });

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => (count.value += 1)}>Increment</button>
    </div>
  );
}
```

## 自定义组件

你可以注册自定义组件：

```javascript
import { registerComponent } from '@eficy/browser';

// 注册组件
registerComponent('MyCard', ({ title, children }) => (
  <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px' }}>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
));

// 在 JSX 中使用
function App() {
  return (
    <div>
      <MyCard title="Hello">
        <p>This is a custom component!</p>
      </MyCard>
    </div>
  );
}
```

## 错误处理

@eficy/browser 提供了友好的错误处理：

```javascript
try {
  await renderJSX(invalidJSX, container);
} catch (error) {
  console.error('JSX 编译错误:', error.message);
  // 显示用户友好的错误信息
  container.innerHTML = `
    <div style="color: red; padding: 16px; border: 1px solid red;">
      <h3>编译错误</h3>
      <p>${error.message}</p>
    </div>
  `;
}
```

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

## 许可证

MIT
