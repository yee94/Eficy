import { DIContainer } from '../container/DIContainer';
import { TOKENS } from '../container/tokens';
import { EficyController } from './EficyController';
import { SignalStore } from './SignalStore';
import { ComponentRegistry } from './ComponentRegistry';
import { VariableReplacer } from '../utils/VariableReplacer';
import { ActionHandler } from './ActionHandler';
import { PluginManager } from '../plugins/PluginManager';
import { IEficyConfig, IEficySchema, IView } from '../types';
import { ReactElement } from 'react';

export class Eficy {
  private static globalContainer: DIContainer;
  private static globalController: EficyController;
  private static isInitialized = false;

  static initialize(): void {
    if (Eficy.isInitialized) {
      return;
    }

    Eficy.globalContainer = DIContainer.getInstance();
    Eficy.setupDependencies();
    Eficy.globalController = Eficy.globalContainer.resolve<EficyController>(TOKENS.EFICY_CONTROLLER);
    Eficy.isInitialized = true;
  }

  private static setupDependencies(): void {
    const container = Eficy.globalContainer;

    // Register core services
    container.registerSingleton(TOKENS.SIGNAL_STORE, SignalStore);
    container.registerSingleton(TOKENS.COMPONENT_REGISTRY, ComponentRegistry);
    container.registerSingleton(TOKENS.VARIABLE_REPLACER, VariableReplacer);
    container.registerSingleton(TOKENS.ACTION_HANDLER, ActionHandler);
    container.registerSingleton(TOKENS.PLUGIN_MANAGER, PluginManager);
    
    // Register controller
    container.register(TOKENS.EFICY_CONTROLLER, EficyController);
  }

  static config(options: IEficyConfig): typeof Eficy {
    Eficy.ensureInitialized();
    Eficy.globalController.config(options);
    return Eficy;
  }

  static extend(options: IEficyConfig): typeof Eficy {
    Eficy.ensureInitialized();
    Eficy.globalController.extend(options);
    return Eficy;
  }

  static load(schema: IEficySchema | IView): typeof Eficy {
    Eficy.ensureInitialized();
    Eficy.globalController.load(schema);
    return Eficy;
  }

  static render(target?: string | HTMLElement): ReactElement | null {
    Eficy.ensureInitialized();
    return Eficy.globalController.render(target);
  }

  static createElement(schema: IEficySchema | IView): ReactElement | null {
    const controller = Eficy.createController();
    controller.load(schema);
    return controller.render();
  }

  static createController(): EficyController {
    Eficy.ensureInitialized();
    return Eficy.globalController.createChild();
  }

  static getController(): EficyController {
    Eficy.ensureInitialized();
    return Eficy.globalController;
  }

  static run(actionProps: { action: string; data?: any }, needReplaceVariable: boolean = true): Promise<void> {
    Eficy.ensureInitialized();
    return Eficy.globalController.run(actionProps, needReplaceVariable);
  }

  static updateModel(id: string, data: Partial<IView>): boolean {
    Eficy.ensureInitialized();
    return Eficy.globalController.updateModel(id, data);
  }

  static getModel(id: string) {
    Eficy.ensureInitialized();
    return Eficy.globalController.getModel(id);
  }

  static get models() {
    Eficy.ensureInitialized();
    return Eficy.globalController.models;
  }

  static registerPlugin(name: string, pluginClass: new (options?: any) => any): typeof Eficy {
    Eficy.ensureInitialized();
    const pluginManager = Eficy.globalContainer.resolve(TOKENS.PLUGIN_MANAGER);
    pluginManager.registerPluginClass(name, pluginClass);
    return Eficy;
  }

  static refresh(): void {
    Eficy.ensureInitialized();
    Eficy.globalController.refresh();
  }

  static dispose(): void {
    if (Eficy.isInitialized) {
      Eficy.globalController.dispose();
      Eficy.globalContainer.dispose();
      Eficy.isInitialized = false;
    }
  }

  private static ensureInitialized(): void {
    if (!Eficy.isInitialized) {
      Eficy.initialize();
    }
  }
}

// Initialize on module load
Eficy.initialize();