import * as Tools from './utils';
import * as Models from './models';
import * as Mobx from 'mobx';
import { observer } from 'mobx-react';
import Controller from './core/Controller';
import EficyComponent from './components/EficyComponent';

import resolver from './core/resolver';
import Config from './constants/Config';
import Plugins from './plugins';
import { install as installPlugin } from './plugins';
import render from './utils/renderHelper';
import ViewNode from './models/ViewNode';
import createElement from './utils/createElement';
import { installAction } from './constants/defaultActions';

export default Controller;

Object.assign(Mobx, { observer });

export {
  resolver,
  Config,
  Plugins,
  installPlugin,
  installAction,
  render,
  ViewNode,
  createElement,
  EficyComponent,
  Controller,
  Tools,
  Models,
  Mobx,
};
