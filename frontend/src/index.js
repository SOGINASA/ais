import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import MSWProvider from './providers/MSWProvider';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MSWProvider>
      <App />
    </MSWProvider>
  </React.StrictMode>
);
