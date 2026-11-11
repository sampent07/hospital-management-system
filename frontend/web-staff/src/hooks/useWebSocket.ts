import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketEventMessage {
  event_id: string;
  event_type: string;
  occurred_at: string;
  payload: Record<string, unknown>;
}

export function useWebSocket(onEvent?: (event: WebSocketEventMessage) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEventMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsed: WebSocketEventMessage = JSON.parse(event.data);
          setLastEvent(parsed);
          if (onEvent) {
            onEvent(parsed);
          }
        } catch {
          // parse error
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Tự động kết nối lại sau 3 giây
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch {
      setIsConnected(false);
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    }
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastEvent };
}
