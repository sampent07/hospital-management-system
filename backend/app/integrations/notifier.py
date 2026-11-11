import logging
from typing import Optional
from app.core.database import get_utc_now

logger = logging.getLogger("notifier")


class NotificationService:
    """Interface gửi thông báo (In-App, WebSocket, Mock SMS)."""

    @staticmethod
    def send_sms_mock(phone_number: str, content: str) -> bool:
        """Gửi SMS giả lập dùng cho môi trường thử nghiệm và demo."""
        logger.info(f"[SMS MOCK TO {phone_number}] Lúc {get_utc_now()}: {content}")
        return True

    @staticmethod
    def notify_patient_turn(phone_number: str, patient_name: str, room_name: str, queue_number: int):
        message = f"Xin chào {patient_name}, số thứ tự {queue_number} của bạn đã đến lượt khám tại {room_name}. Xin mời vào phòng!"
        NotificationService.send_sms_mock(phone_number, message)


notifier = NotificationService()
