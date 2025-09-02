import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import ActiveCalls from './pages/ActiveCalls';
import Leaderboard from './pages/Leaderboard';
import TokenDetail from './pages/TokenDetail';
import Profile from './pages/Profile';
import AuthButton from './components/AuthButton';
import { privyConfig } from './privy-config';
import { BarChart3, Trophy, User, Home } from 'lucide-react';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jack-alpha.vercel.app/api';

// Sidebar Component
const Sidebar = ({ stats }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Active Calls', icon: Home },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-md border-r border-blue-500/20 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <Link to="/" className="text-2xl font-bold text-white">
          <span className="squid-gradient">🐙</span> <span className="gradient-text">Jack</span> <span className="text-white">Ace of Scans</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Live Status */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse deep-sea-glow"></div>
          <span className="text-blue-400 text-sm">Live</span>
        </div>
        
        {/* Auth Button */}
        <AuthButton />
        
        {/* Stats */}
        {stats && stats.stats && (
          <div className="mt-4 text-gray-400 text-xs">
            <div>🔥 {stats.stats.totalCalls} calls</div>
            <div>👥 {stats.stats.totalUsers} users</div>
          </div>
        )}
      </div>
    </div>
  );
};

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
      console.log('Database type:', data.database);
      console.log('Firebase stats:', data.stats);
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
        <div className="min-h-screen bg-black flex">
          {/* Sidebar */}
          <Sidebar stats={stats} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/" element={<ActiveCalls />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/token/:contractAddress" element={<TokenDetail />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-black/50 backdrop-blur-md border-t border-blue-500/20 p-6">
              <div className="text-gray-400 text-sm text-center">
                <span>🐙 Jack Ace of Scans - Track your calls, climb the leaderboard</span>
              </div>
            </footer>
          </div>
        </div>
      </Router>
    </PrivyProvider>
  );
}

export default App;
