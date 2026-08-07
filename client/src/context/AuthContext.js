import React, { createContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getProfileApi } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stylehub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('stylehub_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      getProfileApi(token)
        .then(res => {
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('stylehub_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('stylehub_token', res.token);
        localStorage.setItem('stylehub_user', JSON.stringify(res.user));
      }
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerApi(userData);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('stylehub_token', res.token);
        localStorage.setItem('stylehub_user', JSON.stringify(res.user));
      }
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('stylehub_user');
    localStorage.removeItem('stylehub_token');
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('stylehub_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
};
