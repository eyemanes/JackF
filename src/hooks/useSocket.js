import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://jack-alpha.vercel.app';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Disable WebSocket for Vercel deployment
    // Vercel doesn't support persistent WebSocket connections
    console.log('🔌 WebSocket disabled for Vercel deployment');
    setIsConnected(false);
    setSocket(null);
  }, []);

  return { socket, isConnected };
};

export const useRealtimeCalls = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // Since WebSocket is disabled for Vercel, fetch data via API
    const fetchCalls = async () => {
      try {
        const response = await fetch('https://jack-alpha.vercel.app/api/calls');
        const result = await response.json();
        
        if (result.success) {
          console.log('📊 Fetched calls via API:', result.data.length, 'calls');
          setCalls(result.data);
        } else {
          console.error('❌ Failed to fetch calls:', result.error);
          setCalls([]);
        }
      } catch (error) {
        console.error('❌ Error fetching calls:', error);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchCalls, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return { calls, loading, isConnected };
};
