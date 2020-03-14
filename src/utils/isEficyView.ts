import { get } from './common';
import { ViewNode } from '../models';

export default function isEficyView(schema: any) {
  return schema instanceof ViewNode || !!get(schema, '#view', false);
}
