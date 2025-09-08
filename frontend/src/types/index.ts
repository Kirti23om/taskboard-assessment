export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  version: number;
  lastModified: string;
  ownerId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  version: number;
}

export interface BulkCreateTodoRequest {
  todos: CreateTodoRequest[];
}

export interface BulkDeleteTodoRequest {
  ids: string[];
}

export interface BulkDeleteResponse {
  deleted: string[];
  notFound: string[];
}

export type TodoFilter = 'all' | 'completed' | 'pending';
