import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

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

function TokenDetail() {
  const { contractAddress } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [calls, setCalls] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    if (contractAddress) {
      fetchTokenData();
      fetchSnapshots();
    }
  }, [contractAddress, timeframe]);

  const fetchTokenData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/${contractAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setTokenData(data.data);
        // For now, create a single call array since we're getting one call
        setCalls([data.data]);
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSnapshots = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens/${contractAddress}/snapshots?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setSnapshots(data.data.snapshots);
      }
    } catch (error) {
      console.error('Error fetching snapshots:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log(`Refreshing token data for: ${contractAddress}`);
      console.log(`API URL: ${API_BASE_URL}/refresh/${contractAddress}`);
      
      const response = await fetch(`${API_BASE_URL}/refresh/${contractAddress}`, { method: 'POST' });
      console.log('Refresh response status:', response.status);
      
      const data = await response.json();
      console.log('Refresh response data:', data);
      
      if (data.success) {
        console.log('Refresh successful, fetching updated data...');
        await fetchTokenData();
        await fetchSnapshots();
      } else {
        console.error('Refresh failed:', data.error);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
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

  const formatChartData = (snapshots) => {
    return snapshots.map(snapshot => ({
      timestamp: new Date(snapshot.timestamp).getTime(),
      time: new Date(snapshot.timestamp).toLocaleDateString(),
      price: snapshot.price,
      marketCap: snapshot.marketCap,
      liquidity: snapshot.liquidity,
      volume24h: snapshot.volume24h
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="squid-loader"></div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">Token not found</div>
        <div className="text-gray-500 text-sm mt-2">
          No data available for contract address: {contractAddress}
        </div>
      </div>
    );
  }

  const chartData = formatChartData(snapshots);
  const currentSnapshot = snapshots[snapshots.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-white">
              🐙 {tokenData.token?.name || 'Unknown Token'}
            </h1>
            <span className="text-xl text-gray-400">
              ({tokenData.token?.symbol || 'N/A'})
            </span>
          </div>
          <div className="text-gray-400 mt-1 font-mono text-sm">
            {contractAddress}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Price Chart */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Price Chart</h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
          >
            <option value="1h">1H</option>
            <option value="4h">4H</option>
            <option value="1d">1D</option>
            <option value="7d">7D</option>
            <option value="30d">30D</option>
          </select>
        </div>

        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(8)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [`$${value?.toFixed(8)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-400">No price data available</div>
          </div>
        )}
      </div>

      {/* Calls History */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-black/20 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Call History</h2>
            <span className="text-gray-400 text-sm">({calls.length} calls)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Rank</th>
                <th className="text-left p-4 text-gray-300 font-medium">Caller</th>
                <th className="text-left p-4 text-gray-300 font-medium">Entry Price</th>
                <th className="text-left p-4 text-gray-300 font-medium">Current Price</th>
                <th className="text-left p-4 text-gray-300 font-medium">PnL</th>
                <th className="text-left p-4 text-gray-300 font-medium">Score</th>
                <th className="text-left p-4 text-gray-300 font-medium">Called</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, index) => (
                <tr key={call.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">
                      {call.user?.displayName || 'Anonymous'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 font-mono">
                      ${call.prices?.entry?.toFixed(8) || '0'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-mono">
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
                    <span className="text-gray-400 text-sm">
                      {formatTime(call.timestamps?.createdAt || call.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {calls.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No calls found for this token</div>
            <div className="text-gray-500 text-sm mt-2">
              Be the first to call this token!
            </div>
          </div>
        )}
      </div>

      {/* External Links */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">External Links</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href={`https://dexscreener.com/solana/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Dexscreener</span>
          </a>
          <a
            href={`https://solscan.io/token/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Solscan</span>
          </a>
          <a
            href={`https://birdeye.so/token/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Birdeye</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default TokenDetail;
