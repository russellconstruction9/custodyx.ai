
console.log('🚀 index.tsx starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('📚 Imports loaded');
console.log('React version:', React.version);

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('🔧 Creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('🎨 Rendering App component...');
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
);

console.log('✅ Render complete!');
