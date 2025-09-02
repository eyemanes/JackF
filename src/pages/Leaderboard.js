import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User, TrendingUp, Target, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-400 font-bold text-lg">#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30';
    return 'bg-white/5 border-white/10';
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
          <h1 className="text-3xl font-bold text-white">🐙 Leaderboard</h1>
          <p className="text-gray-400 mt-1">Top performers ranked by total score</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="btn-blue flex items-center space-x-2 px-4 py-2 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
          >
            <option value={10}>Top 10</option>
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Second Place */}
          <div className="order-1 md:order-1">
            <div className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 backdrop-blur-sm rounded-xl p-6 border border-gray-400/30 text-center">
              <div className="flex justify-center mb-4">
                <Medal className="w-12 h-12 text-gray-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {leaderboard[1].username ? `@${leaderboard[1].username}` : leaderboard[1].firstName}
              </div>
              <div className="text-gray-300 text-lg mb-2">
                {leaderboard[1].totalScore.toFixed(1)} pts
              </div>
              <div className="text-sm text-gray-400">
                {leaderboard[1].totalCalls} calls • {leaderboard[1].winRate.toFixed(1)}% wins
              </div>
            </div>
          </div>

          {/* First Place */}
          <div className="order-2 md:order-2">
            <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30 text-center transform md:scale-110">
              <div className="flex justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {leaderboard[0].username ? `@${leaderboard[0].username}` : leaderboard[0].firstName}
              </div>
              <div className="text-yellow-400 text-xl mb-2 font-bold">
                {leaderboard[0].totalScore.toFixed(1)} pts
              </div>
              <div className="text-sm text-gray-300">
                {leaderboard[0].totalCalls} calls • {leaderboard[0].winRate.toFixed(1)}% wins
              </div>
            </div>
          </div>

          {/* Third Place */}
          <div className="order-3 md:order-3">
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30 text-center">
              <div className="flex justify-center mb-4">
                <Award className="w-12 h-12 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {leaderboard[2].username ? `@${leaderboard[2].username}` : leaderboard[2].firstName}
              </div>
              <div className="text-amber-500 text-lg mb-2">
                {leaderboard[2].totalScore.toFixed(1)} pts
              </div>
              <div className="text-sm text-gray-400">
                {leaderboard[2].totalCalls} calls • {leaderboard[2].winRate.toFixed(1)}% wins
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-black/20 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Full Rankings</h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {leaderboard.map((user, index) => (
            <div
              key={user.telegramId}
              className={`p-6 ${getRankBg(user.rank)} border-l-4 transition-all hover:bg-white/10`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/50">
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-semibold text-lg">
                        {user.username ? `@${user.username}` : user.firstName || 'Anonymous'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Telegram ID: {user.telegramId}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-purple-400 text-xl font-bold">
                      {user.totalScore.toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-sm">Total Score</div>
                  </div>
                  <div>
                    <div className="text-blue-400 text-xl font-bold">
                      {user.totalCalls}
                    </div>
                    <div className="text-gray-400 text-sm">Total Calls</div>
                  </div>
                  <div>
                    <div className="text-green-400 text-xl font-bold">
                      {user.successfulCalls}
                    </div>
                    <div className="text-gray-400 text-sm">Successful</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-xl font-bold">
                        {user.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No users on the leaderboard yet</div>
            <div className="text-gray-500 text-sm mt-2">
              Start making token calls to climb the leaderboard!
            </div>
          </div>
        )}
      </div>

      {/* Scoring Information */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>How Scoring Works</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">Base Points by Performance</h4>
            <ul className="space-y-1">
              <li>• Below 1x: -2 points</li>
              <li>• 1x to 1.3x: -1 point</li>
              <li>• 1.3x to 1.8x: 0 points</li>
              <li>• 1.8x to 5x: +1 point</li>
              <li>• 5x to 10x: +2 points</li>
              <li>• 10x to 20x: +3 points</li>
              <li>• 20x to 50x: +4 points</li>
              <li>• 50x to 100x: +7 points</li>
              <li>• 100x to 200x: +10 points</li>
              <li>• 200x+: +15 points</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Market Cap Multipliers</h4>
            <ul className="space-y-1">
              <li>• Below $25k MC: ×0.5</li>
              <li>• $25k - $50k MC: ×0.75</li>
              <li>• $50k - $1M MC: ×1.0</li>
              <li>• Above $1M MC: ×1.5</li>
              <li><em>Only applies to positive points</em></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-2">Additional Rules</h4>
            <ul className="space-y-1">
              <li>• Time decay starts after 24 hours</li>
              <li>• Success threshold: 1.8x+ multiplier</li>
              <li>• Final = Base × MC × Time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
