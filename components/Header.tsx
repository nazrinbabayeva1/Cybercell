
import React from 'react';
import { View } from '../types';
import { Icons } from './Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  onNewAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, onNewAnalysis }) => {
  const navItemClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500";
  const activeClasses = "bg-gray-800 text-cyan-400";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white flex items-center gap-2">
              <Icons.shieldCheck className="h-8 w-8 text-cyan-500" />
              <span className="font-bold text-lg">Log Classification Analysis Tool</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onNewAnalysis}
              className={`${navItemClasses} ${currentView === View.DASHBOARD ? activeClasses : inactiveClasses}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView(View.HISTORY)}
              className={`${navItemClasses} ${currentView === View.HISTORY ? activeClasses : inactiveClasses}`}
            >
              Log History
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
