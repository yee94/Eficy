import { Component } from 'react';
import EficyModel from './EficyModel';
import EficyController from '../../core/Controller';

class EficyComponent extends Component<{ model: EficyModel; componentMap: any; parentController: EficyController }> {
  private controller: EficyController;
  public static EficyModel = EficyModel;

  constructor(props) {
    super(props);
    this.controller = new EficyController(props.model, props.componentMap);
    props.model.bindController(this.controller);
    this.controller.parentController = props.parentController;
  }

  public componentWillUnmount() {
    this.props.model.removeController(this.controller);
    this.controller.destroy();
  }

  public render() {
    return this.controller.resolver();
  }
}

EficyComponent.EficyModel = EficyModel;

export default EficyComponent;
