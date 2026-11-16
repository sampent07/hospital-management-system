# Hướng dẫn demo App bệnh nhân

App bệnh nhân được phát triển riêng trong `frontend/patient-app/`. Không sửa `frontend/web-staff/`; hai ứng dụng dùng chung backend và CSDL để điều phối viên duyệt đăng ký, nhân viên cập nhật tiến độ, còn bệnh nhân chỉ đọc dữ liệu thuộc tài khoản của mình.

## Khởi chạy

1. Chạy backend và database theo hướng dẫn trong `DEVELOPER_GUIDE.md`.
2. Từ `seed/`, nạp dữ liệu bằng `python load.py`.
3. Từ `frontend/patient-app/`, chạy `npm run dev` rồi mở địa chỉ Vite hiển thị trong terminal (mặc định cổng `5174`).
4. API Swagger hiện tại ở `/api/v1/docs`.

Seed chỉ thêm các bản ghi phụ thuộc vào danh mục package/service có sẵn; loader bỏ qua ID đã tồn tại nên có thể nạp lặp mà không tạo thêm bản sao. Mốc lịch hẹn được tính tương đối với thời điểm chạy seed.

## Tài khoản và dữ liệu demo

- Bệnh nhân đăng nhập bằng tài khoản `patient` đã có trong `seed/seed_data.json`; mật khẩu demo nằm cùng bản ghi tài khoản trong file seed.
- Tài khoản `coordinator` có sẵn để xác nhận thao tác duyệt đăng ký qua API. Không dùng tài khoản này trong App bệnh nhân.
- Bệnh nhân demo có ba đăng ký gói có chủ đích: gói cơ bản đã thanh toán demo và có lượt khám đang diễn ra; gói tiêu chuẩn đã thanh toán demo và có lịch hẹn sắp tới; gói VIP đang chờ điều phối viên duyệt. Cả ba đều tham chiếu package hiện hữu.
- Lượt khám đang diễn ra có một dịch vụ hoàn thành, một dịch vụ đang chờ và một dịch vụ chưa bắt đầu. Route seed chỉ tham chiếu hai progress chưa hoàn thành. Các trạng thái này tạo dữ liệu cho UC04/UC05 mà không lưu số lượng hàng đợi hoặc ETA trùng lặp.
- Lịch hẹn đã check-in và lượt khám hiện tại tạo hành trình mẫu. Lịch hẹn `CONFIRMED` còn lại dùng để thử check-in bằng mã hoặc QR; cả hai cách gửi cùng mã hẹn và cùng tạo tối đa một visit.

## Luồng đề xuất để demo

1. Đăng nhập bằng bệnh nhân demo. Tài khoản mới có thể đi qua đăng ký và xác nhận demo; API trả mã xác nhận tại chỗ, không gửi SMS/email.
2. Xem/cập nhật hồ sơ, xem các gói và gửi đăng ký mới. Trạng thái chờ duyệt được lưu trong backend.
3. Điều phối viên duyệt đăng ký qua `POST /api/v1/package-registrations/{registration_id}/approve`. Điểm duyệt hiện được cung cấp ở API; `web-staff` chưa có màn hình duyệt đăng ký gói bệnh nhân và được giữ nguyên theo yêu cầu tách phần App.
4. Làm mới App, xác nhận thanh toán demo, rồi đặt lịch cho gói đã thanh toán. Không có giao dịch tiền thật.
5. Mở lịch hẹn. Dùng camera để quét QR có nội dung bằng mã hẹn hoặc nhập mã thủ công. Backend kiểm tra chủ sở hữu và trạng thái, sau đó tạo visit dùng chung với nghiệp vụ tiếp nhận.
6. Theo dõi tiến độ và lộ trình. Nhân viên cập nhật trạng thái từ quy trình web hiện có; App tải lại dữ liệu dùng chung và bệnh nhân tự quyết định khi có route đề xuất mới.
7. Xem hàng đợi tổng hợp. API riêng cho bệnh nhân không trả tên, visit ID hay thông tin nhận dạng của người khác.

## Giới hạn demo được giữ rõ

- Thanh toán chỉ chuyển trạng thái sang `PAID` với phương thức `DEMO`.
- QR chứa mã hẹn ngắn không kèm dữ liệu cá nhân; backend vẫn xác thực quyền sở hữu, kể cả khi mã bị chụp hoặc chia sẻ.
- Check-in chỉ dùng lịch `CONFIRMED`; quy tắc check-in sớm/muộn và lịch không gắn gói chưa được tự suy diễn.
- Dịch vụ trong dữ liệu lấy từ seed hiện có. Không thêm role thu ngân/kỹ thuật viên, dịch vụ mới, hồ sơ bệnh án, chẩn đoán hay đơn thuốc.
- PWA cache shell giao diện; không cache response API hay thông tin cá nhân. Cần kết nối để dùng nghiệp vụ.
- Khi không có lượt khám được chọn, App tải snapshot hàng đợi qua REST nhưng không mở WebSocket bệnh nhân vì kênh realtime cần visit ID đã xác minh.
