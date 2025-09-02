import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
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
  Activity
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';

const Profile = () => {
  const { ready, authenticated, user } = usePrivy();
  const [copied, setCopied] = useState('');
  const [userCalls, setUserCalls] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  useEffect(() => {
    if (authenticated && user?.twitter) {
      fetchUserData();
      checkTelegramLinkStatus();
    }
  }, [authenticated, user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
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
        console.log('No Twitter ID found for fetching user data');
        return;
      }

      // Fetch user's calls (we'll need to create this endpoint)
      const callsResponse = await fetch(`${API_BASE_URL}/user-calls/${twitterId}`);
      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        if (callsData.success) {
          setUserCalls(callsData.data || []);
        }
      }

      // Calculate user statistics
      const calls = userCalls;
      const stats = {
        totalCalls: calls.length,
        successfulCalls: calls.filter(call => (call.performance?.pnlPercent || 0) > 0).length,
        totalScore: calls.reduce((sum, call) => sum + (call.performance?.score || 0), 0),
        avgPnL: calls.length > 0 ? calls.reduce((sum, call) => sum + (call.performance?.pnlPercent || 0), 0) / calls.length : 0,
        bestCall: Math.max(...calls.map(call => call.performance?.pnlPercent || 0), 0),
        winRate: calls.length > 0 ? (calls.filter(call => (call.performance?.pnlPercent || 0) > 0).length / calls.length) * 100 : 0
      };
      setUserStats(stats);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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

      const response = await fetch(`${API_BASE_URL}/check-telegram-link/${twitterId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.linked) {
          setTelegramLinked(true);
        } else {
          setTelegramLinked(false);
        }
      } else {
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
      '7d': 7 * 24 * 60 * 60 * 1000,
      '14d': 14 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000
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

  const handleBannerSave = () => {
    // TODO: Save banner URL to backend
    console.log('Saving banner URL:', bannerUrl);
    setIsEditingBanner(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🐙 Profile</h1>
          <p className="text-gray-400 mt-1">Your trading statistics and call history</p>
        </div>
      </div>

      {/* Profile Header with Banner */}
      <div className="squid-card rounded-xl overflow-hidden">
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
          
          {/* Banner Edit Button */}
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
                  onClick={handleBannerSave}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingBanner(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Check className="w-4 h-4" />
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
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center -mt-10 border-4 border-gray-900">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {user?.twitter?.name || 'Anonymous User'}
              </h2>
              <p className="text-gray-400 text-lg">
                @{user?.twitter?.username || 'user'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {telegramLinked ? (
                  <span className="text-green-400 text-sm font-medium">✅ Telegram Linked</span>
                ) : (
                  <span className="text-yellow-400 text-sm font-medium">⏳ Telegram Not Linked</span>
                )}
                <button
                  onClick={checkTelegramLinkStatus}
                  disabled={isCheckingLink}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
                >
                  {isCheckingLink ? 'Checking...' : 'Refresh Status'}
                </button>
              </div>
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
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="squid-card rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Total Calls</h3>
          </div>
          <div className="text-3xl font-bold text-white">{userStats?.totalCalls || 0}</div>
          <div className="text-gray-400 text-sm">All time calls made</div>
        </div>

        <div className="squid-card rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Win Rate</h3>
          </div>
          <div className="text-3xl font-bold text-white">{(userStats?.winRate || 0).toFixed(1)}%</div>
          <div className="text-gray-400 text-sm">Successful calls</div>
        </div>

        <div className="squid-card rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Total Score</h3>
          </div>
          <div className="text-3xl font-bold text-white">{(userStats?.totalScore || 0).toFixed(1)}</div>
          <div className="text-gray-400 text-sm">Leaderboard points</div>
        </div>

        <div className="squid-card rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Best Call</h3>
          </div>
          <div className="text-3xl font-bold text-white">{formatPnLDisplay(userStats?.bestCall || 0)}</div>
          <div className="text-gray-400 text-sm">Highest PnL achieved</div>
        </div>

        <div className="squid-card rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Avg PnL</h3>
          </div>
          <div className="text-3xl font-bold text-white">{formatPnLDisplay(userStats?.avgPnL || 0)}</div>
          <div className="text-gray-400 text-sm">Average performance</div>
        </div>

        <div className="squid-card rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Active Days</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {userCalls.length > 0 ? new Set(userCalls.map(call => new Date(call.createdAt).toDateString())).size : 0}
          </div>
          <div className="text-gray-400 text-sm">Days with calls</div>
        </div>
      </div>

      {/* Top Calls by Period */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['7d', '14d', '1m'].map((period) => (
          <div key={period} className="squid-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Top Calls ({period})</h3>
            </div>
            <div className="space-y-3">
              {getTopCalls(period).length > 0 ? (
                getTopCalls(period).map((call, index) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <span className="text-yellow-400 text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{call.token?.symbol}</div>
                        <div className="text-gray-400 text-xs">{formatTime(call.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${(call.performance?.pnlPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPnLDisplay(call.performance?.pnlPercent || 0)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Score: {(call.performance?.score || 0).toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-4">No calls in this period</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Calls Feed */}
      <div className="squid-card rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Recent Calls Feed</h3>
        </div>
        
        <div className="space-y-4">
          {getRecentCalls().length > 0 ? (
            getRecentCalls().map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{call.token?.symbol?.charAt(0) || '?'}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{call.token?.symbol} - {call.token?.name}</div>
                    <div className="text-gray-400 text-sm">
                      Called at ${formatNumber(call.prices?.entryMarketCap || 0)} MCap
                    </div>
                    <div className="text-gray-500 text-xs">{formatTime(call.createdAt)}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {(call.performance?.pnlPercent || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-bold ${(call.performance?.pnlPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPnLDisplay(call.performance?.pnlPercent || 0)}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Score: {(call.performance?.score || 0).toFixed(1)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Current: ${formatNumber(call.prices?.currentMarketCap || 0)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No calls yet</div>
              <div className="text-gray-500 text-sm">Start making calls to see them here!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;