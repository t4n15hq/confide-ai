import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Book, Home, Lock } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Confide.ai</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/chat"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/chat'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          
          <Link
            to="/journal"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/journal'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Book className="h-4 w-4" />
            Journal
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="h-4 w-4" />
          End-to-end encrypted
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;