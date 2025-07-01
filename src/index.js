import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from "./App";
import './App.css';

import { Provider } from 'react-redux';      
import { store } from './redux/store';    

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>                   
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
