const controller = Eficy.render(
  {
    views: [
      {
        '#view': 'Select',
        placeholder: 'Please select a country',
        value: 'china',
        '#children': [
          {
            '#view': 'Select.Option',
            value: 'china',
            sadasd: 22,
            '#content': 'China',
          },
          {
            '#view': 'Select.Option',
            value: 'usa',
            sadasd: 22222222222222,
            '#content': 'U.S.A',
          },
        ],
      },
    ],
  },
  {
    dom: '#container',
  },
);
