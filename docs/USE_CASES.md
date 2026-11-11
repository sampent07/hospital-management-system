# DANH MỤC ĐẶC TẢ USE CASES (USE CASE SPECIFICATION)

> Trích xuất và hệ thống hóa từ tài liệu `docs/Đặc tả UC GĐ2.pdf` và các sơ đồ `Diagram UC`.
> Dùng làm kim chỉ nam để các thành viên trong nhóm nhận việc và code tính năng bổ sung.

---

## BẢNG PHÂN CHIA VÀ THEO DÕI TIẾN ĐỘ THÀNH VIÊN

| Nhóm Use Case | Mã UC | Tên Use Case | Tác nhân chính | Module Backend | Màn hình Frontend |
|---|---|---|---|---|---|
| **BỆNH NHÂN** | `PAT-01` | Đăng ký & Đăng nhập tài khoản | Patient | `api/v1/auth_router.py` | `patient-app/Login.tsx` |
| | `PAT-02` | Xem & Cập nhật thông tin tài khoản | Patient | `api/v1/auth_router.py` | `patient-app/Profile.tsx` |
| | `PAT-03` | Xem & Đăng ký gói khám | Patient | `api/v1/package_router.py` | `patient-app/Packages.tsx` |
| | `PAT-04` | Gợi ý gói khám theo triệu chứng/đối tượng | Patient | `api/v1/package_router.py` | `patient-app/PackageAdvisor.tsx` |
| | `PAT-05` | Tự tiếp nhận (Kiosk / App Check-in) | Patient | `api/v1/visit_router.py` | `patient-app/CheckIn.tsx` |
| | `PAT-06` | Theo dõi lộ trình & tiến độ khám | Patient | `api/v1/route_router.py` | `patient-app/LiveJourney.tsx` |
| | `PAT-07` | Xem trạng thái hàng đợi tại điểm khám | Patient | `api/v1/queue_router.py` | `patient-app/QueueStatus.tsx` |
| | `PAT-08` | Yêu cầu tính lại lộ trình | Patient | `api/v1/route_router.py` | `patient-app/RouteRecalculateModal.tsx` |
| | `PAT-09` | Quyết định chấp nhận / giữ lộ trình | Patient | `api/v1/route_router.py` | `patient-app/RouteDecisionModal.tsx` |
| | `PAT-10` | Xem lịch sử khám & Kết luận / đơn thuốc | Patient | `api/v1/visit_router.py` | `patient-app/History.tsx` |
| | `PAT-11` | Xuất file kết quả khám (PDF) | Patient | `api/v1/visit_router.py` | `patient-app/ExportReport.tsx` |
| **BÁC SĨ & THƯ KÝ** | `STAFF-01` | Đăng nhập & Đăng xuất nhân viên | Doctor, Coordinator | `api/v1/auth_router.py` | `web-staff/Login.tsx` |
| | `STAFF-02` | Xem & Cập nhật thông tin cá nhân | Doctor, Coordinator | `api/v1/auth_router.py` | `web-staff/Profile.tsx` |
| | `STAFF-03` | Xem danh sách hàng đợi tại điểm phụ trách | Doctor, Coordinator | `api/v1/queue_router.py` | `web-staff/MyServicePoint.tsx` |
| | `STAFF-04` | Tiếp nhận bệnh nhân tại quầy lễ tân | Coordinator | `api/v1/visit_router.py` | `web-staff/Reception.tsx` |
| | `STAFF-05` | Xem & Cập nhật hồ sơ bệnh nhân | Coordinator, Doctor | `api/v1/visit_router.py` | `web-staff/PatientDetail.tsx` |
| | `STAFF-06` | Chuyển trạng thái dịch vụ (Bắt đầu / Hoàn thành) | Coordinator, Doctor | `api/v1/visit_router.py` | `web-staff/MyServicePoint.tsx` |
| | `STAFF-07` | Hoàn tác thao tác trạng thái (trong 60s) | Coordinator, Doctor | `api/v1/visit_router.py` | `web-staff/MyServicePoint.tsx` |
| | `STAFF-08` | Chỉ định dịch vụ bổ sung (Khám theo triệu chứng) | Doctor (chỉ bác sĩ) | `api/v1/service_order_router.py` | `web-staff/DoctorConsultation.tsx` |
| | `STAFF-09` | Ghi nhận kết quả cận lâm sàng / chẩn đoán | Doctor | `api/v1/visit_router.py` | `web-staff/DoctorConsultation.tsx` |
| | `STAFF-10` | Kê đơn thuốc & Lập kế hoạch điều trị | Doctor | `api/v1/visit_router.py` | `web-staff/DoctorConsultation.tsx` |
| | `STAFF-11` | Lập kết luận khám & In phiếu khám | Doctor | `api/v1/visit_router.py` | `web-staff/DoctorConsultation.tsx` |
| | `STAFF-12` | Hỗ trợ tính lại lộ trình & Thao tác hộ bệnh nhân | Coordinator | `api/v1/route_router.py` | `web-staff/RouteSupportModal.tsx` |
| | `STAFF-13` | Quản lý lịch hẹn & Đặt lịch tái khám | Coordinator, Doctor | `api/v1/visit_router.py` | `web-staff/Appointments.tsx` |
| | `STAFF-14` | Bác sĩ ủy quyền cho Thư ký | Doctor | `api/v1/admin_router.py` | `web-staff/Authorization.tsx` |
| | `STAFF-15` | Thư ký tiếp nhận ủy quyền | Coordinator | `api/v1/admin_router.py` | `web-staff/Authorization.tsx` |
| **QUẢN TRỊ VIÊN (ADMIN)** | `ADM-01` | Đăng nhập Admin | Admin | `api/v1/auth_router.py` | `web-staff/Login.tsx` |
| | `ADM-02` | Quản lý tài khoản & Duyệt tài khoản nhân viên | Admin | `api/v1/admin_router.py` | `web-staff/admin/Accounts.tsx` |
| | `ADM-03` | Phân quyền & Đổi vai trò (kèm gán điểm phụ trách) | Admin | `api/v1/admin_router.py` | `web-staff/admin/Accounts.tsx` |
| | `ADM-04` | Vô hiệu hóa / Kích hoạt / Xóa mềm tài khoản | Admin | `api/v1/admin_router.py` | `web-staff/admin/Accounts.tsx` |
| | `ADM-05` | Cấu hình điểm dịch vụ (bàn khám, sức chứa, thời gian TB) | Admin | `api/v1/admin_router.py` | `web-staff/admin/ServicePoints.tsx` |
| | `ADM-06` | Điều phối nhân lực theo điểm dịch vụ | Admin | `api/v1/admin_router.py` | `web-staff/admin/ServicePoints.tsx` |
| | `ADM-07` | Quản lý danh mục dịch vụ khám | Admin | `api/v1/admin_router.py` | `web-staff/admin/ExamServices.tsx` |
| | `ADM-08` | Quản lý gói khám & cấp độ gói | Admin | `api/v1/admin_router.py` | `web-staff/admin/Packages.tsx` |
| | `ADM-09` | Quản lý ràng buộc giữa gói, cấp độ, bước khám | Admin | `api/v1/admin_router.py` | `web-staff/admin/Constraints.tsx` |
| | `ADM-10` | Kiểm tra tính nhất quán của bảng ràng buộc | Admin | `api/v1/admin_router.py` | `web-staff/admin/Constraints.tsx` |
| | `ADM-11` | Quản lý khách hàng doanh nghiệp & hợp đồng gói | Admin | `api/v1/admin_router.py` | `web-staff/admin/Companies.tsx` |
| | `ADM-12` | Dashboard thống kê thời gian chờ & lưu viện | Admin | `api/v1/admin_router.py` | `web-staff/admin/Dashboard.tsx` |
| | `ADM-13` | Giám sát hàng đợi tổng thể toàn viện (Realtime) | Admin | `api/v1/admin_router.py` | `web-staff/admin/HospitalQueueOverview.tsx` |
| | `ADM-14` | Xem nhật ký hệ thống bất biến (Audit Logs) | Admin | `api/v1/admin_router.py` | `web-staff/admin/SystemLogs.tsx` |
| | `ADM-15` | Xuất báo cáo thống kê định kỳ | Admin | `api/v1/admin_router.py` | `web-staff/admin/Dashboard.tsx` |

