import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import Dashboard from './pages/Dashboard';
import ActiveCalls from './pages/ActiveCalls';
import TokenDetail from './pages/TokenDetail';
import Profile from './pages/Profile';
import AuthButton from './components/AuthButton';
import Sidebar from './components/Sidebar';
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Stats data received:', data);
      console.log('Database type:', data.database);
      console.log('Firebase stats:', data.stats);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set fallback stats to prevent UI issues
      setStats({
        status: 'OK',
        message: 'Solana Tracker API is running',
        stats: { totalCalls: 0, totalUsers: 0 }
      });
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
        <div className="min-h-screen bg-black flex flex-col">
          {/* Top Header with Auth */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-white">
                <span className="text-blue-400">🐙</span> Jack
              </span>
            </div>
            <AuthButton />
          </div>

          <div className="flex flex-1">
            {/* Sidebar */}
            <Sidebar stats={stats} />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <main className="flex-1 p-6 pb-20 md:pb-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/calls" element={<ActiveCalls />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/token/:contractAddress" element={<TokenDetail />} />
                </Routes>
              </main>

              {/* Footer - Hidden on mobile */}
              <footer className="hidden md:block bg-black/50 backdrop-blur-md border-t border-blue-500/20 p-4">
                <div className="text-gray-400 text-sm text-center">
                  <span>🐙 Jack of all Scans - Track your calls, climb the leaderboard</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </Router>
    </PrivyProvider>
  );
}

export default App;
