import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, LogOut, User, Copy, Check, ChevronDown, Settings, MessageCircle, X, Save, RefreshCw } from 'lucide-react';

const AuthButton = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [linkingCode, setLinkingCode] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  // Generate linking code and fetch profile picture when user authenticates
  useEffect(() => {
    if (authenticated && user?.twitter) {
      generateLinkingCode();
      fetchProfilePicture();
      checkTelegramLinkStatus();
    }
  }, [authenticated, user]);

  const generateLinkingCode = async () => {
    setIsGeneratingCode(true);
    try {
      console.log('Generating linking code for user:', user?.twitter);
      console.log('Full user object:', user);
      console.log('Twitter object keys:', user?.twitter ? Object.keys(user.twitter) : 'No twitter object');
      console.log('Twitter object values:', user?.twitter ? Object.values(user.twitter) : 'No twitter object');
      console.log('Twitter object entries:', user?.twitter ? Object.entries(user.twitter) : 'No twitter object');
      
      // Log the full Twitter object structure for debugging
      if (user?.twitter) {
        console.log('Full Twitter object:', JSON.stringify(user.twitter, null, 2));
        console.log('Twitter object type:', typeof user.twitter);
        console.log('Twitter object constructor:', user.twitter.constructor.name);
        
        // Log each property individually
        Object.entries(user.twitter).forEach(([key, value]) => {
          console.log(`Twitter.${key}:`, value, `(type: ${typeof value})`);
        });
      }
      
      // Try different possible property names for Twitter ID
      let twitterId = user?.twitter?.id || 
                     user?.twitter?.userId || 
                     user?.twitter?.twitterId ||
                     user?.twitter?.sub ||
                     user?.twitter?.user_id;
      
      // If still no ID found, try to extract from any property that looks like an ID
      if (!twitterId && user?.twitter) {
        console.log('No standard ID found, searching for ID-like values...');
        for (const [key, value] of Object.entries(user.twitter)) {
          if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 5) {
            console.log(`Found potential ID in ${key}: ${value}`);
            twitterId = value;
            break;
          }
        }
      }
      
      const twitterUsername = user?.twitter?.username || 
                             user?.twitter?.screen_name ||
                             user?.twitter?.handle;
      
      const twitterName = user?.twitter?.name || 
                         user?.twitter?.display_name ||
                         user?.twitter?.full_name;
      
      console.log('Extracted Twitter data:', {
        twitterId,
        twitterUsername,
        twitterName
      });
      
      // Validate required user data
      if (!twitterId) {
        console.error('Missing Twitter ID:', user?.twitter);
        console.error('Available Twitter properties:', user?.twitter ? Object.keys(user.twitter) : 'None');
        alert('Error: Twitter ID not found. Please reconnect your Twitter account.');
        return;
      }
      
      if (!twitterUsername) {
        console.error('Missing Twitter username:', user?.twitter);
        alert('Error: Twitter username not found. Please reconnect your Twitter account.');
        return;
      }
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Validate the generated code
      if (!code || code.length !== 6) {
        console.error('Invalid linking code generated:', code);
        alert('Error: Failed to generate valid linking code. Please try again.');
        return;
      }
      
      // Store the code in Firebase with user's Twitter info
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';
      
      const requestData = {
        twitterId: twitterId,
        twitterUsername: twitterUsername,
        twitterName: twitterName || twitterUsername,
        profilePictureUrl: user?.twitter?.profilePictureUrl || null,
        linkingCode: code
      };
      
      // Final validation before sending
      if (!requestData.twitterId || !requestData.linkingCode) {
        console.error('Invalid request data:', requestData);
        alert('Error: Invalid request data. Please try again.');
        return;
      }
      
      console.log('Sending request to:', `${API_BASE_URL}/generate-linking-code`);
      console.log('Request data:', requestData);
      console.log('Full request data details:', JSON.stringify(requestData, null, 2));
      console.log('User twitter data:', user?.twitter);
      console.log('User twitter ID:', user?.twitter?.id);
      console.log('User twitter username:', user?.twitter?.username);
      console.log('User twitter name:', user?.twitter?.name);
      
      const response = await fetch(`${API_BASE_URL}/generate-linking-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      console.log('Full response data details:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        setLinkingCode(code);
        console.log('Linking code generated successfully:', code);
      } else {
        console.error('Failed to generate linking code:', responseData);
        console.error('Error details:', responseData.error);
        console.error('Full error response:', JSON.stringify(responseData, null, 2));
      }
    } catch (error) {
      console.error('Error generating linking code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      console.log('Twitter user data:', user?.twitter);
      
      // Try different possible profile image URL fields
      const profileImageUrl = user?.twitter?.profileImageUrl || 
                             user?.twitter?.profile_image_url ||
                             user?.twitter?.profileImage ||
                             user?.twitter?.avatar_url;
      
      if (profileImageUrl) {
        console.log('Found profile image URL:', profileImageUrl);
        setProfilePicture(profileImageUrl);
      } else {
        console.log('No profile image URL found in user data');
        // Try to construct Twitter profile image URL from username
        if (user?.twitter?.username) {
          const constructedUrl = `https://unavatar.io/twitter/${user.twitter.username}`;
          console.log('Trying constructed URL:', constructedUrl);
          setProfilePicture(constructedUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  const checkTelegramLinkStatus = async () => {
    setIsCheckingLink(true);
    try {
      // Extract Twitter ID
      let twitterId = user?.twitter?.id || 
                     user?.twitter?.userId || 
                     user?.twitter?.twitterId ||
                     user?.twitter?.sub ||
                     user?.twitter?.user_id;
      
      // If still no ID found, try to extract from any property that looks like an ID
      if (!twitterId && user?.twitter) {
        for (const [key, value] of Object.entries(user.twitter)) {
          if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 5) {
            twitterId = value;
            break;
          }
        }
      }

      if (!twitterId) {
        console.log('No Twitter ID found for checking Telegram link status');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';
      
      // Check if this Twitter account is linked to any Telegram account
      const response = await fetch(`${API_BASE_URL}/check-telegram-link/${twitterId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.linked) {
          console.log('Telegram account is linked:', data);
          setTelegramLinked(true);
        } else {
          console.log('Telegram account is not linked');
          setTelegramLinked(false);
        }
      } else {
        console.log('Could not check Telegram link status');
        setTelegramLinked(false);
      }
    } catch (error) {
      console.error('Error checking Telegram link status:', error);
      setTelegramLinked(false);
    } finally {
      setIsCheckingLink(false);
    }
  };

  const copyCode = async () => {
    if (linkingCode) {
      await navigator.clipboard.writeText(linkingCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleEditProfile = () => {
    console.log('Edit Profile clicked');
    setShowEditProfile(true);
    setShowProfileMenu(false);
  };

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await fetchProfilePicture();
      await generateLinkingCode();
      await checkTelegramLinkStatus();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile saving functionality
    console.log('Saving profile...');
    setShowEditProfile(false);
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
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-600/30 rounded-lg shadow-xl z-[99999] profile-dropdown">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-1">
                  <button
                    onClick={checkTelegramLinkStatus}
                    disabled={isCheckingLink}
                    className="p-2 text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50"
                    title="Check Telegram status"
                  >
                    <MessageCircle className={`w-4 h-4 ${isCheckingLink ? 'animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={handleRefreshProfile}
                    disabled={isRefreshing}
                    className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh profile"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {/* Edit Profile */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleEditProfile();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-white">Edit Profile</span>
                </button>



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
            className="fixed inset-0 z-[99998] modal-overlay"
            onClick={() => setShowProfileMenu(false)}
          />
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100000] profile-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditProfile(false);
              }
            }}
          >
            <div className="bg-gray-800/95 border border-gray-600/30 rounded-lg shadow-xl w-full max-w-md mx-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-600/30">
                <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-4">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-medium">
                      {user?.twitter?.name || 'User'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      @{user?.twitter?.username || 'user'}
                    </p>
                    <button
                      onClick={handleRefreshProfile}
                      disabled={isRefreshing}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50 mt-1"
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
                    </button>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.twitter?.name || ''}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter Username
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.twitter?.username ? `@${user.twitter.username}` : ''}
                      disabled
                      className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Twitter username cannot be changed</p>
                  </div>
                </div>

                {/* Telegram Connection Section */}
                <div className="border-t border-gray-600/30 pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-medium">Connect Telegram</h3>
                    {isCheckingLink && (
                      <div className="squid-loader" style={{ width: '16px', height: '16px' }}></div>
                    )}
                  </div>
                  
                  {telegramLinked ? (
                    <div className="space-y-3">
                      <div className="bg-green-600/20 border border-green-500/30 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-400" />
                          <div>
                            <div className="text-green-400 font-medium">
                              ✅ Telegram Account Linked!
                            </div>
                            <div className="text-green-300 text-sm">
                              Your Twitter account is connected to Telegram
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={checkTelegramLinkStatus}
                        disabled={isCheckingLink}
                        className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {isCheckingLink ? 'Checking...' : 'Refresh Status'}
                      </button>
                    </div>
                  ) : linkingCode ? (
                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm">
                        Send this code to @jackyscanbot to link your Telegram account:
                      </p>
                      <div className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 rounded-lg px-4 py-3">
                        <div className="flex-1">
                          <div className="text-green-400 font-mono text-2xl font-bold">
                            {linkingCode}
                          </div>
                          <div className="text-green-300 text-xs">
                            Expires in 10 minutes
                          </div>
                        </div>
                        <button
                          onClick={copyCode}
                          className="p-2 text-green-400 hover:text-green-300 transition-colors"
                          title="Copy code"
                        >
                          {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('Generate New Code button clicked');
                            generateLinkingCode();
                          }}
                          disabled={isGeneratingCode}
                          className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                          {isGeneratingCode ? 'Generating...' : 'New Code'}
                        </button>
                        <button
                          onClick={checkTelegramLinkStatus}
                          disabled={isCheckingLink}
                          className="flex-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                          {isCheckingLink ? 'Checking...' : 'Check Status'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm mb-3">
                        Generate a linking code to connect your Telegram account
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('Generate Linking Code button clicked');
                            generateLinkingCode();
                          }}
                          disabled={isGeneratingCode}
                          className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isGeneratingCode ? 'Generating...' : 'Generate Code'}
                        </button>
                        <button
                          onClick={checkTelegramLinkStatus}
                          disabled={isCheckingLink}
                          className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isCheckingLink ? 'Checking...' : 'Check Status'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-600/30">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
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
