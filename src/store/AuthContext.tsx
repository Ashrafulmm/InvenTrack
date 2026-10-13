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
    // Check for existing session in localStorage
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error reading auth from localStorage:', error);
      localStorage.removeItem('auth_user');
    }
    
    // Set loading to false after a short delay to ensure UI renders
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }
      
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
      console.error('Login exception:', err);
      return { error: err.message || 'Login failed. Please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      
      if (error) {
        console.error('Registration error:', error);
        return { error: error.message };
      }

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
      console.error('Registration exception:', err);
      return { error: err.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('auth_user');
      supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Supabase signout fails
      setUser(null);
      localStorage.removeItem('auth_user');
    }
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
