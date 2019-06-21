import { Component } from 'react';
import EficyModel from './EficyModel';
import EficyController from '../../core/Controller';

export default class EficyComponent extends Component<{ model: EficyModel; componentMap: any }> {
  public static EficyModel: EficyModel;
  private controller: EficyController;

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
