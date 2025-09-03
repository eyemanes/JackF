import React, { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useParams } from 'react-router-dom';
import { 
  User, 
  Twitter, 
  MessageCircle, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  Image as ImageIcon,
  Save,
  Edit3,
  BarChart3,
  Calendar,
  Trophy,
  Star,
  Activity,
  Upload,
  X
} from 'lucide-react';

import Card from '../components/ui/Card';
import KPI from '../components/ui/KPI';
import Segmented from '../components/ui/Segmented';
import Badge from '../components/ui/Badge';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';

const Profile = () => {
  const { ready, authenticated, user } = usePrivy();
  const { username } = useParams();
  const [copied, setCopied] = useState('');
  const [userCalls, setUserCalls] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const fileInputRef = useRef(null);

  const timeRangeOptions = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '14d', label: '14d' },
    { value: '30d', label: '30d' }
  ];

  // Get Twitter profile picture URL
  const getTwitterProfilePicture = () => {
    // First try the actual profilePictureUrl from Twitter
    if (user?.twitter?.profilePictureUrl) {
      // Replace _normal with _400x400 for higher quality
      return user.twitter.profilePictureUrl.replace('_normal', '_400x400');
    }
    
    // Try other possible fields for profile picture
    const profilePic = user?.twitter?.picture || 
                      user?.twitter?.profile_image_url || 
                      user?.twitter?.profileImageUrl ||
                      user?.twitter?.avatar_url;
    
    if (profilePic) {
      // Replace _normal with _400x400 for higher quality
      return profilePic.replace('_normal', '_400x400');
    }
    
    // Fallback to constructed URL
    if (user?.twitter?.username) {
      return `https://unavatar.io/twitter/${user.twitter.username}`;
    }
    
    return null;
  };

  useEffect(() => {
    if (authenticated && user?.twitter) {
      fetchUserData();
      if (!username) { // Only check link status for own profile
        checkTelegramLinkStatus();
        loadUserBanner();
      }
    }
  }, [authenticated, user, username]);

  const loadUserBanner = async () => {
    try {
      const twitterId = getTwitterId();
      if (!twitterId) return;

      const response = await fetch(`${API_BASE_URL}/user-banner/${twitterId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bannerUrl) {
          setBannerUrl(data.bannerUrl);
        }
      }
    } catch (error) {
      console.error('Error loading user banner:', error);
    }
  };

  // 🔧 FIXED: Enhanced Twitter ID extraction (same as AuthButton)
  const getTwitterId = () => {
    if (!user?.twitter) {
      console.log('❌ No Twitter object in user');
      return null;
    }

    console.log('🔍 Full Twitter object for Profile:', JSON.stringify(user.twitter, null, 2));
    
    // Try all possible ID fields with priority order (Privy uses 'subject')
    const idFields = [
      'subject',    // Privy typically uses 'subject' for Twitter ID
      'id', 
      'userId', 
      'twitterId',
      'sub',
      'user_id'
    ];

    for (const field of idFields) {
      const value = user.twitter[field];
      if (value && typeof value === 'string' && /^\d+$/.test(value) && value.length > 5) {
        console.log(`✅ Profile - Found Twitter ID in field '${field}': ${value}`);
        return value;
      }
    }

    // If no standard field works, search all properties
    console.log('🔍 Profile - Searching all Twitter properties for ID-like values...');
    for (const [key, value] of Object.entries(user.twitter)) {
      if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 10) {
        console.log(`🔍 Profile - Found potential ID in '${key}': ${value}`);
        return value;
      }
    }

    console.log('❌ Profile - No Twitter ID found in any field');
    return null;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      let targetTwitterId;
      
      if (username) {
        // Viewing another user's profile - we need to find their Twitter ID by username
        // For now, we'll need to implement a lookup by username
        // This is a simplified approach - in a real app you'd have a proper user lookup
        console.log(`🔍 Fetching profile for username: ${username}`);
        console.log('❌ Username lookup not implemented yet - showing own profile instead');
        // TODO: Implement username to Twitter ID lookup
        // For now, fall back to own profile
        targetTwitterId = getTwitterId();
        if (!targetTwitterId) {
          console.log('❌ No Twitter ID found for fallback');
          return;
        }
      } else {
        // Viewing own profile
        targetTwitterId = getTwitterId();
        if (!targetTwitterId) {
          console.log('❌ Profile - No Twitter ID found for fetching user data');
          console.log('🛠️ Profile - Available Twitter object:', user?.twitter);
          return;
        }
      }

      console.log(`🔍 Fetching profile data for Twitter ID: ${targetTwitterId}`);
      const profileResponse = await fetch(`${API_BASE_URL}/user-profile/${targetTwitterId}`);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('📊 Profile data received:', profileData);
        console.log('📋 Raw profile response:', JSON.stringify(profileData, null, 2));
        
        // 🔍 DEBUG: Check if linking is working
        if (profileData.success) {
          console.log('🔍 Backend linking check:', {
            twitterId: targetTwitterId,
            isLinked: profileData.data?.isLinked,
            totalCalls: profileData.data?.totalCalls,
            linkedData: profileData.data?.linkedData
          });
          
          if (!profileData.data?.isLinked) {
            console.log('❌ Backend says NOT linked - possible issues:');
            console.log('1. telegramUsername missing in linking code');
            console.log('2. isUsed flag not set to true');
            console.log('3. twitterId mismatch');
            console.log('Check server console for detailed linking debug logs!');
          }
        }
        
        if (profileData.success) {
          const data = profileData.data;
          
          setUserCalls(data.recentCalls || []);
          
          setUserStats({
            totalCalls: data.totalCalls || 0,
            successfulCalls: data.successfulCalls || 0,
            totalScore: data.totalScore || 0,
            winRate: data.winRate || 0,
            bestCall: data.bestCall || 0,
            avgPnL: data.recentCalls?.length > 0 ? 
              data.recentCalls.reduce((sum, call) => sum + (call.pnlPercent || 0), 0) / data.recentCalls.length : 0
          });
          
          setTelegramLinked(data.isLinked || false);
          
          console.log('✅ Profile stats updated:', {
            totalCalls: data.totalCalls,
            winRate: data.winRate,
            totalScore: data.totalScore,
            isLinked: data.isLinked
          });
        }
      } else {
        console.error('Failed to fetch profile data:', profileResponse.status);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTelegramLinkStatus = async () => {
    setIsCheckingLink(true);
    try {
      const twitterId = getTwitterId();
      if (!twitterId) {
        console.log('No Twitter ID found for checking Telegram link status');
        setTelegramLinked(false);
        return;
      }

      console.log(`🔍 Checking link status for Twitter ID: ${twitterId}`);
      
      // Use the user-profile endpoint instead of check-telegram-link
      // because it has the proper linking logic
      const response = await fetch(`${API_BASE_URL}/user-profile/${twitterId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Profile endpoint response:', data);
        
        if (data.success && data.data.isLinked) {
          setTelegramLinked(true);
          console.log('✅ Account IS linked via profile endpoint');
        } else {
          setTelegramLinked(false);
          console.log('❌ Account NOT linked via profile endpoint');
        }
      } else {
        console.error('Profile endpoint failed:', response.status);
        setTelegramLinked(false);
      }
    } catch (error) {
      console.error('Error checking Telegram link status:', error);
      setTelegramLinked(false);
    } finally {
      setIsCheckingLink(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    } else {
      return num.toFixed(2);
    }
  };

  const formatPnLDisplay = (pnlPercent) => {
    const multiplier = (pnlPercent / 100) + 1;
    
    if (multiplier < 1) {
      return `${pnlPercent.toFixed(1)}%`;
    } else if (multiplier < 2) {
      return `+${pnlPercent.toFixed(1)}%`;
    } else {
      return `${multiplier.toFixed(1)}x`;
    }
  };

  const getTopCalls = (period) => {
    const now = new Date();
    const periodMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '14d': 14 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const filteredCalls = userCalls.filter(call => {
      const callTime = new Date(call.createdAt).getTime();
      return (now.getTime() - callTime) <= periodMs[period];
    });

    return filteredCalls
      .sort((a, b) => (b.performance?.pnlPercent || 0) - (a.performance?.pnlPercent || 0))
      .slice(0, 5);
  };

  const getRecentCalls = () => {
    return userCalls
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  // Handle file upload for banner
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingBanner(true);

    try {
      const twitterId = getTwitterId();
      if (!twitterId) {
        throw new Error('Twitter ID not found');
      }

      // Create form data
      const formData = new FormData();
      formData.append('banner', file);
      formData.append('twitterId', twitterId);

      // Upload to backend
      const response = await fetch(`${API_BASE_URL}/upload-banner`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBannerUrl(data.bannerUrl);
          setIsEditingBanner(false);
          console.log('✅ Banner uploaded successfully:', data.bannerUrl);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner. Please try again.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleBannerSave = async () => {
    try {
      const twitterId = getTwitterId();
      if (!twitterId) return;

      const response = await fetch(`${API_BASE_URL}/save-banner-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twitterId,
          bannerUrl
        })
      });

      if (response.ok) {
        setIsEditingBanner(false);
        console.log('✅ Banner URL saved successfully');
      } else {
        throw new Error('Failed to save banner URL');
      }
    } catch (error) {
      console.error('Error saving banner URL:', error);
      alert('Failed to save banner URL');
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="squid-loader"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">Please connect your account to view your profile</div>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-blue px-6 py-3 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="squid-loader"></div>
      </div>
    );
  }

  const twitterProfilePic = getTwitterProfilePicture();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {username ? `@${username}'s Profile` : 'Profile'}
          </h1>
          <p className="text-gray-400 text-sm">
            {username ? `${username}'s trading statistics and call history` : 'Your trading statistics and call history'}
          </p>
        </div>
      </div>

      {/* Profile Header with Banner */}
      <Card className="p-0 overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-500" />
            </div>
          )}
          
          {/* Banner Edit Button - Only show for own profile */}
          {!username && (
            <div className="absolute top-4 right-4">
              {isEditingBanner ? (
              <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Enter banner image URL"
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm w-64"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingBanner}
                  className="p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  title="Upload Image"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBannerSave}
                  disabled={isUploadingBanner}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingBanner(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingBanner(true)}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload progress indicator */}
          {isUploadingBanner && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-lg">Uploading banner...</div>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            {/* Profile Picture - USE ACTUAL TWITTER PFP */}
            <div className="w-20 h-20 rounded-full -mt-10 border-4 border-gray-900 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
              {twitterProfilePic ? (
                <img
                  src={twitterProfilePic}
                  alt="Profile Picture"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default icon if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`fallback-icon w-full h-full flex items-center justify-center ${twitterProfilePic ? 'hidden' : 'flex'}`}>
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {user?.twitter?.name || 'Anonymous User'}
              </h2>
              <p className="text-gray-400 text-lg">
                @{user?.twitter?.username || 'user'}
              </p>
              {!username && (
                <div className="flex items-center space-x-4 mt-2">
                  {telegramLinked ? (
                    <span className="text-green-400 text-sm font-medium">✅ Telegram Linked</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-sm font-medium">⏳ Telegram Not Linked</span>
                      <button
                        onClick={checkTelegramLinkStatus}
                        disabled={isCheckingLink}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
                      >
                        {isCheckingLink ? 'Checking...' : 'Refresh Status'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Profile Links */}
            <div className="flex items-center space-x-3">
              <a
                href={`https://twitter.com/${user?.twitter?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                title="View Twitter Profile"
              >
                <Twitter className="w-5 h-5" />
              </a>
              {telegramLinked && (
                <a
                  href={`https://t.me/${user?.twitter?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                  title="View Telegram Profile"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI 
          title="Total Calls" 
          value={userStats?.totalCalls || 0} 
          icon={BarChart3}
          size="sm"
        />
        <KPI 
          title="Win Rate" 
          value={`${(userStats?.winRate || 0).toFixed(1)}%`} 
          icon={Trophy}
          size="sm"
        />
        <KPI 
          title="Total Score" 
          value={(userStats?.totalScore || 0).toFixed(1)} 
          icon={Star}
          size="sm"
        />
        <KPI 
          title="Best Call" 
          value={formatPnLDisplay(userStats?.bestCall || 0)} 
          icon={TrendingUp}
          size="sm"
        />
      </div>

      {/* Top Calls */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Top Calls</h3>
          </div>
          <Segmented 
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            size="sm"
          />
        </div>
        <div className="space-y-2">
          {getTopCalls(timeRange).length > 0 ? (
            getTopCalls(timeRange).slice(0, 5).map((call, index) => (
              <div key={call.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <span className="text-yellow-400 text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{call.tokenSymbol || call.token?.symbol}</div>
                    <div className="text-gray-400 text-xs">{formatTime(call.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={(call.pnlPercent || call.performance?.pnlPercent || 0) >= 0 ? 'success' : 'error'}
                    size="sm"
                  >
                    {formatPnLDisplay(call.pnlPercent || call.performance?.pnlPercent || 0)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm text-center py-4">No calls in this period</div>
          )}
        </div>
      </Card>

      {/* Recent Calls Feed */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Recent Calls</h3>
        </div>
        
        <div className="space-y-2">
          {getRecentCalls().length > 0 ? (
            getRecentCalls().slice(0, 5).map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{(call.tokenSymbol || call.token?.symbol)?.charAt(0) || '?'}</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{call.tokenSymbol || call.token?.symbol} - {call.tokenName || call.token?.name}</div>
                    <div className="text-gray-400 text-xs">
                      ${formatNumber(call.entryMarketCap || call.prices?.entryMarketCap || 0)} • {formatTime(call.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={(call.pnlPercent || call.performance?.pnlPercent || 0) >= 0 ? 'success' : 'error'}
                    size="sm"
                  >
                    {formatPnLDisplay(call.pnlPercent || call.performance?.pnlPercent || 0)}
                  </Badge>
                  <div className="text-gray-400 text-xs mt-1">
                    Score: {(call.score || call.performance?.score || 0).toFixed(1)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm mb-1">No calls yet</div>
              <div className="text-gray-500 text-xs">Start making calls to see them here!</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;