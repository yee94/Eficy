import { Component } from 'react';
import EficyModel from './EficyModel';
import EficyController from '../../core/Controller';

class EficyComponent extends Component<{ model: EficyModel; componentMap: any }> {
  private controller: EficyController;
  public static EficyModel = EficyModel;

  constructor(props) {
    super(props);
    this.controller = new EficyController(props.model, props.componentMap);
  }

  public componentWillUnmount() {
    this.controller.destroy();
  }

  public render() {
    return this.controller.resolver();
  }
}

EficyComponent.EficyModel = EficyModel;

export default EficyComponent;
