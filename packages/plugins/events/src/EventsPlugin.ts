import { BasePlugin, TOKENS, ViewNode } from '@eficy/core-v2';

export interface EventsPluginOptions {
  globalEvents?: Record<string, (...args: any[]) => void>;
}

export class EventsPlugin extends BasePlugin {
  name = 'events';
  priority = 90;
  
  private globalEvents: Record<string, (...args: any[]) => void> = {};
  private eventListeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(options: EventsPluginOptions = {}) {
    super();
    this.globalEvents = options.globalEvents || {};
  }

  protected onInstall(): void {
    // Register event emitter service
    this.registerInstance('eventEmitter', this);
    
    // Hook into renderer to process event handlers
    this.setupEventProcessing();
  }

  private setupEventProcessing(): void {
    // This would integrate with the renderer to process @event handlers
    // For now, we'll register a simple event system
  }

  on(eventName: string, handler: (...args: any[]) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(handler);
  }

  off(eventName: string, handler: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventName);
      }
    }
  }

  emit(eventName: string, ...args: any[]): void {
    // Emit to registered listeners
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }

    // Emit to global events
    const globalHandler = this.globalEvents[eventName];
    if (globalHandler) {
      try {
        globalHandler(...args);
      } catch (error) {
        console.error(`Error in global event handler for ${eventName}:`, error);
      }
    }
  }

  processEventHandlers(node: ViewNode): Record<string, (...args: any[]) => void> {
    const eventHandlers: Record<string, (...args: any[]) => void> = {};
    
    // Process @event props
    const props = node.props;
    Object.keys(props).forEach(key => {
      if (key.startsWith('@') && typeof props[key] === 'function') {
        const eventName = key.substring(1);
        eventHandlers[`on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = (...args: any[]) => {
          // Execute the function and handle action results
          const result = props[key](...args);
          
          if (result && typeof result === 'object' && result.action) {
            // If the function returns an action, execute it
            const controller = this.resolve(TOKENS.EFICY_CONTROLLER);
            controller.run(result);
          }
        };
      }
    });

    return eventHandlers;
  }

  registerGlobalEvent(eventName: string, handler: (...args: any[]) => void): void {
    this.globalEvents[eventName] = handler;
  }

  unregisterGlobalEvent(eventName: string): void {
    delete this.globalEvents[eventName];
  }

  clear(): void {
    this.eventListeners.clear();
  }

  protected onUninstall(): void {
    this.clear();
  }
}