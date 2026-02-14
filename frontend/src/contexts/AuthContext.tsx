import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);




export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
     const [user, setUser] = useState<User | null>(() => {
     const savedToken = localStorage.getItem('accessToken');
     if (!savedToken) return null;
     try {
       const payload = JSON.parse(atob(savedToken.split('.')[1]));
       return { id: payload.sub, username: payload.username, email: payload.email, createdAt: '' };
     } catch {
       return null;
     }
   });

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const { accessToken } = response;
    
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    setUser({ id: payload.sub, username: payload.username, email: payload.email, createdAt: new Date().toISOString() }); 
  };

  const register = async (data: RegisterRequest) => {
    const newUser = await authApi.register(data);
    setUser(newUser);
    
    // После регистрации автоматически логинимся
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