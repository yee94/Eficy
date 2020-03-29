import axios from 'axios';
import { installAction } from './defaultActions';

export default {
  defaultComponentMap: {},
  needTransformPropsList: ['style'],
  successAlert: ({ msg }) => alert(`Success:${msg}`),
  failAlert: ({ msg }) => alert(`Error:${msg}`),
  loopExceptFns: [],
  requestInterceptors: axios.interceptors,
  installAction,
};
