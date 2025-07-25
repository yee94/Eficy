import { Properties } from 'csstype';

export type IEficySchema = {
  views: IView[];
  plugins?: IPlugin[];
} & any;

export type IView = {
  '#view': string; // component name
  '#'?: string; // id
  '#style'?: Properties;
  '#children'?: IView[];
  '#className'?: string;
} & any;

export type IPlugin = string | [string, any];

export interface IActionProps {
  action: string;
  data?: any;
}

export type { ExtendsViewNode } from '../models/ViewNode';
