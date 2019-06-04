import resolver from './core/resolver';
import Controller from './core/Controller';
import * as Tools from './utils';
import Config from './constants/Config';

export default { default: Controller, resolver, Tools, Config, render: Tools.renderHelper };
