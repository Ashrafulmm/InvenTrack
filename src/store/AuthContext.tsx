import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  skipLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      
      const userData: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: 'admin',
      };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) return { error: error.message };

      const userData: User = {
        id: data.user?.id || '',
        email,
        name,
        role: 'admin',
      };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    supabase.auth.signOut();
  };

  const skipLogin = () => {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@inventrack.local',
      name: 'Guest User',
      role: 'staff',
    };
    setUser(guestUser);
    localStorage.setItem('auth_user', JSON.stringify(guestUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, skipLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
