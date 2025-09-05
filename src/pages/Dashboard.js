import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  User, 
  ExternalLink, 
  Twitter, 
  Zap,
  Search,
  Filter,
  Trophy,
  Medal,
  Award,
  Copy,
  Check,
  Wifi,
  WifiOff
} from 'lucide-react';

import Card from '../components/ui/Card';
import KPI from '../components/ui/KPI';
import Segmented from '../components/ui/Segmented';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { getCurrentGroup, getLockedGroups } from '../config/groups';
import { useRealtimeCalls } from '../hooks/useSocket';

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

function Dashboard() {
  const { calls: realtimeCalls, loading: realtimeLoading, isConnected } = useRealtimeCalls();
  const [calls, setCalls] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copiedTokens, setCopiedTokens] = useState(new Set());
  
  const currentGroup = getCurrentGroup();
  const lockedGroups = getLockedGroups();

  const timeRangeOptions = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '14d', label: '14d' },
    { value: '30d', label: '30d' }
  ];

  // Use real-time data when available, fallback to API
  useEffect(() => {
    if (realtimeCalls.length > 0) {
      console.log('📊 Using real-time data:', realtimeCalls.length, 'calls');
      setCalls(realtimeCalls);
      setLoading(false);
      setLastUpdated(new Date());
    } else if (!realtimeLoading) {
      // Fallback to API if no real-time data
      console.log('📊 No real-time data, fetching from API');
      fetchData();
    }
  }, [realtimeCalls, realtimeLoading]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchActiveCalls(),
        fetchLeaderboard()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyContractAddress = async (contractAddress) => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopiedTokens(prev => new Set([...prev, contractAddress]));
      setTimeout(() => {
        setCopiedTokens(prev => {
          const newSet = new Set(prev);
          newSet.delete(contractAddress);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy contract address:', err);
    }
  };

  const fetchActiveCalls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Sort by PnL performance (highest first), then by creation time (newest first)
        const sortedCalls = (data.data || []).sort((a, b) => {
          const pnlA = a.performance?.pnlPercent || 0;
          const pnlB = b.performance?.pnlPercent || 0;
          
          // First sort by PnL (descending)
          if (pnlA !== pnlB) {
            return pnlB - pnlA;
          }
          
          // If PnL is the same, sort by creation time (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setCalls(sortedCalls);
        setLastUpdated(new Date());
      } else {
        console.error('API returned error:', data.error);
        setCalls([]);
      }
    } catch (error) {
      console.error('Error fetching active calls:', error);
      setCalls([]);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard?limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data);
      } else {
        console.error('Leaderboard API returned error:', data.error);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="text-gray-400 font-bold text-sm">#{rank}</span>;
  };

  // Calculate KPIs
  const liveCalls = calls.length;
  const avgPnL = calls.length > 0 
    ? calls.reduce((sum, call) => sum + (call.performance?.pnlPercent || 0), 0) / calls.length 
    : 0;
  const bestCall = calls.length > 0 
    ? Math.max(...calls.map(call => call.performance?.pnlPercent || 0)) 
    : 0;

  // Filter calls based on search
  const filteredCalls = calls.filter(call => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      call.token?.symbol?.toLowerCase().includes(searchLower) ||
      call.token?.name?.toLowerCase().includes(searchLower) ||
      call.user?.displayName?.toLowerCase().includes(searchLower) ||
      call.user?.twitterInfo?.twitterUsername?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="relative">
          <div className="squid-loader animate-spin"></div>
          <div className="text-blue-400 mt-4 text-center animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <p className="text-gray-400 text-sm">Live Solana token performance tracking</p>
            <span className="text-blue-400 text-sm">•</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 bg-${currentGroup.color}-400 rounded-full`}></div>
              <span className={`text-${currentGroup.color}-400 text-sm font-medium`}>{currentGroup.displayName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Offline</span>
              </>
            )}
          </div>
          
          <Segmented 
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            size="sm"
          />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI 
          title="Live Calls" 
          value={liveCalls} 
          icon={Zap}
          size="sm"
        />
        <KPI 
          title="Avg PnL (24h)" 
          value={formatPnLDisplay(avgPnL)} 
          icon={TrendingUp}
          size="sm"
        />
        <KPI 
          title="Best Call (24h)" 
          value={formatPnLDisplay(bestCall)} 
          icon={Trophy}
          size="sm"
        />
        <KPI 
          title="Last Update" 
          value={lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'} 
          icon={Clock}
          size="sm"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Active Calls Table (2/3) */}
        <div className="xl:col-span-2">
          <Card className="p-0">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold text-white">Active Calls</h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 bg-${currentGroup.color}-400 rounded-full`}></div>
                    <span className={`text-${currentGroup.color}-400 text-sm font-medium`}>{currentGroup.displayName}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tokens or callers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table compact sticky>
                <Table.Header sticky>
                  <tr>
                    <Table.HeaderCell>Token</Table.HeaderCell>
                    <Table.HeaderCell>Caller</Table.HeaderCell>
                    <Table.HeaderCell align="right">Entry Mcap</Table.HeaderCell>
                    <Table.HeaderCell align="right">Perf</Table.HeaderCell>
                    <Table.HeaderCell align="right">Score</Table.HeaderCell>
                    <Table.HeaderCell align="right">Current Mcap</Table.HeaderCell>
                    <Table.HeaderCell>Age</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </tr>
                </Table.Header>
                <Table.Body>
                  {filteredCalls.map((call, index) => {
                    const twitterInfo = call.user?.twitterInfo;
                    const isLinked = call.user?.isLinked;
                    const pnlPercent = call.performance?.pnlPercent || 0;
                    const isPositive = pnlPercent >= 0;
                    
                    return (
                      <Table.Row key={call.id} zebra index={index}>
                        {/* Token */}
                        <Table.Cell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-400/20 overflow-hidden">
                              {call.token?.image ? (
                                <img 
                                  src={call.token.image} 
                                  alt={call.token?.symbol || 'Token'} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span 
                                className="text-white font-bold text-sm"
                                style={{ display: call.token?.image ? 'none' : 'flex' }}
                              >
                                {call.token?.symbol?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <div className="text-white font-medium text-sm">
                                  {call.token?.symbol || 'Unknown'}
                                </div>
                                <button
                                  onClick={() => copyContractAddress(call.contractAddress)}
                                  className="p-0.5 hover:bg-gray-700/50 rounded transition-colors"
                                  title="Copy contract address"
                                >
                                  {copiedTokens.has(call.contractAddress) ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                                  )}
                                </button>
                              </div>
                              <div className="text-gray-400 text-xs">
                                {call.token?.name || 'Unknown Token'}
                              </div>
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Caller */}
                        <Table.Cell>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex-shrink-0">
                              {isLinked && call.user?.twitterProfilePic ? (
                                <img
                                  src={call.user.twitterProfilePic}
                                  alt={`@${call.user.twitterUsername}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {isLinked ? (
                                    <Twitter className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <User className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              {isLinked && twitterInfo ? (
                                <Link 
                                  to={`/profile/${twitterInfo.twitterUsername}`}
                                  className="text-blue-300 hover:text-blue-200 text-sm font-medium truncate block"
                                >
                                  @{twitterInfo.twitterUsername}
                                </Link>
                              ) : (
                                <div className="text-gray-300 text-sm font-medium truncate">
                                  {call.user?.displayName || call.user?.username || 'Anonymous'}
                                </div>
                              )}
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Entry MCap */}
                        <Table.Cell align="right">
                          <div className="text-white font-medium text-sm">
                            ${formatNumber(call.prices?.entryMarketCap || 0)}
                          </div>
                        </Table.Cell>

                        {/* Performance */}
                        <Table.Cell align="right">
                          <Badge 
                            variant={isPositive ? 'success' : 'error'}
                            size="sm"
                          >
                            {formatPnLDisplay(pnlPercent)}
                          </Badge>
                        </Table.Cell>

                        {/* Score */}
                        <Table.Cell align="right">
                          <div className="text-blue-300 font-bold text-sm">
                            {(call.performance?.score || 0).toFixed(1)}
                          </div>
                        </Table.Cell>

                        {/* Current MCap */}
                        <Table.Cell align="right">
                          <div className="text-white font-medium text-sm">
                            ${formatNumber(call.prices?.currentMarketCap || 0)}
                          </div>
                        </Table.Cell>

                        {/* Age */}
                        <Table.Cell>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-400 text-xs">
                              {formatTime(call.createdAt)}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell>
                          <div className="flex items-center space-x-1">
                            <Link
                              to={`/token/${call.contractAddress}`}
                              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all duration-200"
                              title="View token details"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>

            {filteredCalls.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-400/20 mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-gray-300 text-lg font-semibold mb-2">No Active Calls</div>
                <div className="text-gray-500 text-sm">
                  Token calls will appear here when users post contract addresses
                </div>
              </div>
            )}
          </Card>
          
          {/* Upcoming Groups */}
          <Card className="mt-6">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Group Progression</h3>
              <div className="space-y-3">
                {/* Current Group */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 bg-${currentGroup.color}-400 rounded-full`}></div>
                    <div>
                      <div className="text-white font-medium">{currentGroup.displayName}</div>
                      <div className="text-gray-400 text-sm">{currentGroup.description}</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                
                {/* Locked Groups */}
                {lockedGroups.map((group, index) => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 opacity-60">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 bg-${group.color}-400 rounded-full`}></div>
                      <div>
                        <div className="text-gray-300 font-medium">{group.displayName}</div>
                        <div className="text-gray-500 text-sm">{group.description}</div>
                      </div>
                    </div>
                    <Badge variant="warning" size="sm">Coming Soon</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Leaderboard Panel (1/3) */}
        <div className="xl:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Top 10</h2>
              <Segmented 
                options={timeRangeOptions}
                value={timeRange}
                onChange={setTimeRange}
                size="sm"
              />
            </div>
            
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.telegramId}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {user.isLinked && user.twitterProfilePic ? (
                        <img 
                          src={user.twitterProfilePic} 
                          alt={`@${user.twitterUsername}`}
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-white font-medium text-sm truncate">
                        {user.displayName || user.twitterUsername ? `@${user.twitterUsername}` : user.username ? `@${user.username}` : user.firstName || 'Anonymous'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {user.totalCalls} calls • {user.winRate.toFixed(1)}% wins
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 text-sm font-bold">
                      {user.totalScore.toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-xs">pts</div>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">No users on leaderboard yet</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
