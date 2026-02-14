import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Item, WebSocketContextType} from '../types';

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const newSocket = io(WS_URL, {
      auth: { token },
    });

    //TODO  Логи пока что, нужно сделать уведомления
    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  const joinList = useCallback((listId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-list', { listId });
      console.log(`Joined list: ${listId}`);
    }
  }, [isConnected]);

  const leaveList = useCallback((listId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-list', { listId });
      console.log(`Left list: ${listId}`);
    }
  }, [isConnected]);

  const subscribeToItems = useCallback((
    listId: string,
    callbacks: {
      onItemCreated?: (item: Item) => void;
      onItemUpdated?: (item: Item) => void;
      onItemDeleted?: (data: { itemId: string }) => void;
    }
  ) => {
    const socket = socketRef.current;
    if (!socket) {
      return () => {};
    }

    if (callbacks.onItemCreated) {
      socket.on('item-created', callbacks.onItemCreated);
    }
    if (callbacks.onItemUpdated) {
      socket.on('item-updated', callbacks.onItemUpdated);
    }
    if (callbacks.onItemDeleted) {
      socket.on('item-deleted', callbacks.onItemDeleted);
    }

    return () => {
      if (callbacks.onItemCreated) {
        socket.off('item-created', callbacks.onItemCreated);
      }
      if (callbacks.onItemUpdated) {
        socket.off('item-updated', callbacks.onItemUpdated);
      }
      if (callbacks.onItemDeleted) {
        socket.off('item-deleted', callbacks.onItemDeleted);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        joinList,
        leaveList,
        subscribeToItems,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};