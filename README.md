# SMART OPD ORCHESTRATION PLATFORM

> **Nền Tảng Điều Phối Khám Chữa Bệnh Ngoại Trú Thông Minh (Smart Outpatient Department)**
> Ứng dụng Học Tăng Cường (Reinforcement Learning) & Tối Ưu Hàng Đợi Thời Gian Thực để giảm thiểu tối đa thời gian chờ đợi và lưu viện của người bệnh.

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TS-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. CẤU TRÚC HỆ THỐNG

```
hospital-management-system/
├── backend/              # API nghiệp vụ (FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL)
│   ├── app/
│   │   ├── api/v1/       # Routers API RESTful (/api/v1)
│   │   ├── core/         # Cấu hình, bảo mật JWT, phân quyền, WebSocket, exceptions
│   │   ├── integrations/ # Tích hợp AI Service & Notifier (fallback tự động)
│   │   ├── models/       # 28 ORM Models đồng bộ 100% với ERD
│   │   ├── repositories/ # Nơi duy nhất truy vấn CSDL (GROUP BY hàng đợi tối ưu)
│   │   ├── schemas/      # Pydantic v2 validation schemas
│   │   └── services/     # Logic nghiệp vụ, ranh giới transaction & optimistic locking
│   ├── tests/            # Bộ kiểm thử đơn vị độc lập (Pytest)
│   └── alembic/          # CSDL Migrations
├── ai-service/           # Dịch vụ suy luận lộ trình AI (FastAPI, Stateless RL baseline)
├── frontend/             # Giao diện người dùng
│   ├── web-staff/        # Cổng vận hành Bác sĩ, Thư ký/Điều phối và Quản trị viên
│   └── patient-app/      # Ứng dụng di động & Kiosk dành cho bệnh nhân
├── seed/                 # Dữ liệu mẫu (Seed Data) & Script nạp tự động
├── docs/                 # Tài liệu thiết kế: ERD, Danh mục 43 Use Cases, DOMAIN_RULES
├── docker-compose.yml    # Khởi chạy toàn bộ hệ sinh thái (Postgres + Backend + AI)
├── DEVELOPER_GUIDE.md    # Cẩm nang hướng dẫn thành viên nhóm tiếp tục phát triển
└── AGENTS.md             # Bộ nguyên tắc cốt lõi khi Vibe Code
```

---

## 2. TÍNH NĂNG NỀN TẢNG NỔI BẬT

- **Điều phối lộ trình thông minh (AI & Heuristic Fallback)**:
  - Tự động sinh lộ trình khám ban đầu dựa trên lưu lượng hàng đợi các phòng.
  - Hỗ trợ tính lại lộ trình khi bệnh nhân yêu cầu hoặc hàng đợi quá tải.
  - Ngưỡng tối thiểu tiết kiệm $\ge 3$ phút mới đề xuất phương án mới.
  - Cơ chế dự phòng Heuristic tự động gắn nhãn khi AI quá hạn (500ms).
- **Quyền quyết định thuộc về bệnh nhân**:
  - Hệ thống chỉ đề xuất, bệnh nhân luôn là người bấm chấp nhận hoặc giữ lộ trình cũ.
  - Nhật ký quyết định bất biến (không UPDATE/DELETE).
- **Khóa lạc quan (Optimistic Locking)**:
  - Cột `version` trên tiến độ dịch vụ ngăn chặn hoàn toàn tình trạng 2 nhân viên ghi đè dữ liệu đồng thời (trả HTTP 409).
- **Hàng đợi thời gian thực (Realtime Queue)**:
  - Tính toán bằng một câu lệnh `GROUP BY` tổng hợp duy nhất, loại bỏ triệt để lỗi truy vấn N+1.
  - Cập nhật tự động tới màn hình nhân viên và bệnh nhân qua WebSocket.
- **Phân quyền chặt chẽ theo Role Matrix**:
  - `DOCTOR`: Người duy nhất có quyền chỉ định dịch vụ bổ sung, chẩn đoán và kê đơn.
  - `COORDINATOR`: Tiếp nhận bệnh nhân, cập nhật trạng thái tại bàn, hỗ trợ tính lại lộ trình.
  - `ADMIN`: Quản trị tài khoản, cấu hình điểm dịch vụ, giám sát tải toàn viện.
  - `PATIENT`: Chỉ xem dữ liệu của chính mình, yêu cầu tính lại và quyết định lộ trình.

---

## 3. KHỞI CHẠY NHANH

### Bước 1: Khởi động với Docker Compose
```bash
docker compose up -d
```
Hệ thống sẽ tự động khởi tạo cơ sở dữ liệu PostgreSQL, Backend API và AI Service.

### Bước 2: Nạp dữ liệu mẫu ban đầu
```bash
python seed/load.py
```
Dữ liệu mẫu gồm: 7 điểm dịch vụ, 6 dịch vụ khám, 3 gói khám, các tài khoản Admin, Doctor, Coordinator và Bệnh nhân.

### Bước 3: Khởi chạy Giao diện Frontend
```bash
# Web Nhân viên & Bác sĩ (Port 5173)
cd frontend/web-staff
pnpm install
pnpm dev

# App Bệnh nhân & Kiosk (Port 5174)
cd frontend/patient-app
pnpm install
pnpm dev
```

---

## 4. TÀI KHOẢN TRẢI NGHIỆM

| Vai trò | Tên đăng nhập | Mật khẩu | Phân hệ truy cập |
|---|---|---|---|
| **Admin** | `admin` | `Admin@123` | Dashboard giám sát, quản lý tài khoản & gói khám |
| **Bác sĩ** | `doctor` | `Doctor@123` | Bàn khám nội, khám bệnh, chỉ định dịch vụ, kê đơn |
| **Thư ký / Lễ tân** | `coordinator` | `Coord@123` | Quầy tiếp nhận, mời khám, cập nhật trạng thái |
| **Bệnh nhân** | `patient` | `Patient@123` | Xem lộ trình thời gian thực, bảng chờ, gợi ý gói |

---

## 5. DÀNH CHO THÀNH VIÊN NHÓM TIẾP TỤC CODE

Vui lòng đọc kỹ file [DEVELOPER_GUIDE.md](file:///c:/Users/Le%20Nhut%20Huy/Desktop/hospital-management-system/DEVELOPER_GUIDE.md) và [docs/USE_CASES.md](file:///c:/Users/Le%20Nhut%20Huy/Desktop/hospital-management-system/docs/USE_CASES.md) để:
1. Nhận mã Use Case phụ trách.
2. Nắm vững quy trình 7 bước phát triển tính năng từ CSDL đến Giao diện.
3. Tuân thủ quy ước đặt tên commit: `[Phân hệ] Nội dung thay đổi`.
