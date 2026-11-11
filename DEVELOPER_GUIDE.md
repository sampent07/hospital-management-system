# HƯỚNG DẪN DÀNH CHO THÀNH VIÊN NHÓM PHÁT TRIỂN (DEVELOPER & TEAM GUIDELINES)

> **Chào mừng bạn đến với dự án Smart OPD Orchestration Platform!**
> File này là cẩm nang hướng dẫn chi tiết từng bước để các thành viên trong nhóm dễ dàng tiếp tục công việc, code bổ sung từng tính năng (Use Case) một cách đồng bộ, chuẩn mực và nhanh chóng.

---

## 1. TỔNG QUAN DỰ ÁN VÀ NỀN MÓNG ĐÃ XÂY DỰNG

Hệ thống điều phối khám chữa bệnh thông minh (**Smart OPD Orchestration Platform**) giải quyết bài toán cốt lõi: **Giảm tối đa thời gian chờ đợi và lưu viện của bệnh nhân** thông qua thuật toán học tăng cường (RL) và điều phối hàng đợi thời gian thực.

### Nền móng đã hoàn thành sẵn sàng:
1. **Toàn bộ 28 bảng CSDL theo ERD** đã được khai báo hoàn chỉnh trong `backend/app/models/`.
2. **Kiến trúc phân lớp chuẩn mực**: `Router -> Service -> Repository -> Model` đã được dựng khung, không import chéo.
3. **Cơ chế khóa lạc quan (Optimistic Lock)** chống xung đột cập nhật đồng thời qua cột `version`.
4. **Hàng đợi thời gian thực** tính toán bằng một truy vấn `GROUP BY` tối ưu duy nhất, không N+1 query.
5. **AI Inference Service** độc lập, stateless với phương án dự phòng (Heuristic Fallback) tự động khi quá hạn (500ms).
6. **Kênh WebSocket** phát sự kiện realtime (`queue.updated`, `visit_progress.status_changed`, `route.proposed`...).
7. **Hai ứng dụng Frontend hiện đại** (`web-staff` cho nhân viên/Bác sĩ/Admin và `patient-app` cho bệnh nhân/Kiosk).
8. **Dữ liệu mẫu (Seed Data)** và kịch bản nạp tự động `python seed/load.py`.

---

## 2. NGUYÊN TẮC VÀNG KHI VIBE CODE (BẤT BIẾN)

Trước khi viết bất kỳ dòng code nào, bạn **phải tuân thủ 10 nguyên tắc sau** (trích xuất từ thư mục `AGENT/` và `docs/DOMAIN_RULES.md`):

1. **AI chỉ gợi ý, Bệnh nhân quyết định**: Không bao giờ tự động áp đặt lộ trình mới khi bệnh nhân chưa bấm xác nhận.
2. **Không can thiệp chẩn đoán y khoa**: Bác sĩ là người duy nhất có quyền chỉ định dịch vụ.
3. **Quy tắc khám là DỮ LIỆU, không hardcode**: Mọi thứ tự (HĐ-1 đến HĐ-5), điều kiện nhịn ăn, khám phụ khoa... nằm trong bảng `constraints` (Ràng buộc), không viết cứng `if service_id == ...` trong code.
4. **Thời gian luôn tính ở UTC (Backend)**: CSDL lưu `timestamptz` UTC. Frontend chỉ hiển thị giờ Việt Nam (`Asia/Ho_Chi_Minh`) qua hàm dùng chung `formatFacilityDateTime`.
5. **Công thức tính hàng đợi duy nhất**: Dùng chung hàm `calculate_estimated_wait_seconds` tại `QueueService` cho cả Backend, Frontend và AI.
6. **Vòng đời dịch vụ chuyển đúng bước**: `NOT_STARTED -> WAITING -> IN_PROGRESS -> COMPLETED`. Nhảy cóc sẽ bị ném lỗi `InvalidStatusTransition`.
7. **Nhật ký hệ thống bất biến**: Bảng `system_logs` và `route_decisions` chỉ INSERT, tuyệt đối không UPDATE hay DELETE.
8. **Phân quyền ở Backend qua Dependency**: Dùng `require_permission("tên:quyền")`, không viết `if role == ...` rải rác.
9. **Cảnh báo bắt buộc ở Gợi ý gói khám**: Bất kỳ nơi nào hiển thị gợi ý gói khám phải có khung cảnh báo màu vàng: *"Chỉ mang tính chất tham khảo, không thay thế chẩn đoán y khoa"*.
10. **Giữ cấu trúc phân lớp sạch sẽ**: Router không chứa nghiệp vụ; Service không viết câu lệnh SQL; Repository không chứa logic điều kiện nghiệp vụ.

