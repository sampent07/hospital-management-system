# ĐẶC TẢ NGHIỆP VỤ & LUỒNG RÀNG BUỘC PHÂN HỆ BỆNH NHÂN (PATIENT PORTAL)

> **Tài liệu bàn giao nội bộ:** Dành cho các thành viên trong nhóm đồ án tiếp cận và hiểu toàn bộ kiến trúc, mô hình dữ liệu, luồng nghiệp vụ và các ràng buộc bất biến đã được thiết lập cho phân hệ Bệnh nhân (Patient App & Backend API).

---

## 1. TỔNG QUAN PHÂN HỆ BỆNH NHÂN

Phân hệ bệnh nhân cho phép người bệnh thực hiện tự phục vụ (self-service) xuyên suốt hành trình trước và trong khi đến bệnh viện:
1. **Quản lý hồ sơ người bệnh:** Tạo hồ sơ cá nhân, hồ sơ người thân, hoặc liên kết với mã hồ sơ cũ trên phiếu khám/đơn thuốc.
2. **Đặt lịch khám thông minh:** Đặt lịch theo gói khám và lịch làm việc khả dụng của bác sĩ thông qua bảng lịch trực quan.
3. **Phân tách bạch 2 nghiệp vụ theo dõi:**
   - **Lịch hẹn khám (`AppointmentsPage`):** Nơi giữ mã hẹn, mã QR tiếp nhận và thực hiện Check-in tại quầy/kiosk.
   - **Lịch sử đặt khám (`BookingHistoryPage`):** Nhật ký lưu trữ hồ sơ hành chính đã đăng ký, hiển thị rõ trạng thái đã khám, hết hạn hoặc chờ khám mà **không có mã QR** để tránh nhầm lẫn.

---

## 2. MÔ HÌNH THỰC THỂ CSDL LIÊN QUAN (ERD MAPPING)

| Thực thể ERD | Model trong Code | Bảng CSDL | Vai trò & Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **LICHKHAM** | `DoctorSchedule` | `doctor_schedules` | Lịch trực/khám của bác sĩ theo ngày, phòng khám và khung giờ định sẵn. |
| **LICHHEN** | `Appointment` | `appointments` | Lịch hẹn khám đã được bệnh nhân đăng ký và xác nhận. |
| **BENHNHAN** | `Patient` | `patients` | Hồ sơ thông tin hành chính của bệnh nhân (Họ tên, ngày sinh, CCCD, BHYT...). |
| **BACSI** | `Doctor` | `doctors` | Bác sĩ chuyên khoa phụ trách khám bệnh. |
| **DIEMDICHVU** | `ServicePoint` | `service_points` | Vị trí phòng khám thực tế (Phòng 101, Phòng 102...). |
| **GOIKHAM** | `Package` | `packages` | Gói dịch vụ khám bệnh (Cơ bản, Tiêu chuẩn, VIP...). |
| **LUOTKHAM** | `Visit` | `visits` | Lượt khám thực tế sinh ra khi bệnh nhân đến viện và Check-in thành công. |

### Cấu trúc chi tiết các trường cốt lõi:
- **`DoctorSchedule` (`doctor_schedules`):**
  - `doctor_id`: Khóa ngoại trỏ đến bác sĩ.
  - `service_point_id`: Khóa ngoại trỏ đến phòng khám.
  - `package_id`: Cho phép `NULL`. Khi `NULL` có nghĩa bác sĩ tiếp nhận **tất cả các gói khám**.
  - `work_date`: Ngày làm việc (`YYYY-MM-DD`).
  - `start_time` & `end_time`: Giờ bắt đầu và kết thúc ca (ví dụ: `06:30` – `07:30`).
  - `max_slots` & `current_booked`: Số lượng bệnh nhân tối đa trong khung giờ và số người đã đăng ký.
  - `status`: `AVAILABLE` (còn chỗ), `FULL` (hết chỗ), `OFF` (nghỉ).
- **`Appointment` (`appointments`):**
  - `patient_id`: Người bệnh được đặt khám.
  - `package_id`: Gói khám lựa chọn.
  - `doctor_schedule_id`: Khóa ngoại liên kết ca trực đã chọn của bác sĩ.
  - `doctor_id`: Bác sĩ phụ trách khám.
  - `appointment_time`: Thời điểm hẹn khám lưu theo chuẩn **UTC**.
  - `appointment_code`: Mã hẹn khám duy nhất (ví dụ: `APT-C79BC1B96798`).
  - `status`: `CONFIRMED`, `CHECKED_IN`, `EXPIRED`, `CANCELLED`.

