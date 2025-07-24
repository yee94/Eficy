import 'reflect-metadata';
import React from 'react';
import Eficy from '@eficy/core-v2';
import { RequestPlugin } from '@eficy/plugin-request';
import { EventsPlugin } from '@eficy/plugin-events';
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import * as antd from 'antd';

import Layout from './layout/layout1';
// import Layout from './layout/layout2';
// import Layout from './layout/layout3';

// Global configuration for Eficy V2
Eficy.config({
  componentMap: {
    ...antd,
    'Layout.Sider': antd.Layout.Sider,
    'Layout.Header': antd.Layout.Header,
    'Layout.Content': antd.Layout.Content,
    'Input.TextArea': antd.Input.TextArea,
    'Select.Option': antd.Select.Option,
    'Radio.Group': antd.Radio.Group,
    'Radio.Button': antd.Radio.Button,
    'Checkbox.Group': antd.Checkbox.Group,
    'Form.Item': antd.Form.Item,
    'Upload.Dragger': antd.Upload.Dragger,
    'Input.Password': antd.Input.Password,
    'div': 'div',
    'p': 'p',
    'span': 'span',
    // Add any custom components here
  },
  defaultActions: {
    successAlert: (data: any) => {
      const message = typeof data === 'string' ? data : data?.msg || data?.message;
      antd.message.success(message);
    },
    failAlert: (data: any) => {
      const message = typeof data === 'string' ? data : data?.msg || data?.message;
      antd.message.error(message);
    },
  },
  plugins: [
    // Disabled plugins for now
    // {
    //   name: 'request',
    //   options: {
    //     baseURL: '/api',
    //     timeout: 10000,
    //   }
    // },
    // {
    //   name: 'events',
    //   options: {}
    // }
  ]
});

// Register plugin classes (disable for now due to issues)
// Eficy.registerPlugin('request', RequestPlugin)
//      .registerPlugin('events', EventsPlugin);

import routes from '~react-pages';

const App = () => {
  const ele = useRoutes([...routes, { path: '*', element: routes[0].element }]);
  return (
    <Layout routes={routes}>
      <Suspense fallback={<p>Loading...</p>}>
        {ele}
      </Suspense>
    </Layout>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <Router>
      <App />
    </Router>
  );
}