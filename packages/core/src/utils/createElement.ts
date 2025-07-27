import { IEficySchema, IView } from '../interfaces/schema.type';
import React from 'react';
import EficyComponent from '../components/EficyComponent';

export default function(schema: IEficySchema | IView, componentMap?: Record<string, React.Component | any>) {
  return React.createElement(EficyComponent, { model: schema, componentMap });
}
