import { IView } from '../interface';
import React from 'React';
import { generateUid } from '../utils';

export default function resolver(schema: IView | IView[], options?: { componentMap?: any; containerName?: string }) {
  const { componentMap = (global as any).EficyComponentMap || {}, containerName = null } = options || {};

  if (schema instanceof Array) {
    const idProps = containerName ? { id: containerName } : {};
    return (
      <div {...idProps} className={`eficy-container ${containerName}`}>
        {schema.map(s => resolver(s))}
      </div>
    );
  }
  const Component = componentMap[schema['#view']];

  const id = schema['#'] || generateUid();

  console.log(Component, schema['#view']);

  return <Component {...schema} key={id} />;
}
