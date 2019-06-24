import { IEficySchema } from '../interface';
import EficyController, { Config } from '../index';

export default function(schema: IEficySchema, componentMap = global[Config.defaultComponentMapName] || {}) {
  const controller = new EficyController(schema, componentMap);

  return controller.resolver();
}
