import { useEffect, useRef, useState } from 'react';

interface EventMessage {
  event_type: string;
  payload?: { visit_id?: string };
}

export function usePatientWebSocket(token: string, visitId: string | null, onRefresh: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const refreshRef = useRef(onRefresh);

  useEffect(() => { refreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    if (!visitId) {
      setIsConnected(false);
      return undefined;
    }
    let closed = false;
    let socket: WebSocket | null = null;
    let timer = 0;
    let delay = 1000;

    const connect = () => {
      if (closed) return;
      const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${scheme}//${window.location.host}/ws/patient?token=${encodeURIComponent(token)}&visit_id=${encodeURIComponent(visitId)}`;
      socket = new WebSocket(url);
      socket.onopen = () => {
        setIsConnected(true);
        delay = 1000;
        refreshRef.current();
      };
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as EventMessage;
          if (event.event_type === 'queue.updated' || event.payload?.visit_id === visitId) refreshRef.current();
        } catch {
          refreshRef.current();
        }
      };
      socket.onclose = () => {
        setIsConnected(false);
        if (!closed) refreshRef.current();
        if (!closed) {
          timer = window.setTimeout(connect, delay);
          delay = Math.min(delay * 2, 30000);
        }
      };
      socket.onerror = () => socket?.close();
    };

    connect();
    return () => {
      closed = true;
      window.clearTimeout(timer);
      socket?.close();
    };
  }, [token, visitId]);

  return { isConnected };
}
