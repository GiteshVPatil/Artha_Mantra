import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5050');

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated]);

  const subscribeToStock = (symbol) => {
    if (socket) {
      socket.emit('subscribe_stock', symbol);
    }
  };

  const unsubscribeFromStock = (symbol) => {
    if (socket) {
      socket.emit('unsubscribe_stock', symbol);
    }
  };

  const value = {
    socket,
    isConnected,
    subscribeToStock,
    unsubscribeFromStock,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
