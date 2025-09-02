import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import ActiveCalls from './pages/ActiveCalls';
import Leaderboard from './pages/Leaderboard';
import TokenDetail from './pages/TokenDetail';
import Profile from './pages/Profile';
import AuthButton from './components/AuthButton';
import { privyConfig } from './privy-config';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      console.log('Fetching stats from:', `${API_BASE_URL}/health`);
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log('Stats response status:', response.status);
      const data = await response.json();
      console.log('Stats data received:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <Router>
        <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="bg-black/50 backdrop-blur-md border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-white">
                  <span className="squid-gradient">🐙</span> <span className="gradient-text">Jack</span> <span className="text-white">Ace of Scans</span>
                </Link>
              </div>
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Active Calls
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse deep-sea-glow"></div>
                    <span className="text-blue-400 text-sm">Live</span>
                  </div>
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ActiveCalls />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/token/:contractAddress" element={<TokenDetail />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-black/50 backdrop-blur-md border-t border-blue-500/20 mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                <span>🐙 Jack Ace of Scans - Track your calls, climb the leaderboard</span>
              </div>
              {stats && (
                <div className="text-gray-400 text-sm">
                  <span>Uptime: {Math.floor(stats.uptime / 60)} minutes</span>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </PrivyProvider>
  );
}

export default App;
