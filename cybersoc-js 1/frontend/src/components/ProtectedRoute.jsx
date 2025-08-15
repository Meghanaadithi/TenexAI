import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../store';

export default function ProtectedRoute({ children }) {
  if (!auth.isLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
