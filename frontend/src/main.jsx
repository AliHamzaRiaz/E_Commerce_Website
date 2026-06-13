import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

console.log('App version 2.0.0 is mounting...');
console.log('=== VERIFIED USING NEW CODE ===');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </HashRouter>
    </React.StrictMode>,
  )
}
