import * as Tools from './utils';
import * as Models from './models';
import * as Mobx from 'mobx';
import Controller from './core/Controller';
import EficyComponent from './components/EficyComponent';

import resolver from './core/resolver';
import Config from './constants/Config';
import Plugins from './plugins';
import { install as installPlugin } from './plugins';
import render from './utils/renderHelper';
import ViewSchema from './models/ViewSchema';
import createElement from './utils/createElement';

export default Controller;

export {
  resolver,
  Config,
  Plugins,
  installPlugin,
  render,
  ViewSchema,
  createElement,
  EficyComponent,
  Controller,
  Tools,
  Models,
  Mobx,
};
