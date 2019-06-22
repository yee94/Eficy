import forEachDeep from './forEachDeep';
import ViewSchema from '../models/ViewSchema';

export default function loadComponentModels(
  componentLibrary: Record<string, any>,
): Record<string, new (...args: any) => ViewSchema> {
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
