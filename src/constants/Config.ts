export default {
  defaultComponentMapName: 'EficyComponentMap',
  needTransformPropsList: ['style'],
  successAlert: ({ msg }) => alert(`Success:${msg}`),
  failAlert: ({ msg }) => alert(`Error:${msg}`),
  loopExceptFns: [obj => obj['#view'] === 'Eficy'],
};
