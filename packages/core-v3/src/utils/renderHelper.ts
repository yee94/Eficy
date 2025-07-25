import ReactDOM from 'react-dom';
import Controller from '../core/Controller';
import { IEficySchema } from '../interface';

interface IRenderOptions {
  dom: string | HTMLElement;
  components: Record<string, any>;
}

export function renderReact(reactTree, dom) {
  dom = typeof dom === 'string' ? document.querySelector(dom) : dom;

  if (typeof dom !== 'object') {
    throw new Error('not define valid document');
  }

  ReactDOM.render(reactTree, dom);
}

export default function(schema: IEficySchema, options: string | HTMLElement | IRenderOptions) {
  if (!options) {
    throw new Error('render helper options not define');
  }
  let dom: any;
  let componentMap = {};
  if (typeof options === 'string') {
    dom = options;
  } else if (options.hasOwnProperty('dom')) {
    const opt = options as IRenderOptions;

    dom = opt.dom;
    componentMap = opt.components;
  } else {
    dom = options;
  }

  const controller = new Controller(schema, componentMap);

  setTimeout(() => {
    controller.render(dom);
  });

  return controller;
}
