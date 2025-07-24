# Eficy Core V2

A modern front-end orchestration framework that allows building React applications through JSON configuration with dependency injection and reactive signals.

## Key Features

- **Dependency Injection**: Built with tsyringe for modular and testable architecture
- **Reactive System**: Powered by react-alien-signals for efficient state management
- **Inside-out Rendering**: React-friendly component tree building
- **Plugin Architecture**: Extensible plugin system with lifecycle hooks
- **TypeScript First**: Full TypeScript support with strict typing
- **Modern React**: Supports React 18+ with hooks and concurrent features

## Architecture Overview

### Core Components

- **Eficy**: Main static class with global configuration
- **EficyController**: Instance-based controller for component orchestration
- **SignalStore**: Reactive state management using signals
- **ComponentRegistry**: Component library management with extend/merge capabilities
- **PluginManager**: Plugin lifecycle and dependency management
- **ViewNode**: Enhanced data model for component tree representation

### Dependency Injection

The framework uses tsyringe for dependency injection, allowing for:
- Modular service registration
- Easy testing and mocking
- Plugin-based architecture
- Service lifecycle management

### Reactive System

Built on react-alien-signals for:
- Fine-grained reactivity
- Automatic dependency tracking
- Computed values
- Effect management
- React integration

## Usage

### Basic Setup

```typescript
import Eficy from '@eficy/core-v2';

// Configure global instance
Eficy.config({
  componentMap: {
    Button: MyButton,
    Input: MyInput,
  }
});

// Load and render schema
Eficy.load({
  views: [{
    '#view': 'Button',
    '#': 'myButton',
    children: 'Click me',
    '@click': () => ({ action: 'success', data: 'Button clicked!' })
  }]
}).render('#root');
```

### Extending Configuration

```typescript
// Extend existing configuration
Eficy.extend({
  componentMap: {
    NewComponent: MyNewComponent,
  },
  plugins: [
    { name: 'request', options: { baseURL: '/api' } }
  ]
});
```

### Instance-based Usage

```typescript
const controller = Eficy.createController();

controller
  .config({ /* instance config */ })
  .load({ /* schema */ })
  .render('#container');
```

## Plugin Development

```typescript
import { BasePlugin, TOKENS } from '@eficy/core-v2';

export class MyPlugin extends BasePlugin {
  name = 'my-plugin';
  priority = 100;

  protected onInstall(): void {
    // Register services
    this.registerSingleton('myService', MyService);
    
    // Access other services
    const actionHandler = this.resolve(TOKENS.ACTION_HANDLER);
    actionHandler.registerAction('myAction', this.handleAction.bind(this));
  }

  private handleAction(data: any, controller: any): void {
    // Plugin action logic
  }
}
```

## Migration from V1

### Key Changes

1. **MobX → react-alien-signals**: Update reactive patterns
2. **plugin-decorator → tsyringe**: New DI system
3. **Class components → Hooks**: Modern React patterns
4. **Outside-in → Inside-out**: New rendering approach

### API Changes

- `Eficy.Config` → `Eficy.config()`
- `new EficyController()` → `Eficy.createController()`
- MobX observables → Signals
- Plugin decorators → DI registration

See migration guide for detailed instructions.