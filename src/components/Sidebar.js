import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Trophy, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from 'lucide-react';

const Sidebar = ({ stats, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleMouseEnter = () => {
    if (!isPinned) {
      clearTimeout(hoverTimeout);
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      const timeout = setTimeout(() => {
        setIsCollapsed(true);
      }, 300);
      setHoverTimeout(timeout);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
        setIsPinned(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col bg-gray-900/95 backdrop-blur-md border-r border-white/5 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } min-h-screen sticky top-0`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link to="/" className="text-xl font-bold text-white">
                <span className="text-blue-400">🐙</span> Jack
              </Link>
            )}
            <button
              onClick={togglePin}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isPinned ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          {/* Live Status */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            {!isCollapsed && <span className="text-blue-400 text-sm">Live</span>}
          </div>
          
          {/* Stats */}
          {!isCollapsed && stats && stats.stats && (
            <div className="text-gray-400 text-xs space-y-1">
              <div>🔥 {stats.stats.totalCalls} calls</div>
              <div>👥 {stats.stats.totalUsers} users</div>
            </div>
          )}
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
