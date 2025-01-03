import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Book, Lock } from 'lucide-react';
import { ThemeContext } from './Layout';

const NavigationBar = () => {
  const location = useLocation();
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Confide.ai</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/chat"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/chat'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          
          <Link
            to="/journal"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/journal'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            }`}
          >
            <Book className="h-4 w-4" />
            Journal
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          End-to-end encrypted
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;