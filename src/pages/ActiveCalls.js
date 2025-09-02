import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, TrendingUp, TrendingDown, Clock, User, ExternalLink } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';

// Helper function to format PnL display
const formatPnLDisplay = (pnlPercent) => {
  const multiplier = (pnlPercent / 100) + 1;
  
  if (multiplier < 1) {
    // Negative PnL - show percentage
    return `${pnlPercent.toFixed(1)}%`;
  } else if (multiplier < 2) {
    // Positive PnL below 2x - show percentage
    return `+${pnlPercent.toFixed(1)}%`;
  } else {
    // Positive PnL 2x and above - show multiplier
    return `${multiplier.toFixed(1)}x`;
  }
};

function ActiveCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingTokens, setRefreshingTokens] = useState(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshMessage, setRefreshMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchActiveCalls();
  }, [page, sortBy, sortOrder]);

  const fetchActiveCalls = async () => {
    try {
      console.log('Fetching calls from:', `${API_BASE_URL}/calls`);
      const response = await fetch(`${API_BASE_URL}/calls`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Calls data:', data.data);
        console.log('Number of calls received:', data.data?.length || 0);
        
        // Log some sample data to see if it's updated
        if (data.data && data.data.length > 0) {
          console.log('Sample call data:', {
            tokenName: data.data[0].token?.name,
            tokenSymbol: data.data[0].token?.symbol,
            currentPrice: data.data[0].prices?.current,
            currentMarketCap: data.data[0].prices?.currentMarketCap,
            pnlPercent: data.data[0].performance?.pnlPercent,
            score: data.data[0].performance?.score,
            updatedAt: data.data[0].updatedAt,
            fullCallData: data.data[0] // Log full structure for debugging
          });
        }
        
        // Ensure calls are sorted by creation date (newest first) as fallback
        const sortedCalls = (data.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCalls(sortedCalls);
        setTotalPages(1); // No pagination for now
        setLastUpdated(new Date());
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
      console.log('🔄 Starting refresh of all token data...');
      
      // Call the new refresh-all endpoint to update all token data
      const response = await fetch(`${API_BASE_URL}/refresh-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Refresh all response status:', response.status);
      const data = await response.json();
      console.log('Refresh all response data:', data);
      
      if (data.success) {
        console.log(`✅ Successfully refreshed ${data.data.refreshedCount} tokens`);
        console.log(`📊 Results: ${data.data.refreshedCount} successful, ${data.data.errorCount} failed`);
        
        // Show success message
        if (data.data.refreshedCount > 0) {
          setRefreshMessage(`✅ Updated ${data.data.refreshedCount} tokens with fresh market data!`);
          // Clear message after 3 seconds
          setTimeout(() => setRefreshMessage(''), 3000);
        } else {
          setRefreshMessage('ℹ️ No tokens needed updating');
          setTimeout(() => setRefreshMessage(''), 2000);
        }
        
        // Now fetch the updated calls data
        console.log('🔄 Fetching updated calls data after refresh...');
        await fetchActiveCalls();
        console.log('✅ Calls data refreshed, checking for updates...');
      } else {
        console.error('❌ Refresh all failed:', data.error);
        setRefreshMessage('❌ Refresh failed. Please try again.');
        setTimeout(() => setRefreshMessage(''), 3000);
        // Still fetch the current data even if refresh failed
        await fetchActiveCalls();
      }
    } catch (error) {
      console.error('❌ Error refreshing all tokens:', error);
      setRefreshMessage('❌ Network error. Please check your connection.');
      setTimeout(() => setRefreshMessage(''), 3000);
      // Still fetch the current data even if refresh failed
      await fetchActiveCalls();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshToken = async (contractAddress) => {
    // Add to refreshing set
    setRefreshingTokens(prev => new Set(prev).add(contractAddress));
    
    try {
      console.log(`Refreshing token data for: ${contractAddress}`);
      const response = await fetch(
        `${API_BASE_URL}/refresh/${contractAddress}`,
        { method: 'POST' }
      );
      
      console.log('Refresh response status:', response.status);
      const data = await response.json();
      console.log('Refresh response data:', data);
      
      if (data.success) {
        console.log('Refresh successful, fetching updated calls...');
        await fetchActiveCalls();
      } else {
        console.error('Refresh failed:', data.error);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      // Remove from refreshing set
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
          <h1 className="text-3xl font-bold text-white">🐙 Active Token Calls</h1>
          <p className="text-gray-400 mt-1">Track live performance of recent Solana token calls</p>
          {lastUpdated && (
            <p className="text-gray-500 text-sm mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-blue flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing All...' : 'Refresh All'}</span>
          </button>
          {refreshMessage && (
            <div className={`text-sm px-3 py-1 rounded-lg transition-all duration-300 ${
              refreshMessage.includes('✅') 
                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                : refreshMessage.includes('❌')
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
            }`}>
              {refreshMessage}
            </div>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <span className="text-gray-300 text-sm">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
        >
          <option value="createdAt">Date</option>
          <option value="pnlPercent">PnL</option>
          <option value="score">Score</option>
          <option value="currentMarketCap">Market Cap</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Calls Table */}
      <div className="squid-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30 border-b border-blue-500/20">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Token</th>
                <th className="text-left p-4 text-gray-300 font-medium">Caller</th>
                <th className="text-left p-4 text-gray-300 font-medium">Call at: MCap</th>
                <th className="text-left p-4 text-gray-300 font-medium">Current Price</th>
                <th className="text-left p-4 text-gray-300 font-medium">PnL</th>
                <th className="text-left p-4 text-gray-300 font-medium">Score</th>
                <th className="text-left p-4 text-gray-300 font-medium">Market Cap</th>
                <th className="text-left p-4 text-gray-300 font-medium">Called</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {call.token?.symbol || 'Unknown'}
                          </span>

                        </div>
                        <div className="text-gray-400 text-sm">
                          {call.token?.name || 'Unknown Token'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        {call.user?.displayName || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">
                      ${formatNumber(call.prices?.entryMarketCap || 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">
                      ${call.prices?.current?.toFixed(8) || '0'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {(call.performance?.pnlPercent || 0) >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={`font-medium ${
                          (call.performance?.pnlPercent || 0) >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {formatPnLDisplay(call.performance?.pnlPercent || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-400 font-medium">
                      {(call.performance?.score || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">
                      ${formatNumber(call.prices?.currentMarketCap || call.marketData?.currentMarketCap || 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">
                        {formatTime(call.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRefreshToken(call.contractAddress)}
                        disabled={refreshingTokens.has(call.contractAddress)}
                        className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        title="Refresh token data"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshingTokens.has(call.contractAddress) ? 'animate-spin' : ''}`} />
                      </button>
                      <Link
                        to={`/token/${call.contractAddress}`}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="View token details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {calls.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No active calls found</div>
            <div className="text-gray-500 text-sm mt-2">
              Token calls will appear here when users post contract addresses
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ActiveCalls;
