import { IWritableSignal } from 'reactjs-signal';
import { nanoid } from 'nanoid';
import { cloneDeep, isObject, isArray, get, set, unset } from 'lodash';
import { IView } from '../types';

export class ViewNode {
  private _id: string;
  private _type: string;
  private _props: Map<string, any> = new Map();
  private _children: ViewNode[] = [];
  private _parent?: ViewNode;
  private _signals: Map<string, IWritableSignal<any>> = new Map();

  constructor(data: IView, parent?: ViewNode) {
    this._id = data['#'] || nanoid();
    this._type = data['#view'] || 'div';
    this._parent = parent;
    
    this.parseData(data);
  }

  get id(): string {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  get children(): ViewNode[] {
    return [...this._children];
  }

  get parent(): ViewNode | undefined {
    return this._parent;
  }

  get props(): Record<string, any> {
    const result: Record<string, any> = {};
    this._props.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private parseData(data: IView): void {
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('#')) {
        this.handleSpecialProp(key, value);
      } else {
        this.setProp(key, value);
      }
    });
  }

  private handleSpecialProp(key: string, value: any): void {
    switch (key) {
      case '#':
        // ID already set in constructor
        break;
      case '#view':
        // Type already set in constructor
        break;
      case '#children':
        if (isArray(value)) {
          this._children = value.map(child => new ViewNode(child, this));
        }
        break;
      case '#if':
        this.setProp('__if', value);
        break;
      case '#content':
        this.setProp('children', value);
        break;
      default:
        // Other special props like #request, #model, etc.
        this.setProp(key.substring(1), value);
        break;
    }
  }

  setProp(key: string, value: any): void {
    this._props.set(key, value);
  }

  getProp(key: string): any {
    return this._props.get(key);
  }

  hasProp(key: string): boolean {
    return this._props.has(key);
  }

  deleteProp(key: string): boolean {
    return this._props.delete(key);
  }

  addChild(child: ViewNode): void {
    child._parent = this;
    this._children.push(child);
  }

  removeChild(child: ViewNode): boolean {
    const index = this._children.indexOf(child);
    if (index > -1) {
      this._children.splice(index, 1);
      child._parent = undefined;
      return true;
    }
    return false;
  }

  insertChild(child: ViewNode, index: number): void {
    child._parent = this;
    this._children.splice(index, 0, child);
  }

  findChild(predicate: (node: ViewNode) => boolean): ViewNode | undefined {
    return this._children.find(predicate);
  }

  findChildById(id: string): ViewNode | undefined {
    return this.findChild(node => node.id === id);
  }

  findDescendant(predicate: (node: ViewNode) => boolean): ViewNode | undefined {
    for (const child of this._children) {
      if (predicate(child)) {
        return child;
      }
      const found = child.findDescendant(predicate);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  findDescendantById(id: string): ViewNode | undefined {
    return this.findDescendant(node => node.id === id);
  }

  getPath(): string {
    const path: string[] = [];
    let current: ViewNode | undefined = this;
    
    while (current) {
      path.unshift(current.id);
      current = current.parent;
    }
    
    return path.join('.');
  }

  update(data: Partial<IView>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('#')) {
        this.handleSpecialProp(key, value);
      } else {
        this.setProp(key, value);
      }
    });
  }

  clone(): ViewNode {
    const clonedData = this.toJSON();
    return new ViewNode(clonedData);
  }

  toJSON(): IView {
    const result: IView = {
      '#': this._id,
      '#view': this._type,
    };

    // Add props
    this._props.forEach((value, key) => {
      if (key === '__if') {
        result['#if'] = value;
      } else if (key === 'children' && typeof value === 'string') {
        result['#content'] = value;
      } else {
        result[key] = value;
      }
    });

    // Add children
    if (this._children.length > 0) {
      result['#children'] = this._children.map(child => child.toJSON());
    }

    return result;
  }

  traverse(callback: (node: ViewNode) => void): void {
    callback(this);
    this._children.forEach(child => child.traverse(callback));
  }

  filter(predicate: (node: ViewNode) => boolean): ViewNode[] {
    const results: ViewNode[] = [];
    this.traverse(node => {
      if (predicate(node)) {
        results.push(node);
      }
    });
    return results;
  }

  isVisible(): boolean {
    const condition = this.getProp('__if');
    if (condition === undefined) return true;
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'string') {
      // This would need evaluation in context
      return true; // Placeholder
    }
    return Boolean(condition);
  }

  getSignal(key: string): IWritableSignal<any> | undefined {
    return this._signals.get(key);
  }

  setSignal(key: string, signal: IWritableSignal<any>): void {
    this._signals.set(key, signal);
  }

  dispose(): void {
    this._signals.clear();
    this._children.forEach(child => child.dispose());
    this._children = [];
    this._props.clear();
  }
}