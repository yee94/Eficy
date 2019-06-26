import axios from 'axios';

export default {
  defaultComponentMap: {},
  needTransformPropsList: ['style'],
  successAlert: ({ msg }) => alert(`Success:${msg}`),
  failAlert: ({ msg }) => alert(`Error:${msg}`),
  loopExceptFns: [obj => obj['#view'] === 'Eficy'],
  requestInterceptors: axios.interceptors,
};
