import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

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