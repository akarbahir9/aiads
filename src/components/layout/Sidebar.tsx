import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Library, Users, Bot, X } from 'lucide-react';

const navigation = [
  { name: 'Create Ad', href: '/', icon: LayoutGrid },
  { name: 'References', href: '/references', icon: Library },
  { name: 'Brands', href: '/brands', icon: Users },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-surface border-r border-border-color flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-border-color">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold ml-2 text-text-primary">AgencyBrain</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-text-secondary hover:text-text-primary">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)} // Close sidebar on navigation
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
