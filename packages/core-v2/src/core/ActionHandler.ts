import { injectable, inject } from 'tsyringe';
import { merge } from 'lodash';
import { IAction, IActionProps } from '../types';
import { VariableReplacer } from '../utils/VariableReplacer';
import { TOKENS } from '../container/tokens';

@injectable()
export class ActionHandler {
  private actions: Map<string, IAction> = new Map();

  constructor(
    @inject(TOKENS.VARIABLE_REPLACER) private variableReplacer: VariableReplacer
  ) {
    this.registerDefaultActions();
  }

  registerAction(name: string, action: IAction): void {
    this.actions.set(name, action);
  }

  registerActions(actions: Record<string, IAction>): void {
    Object.entries(actions).forEach(([name, action]) => {
      this.registerAction(name, action);
    });
  }

  unregisterAction(name: string): boolean {
    return this.actions.delete(name);
  }

  hasAction(name: string): boolean {
    return this.actions.has(name);
  }

  getAction(name: string): IAction | undefined {
    return this.actions.get(name);
  }

  getAllActions(): Record<string, IAction> {
    const result: Record<string, IAction> = {};
    this.actions.forEach((action, name) => {
      result[name] = action;
    });
    return result;
  }

  async executeAction(
    actionProps: IActionProps, 
    context: any = {},
    needReplaceVariable: boolean = true
  ): Promise<void> {
    const { action: actionName, data } = actionProps;
    
    if (!actionName) {
      throw new Error('Action name is required');
    }

    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`Action "${actionName}" is not registered`);
    }

    try {
      const processedData = needReplaceVariable 
        ? this.variableReplacer.replaceWithContext(data, context)
        : data;

      await action(processedData, context);
    } catch (error) {
      console.error(`Error executing action "${actionName}":`, error);
      throw error;
    }
  }

  private registerDefaultActions(): void {
    this.registerAction('update', (data: any, controller: any) => {
      if (!data || !Array.isArray(data)) {
        console.warn('Update action requires an array of update instructions');
        return;
      }

      data.forEach((item: any) => {
        if (item['#'] && controller.updateModel) {
          controller.updateModel(item['#'], item);
        }
      });
    });

    this.registerAction('overwrite', (data: any, controller: any) => {
      if (!data || !Array.isArray(data)) {
        console.warn('Overwrite action requires an array of overwrite instructions');
        return;
      }

      data.forEach((item: any) => {
        if (item['#'] && controller.overwriteModel) {
          controller.overwriteModel(item['#'], item);
        }
      });
    });

    this.registerAction('refresh', (data: any, controller: any) => {
      if (controller.refresh) {
        controller.refresh();
      }
    });

    this.registerAction('reload', (data: any, controller: any) => {
      if (data && controller.reload) {
        controller.reload(data);
      }
    });

    this.registerAction('success', (data: any, controller: any) => {
      const message = typeof data === 'string' ? data : data?.message || 'Success';
      if (controller.showSuccess) {
        controller.showSuccess(message);
      } else {
        console.log('Success:', message);
      }
    });

    this.registerAction('fail', (data: any, controller: any) => {
      const message = typeof data === 'string' ? data : data?.message || 'Error';
      if (controller.showError) {
        controller.showError(message);
      } else {
        console.error('Error:', message);
      }
    });

    this.registerAction('jump', (data: any, controller: any) => {
      const url = typeof data === 'string' ? data : data?.url;
      if (url) {
        if (typeof window !== 'undefined') {
          window.location.href = url;
        }
      }
    });

    this.registerAction('request', async (data: any, controller: any) => {
      if (controller.executeRequest) {
        await controller.executeRequest(data);
      }
    });
  }

  clear(): void {
    this.actions.clear();
    this.registerDefaultActions();
  }

  dispose(): void {
    this.actions.clear();
  }
}