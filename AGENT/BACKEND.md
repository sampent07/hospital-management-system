# backend/AGENTS.md — API nghiệp vụ

> Áp dụng cho `backend/`. Bổ sung cho `/AGENTS.md`; nếu mâu thuẫn thì file này ưu tiên. Quy tắc nghiệp vụ, phân quyền, thuật ngữ nằm ở `/docs/DOMAIN_RULES.md`, đọc trước khi sửa logic.

## Stack và lệnh

Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic, Pydantic v2, PostgreSQL. **[CHỜ CHỐT]** FastAPI hay Node.js; nếu đổi thì viết lại file này.

```bash
uvicorn app.main:app --reload        # chạy dev
ruff check . && ruff format --check . && mypy app && pytest -q
alembic upgrade head
alembic revision --autogenerate -m "<mô tả>"
```

## Phân lớp (không phá vỡ)

```
app/api/            router: nhận request, kiểm tra quyền, validate, gọi service, trả response
app/services/       logic nghiệp vụ và ranh giới transaction
app/repositories/   nơi DUY NHẤT truy vấn CSDL
app/models/         ORM
app/schemas/        Pydantic request/response (tách khỏi ORM)
app/core/           cấu hình, bảo mật, phân quyền, WebSocket
app/integrations/   nơi DUY NHẤT gọi dịch vụ ngoài (AI, tin nhắn)
app/events/         sự kiện thời gian thực và thông báo
migrations/  tests/
```

- Chiều phụ thuộc: `api → services → repositories → models`. Không import vòng.
- **Router không chứa logic nghiệp vụ.** Service không viết SQL; repository không chứa quy tắc nghiệp vụ.
- Đặt tên file: `<module>_router.py`, `<module>_service.py`, `<module>_repository.py`, `schemas/<module>.py`, `models/<module>.py`. Module: `auth`, `packages`, `constraints`, `companies`, `visits`, `progress`, `routes`, `orders`, `notifications`, `admin`.
- Phân quyền qua dependency theo **tên quyền** (ví dụ `progress:update_status`), bảng gán quyền cho vai trò đặt ở một chỗ duy nhất.

## API

- REST, tiền tố `/api/v1`, đường dẫn danh từ số nhiều. Hành động đặc biệt dùng động từ rõ nghĩa, ví dụ `POST /visits/{id}/routes/recalculate`.
- Mã HTTP: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409` (xung đột trạng thái hoặc phiên bản), `422`, `500`.
- Danh sách luôn phân trang. ID dùng UUID.
- **Lỗi trả về thống nhất:**
```json
{ "code": "INVALID_STATUS_TRANSITION", "message": "Không thể chuyển từ NOT_STARTED sang COMPLETED.", "details": {} }
```
- Mỗi endpoint có mô tả, schema request và response (OpenAPI). Đổi hợp đồng API phải báo cả nhóm trước.
- Exception nghiệp vụ có tên (`InvalidStatusTransition`, `ConstraintViolation`, `QueueFull`...) và một handler toàn cục chuyển thành định dạng lỗi trên.

## CSDL

- Mọi thay đổi cấu trúc đi qua **migration Alembic**. Không sửa schema bằng tay. Không sửa migration đã merge.
- Khai báo ràng buộc ở CSDL: khóa ngoại, `UNIQUE`, `NOT NULL`, `CHECK`.
- Thời gian: `timestamptz`, lưu UTC (xem mục «Quy tắc thời gian» trong DOMAIN_RULES).
- Truy vấn dùng ORM hoặc tham số hóa. **Cấm ghép chuỗi SQL từ dữ liệu người dùng.**
- Hàng đợi là giá trị dẫn xuất: dùng truy vấn tổng hợp hoặc SQL View thường, không vòng lặp N+1 (xem mục «Hàng đợi» trong DOMAIN_RULES).
- Bảng nhật ký bất biến: chặn UPDATE và DELETE ở tầng ứng dụng, cân nhắc thêm trigger.
- Tiến độ dịch vụ có cột `version` để khóa lạc quan. Xung đột trả `409`, không ghi đè.

## Transaction và sự kiện

- Ranh giới transaction nằm ở service. Một lần đổi trạng thái ghi **trong cùng transaction**: cập nhật tiến độ, mốc thời gian, người thực hiện.
- Phát sự kiện thời gian thực và thông báo **sau khi commit thành công**, không phát khi transaction còn có thể hoàn tác.

## WebSocket

- Tên sự kiện `đối_tượng.hành_động` bằng tiếng Anh: `queue.updated`, `visit_progress.status_changed`, `route.proposed`, `route.applied`, `notification.created`.
- Payload có schema cố định, có `event_id` và `occurred_at` (UTC). Không gửi dữ liệu thừa hoặc nhạy cảm.
- Kiểm tra quyền khi đăng ký kênh: nhân viên theo vai trò, bệnh nhân chỉ nhận sự kiện của chính mình.
- Mục tiêu cập nhật tới giao diện: `REALTIME_PROPAGATION_SECONDS`. Client có thể tải lại bằng REST khi mất kết nối.

## Gọi AI Service

- Chỉ gọi qua `app/integrations/`. Có timeout (`AI_INFERENCE_TIMEOUT_MS` cho một lần, `ROUTE_COMPUTE_TIMEOUT_MS` cho cả lộ trình), thử lại giới hạn, ngắt mạch khi lỗi liên tục.
- Không chạy suy luận đồng bộ chặn luồng xử lý của request khác.
- Quá hạn hoặc lỗi: **tự dùng phương án dự phòng**, gắn nhãn «Dự phòng», không trả lỗi 500 cho người dùng.
- Backend là nơi quyết định hoạt động hợp lệ (bảng ràng buộc); chỉ gửi AI danh sách hợp lệ.
- Ghi log độ trễ và phương pháp thực dùng. Không log dữ liệu cá nhân.

## Thông báo

- Phát sự kiện nghiệp vụ (đến lượt, kết quả sẵn sàng...). Gửi tin nhắn qua interface, có bản giả để demo; nhà cung cấp **[CHỜ CHỐT]**.
- Gửi thông báo lỗi không được làm hỏng nghiệp vụ chính; ghi nhận và thử lại.

## Bảo mật

- Mật khẩu băm bằng argon2 hoặc bcrypt. Token có hạn ngắn [ĐỀ XUẤT: access token 15 phút]; đổi vai trò hoặc vô hiệu hóa thì thu hồi phiên.
- Validate mọi đầu vào ở backend. CORS chỉ cho nguồn được phép. Giới hạn tần suất với đăng nhập và yêu cầu tính lại lộ trình.
- Không để lộ stack trace cho người dùng.

## Test (bắt buộc)

`pytest`, test độc lập, không phụ thuộc mạng ngoài (client AI và thông báo dùng bản giả; thời gian dùng đồng hồ giả). Phải có test cho:
- chuyển trạng thái dịch vụ: hợp lệ, sai thứ tự, đồng thời;
- ràng buộc và nhất quán gói;
- hàng đợi đầy và gợi ý «Chờ thêm»;
- phân quyền từng vai trò và truy cập chéo dữ liệu bệnh nhân;
- lộ trình hợp lệ và trường hợp «không có lộ trình tốt hơn»;
- dự phòng khi AI quá hạn hoặc lỗi;
- tính bất biến của nhật ký;
- xử lý thời gian UTC và ranh giới ngày theo múi giờ cơ sở.

Tên test mô tả hành vi, ví dụ `test_cannot_complete_progress_before_start`. [ĐỀ XUẤT] Độ phủ lớp `services` từ 80%.
