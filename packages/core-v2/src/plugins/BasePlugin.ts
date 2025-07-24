import { DIContainer } from '../container/DIContainer';
import { IPlugin } from '../types';

export abstract class BasePlugin implements IPlugin {
  abstract name: string;
  abstract priority: number;
  
  protected container?: DIContainer;
  protected isInstalled = false;

  install(container: DIContainer): void {
    if (this.isInstalled) {
      console.warn(`Plugin ${this.name} is already installed`);
      return;
    }
    
    this.container = container;
    this.isInstalled = true;
    
    this.onInstall();
  }

  uninstall(): void {
    if (!this.isInstalled) {
      return;
    }
    
    this.onUninstall();
    this.isInstalled = false;
    this.container = undefined;
  }

  protected abstract onInstall(): void;
  
  protected onUninstall(): void {
    // Default implementation - override if needed
  }

  protected registerService<T>(token: string | symbol, implementation: new (...args: any[]) => T): void {
    if (!this.container) {
      throw new Error(`Plugin ${this.name} is not installed`);
    }
    this.container.register(token, implementation);
  }

  protected registerSingleton<T>(token: string | symbol, implementation: new (...args: any[]) => T): void {
    if (!this.container) {
      throw new Error(`Plugin ${this.name} is not installed`);
    }
    this.container.registerSingleton(token, implementation);
  }

  protected registerInstance<T>(token: string | symbol, instance: T): void {
    if (!this.container) {
      throw new Error(`Plugin ${this.name} is not installed`);
    }
    this.container.registerInstance(token, instance);
  }

  protected registerFactory<T>(token: string | symbol, factory: () => T): void {
    if (!this.container) {
      throw new Error(`Plugin ${this.name} is not installed`);
    }
    this.container.registerFactory(token, factory);
  }

  protected resolve<T>(token: string | symbol): T {
    if (!this.container) {
      throw new Error(`Plugin ${this.name} is not installed`);
    }
    return this.container.resolve(token);
  }

  protected isRegistered(token: string | symbol): boolean {
    if (!this.container) {
      return false;
    }
    return this.container.isRegistered(token);
  }
}