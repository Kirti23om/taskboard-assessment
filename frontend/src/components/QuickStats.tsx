'use client';

import { useTodos } from '@/hooks/useTodos';

export default function QuickStats() {
  const { todos, isLoading } = useTodos('all');

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Todos:</span>
            <span className="font-medium">Loading...</span>
          </div>
          <div className="flex justify-between">
            <span>Completed:</span>
            <span className="font-medium text-green-600">Loading...</span>
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-medium text-orange-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Total Todos:</span>
          <span className="font-medium">{totalTodos}</span>
        </div>
        <div className="flex justify-between">
          <span>Completed:</span>
          <span className="font-medium text-green-600">{completedTodos}</span>
        </div>
        <div className="flex justify-between">
          <span>Pending:</span>
          <span className="font-medium text-orange-600">{pendingTodos}</span>
        </div>
      </div>
      
      {totalTodos > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Completion Rate:</span>
            <span className="font-medium">
              {Math.round((completedTodos / totalTodos) * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
