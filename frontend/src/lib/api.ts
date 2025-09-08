import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  BulkCreateTodoRequest,
  BulkDeleteTodoRequest,
  BulkDeleteResponse,
  TodoFilter,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('authToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },
};

// Todos API
export const todosApi = {
  getAll: async (filter?: TodoFilter): Promise<Todo[]> => {
    const params = filter ? { filter } : {};
    const response: AxiosResponse<Todo[]> = await api.get('/todos', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Todo> => {
    const response: AxiosResponse<Todo> = await api.get(`/todos/${id}`);
    return response.data;
  },

  create: async (data: CreateTodoRequest): Promise<Todo> => {
    const response: AxiosResponse<Todo> = await api.post('/todos', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTodoRequest): Promise<Todo> => {
    const response: AxiosResponse<Todo> = await api.patch(`/todos/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  bulkCreate: async (data: BulkCreateTodoRequest): Promise<Todo[]> => {
    const response: AxiosResponse<Todo[]> = await api.post('/todos/bulk-create', data);
    return response.data;
  },

  bulkDelete: async (data: BulkDeleteTodoRequest): Promise<BulkDeleteResponse> => {
    const response: AxiosResponse<BulkDeleteResponse> = await api.post('/todos/bulk-delete', data);
    return response.data;
  },
};

// Retry logic for GET requests
export const retryableGet = async <T>(fn: () => Promise<T>, retries = 1): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryableGet(fn, retries - 1);
    }
    throw error;
  }
};

export default api;
