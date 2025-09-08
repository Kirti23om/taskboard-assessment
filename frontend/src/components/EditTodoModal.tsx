'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTodos } from '@/hooks/useTodos';
import { Todo, UpdateTodoRequest } from '@/types';
import { X } from 'lucide-react';

interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
}

export default function EditTodoModal({ todo, onClose }: EditTodoModalProps) {
  const { updateTodo, isUpdating } = useTodos();
  const [currentTodo, setCurrentTodo] = useState(todo);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateTodoRequest>({
    defaultValues: {
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      version: todo.version,
    },
  });

  useEffect(() => {
    setCurrentTodo(todo);
    reset({
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      version: todo.version,
    });
  }, [todo, reset]);

  const onSubmit = async (data: UpdateTodoRequest) => {
    try {
      const updatedTodo = await updateTodo({
        id: todo.id,
        data: {
          ...data,
          version: currentTodo.version,
        },
      });
      setCurrentTodo(updatedTodo);
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Todo</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 250,
                  message: 'Title must not exceed 250 characters',
                },
              })}
              type="text"
              className="input mt-1"
              maxLength={250}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input mt-1"
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('completed')}
              type="checkbox"
              id="completed"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
              Completed
            </label>
          </div>

          <div className="text-xs text-gray-500">
            Version: {currentTodo.version}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="btn btn-primary flex-1"
            >
              {isUpdating ? 'Updating...' : 'Update Todo'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
