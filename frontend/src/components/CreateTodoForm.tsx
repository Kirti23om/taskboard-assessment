'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTodos } from '@/hooks/useTodos';
import { CreateTodoRequest } from '@/types';
import { Plus } from 'lucide-react';

export default function CreateTodoForm() {
  const { createTodo, isCreating } = useTodos();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTodoRequest>();

  const onSubmit = async (data: CreateTodoRequest) => {
    try {
      await createTodo(data);
      reset();
      setIsExpanded(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (!isExpanded) {
    return (
      <div className="card">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <Plus size={20} />
          <span className="text-gray-600">Add a new todo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Create New Todo</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Enter todo title"
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
            placeholder="Enter todo description (optional)"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isCreating}
            className="btn btn-primary"
          >
            {isCreating ? 'Creating...' : 'Create Todo'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              reset();
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