---

## 3. QUY TRÌNH 7 BƯỚC ĐỂ BỔ SUNG 1 USE CASE MỚI

Khi bạn nhận 1 Use Case (ví dụ: `STAFF-09: Ghi nhận kết quả cận lâm sàng` hoặc `PAT-10: Xem lịch sử khám` từ file `docs/USE_CASES.md`), hãy thực hiện lần lượt theo 7 bước sau:

```
[Bước 1: Tạo nhánh Git] ──> [Bước 2: Pydantic Schema] ──> [Bước 3: Repository]
                                                                  │
[Bước 6: Giao diện UI] <── [Bước 5: API Router] <── [Bước 4: Service & Transaction]
       │
[Bước 7: Viết Test & Commit]
```

### Bước 1: Tạo nhánh Git riêng
Đặt tên nhánh theo quy ước: `feature/<ma-uc>-<ten-ngan>`
```bash
git checkout -b feature/staff-09-exam-results
```

### Bước 2: Khai báo Schema Request/Response (`backend/app/schemas/`)
Tách biệt schema dữ liệu vào/ra khỏi ORM Model.
*Ví dụ tại `backend/app/schemas/clinical.py`:*
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExamResultCreate(BaseModel):
    visit_progress_id: str
    result_content: str
    attachment_url: Optional[str] = None

class ExamResultResponse(BaseModel):
    id: str
    visit_progress_id: str
    result_content: str
    recorded_at: datetime
    
    class Config:
        from_attributes = True
```

### Bước 3: Viết câu lệnh truy vấn tại Repository (`backend/app/repositories/`)
Repository là nơi **DUY NHẤT** truy vấn cơ sở dữ liệu.
*Ví dụ tại `backend/app/repositories/clinical_repository.py`:*
```python
from sqlalchemy.orm import Session
from app.models.clinical import ExamResult
from app.repositories.base import BaseRepository

class ClinicalRepository(BaseRepository[ExamResult]):
    def __init__(self, db: Session):
        super().__init__(ExamResult, db)

    def get_by_progress_id(self, progress_id: str):
        return self.db.query(ExamResult).filter(ExamResult.visit_progress_id == progress_id).first()
```

### Bước 4: Viết Logic nghiệp vụ tại Service (`backend/app/services/`)
Service là nơi kiểm tra điều kiện nghiệp vụ, ranh giới Transaction và phát sự kiện.
*Ví dụ tại `backend/app/services/clinical_service.py`:*
```python
from sqlalchemy.orm import Session
from app.models.clinical import ExamResult
from app.core.exceptions import ResourceNotFound, AppException
from app.core.database import get_utc_now
from app.core.websocket import ws_manager

class ClinicalService:
    def __init__(self, db: Session):
        self.db = db

    async def record_result(self, req, doctor_id: str):
        # 1. Kiểm tra tiến độ dịch vụ tồn tại
        # 2. Lưu kết quả
        result = ExamResult(
            visit_progress_id=req.visit_progress_id,
            result_content=req.result_content,
            recorded_by_id=doctor_id,
            recorded_at=get_utc_now()
        )
        self.db.add(result)
        self.db.commit()

        # 3. Phát sự kiện realtime
        await ws_manager.broadcast_event("exam_result.created", {"progress_id": req.visit_progress_id})
        return result
```

### Bước 5: Khai báo Endpoint tại Router (`backend/app/api/v1/`)
Router nhận request, kiểm tra quyền hạn và trả response. Không viết logic nghiệp vụ tại đây.
*Ví dụ tại `backend/app/api/v1/clinical_router.py`:*
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import require_permission

router = APIRouter(prefix="/clinical", tags=["Cận lâm sàng & Chẩn đoán"])

@router.post("/results", summary="Ghi nhận kết quả cận lâm sàng")
async def create_exam_result(
    req: ExamResultCreate,
    payload: dict = Depends(require_permission("clinical:record_result")),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return await service.record_result(req, doctor_id=payload.get("sub"))
```
*Nhớ đăng ký router này vào `backend/app/api/v1/api.py`!*

### Bước 6: Hoàn thiện màn hình Frontend
- Đặt file trong `frontend/web-staff/src/pages/` hoặc `frontend/patient-app/src/pages/`.
- Luôn xử lý đủ **4 trạng thái**: `Loading`, `Error`, `Empty`, `With Data`.
- Hiển thị ngày giờ qua hàm: `formatFacilityDateTime(utcString)`.

