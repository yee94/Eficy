# @eficy/plugin-unocss

UnoCSS plugin for @eficy/core - Automatically generates and injects CSS styles from className attributes in Eficy components.

## 🚀 Features

- **Automatic Class Collection**: Automatically collects className attributes from Eficy components
- **UnoCSS Integration**: Uses UnoCSS to generate corresponding CSS styles
- **Smart Injection**: Injects generated styles into the root node
- **Performance Optimized**: Includes caching mechanism to avoid redundant computations
- **Customizable**: Supports custom UnoCSS configurations

## 📦 Installation

```bash
npm install @eficy/plugin-unocss
# or
yarn add @eficy/plugin-unocss
# or
pnpm add @eficy/plugin-unocss
```

## 📖 Usage

### Basic Usage

```ts
import { Eficy } from '@eficy/core';
import { createUnocssPlugin } from '@eficy/plugin-unocss';

// Create Eficy instance
const eficy = new Eficy();

// Create and register the plugin
const unocssPlugin = createUnocssPlugin();
eficy.registerPlugin(unocssPlugin);

// Use in your schema
const schema = {
  views: [
    {
      '#': 'root',
      '#view': 'div',
      className: 'text-red-500 p-4 bg-blue-500',
      '#children': 'Hello UnoCSS',
    },
  ],
};

// The plugin will automatically collect className attributes and inject the corresponding CSS
const element = await eficy.createElement(schema);
```

### With Custom Configuration

```ts
import { Eficy } from '@eficy/core';
import { createUnocssPlugin } from '@eficy/plugin-unocss';

const eficy = new Eficy();

// Create plugin with custom UnoCSS configuration
const unocssPlugin = createUnocssPlugin({
  config: {
    // Your custom UnoCSS configuration
    rules: [
      ['btn', { padding: '0.5rem 1rem', borderRadius: '0.25rem' }]
    ],
    // ... other UnoCSS options
  }
});

eficy.registerPlugin(unocssPlugin);
```

## 🛠️ API

### createUnocssPlugin(config?: UnocssPluginConfig)

Creates a new UnocssPlugin instance.

#### UnocssPluginConfig

```ts
interface UnocssPluginConfig {
  config?: UserConfig; // Custom UnoCSS configuration
}
```

### UnocssPlugin Class

The main plugin class that implements ILifecyclePlugin.

#### Methods

- `getGenerator(): UnoGenerator | null` - Returns the UnoCSS generator instance
- `destroy(): void` - Cleans up resources and clears caches

## 🧪 How It Works

1. **Initialization**: The plugin initializes the UnoCSS generator with default presets (Uno and Attributify)
2. **Class Collection**: During the schema building phase, it collects className attributes from all components
3. **CSS Generation**: When rendering the root node, it generates CSS for all collected classes using UnoCSS
4. **Style Injection**: The generated CSS is injected as a `<style>` tag alongside the root element
5. **Caching**: Uses caching to avoid regenerating CSS for the same set of classes

## 🎯 Supported Features

- Class name collection from both string and array formats
- Nested component className collection
- Incremental class collection
- Caching for performance optimization
- Error handling for CSS generation failures
- Custom UnoCSS configuration support

## 📄 License

MIT