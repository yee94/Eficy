import React, { useMemo } from 'react';
import { useSignalValue } from 'reactjs-signal';
import { EficySchema } from '../models/EficySchema';
import { ComponentRegistry } from '../core/ComponentRegistry';
import { VariableReplacer } from '../utils/VariableReplacer';
import { ActionHandler } from '../core/ActionHandler';
import { EficyRenderer } from './EficyRenderer';

interface EficyComponentProps {
  schema: EficySchema;
  componentRegistry: ComponentRegistry;
  variableReplacer: VariableReplacer;
  actionHandler: ActionHandler;
  context?: Record<string, any>;
}

export const EficyComponent: React.FC<EficyComponentProps> = ({
  schema,
  componentRegistry,
  variableReplacer,
  actionHandler,
  context = {}
}) => {
  const views = useMemo(() => {
    return schema.views;
  }, [schema]);

  if (views.length === 0) {
    return null;
  }

  if (views.length === 1) {
    return (
      <EficyRenderer
        node={views[0]}
        componentRegistry={componentRegistry}
        variableReplacer={variableReplacer}
        actionHandler={actionHandler}
        context={context}
      />
    );
  }

  return (
    <React.Fragment>
      {views.map(view => (
        <EficyRenderer
          key={view.id}
          node={view}
          componentRegistry={componentRegistry}
          variableReplacer={variableReplacer}
          actionHandler={actionHandler}
          context={context}
        />
      ))}
    </React.Fragment>
  );
};

export default EficyComponent;