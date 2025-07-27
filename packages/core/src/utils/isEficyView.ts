import { get } from './common';
import EficyNode from '../models/EficyNode';

export default function isEficyView(schema: any) {
  return schema instanceof EficyNode || !!get(schema, '#view', false);
}
