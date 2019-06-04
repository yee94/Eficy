import React from 'react';
import { IView } from '../interface';
import { generateUid } from '../utils';
import Config from '../constants/Config';

export default function resolver(schema: IView | IView[], options?: { componentMap?: any; containerName?: string }) {
  const { componentMap = window[Config.defaultComponentMapName] || {}, containerName = null } = options || {};

  if (schema instanceof Array) {
    const idProps = containerName ? { id: containerName } : {};
    return (
      <div {...idProps} className={`eficy-container ${containerName}`}>
        {schema.map(s => resolver(s, { componentMap }))}
      </div>
    );
  }
  const Component = componentMap[schema['#view']];

  if (!Component) {
    throw new Error(`Not found "${schema['#view']}" component`);
  }

  const id = schema['#'] || generateUid();

  console.log('render ' + schema['#view'], schema);

  return <Component {...schema} key={id} />;
}
