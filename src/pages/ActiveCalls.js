import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, TrendingUp, TrendingDown, Clock, User, ExternalLink, Twitter, Zap } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';

// Helper function to format PnL display
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

function ActiveCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingTokens, setRefreshingTokens] = useState(new Set());
  const [refreshMessage, setRefreshMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchActiveCalls();
  }, []);

  const fetchActiveCalls = async () => {
    try {
      console.log('Fetching calls from:', `${API_BASE_URL}/calls`);
      const response = await fetch(`${API_BASE_URL}/calls`);
      const data = await response.json();
      
      if (data.success) {
        const sortedCalls = (data.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCalls(sortedCalls);
        setLastUpdated(new Date());
        console.log(`✅ Loaded ${sortedCalls.length} active calls`);
      } else {
        console.error('API returned error:', data.error);
        setCalls([]);
      }
    } catch (error) {
      console.error('Error fetching active calls:', error);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('⚡ Starting OPTIMIZED refresh...');
      
      const response = await fetch(`${API_BASE_URL}/refresh-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('Refresh response:', data);
      
      if (data.success) {
        const { refreshedCount, skippedCount, errorCount } = data.data;
        setRefreshMessage(
          `⚡ LIGHTNING FAST! ${refreshedCount} updated, ${skippedCount} skipped (smart), ${errorCount} errors`
        );
        setTimeout(() => setRefreshMessage(''), 4000);
        
        // Fetch updated data
        await fetchActiveCalls();
      } else {
        setRefreshMessage('❌ Refresh failed. Try again.');
        setTimeout(() => setRefreshMessage(''), 3000);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshMessage('❌ Network error occurred.');
      setTimeout(() => setRefreshMessage(''), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshToken = async (contractAddress) => {
    setRefreshingTokens(prev => new Set(prev).add(contractAddress));
    
    try {
      const response = await fetch(`${API_BASE_URL}/refresh/${contractAddress}`, { 
        method: 'POST' 
      });
      
      if (response.ok) {
        await fetchActiveCalls();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      setRefreshingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractAddress);
        return newSet;
      });
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="relative">
          <div className="squid-loader animate-spin"></div>
          <div className="text-blue-400 mt-4 text-center animate-pulse">Loading calls...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 🔥 REDESIGNED HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-blue-800/10 border border-blue-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    Active Calls
                  </h1>
                  <p className="text-blue-300/80 text-lg">Live Solana token performance tracking</p>
                </div>
              </div>
              
              {lastUpdated && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  refreshing 
                    ? 'bg-blue-600/30 text-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 hover:scale-105 active:scale-95'
                } border border-blue-500/30 backdrop-blur-sm`}
              >
                <div className="flex items-center space-x-3">
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span>{refreshing ? 'Optimizing...' : 'Refresh All'}</span>
                </div>
                
                {!refreshing && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/0 via-blue-400/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
              
              {refreshMessage && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 backdrop-blur-sm border ${
                  refreshMessage.includes('⚡') 
                    ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                    : refreshMessage.includes('❌')
                    ? 'bg-red-600/20 text-red-300 border-red-500/30'
                    : 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                }`}>
                  {refreshMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 REDESIGNED CALLS TABLE */}
      <div className="rounded-2xl overflow-hidden border border-blue-500/20 bg-gray-900/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-500/20">
              <tr>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Token</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Caller</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Entry MCap</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Performance</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Score</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Current MCap</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Time</th>
                <th className="text-left p-6 text-blue-300 font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/10">
              {calls.map((call, index) => {
                const twitterInfo = call.user?.twitterInfo;
                const isLinked = call.user?.isLinked;
                const pnlPercent = call.performance?.pnlPercent || 0;
                const isPositive = pnlPercent >= 0;
                
                return (
                  <tr 
                    key={call.id} 
                    className={`group hover:bg-blue-600/5 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-900/10'
                    }`}
                  >
                    {/* Token */}
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-400/20">
                          <span className="text-white font-bold text-lg">
                            {call.token?.symbol?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-lg">
                            {call.token?.symbol || 'Unknown'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {call.token?.name || 'Unknown Token'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Caller */}
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center">
                            {isLinked ? (
                              <Twitter className="w-5 h-5 text-blue-400" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <div className="min-w-0">
                          {isLinked && twitterInfo ? (
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-300 font-medium truncate">
                                  @{twitterInfo.twitterUsername}
                                </span>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                              </div>
                              {twitterInfo.twitterName && (
                                <div className="text-gray-500 text-sm truncate">
                                  {twitterInfo.twitterName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-300 font-medium truncate">
                              {call.user?.displayName || call.user?.username || 'Anonymous'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Entry MCap */}
                    <td className="p-6">
                      <div className="text-white font-medium">
                        ${formatNumber(call.prices?.entryMarketCap || 0)}
                      </div>
                    </td>

                    {/* Performance */}
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isPositive ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className={`font-bold text-lg ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPnLDisplay(pnlPercent)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-300 font-bold text-lg">
                          {(call.performance?.score || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Current MCap */}
                    <td className="p-6">
                      <div className="text-white font-medium">
                        ${formatNumber(call.prices?.currentMarketCap || 0)}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400 text-sm">
                          {formatTime(call.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRefreshToken(call.contractAddress)}
                          disabled={refreshingTokens.has(call.contractAddress)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Refresh token data"
                        >
                          <RefreshCw className={`w-4 h-4 ${
                            refreshingTokens.has(call.contractAddress) ? 'animate-spin' : ''
                          }`} />
                        </button>
                        <Link
                          to={`/token/${call.contractAddress}`}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                          title="View token details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {calls.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-400/20 mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-gray-300 text-xl font-semibold mb-2">No Active Calls</div>
            <div className="text-gray-500 text-sm max-w-md mx-auto">
              Token calls will appear here when users post contract addresses in Telegram
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveCalls;