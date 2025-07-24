import { injectable, inject } from 'tsyringe';
import { createElement, ReactElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { merge, cloneDeep } from 'lodash';
import { DIContainer } from '../container/DIContainer';
import { SignalStore } from './SignalStore';
import { ComponentRegistry } from './ComponentRegistry';
import { VariableReplacer } from '../utils/VariableReplacer';
import { ActionHandler } from './ActionHandler';
import { PluginManager } from '../plugins/PluginManager';
import { EficySchema } from '../models/EficySchema';
import { ViewNode } from '../models/ViewNode';
import { EficyComponent } from '../components/EficyComponent';
import { IEficyConfig, IEficySchema, IView, IActionProps } from '../types';
import { TOKENS } from '../container/tokens';

@injectable()
export class EficyController {
  private _schema?: EficySchema;
  private _config: IEficyConfig = {};
  private _context: Record<string, any> = {};
  private _reactRoot?: Root;

  constructor(
    @inject(TOKENS.SIGNAL_STORE) private signalStore: SignalStore,
    @inject(TOKENS.COMPONENT_REGISTRY) private componentRegistry: ComponentRegistry,
    @inject(TOKENS.VARIABLE_REPLACER) private variableReplacer: VariableReplacer,
    @inject(TOKENS.ACTION_HANDLER) private actionHandler: ActionHandler,
    @inject(TOKENS.PLUGIN_MANAGER) private pluginManager: PluginManager,
    private container: DIContainer
  ) {
    this.initializeContext();
  }

  private initializeContext(): void {
    this._context = {
      controller: this,
      signalStore: this.signalStore,
      componentRegistry: this.componentRegistry,
      variableReplacer: this.variableReplacer,
      actionHandler: this.actionHandler,
      pluginManager: this.pluginManager,
    };
  }

  config(options: IEficyConfig): this {
    this._config = merge({}, this._config, options);
    
    if (options.componentMap) {
      this.componentRegistry.merge(options.componentMap);
    }
    
    if (options.defaultActions) {
      this.actionHandler.registerActions(options.defaultActions);
    }
    
    if (options.plugins) {
      this.pluginManager.installPlugins(options.plugins);
    }
    
    return this;
  }

  extend(options: IEficyConfig): this {
    this._config = merge({}, this._config, cloneDeep(options));
    
    if (options.componentMap) {
      this.componentRegistry.extendComponentMap(options.componentMap);
    }
    
    if (options.defaultActions) {
      this.actionHandler.registerActions(options.defaultActions);
    }
    
    if (options.plugins) {
      this.pluginManager.installPlugins(options.plugins);
    }
    
    return this;
  }

  load(schema: IEficySchema | IView): this {
    // Convert single view to schema
    const schemaData: IEficySchema = this.normalizeSchema(schema);
    
    // Dispose old schema if exists
    if (this._schema) {
      this._schema.dispose();
    }
    
    // Create new schema
    this._schema = new EficySchema(this.signalStore, schemaData);
    
    // Install schema plugins
    if (schemaData.plugins) {
      this.pluginManager.installPlugins(schemaData.plugins);
    }
    
    return this;
  }

  reload(schema: IEficySchema | IView): this {
    return this.load(schema);
  }

  update(data: Partial<IEficySchema>): this {
    if (this._schema) {
      this._schema.update(data);
    }
    return this;
  }

  updateModel(id: string, data: Partial<IView>): boolean {
    if (this._schema) {
      return this._schema.updateView(id, data);
    }
    return false;
  }

  overwriteModel(id: string, data: IView): boolean {
    if (this._schema) {
      return this._schema.replaceView(id, data);
    }
    return false;
  }

  getModel(id: string): ViewNode | undefined {
    return this._schema?.getViewModel(id);
  }

  get models(): Record<string, ViewNode> {
    return this._schema?.viewDataMap || {};
  }

  get schema(): EficySchema | undefined {
    return this._schema;
  }

  async run(actionProps: IActionProps, needReplaceVariable: boolean = true): Promise<void> {
    await this.actionHandler.executeAction(actionProps, this._context, needReplaceVariable);
  }

  render(target?: string | HTMLElement): ReactElement | null {
    if (!this._schema) {
      console.warn('No schema loaded. Call load() first.');
      return null;
    }

    const element = createElement(EficyComponent, {
      schema: this._schema,
      componentRegistry: this.componentRegistry,
      variableReplacer: this.variableReplacer,
      actionHandler: this.actionHandler,
      context: this._context,
    });

    if (target) {
      this.renderToDOM(element, target);
    }

    return element;
  }

  private renderToDOM(element: ReactElement, target: string | HTMLElement): void {
    const container = typeof target === 'string' 
      ? document.querySelector(target) 
      : target;
      
    if (!container) {
      throw new Error(`Target element not found: ${target}`);
    }

    if (this._reactRoot) {
      this._reactRoot.unmount();
    }

    this._reactRoot = createRoot(container);
    this._reactRoot.render(element);
  }

  refresh(): void {
    if (this._schema && this._reactRoot) {
      const element = this.render();
      if (element) {
        this._reactRoot.render(element);
      }
    }
  }

  showSuccess(message: string): void {
    console.log('Success:', message);
  }

  showError(message: string): void {
    console.error('Error:', message);
  }

  async executeRequest(requestConfig: any): Promise<any> {
    // This would be implemented by a request plugin
    console.log('Request:', requestConfig);
    return Promise.resolve();
  }

  createChild(): EficyController {
    const childContainer = this.container.createChild();
    const childController = childContainer.resolve<EficyController>(TOKENS.EFICY_CONTROLLER);
    
    // Copy configuration to child
    childController.config(cloneDeep(this._config));
    
    return childController;
  }

  dispose(): void {
    if (this._reactRoot) {
      this._reactRoot.unmount();
      this._reactRoot = undefined;
    }
    
    if (this._schema) {
      this._schema.dispose();
      this._schema = undefined;
    }
    
    this.signalStore.dispose();
    this.pluginManager.dispose();
  }

  private normalizeSchema(schema: IEficySchema | IView): IEficySchema {
    if ('views' in schema) {
      return schema;
    }
    
    // Single view case
    return {
      views: [schema],
    };
  }
}