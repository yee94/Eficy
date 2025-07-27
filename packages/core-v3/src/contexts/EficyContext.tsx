import React, { createContext, useContext, ReactNode } from 'react';
import { LifecycleEventEmitter } from '../services/LifecycleEventEmitter';
import { PluginManager } from '../services/PluginManager';
import ComponentRegistry from '../services/ComponentRegistry';

/**
 * Eficy 全局上下文接口
 */
export interface IEficyContextValue {
  /** 生命周期事件发射器 */
  lifecycleEventEmitter: LifecycleEventEmitter;
  /** 插件管理器 */
  pluginManager: PluginManager;
  /** 组件注册表 */
  componentRegistry: ComponentRegistry;
}

/**
 * Eficy 全局上下文
 */
const EficyContext = createContext<IEficyContextValue | null>(null);

/**
 * Eficy Context Provider 属性
 */
export interface IEficyProviderProps {
  children: ReactNode;
  value: IEficyContextValue;
}

/**
 * Eficy Context Provider
 */
export const EficyProvider: React.FC<IEficyProviderProps> = ({ children, value }) => {
  return (
    <EficyContext.Provider value={value}>
      {children}
    </EficyContext.Provider>
  );
};

/**
 * 使用 Eficy Context 的 Hook
 */
export const useEficyContext = (): IEficyContextValue => {
  const context = useContext(EficyContext);
  if (!context) {
    throw new Error('useEficyContext must be used within EficyProvider');
  }
  return context;
};

/**
 * 可选的 Eficy Context Hook（可能返回 null）
 */
export const useOptionalEficyContext = (): IEficyContextValue | null => {
  return useContext(EficyContext);
};

export default EficyContext;