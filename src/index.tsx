import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // This now correctly points to src/App.tsx

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