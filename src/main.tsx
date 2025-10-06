import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

import Login from './pages/login';
import Register from './pages/Register';
import ReactDOM from 'react-dom/client';
import React from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';
import ProtectedRoute from './routes/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <BrowserRouter>
  <Routes>
    {/* public */}
     <Route path="/" element={<Login />} />
     <Route path="/Login" element={<Login />} />
     <Route path="/Register" element={<Register />} />

    {/* protected */}
    <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard/>
      </ProtectedRoute>
    }/>
    {/* fallback */}
    <Route path="*" element={<Navigate to={"/"} replace />}/>
  </Routes>
  </BrowserRouter>
  </React.StrictMode>
);