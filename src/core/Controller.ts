import { IEficySchema } from '../interface';
import resolver from './resolver';
import EficySchema from '../models/EficySchema';
import Config from '../constants/Config';

export default class Controller {
  public schema: EficySchema;
  public componentMap: Record<string, any>;

  constructor(schema: IEficySchema, componentMap?: Record<string, any>) {
    this.schema = new EficySchema(schema);
    this.componentMap = componentMap || window[Config.defaultComponentMapName];
  }

  public resolver() {
    return resolver(this.schema.views, {
      componentMap: this.componentMap,
      containerName: 'eficy-controller-container',
    });
  }
}
