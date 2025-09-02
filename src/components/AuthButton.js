import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, LogOut, User, Copy, Check, ChevronDown, Settings, MessageCircle } from 'lucide-react';

const AuthButton = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [linkingCode, setLinkingCode] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Generate linking code and fetch profile picture when user authenticates
  useEffect(() => {
    if (authenticated && user?.twitter) {
      generateLinkingCode();
      fetchProfilePicture();
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

  const fetchProfilePicture = async () => {
    try {
      // Use Twitter's profile image URL from the user data
      if (user?.twitter?.profileImageUrl) {
        setProfilePicture(user.twitter.profileImageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
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
      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors border border-gray-600/30"
        >
          {/* Profile Picture or Default Icon */}
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-blue-400" />
          )}
          
          <div className="text-sm">
            <div className="text-white font-medium">
              {user?.twitter?.username ? `@${user.twitter.username}` : 'User'}
            </div>
          </div>
          
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-600/30 rounded-lg shadow-xl z-50">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div>
                  <div className="text-white font-medium">
                    {user?.twitter?.name || 'User'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    @{user?.twitter?.username || 'user'}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {/* Edit Profile */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Handle edit profile action
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-white">Edit Profile</span>
                </button>

                {/* Telegram Connection */}
                {linkingCode && (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">Connect Telegram</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2">
                      <div className="text-sm">
                        <div className="text-green-400 font-mono text-lg font-bold">
                          {linkingCode}
                        </div>
                        <div className="text-green-300 text-xs">
                          Send this code to @JackBot
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
                  </div>
                )}

                {/* Logout */}
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close menu */}
        {showProfileMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileMenu(false)}
          />
        )}
      </div>
    );
  }

  const handleTwitterLogin = async () => {
    try {
      // Direct Twitter login without modal
      await login({ loginMethod: 'twitter' });
    } catch (error) {
      console.error('Twitter login failed:', error);
    }
  };

  return (
    <button
      onClick={handleTwitterLogin}
      className="btn-blue flex items-center space-x-2 px-4 py-2 rounded-lg"
    >
      <LogIn className="w-4 h-4" />
      <span>Connect with Twitter</span>
    </button>
  );
};

export default AuthButton;
