import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import api, { Endpoints } from '../services/api';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.log('Auth check failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    // We use URLSearchParams because the backend expects form-data for login
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const res = await api.post(Endpoints.login, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, user_id, role } = res.data;
    
    // Store session securely
    await SecureStore.setItemAsync('access_token', access_token);
    const userObj = { id: user_id, role, email: username };
    await SecureStore.setItemAsync('user_data', JSON.stringify(userObj));
    
    setUser(userObj);
    // Navigate will be handled by the Root Layout protection, 
    // but we can force a redirect here if needed.
    router.replace('/(tabs)');
  };

  const register = async (email: string, pass: string, name: string, role: string) => {
    await api.post(Endpoints.register, {
      email,
      password: pass,
      full_name: name,
      role
    });
    // Auto-login after register
    await login(email, pass);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
    router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
