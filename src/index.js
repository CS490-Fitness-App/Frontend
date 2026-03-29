import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
//import reportWebVitals from './reportWebVitals';
//import { registerLicense } from '@syncfusion/ej2-base';

// Registering Syncfusion<sup style="font-size:70%">&reg;</sup> license key
//registerLicense('Ngo9BigBOggjGyl/VkV+XU9AclRDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS3hTdUdlWX9beHZdTmRbUE91XA==');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
