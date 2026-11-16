# Đặc tả Use Case – Bệnh nhân (bản nhóm cung cấp)

> Trạng thái: ghi nhận từ đặc tả gửi ngày 14/11/2026. Chưa thay thế `USE_CASES.md` hoặc các mục `[CHỜ CHỐT]` trong `DOMAIN_RULES.md`.
> Phạm vi: UC01–UC05 trong nội dung nhóm cung cấp; không suy diễn luồng chưa đặc tả.

## Quy ước và lưu ý đồng bộ

- Mã `UC01`–`UC05` là mã trong đặc tả này; danh mục hiện dùng `PAT-01` trở đi. Cần thống nhất mã trước khi liên kết issue, API hoặc nhánh Git.
- Đăng nhập dùng tên đăng nhập và mật khẩu; việc xác minh tài khoản bệnh nhân khi đăng ký cần đối chiếu `DOMAIN_RULES.md`.
- UC03 chưa xác định thời điểm đăng ký, thanh toán, đăng ký trùng hay hủy đăng ký.
- UC04/UC05 yêu cầu cập nhật thời gian thực; khi mất kết nối phải báo lỗi và giữ dữ liệu gần nhất. Kênh cập nhật cụ thể chưa quy định.
- UC05 nói tới gợi ý điều phối đã xác nhận. Quy tắc chung vẫn yêu cầu bệnh nhân quyết định; không tự áp dụng lộ trình.
- Chỉ dùng dữ liệu mẫu. Không suy ra phạm vi hồ sơ y tế, lịch sử khám hay đơn thuốc từ các UC này.

---

## UC01: Đăng nhập

**Mô tả:** Cho phép bệnh nhân đăng nhập vào hệ thống bằng tài khoản đã đăng ký.  
**Sự kiện kích hoạt:** Bệnh nhân chọn chức năng Đăng nhập.  
**Tác nhân:** Bệnh nhân.  
**Use Case liên quan:** Không có.  
**Tiền điều kiện:** Bệnh nhân đã đăng ký tài khoản hợp lệ.  
**Hậu điều kiện:** Bệnh nhân đăng nhập thành công và được chuyển đến trang chủ.

### Dòng sự kiện chính

1. Bệnh nhân nhập tên đăng nhập và mật khẩu.
2. Hệ thống kiểm tra thông tin đăng nhập.
3. Hệ thống xác thực thành công và chuyển đến trang chủ.

**Biến thể:** Không có.

### Ngoại lệ

- **Sai thông tin đăng nhập:** Hệ thống thông báo lỗi và yêu cầu nhập lại.
- **Tài khoản bị khóa hoặc vô hiệu hóa:** Hệ thống từ chối đăng nhập.

---

## UC02: Xem thông tin cá nhân

**Mô tả:** Cho phép bệnh nhân xem thông tin cá nhân được lưu trên hệ thống.  
**Sự kiện kích hoạt:** Bệnh nhân chọn chức năng Xem thông tin cá nhân.  
**Tác nhân:** Bệnh nhân.  
**Use Case liên quan:** Được mở rộng (`extend`) bởi Cập nhật thông tin cá nhân.  
**Tiền điều kiện:** Bệnh nhân đã đăng nhập thành công.  
**Hậu điều kiện:** Thông tin cá nhân của bệnh nhân được hiển thị.

### Dòng sự kiện chính

1. Bệnh nhân chọn chức năng Xem thông tin cá nhân.
2. Hệ thống truy xuất thông tin cá nhân của bệnh nhân.
3. Hệ thống hiển thị thông tin cá nhân.

### Biến thể

- Bệnh nhân chọn Cập nhật thông tin cá nhân để chỉnh sửa hồ sơ.

### Ngoại lệ

- **Không tìm thấy thông tin cá nhân:** Hệ thống thông báo không có dữ liệu.

---

## UC03: Xem và đăng ký gói khám

**Mô tả:** Cho phép bệnh nhân xem thông tin và đăng ký gói khám phù hợp.  
**Sự kiện kích hoạt:** Bệnh nhân chọn chức năng Xem và đăng ký gói khám.  
**Tác nhân:** Bệnh nhân.  
**Use Case liên quan:** Không có.  
**Tiền điều kiện:** Bệnh nhân đã đăng nhập thành công.  
**Hậu điều kiện:** Thông tin đăng ký gói khám được lưu vào hệ thống.

### Dòng sự kiện chính

