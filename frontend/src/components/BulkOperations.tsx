'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTodos } from '@/hooks/useTodos';
import { CreateTodoRequest } from '@/types';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface BulkCreateForm {
  todos: CreateTodoRequest[];
}

export default function BulkOperations() {
  const { todos, bulkCreate, bulkDelete, isBulkCreating, isBulkDeleting } = useTodos();
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCreateError, setBulkCreateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BulkCreateForm>({
    defaultValues: {
      todos: [{ title: '', description: '' }],
    },
  });

  const handleBulkCreate = async (data: BulkCreateForm) => {
    setBulkCreateError(null);
    try {
      await bulkCreate({ todos: data.todos });
      reset();
      setShowBulkCreate(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create todos';
      setBulkCreateError(message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} todos?`)) {
      try {
        await bulkDelete({ ids: selectedIds });
        setSelectedIds([]);
        setShowBulkDelete(false);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const toggleSelectTodo = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAllTodos = () => {
    setSelectedIds(todos.map(todo => todo.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Bulk Operations</h2>
      
      <div className="space-y-4">
        {/* Bulk Create */}
        <div>
          <button
            onClick={() => setShowBulkCreate(!showBulkCreate)}
            className="btn btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Bulk Create Todos</span>
          </button>

          {showBulkCreate && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <form onSubmit={handleSubmit(handleBulkCreate)} className="space-y-4">
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="grid grid-cols-2 gap-3">
                      <input
                        {...register(`todos.${index}.title` as const, {
                          maxLength: {
                            value: 250,
                            message: 'Title must not exceed 250 characters',
                          },
                        })}
                        type="text"
                        className="input"
                        placeholder={`Todo ${index + 1} title`}
                        maxLength={250}
                      />
                      <input
                        {...register(`todos.${index}.description` as const)}
                        type="text"
                        className="input"
                        placeholder={`Todo ${index + 1} description`}
                      />
                    </div>
                  ))}
                </div>

                {bulkCreateError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-medium">Bulk Create Failed</span>
                    </div>
                    <p className="mt-1 text-sm text-red-700">{bulkCreateError}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isBulkCreating}
                    className="btn btn-primary"
                  >
                    {isBulkCreating ? 'Creating...' : 'Create All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkCreate(false);
                      reset();
                      setBulkCreateError(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Bulk Delete */}
        <div>
          <button
            onClick={() => setShowBulkDelete(!showBulkDelete)}
            className="btn btn-danger w-full flex items-center justify-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Bulk Delete Todos</span>
          </button>

          {showBulkDelete && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllTodos}
                    className="btn btn-secondary text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="btn btn-secondary text-sm"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {todos.map((todo) => (
                    <label
                      key={todo.id}
                      className="flex items-center space-x-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(todo.id)}
                        onChange={() => toggleSelectTodo(todo.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{todo.title}</span>
                    </label>
                  ))}
                </div>

                {selectedIds.length > 0 && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="btn btn-danger"
                    >
                      {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Todos`}
                    </button>
                    <button
                      onClick={() => {
                        setShowBulkDelete(false);
                        setSelectedIds([]);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
