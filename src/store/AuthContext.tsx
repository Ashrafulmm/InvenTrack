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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify session with Supabase and localStorage
    const checkSession = async () => {
      try {
        // First check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Valid Supabase session exists
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: 'admin',
          };
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } else {
          // No valid Supabase session, clear localStorage
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('auth_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('auth_user');
      } else if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: 'admin',
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
