import BasePlugin from './base';
import ViewSchema from '../models/ViewSchema';
import { Inject } from '../utils';

export default class AntForm extends BasePlugin {
  public static pluginName: string = 'ant-form';

  @Inject
  public componentWrap(next, component, schema: ViewSchema) {
    console.log(schema);
    if (schema['#view'] === 'Form') {
      // @ts-ignore
      component = window.antd.Form.create()(component);
      console.log('rewrite component', component);
    }
    next(component);
  }
}
