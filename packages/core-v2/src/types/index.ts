export interface IEficySchema {
  views: IView[];
  plugins?: IPluginConfig[];
  requests?: IRequestConfig[];
}

export interface IEficyConfig {
  componentMap?: Record<string, any>;
  defaultActions?: Record<string, IAction>;
  plugins?: IPluginConfig[];
  lifecycle?: {
    beforeRender?: LifecycleHook[];
    afterRender?: LifecycleHook[];
    beforeUpdate?: LifecycleHook[];
    afterUpdate?: LifecycleHook[];
  };
}

export interface IView {
  '#view'?: string;
  '#'?: string;
  '#children'?: IView[];
  '#if'?: string | boolean;
  '#content'?: string;
  '#request'?: IRequestConfig;
  [key: string]: any;
}

export interface IPluginConfig {
  name: string;
  options?: Record<string, any>;
  priority?: number;
}

export interface IRequestConfig {
  '#'?: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  immediately?: boolean;
  format?: (response: any) => IActionProps;
}

export interface IAction {
  (data: any, controller: any): void | Promise<void>;
}

export interface IActionProps {
  action: string;
  data?: any;
}

export type LifecycleHook = (context: any) => void | Promise<void>;

export interface IPlugin {
  name: string;
  priority: number;
  install(container: any): void;
  uninstall?(): void;
}

export interface IComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export interface IReplaceOptions {
  context?: Record<string, any>;
  skipFunctions?: boolean;
}