---

## 3. CÁC QUY TẮC & RÀNG BUỘC NGHIỆP VỤ BẤT BIẾN (DOMAIN RULES)

### A. Ràng buộc ngày làm việc của bệnh viện
- **Chỉ tiếp nhận khám từ Thứ Hai đến Thứ Bảy.**
- **Chủ nhật: NGHỈ HOÀN TOÀN.**
  - Trên API lịch khả dụng (`available-schedules`): Tất cả các ngày Chủ nhật luôn có trạng thái `UNAVAILABLE`, 0 slot và hiển thị màu xám.
  - Trên API tạo lịch (`create_appointment`): Bất kỳ yêu cầu đặt lịch nào rơi vào Chủ nhật đều bị backend từ chối với lỗi `SUNDAY_NOT_ALLOWED` (HTTP 422).

### B. Khung giờ khám ngoại trú cố định (OPD Hours)
Bệnh viện khám bệnh theo các ca cố định, không chấp nhận giờ lẻ hoặc ngoài giờ khám:
- **Thời gian tiếp nhận:**
  - **Buổi sáng (06:30 – 11:00):** Gồm 5 ca khám cố định:
    1. Ca 1: `06:30 - 07:30`
    2. Ca 2: `07:30 - 08:30`
    3. Ca 3: `08:30 - 09:30`
    4. Ca 4: `09:30 - 10:30`
    5. Ca 5: `10:30 - 11:00`
  - **Buổi chiều (13:30 – 15:30):** Gồm 2 ca khám cố định:
    6. Ca 6: `13:30 - 14:30`
    7. Ca 7: `14:30 - 15:30`
- **Riêng Thứ Bảy:** Chỉ tiếp nhận khám bệnh buổi sáng (`06:30 – 11:00`). Đặt lịch vào chiều Thứ Bảy bị từ chối với lỗi `SATURDAY_MORNING_ONLY`.
- Mọi lịch hẹn ngoài khung giờ trên bị từ chối với lỗi `OUTSIDE_OPERATING_HOURS`.
- Thời gian đặt hẹn phải khớp chính xác với giờ bắt đầu ca trực của bác sĩ (`SCHEDULE_TIME_MISMATCH`).

### C. Ràng buộc tính toán trạng thái lịch hẹn theo thời gian thực (Status Evaluation)
Hệ thống tính toán trạng thái động khi trả về client (`_appointment_response`) dựa trên ngày hiện tại theo múi giờ cơ sở (`Asia/Ho_Chi_Minh`):
1. **Lịch hẹn ở tương lai (`appt_date > now_date`):**
   - Luôn luôn là **`CONFIRMED`** (**Chờ khám**).
   - Tuyệt đối không thể chuyển thành `Đã sử dụng` hay `Hết hạn` khi ngày khám chưa đến.
2. **Lịch hẹn trong ngày hôm nay (`appt_date == now_date`):**
   - Đã làm thủ tục check-in hoặc đang có tiến trình khám (`Visit`): `CHECKED_IN` (**Đang thực hiện khám**).
   - Chưa check-in: `CONFIRMED` (**Chờ khám trong ngày**).
3. **Lịch hẹn đã qua ngày (`appt_date < now_date`):**
   - Nếu bệnh nhân đã check-in / hoàn thành khám: `CHECKED_IN` (**Đã sử dụng**).
   - Nếu đã qua ngày hẹn mà bệnh nhân **chưa từng check-in**: Tự động chuyển thành **`EXPIRED`** (**Hết hạn**).
4. **Lịch hẹn bị hủy:** `CANCELLED` (**Đã hủy**).

### D. Ràng buộc Check-in tiếp nhận tại viện
- Bệnh nhân **chỉ được phép check-in vào đúng ngày hẹn khám**.
- Check-in trước ngày hẹn: Bị từ chối với mã lỗi `APPOINTMENT_NOT_TODAY` (*"Chưa đến ngày hẹn khám..."*).
- Check-in khi đã quá ngày hẹn: Bị từ chối với mã lỗi `APPOINTMENT_EXPIRED` (*"Lịch hẹn khám này đã quá hạn..."*).

