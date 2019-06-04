import ReactDOM from 'react-dom';
import Controller from '../core/Controller';
import { IEficySchema } from '../interface';

export default function(schema: IEficySchema, domQuery: string | HTMLElement) {
  const controller = new Controller(schema);

  ReactDOM.render(controller.resolver(), typeof domQuery === 'string' ? document.querySelector(domQuery) : domQuery);

  return controller;
}
