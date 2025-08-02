/**
 * EficyContext - 提供 Eficy 实例
 */

import { createContext, FC, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Eficy } from '../core/EficyCore';
import { HookType } from '../constants';

const EficyContext = createContext<Eficy | null>(null);

export interface EficyProviderProps {
  children: ReactNode;
  core?: Eficy;
}

/**
 * EficyProvider - 提供 Eficy 上下文
 */
export const EficyProvider: FC<EficyProviderProps> = ({ children, core }) => {
  const RootProvider = useMemo(() => {
    const coreInstance = core || new Eficy();

    const RootProvider = (props: any) => {
      useEffect(() => {
        coreInstance.pluginManager.executeHook(HookType.ROOT_MOUNT, {}, () => {});
        return () => {
          coreInstance.pluginManager.executeHook(HookType.ROOT_UNMOUNT, {}, () => {});
        };
      }, []);
      return <EficyContext.Provider value={coreInstance}>{props.children}</EficyContext.Provider>;
    };

    RootProvider.displayName = 'EficyRootProvider';
    RootProvider._eficy_root = true;

    return coreInstance.pluginManager.executeRenderHooks(RootProvider, {
      props: {},
    });
  }, [core]);

  return <RootProvider>{children}</RootProvider>;
};

/**
 * useEficy - 获取 Eficy 实例
 */
export function useEficyContext(): Eficy {
  const context = useContext(EficyContext);

  if (!context) {
    throw new Error('useEficyContext must be used within EficyProvider');
  }

  return context;
}
