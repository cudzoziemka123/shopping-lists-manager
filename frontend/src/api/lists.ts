import { apiClient } from './client';
import type { ShoppingList, CreateListRequest } from '../types';

export const listsApi = {
  getAll: async (): Promise<ShoppingList[]> => {
    const response = await apiClient.get('/lists');
    return response.data;
  },
  getById: async (id: string): Promise<ShoppingList> => {
    const response = await apiClient.get(`/lists/${id}`);
    return response.data;
  },
  
  create: async (data: CreateListRequest): Promise<ShoppingList> => {
    const response = await apiClient.post('/lists', data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lists/${id}`);
  },
  
  addMember: async (listId: string, usernameOrEmail: string): Promise<void> => {
    await apiClient.post(`/lists/${listId}/members`, { usernameOrEmail });
  },

  removeMember: async (listId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/lists/${listId}/members/${memberId}`);
  },
};