import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './pages/MapPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrapper
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <MapPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
