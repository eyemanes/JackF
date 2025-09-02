import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, LogOut, User } from 'lucide-react';

const AuthButton = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="flex items-center space-x-2">
        <div className="squid-loader" style={{ width: '20px', height: '20px' }}></div>
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center space-x-4">
        {/* User Profile Info */}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-400" />
          <div className="text-sm">
            <div className="text-white font-medium">
              {user?.twitter?.username ? `@${user.twitter.username}` : 
               user?.telegram?.username ? `@${user.telegram.username}` : 
               'User'}
            </div>
            <div className="text-gray-400 text-xs">
              {user?.twitter?.username && user?.telegram?.username ? 'Twitter + Telegram' :
               user?.twitter?.username ? 'Twitter' :
               user?.telegram?.username ? 'Telegram' : 'Connected'}
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="btn-blue flex items-center space-x-2 px-4 py-2 rounded-lg"
    >
      <LogIn className="w-4 h-4" />
      <span>Connect</span>
    </button>
  );
};

export default AuthButton;
