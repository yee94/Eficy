import type { CSSProperties } from "react";

export type IEficySchema = {
  views: IView[];
  plugins?: IPlugin[];
} & any;

export type IView = {
  '#view': string; // component name
  '#'?: string; // id
  '#style'?: CSSProperties;
  '#children'?: IView[];
  '#className'?: string;
} & any;

export type IPlugin = string | [string, any];

export interface IActionProps {
  action: string;
  data?: any;
}

