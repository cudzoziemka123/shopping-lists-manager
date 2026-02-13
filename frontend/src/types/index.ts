// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// List types
export interface ShoppingList {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListRequest {
  title: string;
  description?: string;
}

// Item types
export const ItemStatus = {
  PENDING: 'pending',
  PURCHASED: 'purchased',
} as const;
export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

export const ItemPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
export type ItemPriority = (typeof ItemPriority)[keyof typeof ItemPriority];

export interface Item {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: ItemStatus;
  priority: ItemPriority;
  addedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  name: string;
  quantity: number;
  unit?: string;
  priority?: ItemPriority;
}

export interface UpdateItemRequest {
  name?: string;
  quantity?: number;
  unit?: string;
  status?: ItemStatus;
  priority?: ItemPriority;
}