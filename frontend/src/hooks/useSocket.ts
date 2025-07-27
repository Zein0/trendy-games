import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents } from '../types/index';
import type { ClientToServerEvents } from '../types/index';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export const useSocket = (serverUrl: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001') => {
  const socketRef = useRef<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(serverUrl, {
        autoConnect: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [serverUrl]);

  return isConnected ? socketRef.current : null;
};