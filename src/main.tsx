import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';                // tvoj Nexora chat
import './styles/index.css';

// nove stranice
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Početna prezentacijska stranica */}
        <Route path="/" element={<Landing />} />

        {/* Auth stranice */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Glavni chatbot (trenutni App.tsx) */}
        <Route path="/chat" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
