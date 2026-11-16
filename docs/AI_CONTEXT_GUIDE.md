# Hướng dẫn ngữ cảnh AI cho Smart OPD

> Chỉ mục và tóm tắt để thành viên cung cấp ngữ cảnh cho AI. Quy tắc chuẩn vẫn nằm trong `AGENTS.md` và `DOMAIN_RULES.md`; tài liệu này không thay thế chúng.

## 1. Dự án và phạm vi

Đây là hệ thống điều phối khám ngoại trú cho bệnh viện, phát triển dựa trên ý tưởng/mô hình AI từ khóa luận `smart-opd-platform`. Nhóm tập trung xây dựng hệ thống nghiệp vụ, không triển khai lại nghiên cứu AI.

- Dùng mô hình đã huấn luyện để suy luận/gợi ý theo hợp đồng hiện có.
- Không huấn luyện lại, sửa mô hình, thêm mô phỏng hoặc dùng dữ liệu y tế thật.
- AI chỉ đề xuất thứ tự/lộ trình; hệ thống không chẩn đoán hay quyết định y khoa.
- Bệnh nhân là tác nhân chính của luồng tự phục vụ; điều phối viên hỗ trợ tại quầy; bác sĩ thực hiện nghiệp vụ được phân quyền; Admin quản trị và theo dõi vận hành.
- Chỉ sử dụng dữ liệu mẫu trong code, seed, prompt và ví dụ.

## 2. Tài liệu cần đọc trước khi code

1. `AGENTS.md` ở gốc repository.
2. `AGENTS.md` trong thư mục gần nhất với file sẽ sửa (chẳng hạn `backend/AGENTS.md`, `ai-service/AGENTS.md`, `frontend/AGENTS.md`).
3. `docs/DOMAIN_RULES.md` trước khi sửa nghiệp vụ, phân quyền, trạng thái, dữ liệu hoặc thuật ngữ.
4. Use case liên quan: `docs/USE_CASES.md`, `docs/PATIENT_USE_CASES.md` (nếu là luồng bệnh nhân), và đặc tả/thiết kế phù hợp.
5. Code hiện tại trong module cần sửa. Không giả định API, model hay component dựa riêng vào tài liệu.

## 3. Nguồn chuẩn và xử lý mâu thuẫn

- `AGENTS.md`: cách làm việc, kiến trúc và quy ước code.
- `docs/DOMAIN_RULES.md`: nguồn chuẩn cho quy tắc nghiệp vụ, phân quyền, thời gian và thuật ngữ. Nếu code/tài liệu khác mâu thuẫn, báo lại; không tự sửa quy tắc.
- `docs/USE_CASES.md`: danh mục UC tổng quan và mã hiện dùng trong repository.
- `docs/PATIENT_USE_CASES.md`: UC01–UC05 do phụ trách bệnh nhân cung cấp; các khác biệt với danh mục/DOMAIN_RULES được ghi lại, chưa tự thay thế tài liệu chuẩn.
- Project khóa luận `smart-opd-platform`: chỉ tham khảo mô hình và cách tích hợp cần thiết. Không đưa module mô phỏng hay giả định nghiệp vụ cũ vào hệ thống hiện tại.
- `[CHỜ CHỐT]` không được tự quyết định. `[ĐỀ XUẤT]` chưa phải quy tắc đã chốt.

Khi có mâu thuẫn, nêu file/mục, tác động và quyết định cần chốt trước khi triển khai phần phụ thuộc.

## 4. Nguyên tắc triển khai

- Backend kiểm tra quyền và quy tắc nghiệp vụ; không dựa vào việc ẩn nút trên frontend.
- Giữ đúng phân lớp hiện tại. Backend: router → service → repository; repository là nơi truy vấn dữ liệu. Frontend hiển thị dữ liệu backend trả về, không tự tính quy tắc nghiệp vụ.
- Mọi truy vấn bệnh nhân phải giới hạn theo danh tính đã xác thực; không tin `patient_id` từ client nếu chưa xác minh quyền sở hữu.
- Ghi trạng thái/nhật ký theo quy tắc bất biến; thời gian lưu và tính bằng UTC, chỉ định dạng giờ địa phương khi hiển thị.
- Không hardcode quy tắc gói/dịch vụ, ngưỡng thời gian hay mã hoạt động; dùng cấu hình và bảng ràng buộc hiện có.
- Giao diện xử lý đủ trạng thái tải, lỗi, rỗng và có dữ liệu.
- Thay đổi nhỏ đúng UC; không refactor ngoài phạm vi, thêm dependency, công nghệ, schema, API hoặc cấu trúc mới trái hướng dẫn `AGENTS.md`.
- Khi bổ sung logic nghiệp vụ, bổ sung test tương ứng; không làm yếu test hiện có.

## 5. Mẫu giao việc cho AI

```text
Ngữ cảnh: UC <mã và tên>, module <tên>, vai trò <vai trò>.
Yêu cầu: <một thay đổi cụ thể>.
Tiêu chí chấp nhận: <hành vi có thể kiểm tra>.
File liên quan: <đường dẫn nếu biết>.
Không đụng: <phạm vi loại trừ>.
Lỗi/tái hiện: <nếu sửa lỗi; loại bỏ dữ liệu nhạy cảm>.
```

AI cần nêu giả định, kế hoạch ngắn khi cần, thay đổi đã làm, kiểm tra đã chạy và kết quả. Không bịa endpoint, field, thư viện hoặc quyết định đang chờ chốt.

## 6. Phạm vi bệnh nhân hiện được ghi nhận

`docs/PATIENT_USE_CASES.md` lưu UC01 đăng nhập, UC02 xem thông tin cá nhân, UC03 xem/đăng ký gói, UC04 theo dõi tiến độ, UC05 xem hàng đợi. Danh mục tổng thể có thêm luồng bệnh nhân như tự tiếp nhận, lộ trình và gợi ý gói; chỉ triển khai khi có UC/tiêu chí phù hợp và đã đối chiếu `DOMAIN_RULES.md`.

## 7. Các điểm không được AI tự chốt

Tham chiếu danh sách đầy đủ trong `AGENTS.md` và `docs/DOMAIN_RULES.md`. Những điểm có thể ảnh hưởng trực tiếp bệnh nhân gồm xác minh tài khoản, cách tự tiếp nhận, dịch vụ ngoài tập mô hình, giới hạn/nhịp tính lại lộ trình và cách đánh giá hiệu quả. Đặc tả UC mới không tự chốt các điểm này.
