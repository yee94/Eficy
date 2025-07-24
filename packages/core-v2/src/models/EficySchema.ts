import { createSignal, createComputed, IWritableSignal, ISignal } from 'reactjs-signal';
import { injectable, inject } from 'tsyringe';
import { cloneDeep, get } from 'lodash';
import { ViewNode } from './ViewNode';
import { SignalStore } from '../core/SignalStore';
import { IView, IPluginConfig } from '../types';

import { TOKENS } from '../container/tokens';

interface IEficySchema {
  views: IView[];
  plugins?: IPluginConfig[];
  requests?: any[];
}

@injectable()
export class EficySchema {
  private _views: IWritableSignal<ViewNode[]>;
  private _plugins: IPluginConfig[];
  private _viewDataMap: ISignal<Record<string, ViewNode>>;

  constructor(
    @inject(TOKENS.SIGNAL_STORE) private signalStore: SignalStore,
    data: IEficySchema
  ) {
    this._plugins = data.plugins || [];
    
    // Create root views
    const views = data.views.map(viewData => new ViewNode(viewData));
    this._views = this.signalStore.createSignal('schema.views', views);
    
    // Create computed viewDataMap for easy access by ID
    this._viewDataMap = this.signalStore.createComputed('schema.viewDataMap', () => {
      const map: Record<string, ViewNode> = {};
      
      const collectNodes = (nodes: ViewNode[]) => {
        nodes.forEach(node => {
          map[node.id] = node;
          if (node.children.length > 0) {
            collectNodes(node.children);
          }
        });
      };
      
      collectNodes(this._views());
      return map;
    });
  }

  get views(): ViewNode[] {
    return this._views();
  }

  get plugins(): IPluginConfig[] {
    return [...this._plugins];
  }

  get viewDataMap(): Record<string, ViewNode> {
    return this._viewDataMap();
  }

  getViewModel(path: string): ViewNode | undefined {
    // Support dot notation like "form.input1" or just "input1"
    if (path.includes('.')) {
      const parts = path.split('.');
      let current = this.viewDataMap[parts[0]];
      
      for (let i = 1; i < parts.length && current; i++) {
        current = current.findChildById(parts[i]);
      }
      
      return current;
    }
    
    return this.viewDataMap[path];
  }

  addView(viewData: IView, index?: number): ViewNode {
    const newNode = new ViewNode(viewData);
    const currentViews = [...this._views()];
    
    if (index !== undefined) {
      currentViews.splice(index, 0, newNode);
    } else {
      currentViews.push(newNode);
    }
    
    this._views(currentViews);
    return newNode;
  }

  removeView(id: string): boolean {
    const currentViews = this._views();
    const index = currentViews.findIndex(view => view.id === id);
    
    if (index > -1) {
      const removedView = currentViews[index];
      removedView.dispose();
      
      const newViews = [...currentViews];
      newViews.splice(index, 1);
      this._views(newViews);
      
      return true;
    }
    
    return false;
  }

  updateView(id: string, data: Partial<IView>): boolean {
    const node = this.viewDataMap[id];
    if (node) {
      node.update(data);
      // Trigger re-computation
      this._views([...this._views()]);
      return true;
    }
    return false;
  }

  replaceView(id: string, newData: IView): boolean {
    const currentViews = this._views();
    const index = currentViews.findIndex(view => view.id === id);
    
    if (index > -1) {
      const oldView = currentViews[index];
      oldView.dispose();
      
      const newView = new ViewNode(newData);
      const newViews = [...currentViews];
      newViews[index] = newView;
      
      this._views(newViews);
      return true;
    }
    
    return false;
  }

  update(data: Partial<IEficySchema>): void {
    if (data.views) {
      // Dispose old views
      this._views().forEach(view => view.dispose());
      
      // Create new views
      const newViews = data.views.map(viewData => new ViewNode(viewData));
      this._views(newViews);
    }
    
    if (data.plugins) {
      this._plugins = [...data.plugins];
    }
  }

  overwrite(data: IEficySchema): void {
    // Dispose all current views
    this._views().forEach(view => view.dispose());
    
    // Reset everything
    const newViews = data.views.map(viewData => new ViewNode(viewData));
    this._views(newViews);
    this._plugins = data.plugins || [];
  }

  clone(): EficySchema {
    const clonedData: IEficySchema = {
      views: this._views().map(view => view.toJSON()),
      plugins: cloneDeep(this._plugins)
    };
    
    return new EficySchema(this.signalStore, clonedData);
  }

  toJSON(): IEficySchema {
    return {
      views: this._views().map(view => view.toJSON()),
      plugins: cloneDeep(this._plugins)
    };
  }

  findNodes(predicate: (node: ViewNode) => boolean): ViewNode[] {
    const results: ViewNode[] = [];
    
    this._views().forEach(view => {
      results.push(...view.filter(predicate));
    });
    
    return results;
  }

  findNodesByType(type: string): ViewNode[] {
    return this.findNodes(node => node.type === type);
  }

  findNodesWithProp(propName: string): ViewNode[] {
    return this.findNodes(node => node.hasProp(propName));
  }

  dispose(): void {
    this._views().forEach(view => view.dispose());
  }
}