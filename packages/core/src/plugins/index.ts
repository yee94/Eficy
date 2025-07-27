// This directory will contain the new plugin system implementation
// Based on tsyringe dependency injection

// Future plugins will be implemented as:
// - @eficy/plugin package with core plugin interfaces
// - Individual plugin packages that implement the interfaces
// - Lifecycle decorators: @Init, @BuildViewNode, @BeforeRender

// Legacy plugin system has been removed
// New plugin system will be implemented in separate packages

export interface IPluginPlaceholder {
  // Placeholder for future plugin interfaces
}

export const pluginPlaceholder = {} as IPluginPlaceholder