---

## NGUYÊN TẮC KHI THÀNH VIÊN VÀO CODE BỔ SUNG 1 USE CASE

1. **Chọn mã UC từ bảng trên**: Mỗi thành viên tạo nhánh `feature/<ma-uc>-<ten-tinh-nang>` (Ví dụ: `feature/pat-08-recalculate-route`).
2. **Không phá vỡ cấu trúc phân lớp**:
   - Schema Pydantic tách riêng khỏi ORM Model.
   - Truy vấn SQL chỉ nằm trong Repository (`app/repositories/`).
   - Logic kiểm tra điều kiện nghiệp vụ và ranh giới Transaction nằm trong Service (`app/services/`).
   - Router chỉ nhận request, dependency inject auth/permission, gọi Service và trả response (`app/api/v1/`).
3. **Tuân thủ quy tắc thời gian UTC**: Lưu UTC ở CSDL, Backend tính toán UTC, Frontend chỉ hiển thị theo múi giờ `Asia/Ho_Chi_Minh` bằng hàm tiện ích dùng chung `formatDateTime`.
4. **Phân quyền bằng Dependency**: Dùng `require_permission("ten:quyen")`, không dùng `if role == "ADMIN"`.
5. **Viết kiểm thử (Unit test)**: Mỗi logic nghiệp vụ có ít nhất 1 test case tích cực và 1 test case chặn lỗi.
