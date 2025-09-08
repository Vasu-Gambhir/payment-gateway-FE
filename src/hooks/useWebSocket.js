import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const useWebSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentMoneyNotification, setCurrentMoneyNotification] = useState(null);
  const [showMoneyPopup, setShowMoneyPopup] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    if (!token) return;

    // Determine WebSocket URL based on environment
    const wsUrl = import.meta.env.NODE_ENV === 'production' 
      ? import.meta.env.VITE_WS_URL_PROD || 'wss://payment-gateway-be.onrender.com'
      : import.meta.env.VITE_WS_URL_DEV || 'ws://localhost:5000';

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with the server
        wsRef.current.send(JSON.stringify({
          type: 'authenticate',
          token: token
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'authenticated') {
            console.log('WebSocket authenticated');
          } else if (message.type === 'notification') {
            handleNotification(message.data);
          } else if (message.type === 'error') {
            console.error('WebSocket error:', message.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  const handleNotification = (notification) => {
    // Add notification to state
    setNotifications(prev => [notification, ...prev]);
    
    // Show popup notification for money received
    if (notification.type === 'money_received') {
      setCurrentMoneyNotification(notification);
      setShowMoneyPopup(true);
      
      // Also show a toast as backup
      toast.success(
        `💰 You received $${notification.amount.toFixed(2)} from ${notification.senderName}!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      // Play a notification sound if available
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Could not play notification sound'));
      } catch (e) {
        // Ignore if sound file doesn't exist
      }
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [token]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  const closeMoneyPopup = () => {
    setShowMoneyPopup(false);
    setCurrentMoneyNotification(null);
  };

  return {
    isConnected,
    notifications,
    sendMessage,
    clearNotifications: () => setNotifications([]),
    currentMoneyNotification,
    showMoneyPopup,
    closeMoneyPopup
  };
};

export default useWebSocket;