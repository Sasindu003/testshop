import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so only users with one of the allowed roles can access it.
 * - Unauthenticated → /login
 * - Wrong role       → / (home)
 *
 * @param {string[]} roles - e.g. ['admin', 'owner']
 */
export default function RoleRoute({ roles = [], children }) {
  const { user, isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
