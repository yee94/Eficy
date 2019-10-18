import axios from 'axios';

export default {
  defaultComponentMap: {},
  needTransformPropsList: ['style'],
  successAlert: ({ msg }) => alert(`Success:${msg}`),
  failAlert: ({ msg }) => alert(`Error:${msg}`),
  loopExceptFns: [],
  requestInterceptors: axios.interceptors,
};
