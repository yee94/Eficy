import { DependencyContainer } from 'tsyringe';
import { BasePlugin } from '../BasePlugin';
import { TOKENS } from '../../container/tokens';
import { IActionConfig } from '../../interfaces';

/**
 * 动作插件
 * 处理用户交互动作
 */
export class ActionPlugin extends BasePlugin {
  public readonly name = 'action';
  public readonly version = '1.0.0';
  public readonly singleton = true;

  private actions = new Map<string, Function>();
  private defaultActions: Record<string, Function> = {};

  protected onInstall(container: DependencyContainer, options?: any): void {
    // 注册默认动作
    this.registerDefaultActions();

    // 注册动作服务
    this.registerSingleton(TOKENS.ACTION_SERVICE, {
      register: this.register.bind(this),
      execute: this.execute.bind(this),
      has: this.has.bind(this),
      remove: this.remove.bind(this),
      getAll: this.getAll.bind(this),
      clear: this.clear.bind(this)
    });
  }

  protected onUninstall(container: DependencyContainer): void {
    this.actions.clear();
  }

  /**
   * 注册默认动作
   */
  private registerDefaultActions(): void {
    this.defaultActions = {
      // 更新动作
      update: (data: any, context: any) => {
        if (data && Array.isArray(data)) {
          for (const item of data) {
            if (item['#'] && context.models && context.models[item['#']]) {
              context.models[item['#']].update(item);
            }
          }
        }
      },

      // 重置动作
      reset: (data: any, context: any) => {
        if (data && Array.isArray(data)) {
          for (const item of data) {
            if (item['#'] && context.models && context.models[item['#']]) {
              context.models[item['#']].overwrite(item);
            }
          }
        }
      },

      // 显示成功消息
      success: (data: { msg: string }, context: any) => {
        const configService = context.resolve(TOKENS.CONFIG_SERVICE);
        const successAlert = configService.get('successAlert');
        if (successAlert) {
          successAlert(data);
        }
      },

      // 显示错误消息
      error: (data: { msg: string }, context: any) => {
        const configService = context.resolve(TOKENS.CONFIG_SERVICE);
        const failAlert = configService.get('failAlert');
        if (failAlert) {
          failAlert(data);
        }
      },

      // 请求动作
      request: async (data: any, context: any) => {
        const requestService = context.resolve(TOKENS.REQUEST_SERVICE);
        try {
          const result = await requestService.request(data);
          return result;
        } catch (error) {
          console.error('Request action failed:', error);
          throw error;
        }
      },

      // 导航动作
      navigate: (data: { url: string; replace?: boolean }, context: any) => {
        if (data.replace) {
          window.location.replace(data.url);
        } else {
          window.location.href = data.url;
        }
      },

      // 重新加载动作
      reload: () => {
        window.location.reload();
      }
    };

    // 注册所有默认动作
    for (const [name, action] of Object.entries(this.defaultActions)) {
      this.actions.set(name, action);
    }
  }

  /**
   * 注册动作
   */
  private register(name: string, action: Function): void {
    this.actions.set(name, action);
  }

  /**
   * 执行动作
   */
  private async execute(actionConfig: IActionConfig, context: any): Promise<any> {
    const { action: actionName, data, ...options } = actionConfig;
    
    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`Action "${actionName}" not found`);
    }

    try {
      return await action(data, context, options);
    } catch (error) {
      console.error(`Failed to execute action "${actionName}":`, error);
      throw error;
    }
  }

  /**
   * 检查动作是否存在
   */
  private has(name: string): boolean {
    return this.actions.has(name);
  }

  /**
   * 移除动作
   */
  private remove(name: string): boolean {
    return this.actions.delete(name);
  }

  /**
   * 获取所有动作
   */
  private getAll(): Record<string, Function> {
    const result: Record<string, Function> = {};
    for (const [name, action] of this.actions) {
      result[name] = action;
    }
    return result;
  }

  /**
   * 清空所有动作
   */
  private clear(): void {
    this.actions.clear();
    // 重新注册默认动作
    this.registerDefaultActions();
  }

  /**
   * 获取动作数量
   */
  private size(): number {
    return this.actions.size;
  }

  /**
   * 批量注册动作
   */
  private registerMany(actions: Record<string, Function>): void {
    for (const [name, action] of Object.entries(actions)) {
      this.register(name, action);
    }
  }
} 