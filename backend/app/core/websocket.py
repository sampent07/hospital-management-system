import uuid
from typing import Dict, List, Any
from fastapi import WebSocket
from app.core.database import get_utc_now


class ConnectionManager:
    """Quản lý các kết nối WebSocket thời gian thực."""
    def __init__(self):
        # Lưu các kết nối đang hoạt động: {client_id: WebSocket}
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_event(self, event_type: str, payload: Dict[str, Any]):
        """Phát sự kiện thời gian thực theo đúng chuẩn quy định trong BACKEND.md.
        
        Tên sự kiện: đối_tượng.hành_động (ví dụ: queue.updated, visit_progress.status_changed)
        """
        event_message = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "occurred_at": get_utc_now().isoformat(),
            "payload": payload
        }
        
        # Gửi tới các client đang kết nối
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(event_message)
            except Exception:
                disconnected.append(connection)
                
        for dead_conn in disconnected:
            self.disconnect(dead_conn)


ws_manager = ConnectionManager()
