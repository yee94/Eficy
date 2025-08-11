# Eficy

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/eficy.svg)](#License)
[![](https://flat.badgen.net/npm/v/eficy?icon=npm)](https://www.npmjs.com/package/eficy)
[![NPM downloads](http://img.shields.io/npm/dm/eficy.svg?style=flat-square)](http://npmjs.com/eficy)

**Eficy** is a zero‑build JSX runtime for React. It renders JSX directly in the browser using existing React components without bundlers or compilation. Register React components once and use them as protocol elements (e.g., `e-Button`). Built‑in signals make state simple. Great for LLM‑generated pages.

<a href="https://stackblitz.com/edit/eficy-demo-a79lbepw?file=htmls%2Fbasic.mjs"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>

English | [简体中文](./README-zh_CN.md)

## ⚡ Quick Page Generation (LLM + shadcn/ui prompts)

If you want to quickly generate pages with Eficy, you can use the prompt set provided in `llm_shadcn.txt`.

- What it includes: best-practice prompts for Eficy + shadcn/ui, component protocol with `e-` prefix, ready-to-use HTML template, and common examples
- How to use:
  1. Open the prompts in [`llm_shadcn.txt`](./llm_shadcn.txt)
  2. In an LLM client that supports HTML preview (e.g., Cherry Studio), ask it to generate a page using Eficy + shadcn/ui with these prompts
  3. Preview the result directly in the chat window — no manual copy-paste into HTML is required
- Related: [Browser usage guide](./packages/browser/README.md)

![llm_shadcn.txt](https://md.xiaobe.top/imgs/202508092129587.png!preview.webp)
![](https://md.xiaobe.top/imgs/202508111310764.gif!preview.webp)

## 🎯 Why Eficy?

Eficy helps you:

1. **Run JSX with no build** — use `<script type="text/eficy">` in a plain HTML page
2. **Protocol components** — register React components and use them as `e-Button`, ensuring consistent LLM output
3. **Simple reactive state** — signals with fine‑grained updates
4. **Optional UnoCSS plugin** — generate atomic CSS from `className`

## ✨ Key Features

### 🔄 Signal-based Reactive System
- **Intuitive State Management**: Eliminates the need for complex React Hooks
- **Automatic Dependency Tracking**: Signals used in JSX are automatically tracked
- **Fine-grained Updates**: Only components using changed signals re-render
- **Async Data Support**: Built-in async signals with automatic loading/error handling

### 🚀 No-compilation Rendering
- **Direct Browser Execution**: Run JSX directly in browser environments
- **Script Tag Support**: Use `<script type="text/eficy">` for inline JSX
- **Real-time Transpilation**: Instantly convert JSX to executable JavaScript

### 🧩 Protocol-based Component Rendering
- **Prefix-based Components**: Use `e-Button` syntax for registered components
- **Global Component Registry**: Register components once, use everywhere
- **Consistent LLM Output**: Reduce variability in LLM-generated components

### 🎨 UnoCSS Integration
- **Atomic CSS Generation**: Automatically generate styles from className attributes
- **Real-time Style Processing**: Extract and generate CSS during rendering
- **Smart Caching**: Avoid regenerating identical styles

### 📦 Seamless React Integration
- **Full React Compatibility**: Work with existing React component libraries
- **Custom JSX Runtime**: Transparent integration with signals
- **TypeScript Support**: Complete type safety

## 📦 Installation

```bash
npm install eficy
# or
yarn add eficy
# or
pnpm add eficy
```

## 🚀 Quick Start

### Browser Usage (No Compilation)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Eficy Demo</title>
  <script type="module" src="https://unpkg.com/@eficy/browser@1.0.19/dist/standalone.mjs"></script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/eficy">
    import { signal } from 'eficy';
    import * as antd from 'antd';
    
    // Register components
    Eficy.registerComponents(antd);
    
    const App = () => {
      const count = signal(0);
      const name = signal('World');
      
      return (
        <div className="p-6 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Hello, {name}!</h1>
          <p className="mb-4">Count: {count}</p>
          
          <input 
            className="border p-2 mr-2"
            value={name}
            onChange={(e) => name.set(e.target.value)}
            placeholder="Enter your name"
          />
          
          <e-Button 
            type="primary" 
            onClick={() => count.set(count() + 1)}
          >
            Increment
          </e-Button>
        </div>
      );
    };
    
    Eficy.render(App, document.getElementById('root'));
  </script>
</body>
</html>
```

### Node.js Usage

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { create, EficyProvider } from 'eficy';
import { signal } from '@eficy/reactive';
import * as antd from 'antd';

// Create Eficy instance
const core = await create();

// Register components
core.registerComponents(antd);

const App = () => {
  const count = signal(0);
  const name = signal('Eficy');
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Hello, {name}!</h1>
      <p className="mb-4">Count: {count}</p>
      
      <input 
        className="border p-2 mr-2"
        value={name}
        onChange={(e) => name.set(e.target.value)}
        placeholder="Enter your name"
      />
      
      <e-Button 
        type="primary" 
        onClick={() => count.set(count() + 1)}
      >
        Increment
      </e-Button>
    </div>
  );
};

// Render application
const root = createRoot(document.getElementById('root'));
root.render(
  <EficyProvider core={core}>
    <App />
  </EficyProvider>
);
```

## 🧠 Core Concepts

### Signals for State Management

```jsx
import { signal, computed } from 'eficy';

// Create signals for state
const count = signal(0);
const name = signal('World');

// Create computed values
const greeting = computed(() => `Hello, ${name()}!`);

// Use in JSX (automatic subscription)
const App = () => (
  <div>
    <h1>{greeting}</h1>
    <p>Count: {count}</p>
    <button onClick={() => count.set(count() + 1)}>
      Increment
    </button>
  </div>
);
```

### Async Data Handling

```jsx
import { asyncSignal } from 'eficy';

const userList = asyncSignal(async () => {
  const response = await fetch('/api/users');
  return response.json();
});

const UserList = () => (
  <div>
    {userList.loading() && <div>Loading...</div>}
    {userList.error() && <div>Error: {userList.error().message}</div>}
    {userList.data() && (
      <ul>
        {userList.data().map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    )}
  </div>
);
```

### Protocol-based Components

```jsx
// Register components globally
core.registerComponents({
  Button: ({ children, ...props }) => (
    <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>
      {children}
    </button>
  )
});

// Use with e- prefix
const App = () => (
  <div>
    <e-Button onClick={() => console.log('Clicked!')}>
      Click me
    </e-Button>
  </div>
);
```

## 📦 Included Modules

The Eficy package includes the following core modules:

### Core Framework
- **@eficy/core-jsx** - Third-generation core engine based on custom JSX runtime
- **@eficy/reactive** - High-performance reactive state management system
- **@eficy/reactive-react** - React reactive integration
- **@eficy/reactive-async** - Async reactive support

### Built-in Plugins
- **@eficy/plugin-unocss** - UnoCSS atomic CSS auto-generation plugin

### Special Packages
- **@eficy/browser** - Browser-ready bundle for no-compilation usage

## 🖥 Environment Support

- Modern browsers
- Node.js environments
- Server-side Rendering
- [Electron](https://www.electronjs.org/)

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Electron |
|---|---|---|---|---|
| IE11, Edge | last 2 versions | last 2 versions | last 2 versions | last 2 versions |

## 📚 Related Documentation

- [Core Framework Documentation](./packages/core-jsx/README.md) - Detailed documentation for @eficy/core-jsx
- [Reactive System Documentation](./packages/reactive/README.md) - Detailed documentation for @eficy/reactive
- [React Reactive Integration Documentation](./packages/reactive-react/README.md) - Detailed documentation for @eficy/reactive-react
- [Async Reactive Documentation](./packages/reactive-async/README.md) - Detailed documentation for @eficy/reactive-async
- [UnoCSS Plugin Documentation](./packages/plugin-unocss/README.md) - Detailed documentation for @eficy/plugin-unocss
- [Browser Package Documentation](./packages/browser/README.md) - Documentation for browser usage
- [Playground Examples](./playground/README.md) - Complete application examples

## 🔗 API Reference

### Core API
- `create()` - Create a pre-configured Eficy instance
- `EficyProvider` - Component that provides Eficy context
- `useEficyContext()` - Hook to get Eficy instance

### Reactive API
- `signal(value)` - Create reactive signal
- `computed(fn)` - Create computed property
- `asyncSignal(fn, options)` - Create async signal
- `useObserver(fn)` - React Hook to observe signal changes

### Plugin API
- `core.install(Plugin, config)` - Install plugin
- `core.registerComponent(name, component)` - Register single component
- `core.registerComponents(components)` - Batch register components

## 🤝 Contributing

We welcome issues and pull requests!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgements

Thanks for the inspiration and support from the following open-source projects:

- [React](https://reactjs.org/) - User interface library
- [Preact Signals](https://preactjs.com/guide/v10/signals/) - Reactive system foundation
- [@preact/signals-react](https://github.com/preactjs/signals) - React reactive integration
- [UnoCSS](https://unocss.dev/) - Atomic CSS engine
- [TSyringe](https://github.com/microsoft/tsyringe) - Dependency injection container
- [Ant Design](https://ant.design/) - Enterprise UI design language

---

<div align="center">
  <strong>Enabling LLMs to truly generate pages with one sentence</strong>
</div>
