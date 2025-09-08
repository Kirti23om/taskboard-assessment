'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTodos } from '@/hooks/useTodos';
import { Settings, LogOut, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function DevControls() {
  const { logout } = useAuth();
  const { refetch } = useTodos();
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [slowNetwork, setSlowNetwork] = useState(false);

  // Simulate slow network for testing
  const toggleSlowNetwork = () => {
    setSlowNetwork(!slowNetwork);
    if (typeof window !== 'undefined') {
      // This would be implemented with a service worker or network throttling
      console.log('Slow network mode:', !slowNetwork);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDevPanel(!showDevPanel)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Developer Controls"
      >
        <Settings size={20} />
      </button>

      {showDevPanel && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Developer Controls</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh Todos</span>
            </button>

            <button
              onClick={toggleSlowNetwork}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                slowNetwork 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {slowNetwork ? <WifiOff size={16} /> : <Wifi size={16} />}
              <span>{slowNetwork ? 'Slow Network ON' : 'Slow Network OFF'}</span>
            </button>

            <div className="border-t pt-3">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t text-xs text-gray-500">
            <p>Use these controls to test edge cases:</p>
            <ul className="mt-1 space-y-1">
              <li>• Slow network for race conditions</li>
              <li>• Refresh to test data consistency</li>
              <li>• Logout to test auth flows</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
