import React from 'react';
import ReactDOM from 'react-dom';
import App from './screens/App';
import './index.css';

// TODO: Describe
declare global {
  interface Window {
    require: any;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);