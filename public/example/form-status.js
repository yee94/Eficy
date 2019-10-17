window.renderData = {
  views: [
    {
      '#view': 'Form',
      '#children': [
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Input',
              placeholder: 'unavailable choice',
              id: 'error',
            },
          ],
          label: 'Fail',
          validateStatus: 'error',
          help: 'Should be combination of numbers & alphabets',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Input',
              placeholder: 'Warning',
              id: 'warning',
            },
          ],
          label: 'Warning',
          validateStatus: 'warning',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Input',
              placeholder: "I'm the content is being validated",
              id: 'validating',
            },
          ],
          label: 'Validating',
          hasFeedback: true,
          validateStatus: 'validating',
          help: 'The information is being validated...',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Input',
              placeholder: "I'm the content",
              id: 'success',
            },
          ],
          label: 'Success',
          hasFeedback: true,
          validateStatus: 'success',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Input',
              placeholder: 'Warning',
              id: 'warning2',
            },
          ],
          label: 'Warning',
          hasFeedback: true,
          validateStatus: 'warning',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Input',
              placeholder: 'unavailable choice',
              id: 'error2',
            },
          ],
          label: 'Fail',
          hasFeedback: true,
          validateStatus: 'error',
          help: 'Should be combination of numbers & alphabets',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'DatePicker',
              style: {
                width: '100%',
              },
            },
          ],
          label: 'Success',
          hasFeedback: true,
          validateStatus: 'success',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'TimePicker',
              style: {
                width: '100%',
              },
            },
          ],
          label: 'Warning',
          hasFeedback: true,
          validateStatus: 'warning',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Select',
              '#children': [
                {
                  '#view': 'Option',
                  value: '1',
                  '#content': 'Option 1',
                },
                {
                  '#view': 'Option',
                  value: '2',
                  '#content': 'Option 2',
                },
                {
                  '#view': 'Option',
                  value: '3',
                  '#content': 'Option 3',
                },
              ],
              defaultValue: '1',
            },
          ],
          label: 'Error',
          hasFeedback: true,
          validateStatus: 'error',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Cascader',
              defaultValue: ['1'],
              options: [],
            },
          ],
          label: 'Validating',
          hasFeedback: true,
          validateStatus: 'validating',
          help: 'The information is being validated...',
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'Form.Item',
              '#children': [
                {
                  '#view': 'DatePicker',
                },
              ],
              validateStatus: 'error',
              help: 'Please select the correct date',
              style: {
                display: 'inline-block',
                width: 'calc(50% - 12px)',
              },
            },
            {
              '#view': 'span',
              '#content': '-',
              style: {
                display: 'inline-block',
                width: '24px',
                textAlign: 'center',
              },
            },
            {
              '#view': 'Form.Item',
              '#children': [
                {
                  '#view': 'DatePicker',
                },
              ],
              style: {
                display: 'inline-block',
                width: 'calc(50% - 12px)',
              },
            },
          ],
          label: 'inline',
          style: {
            marginBottom: 0,
          },
        },
        {
          '#view': 'Form.Item',
          '#children': [
            {
              '#view': 'InputNumber',
              style: {
                width: '100%',
              },
            },
          ],
          label: 'Success',
          hasFeedback: true,
          validateStatus: 'success',
        },
      ],
    },
  ],
};
