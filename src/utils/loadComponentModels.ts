import forEachDeep from './forEachDeep';
import ViewNode from '../models/ViewNode';

export default function loadComponentModels(
  componentLibrary: Record<string, any>,
): Record<string, new (...args: any) => ViewNode> {
  const componentModelMap = {};

  forEachDeep(componentLibrary, objMaps => {
    Object.keys(objMaps).forEach(key => {
      const component = objMaps[key];
      if (component.EficyModel) {
        componentModelMap[key] = component.EficyModel;
      }
    });
  });

  return componentModelMap;
}
