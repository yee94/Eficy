import BasePlugin from './base';
import ViewNode from '../models/ViewNode';
import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';
import * as React from 'react';

declare module '../models/ViewNode' {
  export default interface ViewNode {
    '#bindValuePropName': string;
    value: any;
  }
}

export default class EficyInEficy extends BasePlugin {
  public static pluginName: string = 'eficy-in-eficy';

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewNode) {
    let SyncWrapComponent = next();
    if (schema['#view'] === 'Eficy') {
      SyncWrapComponent = React.forwardRef((props, ref) =>
        React.createElement(Component, {
          ...props,
          ref,
          componentMap: this.controller.componentLibrary,
          parentController: this.controller,
        }),
      );
    }
    return SyncWrapComponent;
  }
}
