import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'tdesign-react/es/style/index.css';
import enConfig from 'tdesign-react/es/locale/en_US';
import { ConfigProvider } from 'tdesign-react';
import './index.css';
import App from './App';
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider globalConfig={enConfig}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
