import { ReactNode } from 'react';
import EficyNode from '../models/EficyNode';

export const ObservableChildren = (props: { eficyNode: EficyNode }) => {
  const nextChildren = eficyNode['#children'] ?? [eficyNode['#content']] ?? [];
  if (!nextChildren.length) {
    return null;
  }
  // 递归构建子节点的RenderNode
  return nextChildren.map((child: EficyNode | any) => {
    if (child instanceof EficyNode) {
      return doBuild(child);
    }
    return child;
  });
};
