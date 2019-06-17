const controller = Eficy.render(
  {
    views: [
      {
        '#': 'alert',
        '#view': 'Alert',
        message: 'Hello this is a Login demo ',
        type: 'info',
        showIcon: true,
      },
      {
        '#view': 'Alert',
        message: 'quick bind ${models.input.value} ${models.switch.checked} ${models.textarea.value}',
        type: 'success',
        showIcon: true,
      },
      {
        '#': 'input',
        '#view': 'Input',
        value: 'value',
      },
      {
        '#': 'textarea',
        '#view': 'Input.TextArea',
        '#bindValuePropName': 'value',
        value: 'value',
      },
      {
        '#': 'switch',
        '#view': 'Switch',
        checked: true,
      },
    ],
    reactions: [
      {
        expression: ctrl => ctrl.models.input.value,
        effect: (effectResult, ctrl) => (ctrl.models.alert.message = effectResult),
      },
    ],
    plugins: ['two-way-bind'],
  },
  {
    dom: '#container',
    components: window.antd,
  },
);
