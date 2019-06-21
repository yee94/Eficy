import BasePlugin from './base';
import ViewSchema from '../models/ViewSchema';
import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';
import * as React from 'react';

declare module '../models/ViewSchema' {
  export default interface ViewSchema {
    '#bindValuePropName': string;
    value: any;
  }
}

export default class EficyInEficy extends BasePlugin {
  public static pluginName: string = 'eficy-in-eficy';

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewSchema) {
    let SyncWrapComponent = next();
    if (schema['#view'] === 'Eficy') {
      SyncWrapComponent = React.forwardRef((props, ref) =>
        React.createElement(Component, {
          ...props,
          ref,
          componentMap: this.controller.componentLibrary,
        }),
      );
    }
    return SyncWrapComponent;
  }
}
