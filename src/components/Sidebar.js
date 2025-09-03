import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User,
  FileText
} from 'lucide-react';

const Sidebar = ({ stats, user }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/docs', label: 'Documentation', icon: FileText },
  ];

  return (
    <>
      {/* Desktop Sidebar - Icons Only */}
      <div className="hidden md:flex flex-col bg-gray-900/95 backdrop-blur-md border-r border-white/5 w-16 min-h-screen sticky top-0">
        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-6 h-6 ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                  }`} />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - Live Status */}
        <div className="p-2 border-t border-white/5">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Live"></div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/5 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
