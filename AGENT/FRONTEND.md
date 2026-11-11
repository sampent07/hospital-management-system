# frontend/AGENTS.md — Web nhân viên, Admin và cổng bệnh nhân

> Áp dụng cho `frontend/web-staff/` (nhân viên và Admin) và `frontend/patient-app/` (bệnh nhân, web và ứng dụng). Bổ sung cho `/AGENTS.md`; nếu mâu thuẫn thì file này ưu tiên. Quy tắc nghiệp vụ ở `/docs/DOMAIN_RULES.md`.

## Stack và lệnh

React + TypeScript (`strict: true`). **[CHỜ CHỐT]** công nghệ ứng dụng di động của bệnh nhân và cách dùng chung mã với web. Trình quản lý gói (`pnpm` ở dưới) cũng **[CHỜ CHỐT]**.

```bash
pnpm dev
pnpm lint && pnpm typecheck && pnpm test
```

## Quy tắc chung

- **Cấm `any`.** Dùng `unknown` rồi thu hẹp kiểu.
- Component nhỏ, một nhiệm vụ. **Không đặt logic nghiệp vụ trong component**; tách vào hook hoặc service. Giao diện chỉ hiển thị giá trị backend trả về, không tự tính lại thời gian chờ hay trạng thái quá hạn.
- Kiểu dữ liệu API **sinh từ OpenAPI** của backend, không gõ tay kiểu trùng lặp.
- **State tối giản:** dùng `useState`, `useContext` và thư viện lấy dữ liệu của dự án. Không thêm thư viện quản lý state phức tạp (Redux...) khi chưa được cả nhóm đồng ý.
- **Form:** dùng `react-hook-form` kết hợp `zod` **[ĐỀ XUẤT]**, schema phải khớp quy tắc validate của backend. Backend vẫn là nơi validate cuối cùng.
- Văn bản giao diện tiếng Việt đặt trong **file tài nguyên**, không rải trong JSX.
- Mọi màn hình xử lý đủ **4 trạng thái**: đang tải, lỗi, rỗng, có dữ liệu.
- Giao diện thích ứng màn hình điện thoại; chú ý nhãn, tương phản, thao tác bàn phím.

## Thời gian

Backend trả thời điểm ở **UTC (ISO 8601)**. Frontend **chỉ đổi sang giờ địa phương khi hiển thị**, theo múi giờ của cơ sở (mặc định `Asia/Ho_Chi_Minh`), dùng **một hàm định dạng dùng chung**. Không tự cộng trừ múi giờ bằng tay. Không tự quyết định ranh giới «ngày» cho thống kê; dùng dữ liệu backend trả về.

## Thời gian thực

- Dùng **một hook WebSocket dùng chung**: tự kết nối lại, tải lại bằng REST khi mất kết nối, hiển thị rõ khi đang mất kết nối.
- Cập nhật giao diện theo sự kiện (`queue.updated`, `visit_progress.status_changed`, `route.proposed`, `route.applied`, `notification.created`). Không dựa vào polling dày để giả lập thời gian thực.

## Bắt buộc hiển thị

- **Cảnh báo của gợi ý gói** ở mọi nơi hiển thị gợi ý: chỉ là gợi ý, có thể không phù hợp; muốn được tư vấn trực tiếp thì đến quầy tư vấn; triệu chứng nguy hiểm thì đến cấp cứu ngay.
- **Thời gian dự kiến trên lộ trình ghi rõ là ước lượng.**
- Khi AI dự phòng: không hiển thị lỗi kỹ thuật cho người dùng; chỉ hiển thị nhãn nguồn nếu thiết kế yêu cầu.

## Phân quyền ở giao diện

Chặn route và ẩn nút theo vai trò chỉ để trải nghiệm tốt. **Bảo mật thật nằm ở backend.** Không lưu token dài hạn ở nơi dễ bị lộ (ví dụ `localStorage`) [ĐỀ XUẤT: cookie `HttpOnly`].

## Riêng `web-staff/`

- Trang «Điểm dịch vụ của tôi» gồm 3 khối: **Đang thực hiện**, **Đang chờ** (theo giờ vào hàng, bệnh nhân ưu tiên có nhãn), **Vừa hoàn thành**. Thao tác một chạm cho «Bắt đầu» và «Hoàn thành», có hoàn tác trong cửa sổ cho phép.
- Nút «Chỉ định dịch vụ» **chỉ hiện với `DOCTOR`**.
- Admin: không có thao tác vận hành luồng bệnh nhân; dashboard chỉ đọc dữ liệu thống kê.

## Riêng `patient-app/`

- **Bệnh nhân luôn là người bấm xác nhận** lộ trình mới hoặc giữ lộ trình cũ. Không tự đổi lộ trình khi chưa có xác nhận.
- Chỉ hiển thị dữ liệu của chính bệnh nhân. Dữ liệu sổ sức khỏe, đơn thuốc, bản đồ thuộc **giai đoạn sau**; không làm khi chưa được giao.
- Nếu có mã dùng chung giữa web và ứng dụng, đặt ở một gói dùng chung riêng (ví dụ `frontend/shared/`) **[ĐỀ XUẤT]**, không sao chép giữa hai app.

## Test

Kiểm thử component và các luồng chính: tiếp nhận, cập nhật trạng thái, yêu cầu tính lại lộ trình và quyết định, hiển thị cảnh báo gợi ý gói, hiển thị giờ đúng múi giờ.
