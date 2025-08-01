/**
 * EficyContext - 提供 Eficy 实例
 */

import { createContext, FC, useContext, useMemo, type ReactNode } from 'react';
import { Eficy } from '../core/EficyCore';

const EficyContext = createContext<Eficy | null>(null);

export interface EficyProviderProps {
  children: ReactNode;
  core?: Eficy;
}

/**
 * EficyProvider - 提供 Eficy 上下文
 */
export const EficyProvider: FC<EficyProviderProps> = ({ children, core }) => {
  const coreInstance = useMemo(() => {
    return core || new Eficy();
  }, [core]);

  return <EficyContext.Provider value={coreInstance}>{children}</EficyContext.Provider>;
};

/**
 * useEficy - 获取 Eficy 实例
 */
export function useEficyContext(): Eficy {
  const context = useContext(EficyContext);

  if (!context) {
    throw new Error('useEficy must be used within EficyProvider');
  }

  return context;
}
