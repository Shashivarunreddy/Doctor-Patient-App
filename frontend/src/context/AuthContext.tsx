import { useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/auth';
import { authService } from '../services/auth.service';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            const userData = (res.data as { user?: typeof res.data }).user ?? res.data;
            setUser(userData as User);
            setIsAuthenticated(true);
          }
        } catch (error: unknown) {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (!status || status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          } else {
            console.error('Auth check failed with unexpected error:', error);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      if (isAuthenticated) await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        const userData = (res.data as { user?: typeof res.data }).user ?? res.data;
        setUser(userData as User);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
