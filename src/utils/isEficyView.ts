import { get } from './common';
import { ViewSchema } from '../models';

export default function isEficyView(schema: any) {
  return schema instanceof ViewSchema || !!get(schema, '#view', false);
}