### Bước 7: Viết Unit Test & Chạy kiểm tra
Tạo file test trong `backend/tests/` (ví dụ: `test_clinical.py`).
Chạy kiểm tra toàn bộ trước khi commit:
```bash
# Tại backend/
pytest -v
```

---

## 4. QUY ƯỚC ĐẶT TÊN COMMIT & PULL REQUEST

Để lịch sử dự án đồng nhất và chuyên nghiệp, bạn phải đặt tên commit theo cú pháp:

```
[Phân hệ] Tóm tắt nội dung thay đổi (bằng tiếng Việt rõ ràng)
```

**Danh sách phân hệ chuẩn:**
- `[Auth]`: Xác thực, đăng ký, JWT, phân quyền
- `[Visit]`: Lượt khám, tiếp nhận, vòng đời trạng thái dịch vụ
- `[Queue]`: Hàng đợi, tính toán thời gian chờ
- `[Route]`: Lộ trình thông minh, tính lại lộ trình, quyết định bệnh nhân
- `[Package]`: Gói khám, cấp độ, tư vấn gói khám
- `[Constraint]`: Bảng ràng buộc thứ tự và phụ thuộc
- `[Doctor]`: Khám bệnh, chỉ định dịch vụ, kê đơn, kết luận
- `[Admin]`: Cấu hình điểm dịch vụ, dashboard, quản lý nhân viên
- `[UI-Staff]`: Giao diện web nhân viên và Bác sĩ
- `[UI-Patient]`: Giao diện cổng bệnh nhân / Kiosk
- `[Docs]`: Tài liệu hướng dẫn, sơ đồ

*Ví dụ commit hợp lệ:*
- `[Doctor] Thêm chức năng ghi nhận kết quả xét nghiệm và chẩn đoán`
- `[UI-Patient] Bổ sung giao diện xem lịch sử đơn thuốc điện tử`

---

## 5. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG CỤC BỘ

### Cách 1: Chạy toàn bộ bằng Docker Compose (Khuyên dùng)
```bash
docker compose up -d
```
- Backend API Docs: `http://localhost:8000/api/v1/docs`
- AI Service Docs: `http://localhost:8001/docs`
- CSDL PostgreSQL: `localhost:5432` (user: `postgres`, password: `postgrespassword`)

### Cách 2: Chạy trực tiếp trên máy (Development Mode)
1. **Chạy Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
2. **Chạy AI Service:**
```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8001
```
3. **Nạp dữ liệu mẫu ban đầu:**
```bash
python seed/load.py
```
4. **Chạy Web Nhân Viên:**
```bash
cd frontend/web-staff
pnpm dev   # hoặc npm run dev
```
5. **Chạy App Bệnh Nhân:**
```bash
cd frontend/patient-app
pnpm dev   # hoặc npm run dev
```

---

## 6. DANH SÁCH TÀI KHOẢN MẪU ĐỂ ĐĂNG NHẬP THỬ NGHIỆM

Sau khi chạy `python seed/load.py`, bạn có thể dùng các tài khoản sau để đăng nhập thử các vai trò:

| Vai trò | Tên đăng nhập | Mật khẩu | Tên hiển thị | Điểm dịch vụ phụ trách |
|---|---|---|---|---|
| **Admin** | `admin` | `Admin@123` | Quản Trị Viên Hệ Thống | Toàn viện |
| **Bác sĩ (Doctor)** | `doctor` | `Doctor@123` | BS. CK1 Nguyễn Văn An | Phòng Khám Nội (Phòng 101) |
| **Điều phối (Coordinator)** | `coordinator` | `Coord@123` | Nguyễn Thị Mai | Quầy Lễ Tân (Sảnh Tầng 1) |
| **Bệnh nhân (Patient)** | `patient` | `Patient@123` | Lê Văn Hùng | Bệnh nhân ngoại trú |

---

## 7. CHECKLIST TRƯỚC KHI PUSH CODE LÊN GIT

- [ ] Code không hardcode quy tắc nghiệp vụ hoặc thời gian chờ.
- [ ] Thời gian lưu và tính toán ở Backend ở chuẩn UTC.
- [ ] Không có lệnh SQL trực tiếp trong router hoặc service (chỉ gọi repository).
- [ ] Đã kiểm tra phân quyền bằng dependency `require_permission(...)`.
- [ ] Đã viết unit test cho nghiệp vụ mới và toàn bộ test đều xanh (`pytest -v`).
- [ ] Không commit file nhạy cảm (`.env`, `hospital.db`, `node_modules`).
- [ ] Tên commit đúng định dạng `[Phân hệ] Nội dung`.
