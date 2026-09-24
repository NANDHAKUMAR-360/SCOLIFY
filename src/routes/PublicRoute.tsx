import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../store/authStore';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = authStore.getState();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
