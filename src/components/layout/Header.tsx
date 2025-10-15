import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-6 bg-surface border-b border-border-color flex-shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="md:hidden mr-4 text-text-secondary hover:text-text-primary"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl md:text-2xl font-semibold text-text-primary truncate">{title}</h2>
      </div>
      {/* User profile can be added here */}
    </header>
  );
};

export default Header;
