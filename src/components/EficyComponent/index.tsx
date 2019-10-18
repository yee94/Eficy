import { Component } from 'react';
import EficyModel from './EficyModel';
import EficyController from '../../core/Controller';

class EficyComponent extends Component<{ model: EficyModel; componentMap: any; parentController: EficyController }> {
  private controller: EficyController;
  public static EficyModel = EficyModel;

  constructor(props) {
    super(props);
    const { controller } = props.model;
    this.controller = controller || new EficyController(props.model, props.componentMap);
    if (props.model instanceof EficyModel) {
      props.model.bindController(this.controller);
      this.controller.parentController = props.parentController;
    }
  }

  public componentWillUnmount() {
    this.controller.destroy();
    if (this.props.model && this.props.model.removeController) {
      this.props.model.removeController(this.controller);
    }
  }

  public render() {
    return this.controller.resolver();
  }
}

EficyComponent.EficyModel = EficyModel;

export default EficyComponent;
