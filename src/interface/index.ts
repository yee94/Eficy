import { CSSProperties } from 'React';

export interface IEficySchema {
  views: IView[];
  plugins?: IPlugin[];
}

export type IView = {
  '#view': string; // component name
  '#'?: string; // id
  '#style'?: CSSProperties;
  '#children'?: IView[];
  '#className'?: string;
} & any;

export type IPlugin = string | [string, any];
