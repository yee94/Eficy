import { CSSProperties } from 'React';

export interface IEficySchema {
  views: IView[];
  plugins: IPlugin[];
}

export interface IView {
  '#view': string; // component name
  '#'?: string; // id
  '#style'?: CSSProperties;
  '#className'?: string;
}

export type IPlugin = string | [string, any];
