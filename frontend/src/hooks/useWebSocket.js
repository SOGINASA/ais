import { useEffect, useRef } from 'react';
import { useUIStore } from '../store/useUIStore';

const WS_BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:5252')
  .replace(/^http/, 'ws');

export const useWebSocket = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return; // Not authenticated, skip

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/notifications?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification' || data.message) {
            addNotification({
              type: data.notification_type || 'info',
              message: data.message || data.title || 'Новое уведомление',
            });
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onclose = (event) => {
        if (!event.wasClean) {
          // Reconnect after 5s on unexpected close
          reconnectTimer.current = setTimeout(connect, 5252);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useWebSocket;
