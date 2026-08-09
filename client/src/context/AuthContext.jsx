import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as authApi from '../api/auth';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('accessToken') || null,
  loading: false,
  initialized: false, // profile fetch attempted at least once
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true };
    case 'AUTH_SUCCESS':
      localStorage.setItem('accessToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        loading: false,
        initialized: true,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'PROFILE_LOADED':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, loading: false, initialized: true, user: action.payload };
    case 'PROFILE_UPDATED':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case 'AUTH_FAIL':
      return { ...state, loading: false, initialized: true };
    case 'LOGOUT':
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return { user: null, token: null, loading: false, initialized: true };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Hydrate user from server on mount (validates stored token)
  useEffect(() => {
    if (!state.token) {
      dispatch({ type: 'AUTH_FAIL' });
      return;
    }
    authApi
      .getProfile()
      .then(({ data }) => dispatch({ type: 'PROFILE_LOADED', payload: data.user }))
      .catch(() => dispatch({ type: 'LOGOUT' }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for forced logout emitted by axiosClient's 401 refresh failure
  useEffect(() => {
    const handle = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    const { data } = await authApi.login(credentials);
    dispatch({ type: 'AUTH_SUCCESS', payload: { token: data.accessToken, user: data.user } });
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'AUTH_START' });
    const { data } = await authApi.register(userData);
    dispatch({ type: 'AUTH_SUCCESS', payload: { token: data.accessToken, user: data.user } });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // best-effort: clear client state regardless
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const { data: updated } = await authApi.updateProfile(data);
    dispatch({ type: 'PROFILE_UPDATED', payload: updated.user });
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    initialized: state.initialized,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isOwner: state.user?.role === 'owner',
    isAdminOrOwner: ['admin', 'owner'].includes(state.user?.role),
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
