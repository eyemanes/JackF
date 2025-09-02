import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, LogOut, User, Copy, Check } from 'lucide-react';

const AuthButton = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [linkingCode, setLinkingCode] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Generate linking code when user authenticates
  useEffect(() => {
    if (authenticated && user?.twitter) {
      generateLinkingCode();
    }
  }, [authenticated, user]);

  const generateLinkingCode = async () => {
    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in Firebase with user's Twitter info
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';
      const response = await fetch(`${API_BASE_URL}/generate-linking-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twitterId: user.twitter.id,
          twitterUsername: user.twitter.username,
          twitterName: user.twitter.name,
          linkingCode: code
        }),
      });

      if (response.ok) {
        setLinkingCode(code);
      }
    } catch (error) {
      console.error('Error generating linking code:', error);
    }
  };

  const copyCode = async () => {
    if (linkingCode) {
      await navigator.clipboard.writeText(linkingCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

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
              {user?.twitter?.username ? `@${user.twitter.username}` : 'User'}
            </div>
            <div className="text-gray-400 text-xs">
              Twitter Connected
            </div>
          </div>
        </div>

        {/* Linking Code Section */}
        {linkingCode && (
          <div className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2">
            <div className="text-sm">
              <div className="text-green-400 font-mono text-lg font-bold">
                {linkingCode}
              </div>
              <div className="text-green-300 text-xs">
                Link to Telegram
              </div>
            </div>
            <button
              onClick={copyCode}
              className="p-1 text-green-400 hover:text-green-300 transition-colors"
              title="Copy code"
            >
              {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
        
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
