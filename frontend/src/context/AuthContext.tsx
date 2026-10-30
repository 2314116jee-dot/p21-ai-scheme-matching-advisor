import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest, setCsrfToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const userData = await apiRequest<User>('/api/auth/me');
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<User> => {
    const res = await apiRequest<{ user: User; csrf_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    setCsrfToken(res.csrf_token);
    setUser(res.user);
    return res.user;
  };

  const adminLogin = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ user: User; csrf_token: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setCsrfToken(res.csrf_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: any): Promise<User> => {
    const res = await apiRequest<{ user: User; csrf_token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setCsrfToken(res.csrf_token);
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  const isAdmin = Boolean(user && user.roles && user.roles.includes('admin'));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
