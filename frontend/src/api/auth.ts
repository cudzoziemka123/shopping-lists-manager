import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};