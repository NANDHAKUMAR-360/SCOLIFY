import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../store/authStore';
import { LoadingState } from '../components/ui/LoadingState';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = authStore.getState();

  if (isLoading) {
    return <LoadingState message="Verifying student authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
