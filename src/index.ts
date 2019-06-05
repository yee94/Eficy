import resolver from './core/resolver';
import Controller from './core/Controller';
import Config from './constants/Config';
import Plugins from './plugins';
import * as Tools from './utils';
import * as Models from './models';
import renderHelper from './utils/renderHelper';

export default { default: Controller, resolver, Tools, Config, render: renderHelper, Models, Plugins };
