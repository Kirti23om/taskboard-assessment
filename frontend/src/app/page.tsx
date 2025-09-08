'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TodoList from '@/components/TodoList';
import CreateTodoForm from '@/components/CreateTodoForm';
import BulkOperations from '@/components/BulkOperations';
import DevControls from '@/components/DevControls';
import QuickStats from '@/components/QuickStats';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
            <p className="text-gray-600">Welcome back, {user.email}</p>
          </div>
          <DevControls />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CreateTodoForm />
            <BulkOperations />
            <TodoList />
          </div>
          
          <div className="space-y-6">
            <QuickStats />
          </div>
        </div>
      </div>
    </div>
  );
}
