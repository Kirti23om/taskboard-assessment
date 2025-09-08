'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { todosApi, retryableGet } from '@/lib/api';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter, BulkCreateTodoRequest, BulkDeleteTodoRequest } from '@/types';
import toast from 'react-hot-toast';

export function useTodos(filter: TodoFilter = 'all') {
  const queryClient = useQueryClient();

  const {
    data: todos = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['todos', filter],
    () => retryableGet(() => todosApi.getAll(filter)),
    {
      retry: 1,
      retryDelay: 1000,
    }
  );

  const createMutation = useMutation(todosApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      toast.success('Todo created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create todo';
      toast.error(message);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateTodoRequest }) => todosApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todos']);
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          toast.error('Todo was modified by another user. Please refresh and try again.');
        } else {
          const message = error.response?.data?.message || 'Failed to update todo';
          toast.error(message);
        }
      },
    }
  );

  const deleteMutation = useMutation(todosApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      toast.success('Todo deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete todo';
      toast.error(message);
    },
  });

  const bulkCreateMutation = useMutation(todosApi.bulkCreate, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      toast.success('Todos created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create todos';
      toast.error(message);
    },
  });

  const bulkDeleteMutation = useMutation(todosApi.bulkDelete, {
    onSuccess: (result) => {
      queryClient.invalidateQueries(['todos']);
      if (result.notFound.length > 0) {
        toast.error(`Some todos were not found: ${result.notFound.join(', ')}`);
      } else {
        toast.success('Todos deleted successfully!');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete todos';
      toast.error(message);
    },
  });

  // Optimistic toggle completion
  const toggleComplete = useCallback(
    async (todo: Todo) => {
      const originalTodos = queryClient.getQueryData(['todos', filter]);
      
      // Optimistic update
      queryClient.setQueryData(['todos', filter], (old: Todo[] = []) =>
        old.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
      );

      try {
        await updateMutation.mutateAsync({
          id: todo.id,
          data: {
            completed: !todo.completed,
            version: todo.version,
          },
        });
      } catch (error) {
        // Revert optimistic update on error
        queryClient.setQueryData(['todos', filter], originalTodos);
        throw error;
      }
    },
    [queryClient, filter, updateMutation]
  );

  return {
    todos,
    isLoading,
    error,
    refetch,
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    toggleComplete,
    bulkCreate: bulkCreateMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isBulkCreating: bulkCreateMutation.isLoading,
    isBulkDeleting: bulkDeleteMutation.isLoading,
  };
}
