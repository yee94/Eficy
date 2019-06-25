import { IEficySchema } from '../interface';
import EficyController from '../index';
import React from 'react';

export default function(schema: IEficySchema, componentMap?: Record<string, React.Component>) {
  const controller = new EficyController(schema, componentMap);

  return controller.resolver();
}