### E. Ràng buộc phòng chống đặt trùng
- Bệnh nhân không được phép đặt lịch khám trong quá khứ (`APPOINTMENT_IN_PAST`).
- Không được đặt trùng một gói khám khi đang có một lịch hẹn khác của cùng gói đó ở trạng thái chờ khám (`DUPLICATE_APPOINTMENT`).

### F. Quy chuẩn lưu trữ thời gian (UTC Rule)
- CSDL SQLite và Backend luôn tính toán và lưu thời gian ở chuẩn **UTC** có timezone (`timestamptz` / ISO 8601 kết thúc bằng `Z` hoặc `+00:00`).
- Frontend chịu trách nhiệm chuyển đổi sang múi giờ cơ sở (`Asia/Ho_Chi_Minh`) khi hiển thị thông qua bộ tiện ích `facilityTime.ts` (`parseUtcDate`, `formatFacilityDate`, `formatFacilityTime`).

---

## 4. CHI TIẾT CÁC LUỒNG GIAO DIỆN (UI FLOWS)

### Luồng 1: Đặt lịch khám 4 bước (`BookingPage.tsx`)
```
[Bước 1: Hồ sơ bệnh nhân]
       │
       ▼ (Chọn hồ sơ hoặc thêm mới qua AddNewProfileModal)
[Bước 2: Chọn gói khám]
       │
       ▼ (Xem dịch vụ, giá tiền & cảnh báo y tế bắt buộc)
[Bước 3: Lịch hẹn & Bảng lịch bác sĩ]
       │
       ├─► Bảng lịch (ScheduleCalendar):
       │     • Xanh lá (emerald): Còn chỗ
       │     • Vàng (amber): Hết chỗ
       │     • Xám (slate): Không khả dụng (Quá khứ / Chủ nhật)
       │
       ├─► Chọn ca khám cụ thể (Bác sĩ, phòng khám, giờ khám)
       ├─► Chọn thông tin BHYT / Bảo hiểm tư nhân
       │
       ▼ (Bấm Xác nhận đặt khám)
[Bước 4: Phiếu khám bệnh hoàn tất]
       │
       └─► Hiển thị Số thứ tự to tròn, Phòng khám, Bác sĩ, Ngày giờ hẹn, Lời dặn di chuyển
```

### Luồng 2: Tách biệt "Lịch hẹn khám" và "Lịch sử đặt khám"

```
                              ┌──────────────────────────────────────────┐
                              │           MENU BỆNH NHÂN                 │
                              └────────────────────┬─────────────────────┘
                                                   │
                  ┌────────────────────────────────┴──────────────────────────────┐
                  │                                                               │
                  ▼                                                               ▼
    [Lịch hẹn khám - AppointmentsPage]                            [Lịch sử đặt khám - BookingHistoryPage]
    • Dùng để đi khám thực tế tại bệnh viện                       • Nhật ký lưu trữ hồ sơ đăng ký theo thời gian
    • HIỂN THỊ MÃ QR TO & MÃ HẸN                                  • HOÀN TOÀN KHÔNG CÓ MÃ QR
    • Có nút quét QR / nhập mã Check-in tiếp nhận                • Không có nút Check-in (tránh nhầm lẫn tại quầy)
    • Trạng thái: Chờ khám, Đã check-in                           • Bộ lọc: Tất cả / Đã sử dụng / Hết hạn / Chờ khám
                                                                  • Hiển thị: Gói dịch vụ, Bác sĩ, Phòng khám, Giờ đăng ký
```

### Luồng 3: Trang Chức năng độc lập (`FeaturesPage.tsx`) - Lịch Khám Bác Sĩ & Liên Hệ
Trang "Chức năng" trên thanh điều hướng dưới được thiết kế thành một trung tâm tra cứu chuyên biệt với 2 phân mục lớn:

