import { container, inject, singleton, injectable, DependencyContainer } from 'tsyringe';

export { inject, singleton, injectable };

export class DIContainer {
  private static instance: DIContainer;
  private _container: DependencyContainer = container;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(token: string | symbol, implementation: new (...args: any[]) => T): void {
    this._container.register(token, { useClass: implementation });
  }

  registerSingleton<T>(token: string | symbol, implementation: new (...args: any[]) => T): void {
    this._container.registerSingleton(token, implementation);
  }

  registerInstance<T>(token: string | symbol, instance: T): void {
    this._container.register(token, { useValue: instance });
  }

  registerFactory<T>(token: string | symbol, factory: () => T): void {
    this._container.register(token, { useFactory: factory });
  }

  resolve<T>(token: string | symbol): T {
    return this._container.resolve(token as any);
  }

  isRegistered(token: string | symbol): boolean {
    return this._container.isRegistered(token as any);
  }

  createChild(): DIContainer {
    const child = new DIContainer();
    child._container = this._container.createChildContainer();
    return child;
  }

  dispose(): void {
    this._container.dispose();
  }
}

export const diContainer = DIContainer.getInstance();