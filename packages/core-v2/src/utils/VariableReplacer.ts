import { injectable, inject } from 'tsyringe';
import { isString, isObject, isArray, cloneDeep } from 'lodash';
import { isValidElement } from 'react';
import { SignalStore } from '../core/SignalStore';
import { IReplaceOptions } from '../types';
import { TOKENS } from '../container/tokens';

@injectable()
export class VariableReplacer {
  private static readonly VARIABLE_PATTERN = /\$\{([^}]+)\}/g;

  constructor(
    @inject(TOKENS.SIGNAL_STORE) private signalStore: SignalStore
  ) {}

  replace<T>(target: T, context: Record<string, any> = {}, options: IReplaceOptions = {}): T {
    const { skipFunctions = true } = options;
    
    if (target === null || target === undefined) {
      return target;
    }

    if (isString(target)) {
      return this.replaceString(target as string, context) as T;
    }

    if (isArray(target)) {
      return (target as any[]).map(item => 
        this.replace(item, context, options)
      ) as T;
    }

    if (isObject(target)) {
      if (skipFunctions && typeof target === 'function') {
        return target;
      }

      const result = cloneDeep(target) as Record<string, any>;
      
      Object.keys(result).forEach(key => {
        if (key.startsWith('@') && typeof result[key] === 'function') {
          // Skip event handlers that start with @
          return;
        }
        
        result[key] = this.replace(result[key], context, options);
      });

      return result as T;
    }

    return target;
  }

  private replaceString(str: string, context: Record<string, any>): string {
    return str.replace(VariableReplacer.VARIABLE_PATTERN, (match, expression) => {
      try {
        const value = this.evaluateExpression(expression.trim(), context);
        return value !== undefined ? String(value) : match;
      } catch (error) {
        console.warn(`Failed to evaluate expression: ${expression}`, error);
        return match;
      }
    });
  }

  private evaluateExpression(expression: string, context: Record<string, any>): any {
    // Create a safe evaluation context
    const evalContext = {
      ...context,
      models: this.getModelsProxy(),
      signals: this.getSignalsProxy(),
    };

    // Simple dot notation evaluation
    if (this.isSimpleDotNotation(expression)) {
      return this.evaluateDotNotation(expression, evalContext);
    }

    // For more complex expressions, use Function constructor with safe context
    try {
      const contextKeys = Object.keys(evalContext);
      const contextValues = contextKeys.map(key => evalContext[key]);
      
      const func = new Function(...contextKeys, `return ${expression}`);
      return func(...contextValues);
    } catch (error) {
      console.warn(`Failed to evaluate complex expression: ${expression}`, error);
      return undefined;
    }
  }

  private isSimpleDotNotation(expression: string): boolean {
    // Check if it's just property access like "models.input.value" or "user.name"
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(expression);
  }

  private evaluateDotNotation(expression: string, context: Record<string, any>): any {
    const parts = expression.split('.');
    let current = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      if (typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private getModelsProxy(): any {
    return new Proxy({}, {
      get: (target, prop: string) => {
        const signal = this.signalStore.getSignal(`model.${prop}`);
        return signal?.value;
      },
      set: (target, prop: string, value) => {
        this.signalStore.setValue(`model.${prop}`, value);
        return true;
      },
      has: (target, prop: string) => {
        return this.signalStore.getSignal(`model.${prop}`) !== undefined;
      },
      ownKeys: () => {
        // This is a simplified implementation
        // In practice, you might want to track all model keys
        return [];
      }
    });
  }

  private getSignalsProxy(): any {
    return new Proxy({}, {
      get: (target, prop: string) => {
        const signal = this.signalStore.getSignal(prop as string);
        return signal?.value;
      },
      set: (target, prop: string, value) => {
        this.signalStore.setValue(prop as string, value);
        return true;
      },
      has: (target, prop: string) => {
        return this.signalStore.getSignal(prop as string) !== undefined;
      }
    });
  }

  createContext(additionalContext: Record<string, any> = {}): Record<string, any> {
    return {
      ...additionalContext,
      models: this.getModelsProxy(),
      signals: this.getSignalsProxy(),
    };
  }

  replaceWithContext<T>(target: T, additionalContext: Record<string, any> = {}, options: IReplaceOptions = {}): T {
    const context = this.createContext(additionalContext);
    return this.replace(target, context, options);
  }
}