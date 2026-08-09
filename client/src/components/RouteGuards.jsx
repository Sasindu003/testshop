import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so only authenticated users can access it.
 * Redirects to /login with `from` state preserved for post-login redirect.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return null; // profile fetch in-flight — render nothing

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Wraps a route so only admin/owner users can access it.
 */
export function RequireAdmin({ children }) {
  const { isAdminOrOwner, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return null;

  if (!isAdminOrOwner) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
