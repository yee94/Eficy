import { IEficySchema } from '../interface';
import resolver from './resolver';

export default class Controller {
  public schema: IEficySchema;
  public componentMap: Record<string, any>;

  constructor(schema: IEficySchema, componentMap = (window as any).EficyComponentMap || {}) {
    this.schema = schema;
    this.componentMap = componentMap;
  }

  public resolver() {
    return resolver(this.schema.views, {
      componentMap: this.componentMap,
      containerName: 'eficy-controller-container',
    });
  }
}
