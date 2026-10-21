'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getAuthToken, setAuthToken, removeAuthToken, fetchApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchApi('/auth/profile');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
