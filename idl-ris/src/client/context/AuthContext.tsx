import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, setToken, removeToken } from '../lib/auth';
import { api } from '../lib/api';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: UserProfile; token: string }>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const BYPASS_AUTH = true;

  const defaultDemoUser: UserProfile = {
    id: '1',
    email: 'demo@interiorduct.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'ADMIN'
  };

  const [user, setUser] = useState<UserProfile | null>(BYPASS_AUTH ? defaultDemoUser : null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (BYPASS_AUTH) {
      setIsLoading(false);
      return;
    }

    const token = getToken();
    if (token) {
      api
        .get('/auth/me')
        .then((response) => setUser(response.data))
        .catch(() => {
          removeToken();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    setToken(token);
    setUser(userData);
    return { user: userData, token };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: BYPASS_AUTH || !!user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
