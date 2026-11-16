import uuid
from typing import Dict, List, Any
from fastapi import WebSocket
from app.core.database import get_utc_now


class ConnectionManager:
    """Quản lý các kết nối WebSocket thời gian thực."""
    def __init__(self):
        # Lưu các kết nối đang hoạt động: {client_id: WebSocket}
        self.active_connections: List[WebSocket] = []
        self.patient_connections: Dict[WebSocket, tuple[str, str]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def connect_patient(self, websocket: WebSocket, account_id: str, visit_id: str):
        """Đăng ký kênh chỉ nhận sự kiện tổng hợp hoặc thuộc lượt khám đã xác thực."""
        await websocket.accept()
        self.patient_connections[websocket] = (account_id, visit_id)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        self.patient_connections.pop(websocket, None)

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
        
        # Kênh nhân viên nhận sự kiện nghiệp vụ theo thiết kế đang có.
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(event_message)
            except Exception:
                disconnected.append(connection)
                
        for dead_conn in disconnected:
            self.disconnect(dead_conn)

        # Kênh bệnh nhân chỉ nhận tổng hợp hàng đợi hoặc sự kiện của lượt mình.
        disconnected_patients = []
        for connection, (_, visit_id) in list(self.patient_connections.items()):
            event_visit_id = payload.get("visit_id")
            is_queue_summary = event_type == "queue.updated"
            if not is_queue_summary and event_visit_id != visit_id:
                continue
            try:
                await connection.send_json(event_message)
            except Exception:
                disconnected_patients.append(connection)
        for dead_conn in disconnected_patients:
            self.disconnect(dead_conn)


ws_manager = ConnectionManager()
