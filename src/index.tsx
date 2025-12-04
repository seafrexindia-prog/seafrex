import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.tsx'; // Assuming you might have css file later, but standard Vite apps have this

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('Seafrex Portal: Application Starting...');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);