1. Bệnh nhân chọn chức năng Xem và đăng ký gói khám.
2. Hệ thống hiển thị danh sách các gói khám.
3. Bệnh nhân chọn gói khám muốn xem.
4. Hệ thống hiển thị thông tin chi tiết gói khám.
5. Bệnh nhân chọn Đăng ký gói khám.
6. Hệ thống hiển thị thông tin đăng ký để xác nhận.
7. Bệnh nhân xác nhận đăng ký.
8. Hệ thống lưu thông tin và thông báo đăng ký thành công.

### Biến thể

- Bệnh nhân chỉ xem thông tin gói khám mà không đăng ký.
- Bệnh nhân hủy xác nhận đăng ký; hệ thống không lưu thông tin.

### Ngoại lệ

- **Không có gói khám khả dụng:** Hệ thống thông báo không có dữ liệu.
- **Đăng ký thất bại:** Hệ thống thông báo lỗi và cho phép thử lại.

---

## UC04: Theo dõi tiến độ khám của bản thân

**Mô tả:** Cho phép bệnh nhân theo dõi tiến độ thực hiện các hoạt động trong quy trình khám.  
**Sự kiện kích hoạt:** Bệnh nhân chọn chức năng Theo dõi tiến độ khám.  
**Tác nhân:** Bệnh nhân.  
**Use Case liên quan:** Không có.  
**Tiền điều kiện:** Bệnh nhân đã đăng nhập và có quy trình khám được ghi nhận.  
**Hậu điều kiện:** Tiến độ khám hiện tại được hiển thị.

### Dòng sự kiện chính

1. Bệnh nhân chọn chức năng Theo dõi tiến độ khám.
2. Hệ thống truy xuất tiến độ khám của bệnh nhân.
3. Hệ thống hiển thị các hoạt động đã hoàn thành, đang thực hiện và chưa thực hiện.
4. Hệ thống cập nhật tiến độ khi có thay đổi.

**Biến thể:** Không có.

### Ngoại lệ

- **Chưa có dữ liệu tiến độ:** Hệ thống thông báo chưa có thông tin.
- **Mất kết nối thời gian thực:** Hệ thống thông báo và giữ dữ liệu gần nhất.

---

## UC05: Xem trạng thái hàng đợi

**Mô tả:** Cho phép bệnh nhân theo dõi trạng thái hàng đợi tại các phòng khám liên quan.  
**Sự kiện kích hoạt:** Bệnh nhân chọn chức năng Xem trạng thái hàng đợi.  
**Tác nhân:** Bệnh nhân.  
**Use Case liên quan:** Được mở rộng (`extend`) bởi Xem gợi ý điều phối khám.  
**Tiền điều kiện:** Bệnh nhân đã đăng nhập và có quy trình khám được ghi nhận.  
**Hậu điều kiện:** Thông tin hàng đợi được hiển thị và cập nhật.

### Dòng sự kiện chính

1. Bệnh nhân chọn chức năng Xem trạng thái hàng đợi.
2. Hệ thống truy xuất trạng thái hàng đợi tại các phòng khám liên quan.
3. Hệ thống hiển thị số lượng bệnh nhân đang chờ và trạng thái hàng đợi.
4. Hệ thống cập nhật thông tin khi có thay đổi.

### Biến thể

- Khi thời gian chờ dự kiến cao và có phương án điều phối hợp lệ đã được xác nhận, hệ thống hiển thị gợi ý điều phối khám.
- Gợi ý không tự đổi lộ trình; việc chấp nhận hoặc giữ lộ trình phải tuân thủ `DOMAIN_RULES.md`.

### Ngoại lệ

- **Không có dữ liệu hàng đợi:** Hệ thống thông báo chưa có thông tin.
- **Mất kết nối thời gian thực:** Hệ thống thông báo và giữ dữ liệu gần nhất.

---

## Các điểm cần làm rõ trước khi triển khai

1. Mã UC chính thức: `UC01`–`UC05` hay đồng bộ sang `PAT-xx` trong `USE_CASES.md`.
2. UC02 chưa nêu trường được cập nhật, cách xác thực thay đổi và nhật ký.
3. UC03 chưa nêu trạng thái đăng ký, đăng ký nhiều gói/trùng hay xử lý khi gói ngừng khả dụng.
4. UC04 cần xác nhận “hoạt động” tương ứng dịch vụ trong lộ trình; backend là nguồn trạng thái duy nhất và dữ liệu chỉ thuộc bệnh nhân hiện tại.
5. UC05 cần xác định hàng đợi liên quan và nội dung được phép hiển thị; không lộ thông tin nhận dạng bệnh nhân khác.
6. Tài liệu này không thêm UC đăng ký tài khoản, tự tiếp nhận, tính lại lộ trình hoặc quyết định lộ trình vì chưa có đặc tả chi tiết trong nội dung vừa cung cấp.
