import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User, LoginRequest, RegisterRequest, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState<User | null>(null);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const { accessToken } = response;
    
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    
    // TODO: get user data from token or API
    // For now, set a placeholder
    setUser({ id: '', username: data.email, email: data.email, createdAt: '' });
  };

  const register = async (data: RegisterRequest) => {
    const newUser = await authApi.register(data);
    setUser(newUser);
    
    // After registration, automatically log in
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};