'use client';

import { useState } from 'react';
import { Todo } from '@/types';
import { useTodos } from '@/hooks/useTodos';
import { Check, X, Edit2, Trash2 } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onEdit: () => void;
}

export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  const { toggleComplete, deleteTodo, isUpdating, isDeleting } = useTodos();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleComplete(todo);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todo.id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  return (
    <div 
      data-testid="todo-item"
      className={`p-4 border rounded-lg transition-all ${
        todo.completed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggle}
          disabled={isToggling || isUpdating}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-gray-300 hover:border-green-500'
          } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {todo.completed && <Check size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${
            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className={`mt-1 text-sm ${
              todo.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {todo.description}
            </p>
          )}
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <span>v{todo.version}</span>
            <span>
              {new Date(todo.lastModified).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit todo"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete todo"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
