'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { Todo, TodoFilter } from '@/types';
import TodoItem from './TodoItem';
import EditTodoModal from './EditTodoModal';

export default function TodoList() {
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { todos, isLoading } = useTodos(filter);

  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-lg">Loading todos...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Todos</h2>
          <div className="flex space-x-2">
            {(['all', 'pending', 'completed'] as TodoFilter[]).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredTodos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'all' 
              ? 'No todos yet. Create your first todo!' 
              : `No ${filter} todos.`
            }
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onEdit={() => setEditingTodo(todo)}
              />
            ))}
          </div>
        )}
      </div>

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </>
  );
}
