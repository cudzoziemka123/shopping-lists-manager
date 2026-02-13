import { apiClient } from './client';
import type { Item, CreateItemRequest, UpdateItemRequest } from '../types';

export const itemsApi = {
  getAll: async (listId: string): Promise<Item[]> => {
    const response = await apiClient.get(`/lists/${listId}/items`);
    return response.data;
  },

  create: async (listId: string, data: CreateItemRequest): Promise<Item> => {
    const response = await apiClient.post(`/lists/${listId}/items`, data);
    return response.data;
  },

  update: async (listId: string, itemId: string, data: UpdateItemRequest): Promise<Item> => {
    const response = await apiClient.patch(`/lists/${listId}/items/${itemId}`, data);
    return response.data;
  },

  delete: async (listId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/lists/${listId}/items/${itemId}`);
  },
};