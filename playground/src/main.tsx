import React from 'react';
import * as Eficy from '@eficy/core';
import ReactDOM from 'react-dom';
import { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import * as antd from 'antd';

import Layout from './layout/layout1';
// import Layout from './layout/layout2';
// import Layout from './layout/layout3';

import 'antd/dist/antd.min.css';

Eficy.Config.successAlert = ({ msg }) => antd.message.success(msg);
Eficy.Config.failAlert = ({ msg }) => antd.message.error(msg);
Eficy.Config.defaultComponentMap = Object.assign({}, antd, {});

import routes from '~react-pages';

const App = () => {
  return (
    <Layout routes={routes}>
      <Suspense fallback={<p>Loading...</p>}>
        {useRoutes([...routes, { path: '*', element: routes[0].element }])}
      </Suspense>
    </Layout>
  );
};

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root'),
);