```
                              ┌──────────────────────────────────────────┐
                              │     TAB CHỨC NĂNG (FeaturesPage.tsx)     │
                              └────────────────────┬─────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   │                                                               │
                   ▼                                                               ▼
    [Mục 1: Lịch Khám bệnh (Bác sĩ)]                              [Mục 2: Liên Hệ & Vị Trí]
    • Thanh tìm kiếm (Tên, học vị, chuyên khoa)                   • Thông tin chính thức Bệnh viện ĐHYD TP.HCM
    • 2 pushdown dropdown catalog:                                • Địa chỉ: 215 Hồng Bàng, P.11, Q.5, TP.HCM
      + Lọc theo Chuyên khoa (Nội, TMH, RHM...)                   • Điện thoại, Email, Website, Giờ khám ngoại trú
      + Lọc theo Thứ trong tuần (Thứ 2 đến Thứ 7)                 • Bản đồ tương tác vị trí bệnh viện (Maps)
    • Thẻ bác sĩ (Doctor Card):                                   • Nút gọi hotline cố định: 1900 7178 (24/7)
      - Trái: Ảnh đại diện + Nút "Xem chi tiết"
      - Phải: Học vị + Họ tên (TS. BS...), Chuyên khoa,
        Lịch trực phụ trách (Sáng Thứ 4...), Nút "Đặt khám"
    • Modal chi tiết bác sĩ (Doctor Detail):
      - Tiêu đề: Ảnh, Học hàm học vị, Chuyên môn, Số CCHN
      - 4 tab pushdown viền xanh dương (Blue Accent):
        1. Lịch khám bệnh (Ca trực, phòng khám, số lượt)
        2. Quá trình đào tạo (Trường, học vị, tu nghiệp)
        3. Quá trình công tác (Bệnh viện, chức vụ)
        4. Hiệp hội chuyên môn (Tổ chức y khoa tham gia)
      - Nút hành động: "Đặt khám với bác sĩ" -> BookingPage
```

---

## 5. BẢNG TỔNG HỢP API BACKEND

| Phương thức | Đường dẫn API | Chức năng | Phân quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/doctors` | Danh sách bác sĩ kèm bộ lọc chuyên khoa, thứ trong tuần và từ khóa | Công khai |
| `GET` | `/api/v1/doctors/specialties` | Danh sách các chuyên khoa hiện có để hiển thị dropdown | Công khai |
| `GET` | `/api/v1/doctors/{id}` | Chi tiết lý lịch bác sĩ và 4 tab thông tin | Công khai |
| `GET` | `/api/v1/patients/me/profiles` | Lấy danh sách toàn bộ hồ sơ người bệnh của tài khoản | `account:self_view` |
| `POST` | `/api/v1/patients/me/profiles` | Tạo hồ sơ người bệnh mới | `account:self_update` |
| `POST` | `/api/v1/patients/me/link-by-code` | Liên kết hồ sơ qua mã bệnh nhân cũ trên đơn thuốc | `account:self_update` |
| `POST` | `/api/v1/patients/me/lookup` | Tra cứu hồ sơ cũ theo Họ tên, SĐT, CCCD | `account:self_view` |
| `GET` | `/api/v1/packages` | Danh mục các gói khám đang hoạt động | Công khai |
| `GET` | `/api/v1/packages/{id}/available-schedules?month=YYYY-MM` | Trả về bảng lịch ngày trong tháng (Xanh/Vàng/Xám) kèm ca khám bác sĩ | Công khai |
| `GET` | `/api/v1/patients/me/appointments` | Danh sách lịch hẹn/lịch sử đặt khám của bệnh nhân | `appointment:self_manage` |
| `POST` | `/api/v1/patients/me/appointments` | Đặt lịch hẹn mới theo bác sĩ, gói và khung giờ | `appointment:self_manage` |
| `POST` | `/api/v1/patients/me/appointments/check-in` | Check-in bằng mã hẹn tại viện để tạo `Visit` | `appointment:self_manage` |

---

## 6. LƯU Ý DÀNH CHO THÀNH VIÊN TIẾP NẬN DỰ ÁN

1. **CSDL Local:** Cấu hình trong `backend/app/core/database.py` đã chuẩn hóa đường dẫn tuyệt đối trỏ về `backend/hospital.db`. Không chỉnh sửa thành đường dẫn tương đối để tránh tạo ra nhiều tệp CSDL rải rác.
2. **Khởi chạy local:**
   - Backend: Chạy lệnh `powershell -ExecutionPolicy Bypass -File .\start-backend.ps1` (chạy trên cổng 8000).
   - Frontend: Chạy lệnh `powershell -ExecutionPolicy Bypass -File .\start-frontend.ps1` (chạy trên cổng 5174/5173).
3. **Nếu có Docker:** Nhớ chạy `docker stop smart_opd_backend smart_opd_ai` nếu muốn chạy trực tiếp code python local trên máy để tránh Docker chiếm dụng cổng 8000.
