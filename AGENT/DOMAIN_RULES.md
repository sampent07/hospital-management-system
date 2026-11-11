# DOMAIN_RULES.md — Quy tắc nghiệp vụ bất biến

> Nguồn duy nhất cho quy tắc nghiệp vụ, phân quyền và thuật ngữ. Các file AGENTS.md tham chiếu file này, không lặp lại.
> Nhãn: **[ĐỀ XUẤT]** do BA/trưởng nhóm đề xuất; **[CHỜ CHỐT]** nhóm chưa quyết định, không tự chọn.
> Nếu code mâu thuẫn với file này, **file này đúng**; báo cho nhóm thay vì sửa file.

## 1. Bảng cấu hình (không viết cứng trong code)

| Khóa cấu hình | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_INFERENCE_TIMEOUT_MS` | 500 | Thời gian tối đa cho **một lần** suy luận (đề cương) |
| `ROUTE_COMPUTE_TIMEOUT_MS` | [CHỜ CHỐT] | Thời gian tối đa tính cả lộ trình nhiều bước (cần lớn hơn một lần suy luận) |
| `REALTIME_PROPAGATION_SECONDS` | 2 | Mục tiêu cập nhật hàng đợi và trạng thái tới giao diện (đề cương) |
| `ROUTE_MIN_IMPROVEMENT_MINUTES` | 3 [ĐỀ XUẤT] | Chỉ đề xuất lộ trình mới khi tiết kiệm từ ngưỡng này trở lên |
| `ROUTE_RECALC_COOLDOWN_SECONDS` | [CHỜ CHỐT] | Giãn cách giữa hai lần yêu cầu tính lại (tránh dao động) |
| `WAIT_RETRY_SECONDS` | 60 [ĐỀ XUẤT] | Thử lại sau gợi ý «Chờ thêm» khi mọi hàng đợi đầy |
| `STATUS_UNDO_WINDOW_SECONDS` | 60 [ĐỀ XUẤT] | Thời gian cho phép hoàn tác thao tác trạng thái |
| `OVERDUE_FACTOR` | 1.5 [ĐỀ XUẤT] | Dịch vụ quá hạn khi thời gian thực hiện vượt hệ số này nhân thời gian phục vụ trung bình |

## 2. Quy tắc thời gian (UTC)

- Mọi thời điểm **lưu và tính toán ở UTC**. CSDL dùng kiểu có múi giờ (`timestamptz`); API trả ISO 8601 có hậu tố `Z`.
- Mọi logic về **thời gian chờ ước tính, quá hạn, cửa sổ hoàn tác, giãn cách tính lại, thời gian dự kiến của lộ trình, thời gian lưu viện** được tính ở **backend bằng UTC**. Khoảng thời gian (thời lượng) lưu dạng số giây hoặc số phút, không dùng chuỗi giờ địa phương.
- **Frontend chỉ đổi sang giờ địa phương khi hiển thị** (múi giờ của cơ sở, mặc định `Asia/Ho_Chi_Minh`). Frontend không tự tính lại thời gian chờ hay trạng thái quá hạn; chỉ hiển thị giá trị backend trả về.
- **Ngoại lệ có chủ đích:** các phép tính theo **ngày** (thống kê dashboard theo ngày, «lượt khám trong ngày») phải xác định ranh giới ngày theo **múi giờ của cơ sở** (lấy từ cấu hình) **ở backend**, rồi đổi về UTC để truy vấn. Không để frontend quyết định ranh giới ngày.
- Không dùng thời điểm không có múi giờ (ví dụ `datetime.now()` thiếu `tz`). Dùng một hàm lấy thời gian dùng chung để thay bằng đồng hồ giả trong test.

## 3. Vòng đời dịch vụ của lượt khám

- Trạng thái: `NOT_STARTED → WAITING → IN_PROGRESS → COMPLETED`.
- Chỉ chuyển **đúng thứ tự, từng bước**. Sai thứ tự hoặc lặp thì từ chối bằng lỗi nghiệp vụ.
- Bắt đầu (`IN_PROGRESS`) phải kiểm tra số người đang thực hiện chưa vượt số nguồn lực của điểm dịch vụ.
- Mỗi lần chuyển ghi: người thực hiện, thời điểm, cờ «cập nhật thay» khi người ghi không phải người phụ trách mặc định.
- Hoàn tác trong cửa sổ `STATUS_UNDO_WINDOW_SECONDS`; sau đó chỉ sửa kèm nhật ký.
- Hai người cập nhật đồng thời: dùng khóa lạc quan (cột `version`), trả lỗi xung đột `409`, **không ghi đè**.
- Với AI, tiến độ chỉ tính dịch vụ `COMPLETED`; `WAITING` và `IN_PROGRESS` tính vào hàng đợi.

## 4. Hàng đợi

- **Không có bảng hàng đợi riêng.** Hàng đợi của một điểm là các bản ghi `WAITING`, xếp theo ưu tiên rồi thời điểm vào hàng.
- Độ dài hàng đợi, số đang thực hiện, thời gian chờ ước tính là **giá trị dẫn xuất**, tính từ dữ liệu, không lưu trùng.
- Sức chứa hàng đợi lấy từ cấu hình điểm dịch vụ. Đầy thì không xếp thêm.
- Xếp vào hàng đợi chỉ qua **một hàm dùng chung** trong tầng service.
- **Cách tính (kỹ thuật):** lấy số người chờ và số đang thực hiện của **mọi điểm dịch vụ trong một truy vấn tổng hợp** (`GROUP BY` với `COUNT(*) FILTER (...)`) hoặc một SQL View thường khai báo trong migration. Vị trí trong hàng dùng window function (`ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`).
- **Không** truy vấn từng điểm trong vòng lặp (N+1) và **không** tải toàn bộ bản ghi lên để đếm trong code. Vòng lặp trên kết quả nhỏ (khoảng số điểm dịch vụ) để áp công thức là chấp nhận được.
- **Không dùng materialized view** cho dữ liệu này (mục tiêu cập nhật 2 giây). Đặt chỉ mục theo (dịch vụ, trạng thái, thời điểm vào hàng).
- Công thức ước lượng thời gian chờ nằm trong **một hàm duy nhất**, dùng chung cho giao diện và cho đầu vào của AI, để hai nơi không lệch số liệu.

## 5. Gói khám, dịch vụ và ràng buộc

- Gói khám là tập dịch vụ, có **cấp độ**; đối tượng là cá nhân hoặc doanh nghiệp.
- Doanh nghiệp đăng ký gói theo nhóm nhân viên: mỗi dòng nêu gói, nhóm đối tượng, số người. Số đã dùng không vượt số đăng ký.
- Bảng ràng buộc có 4 loại: giữa các gói khám; giữa gói và cấp độ; giữa các bước khám (thứ tự, phụ thuộc, loại trừ); giữa bước khám với gói và cấp độ.
- **Kiểm tra nhất quán khi tạo hoặc sửa gói.** Gói vi phạm không được lưu.
- Mọi lộ trình và mọi chỉ định của bác sĩ **phải qua kiểm tra ràng buộc**. Hoạt động hợp lệ do hàm kiểm tra ràng buộc quyết định, **không do AI**.
- Các quy tắc trong khóa luận (HĐ-1 đến HĐ-5 đúng thứ tự, HĐ-21 làm cuối, khám phụ khoa chỉ cho nữ đã kết hôn, khám nhũ chỉ cho nữ) là **dữ liệu** trong bảng ràng buộc, không phải code.

## 6. Lộ trình và AI

- Hai chức năng:
  1. **Lộ trình ban đầu:** sinh khi bệnh nhân bắt đầu khám.
  2. **Tính lại theo yêu cầu:** bệnh nhân (hoặc nhân viên hỗ trợ) yêu cầu; chỉ đề xuất lộ trình mới **khi tối ưu hơn lộ trình hiện tại** (theo `ROUTE_MIN_IMPROVEMENT_MINUTES`) và vẫn đúng ràng buộc.
- Lộ trình dựa trên chỉ số hàng đợi và thời gian ước lượng **thời gian thực**: số người chờ, số đang thực hiện, số nguồn lực, thời gian chờ ước tính, thời gian phục vụ trung bình, thời gian chờ kết quả.
- Mỗi lộ trình có phiên bản và trạng thái `ACTIVE`, `REPLACED`, `REJECTED` [ĐỀ XUẤT]. Không xóa lộ trình cũ.
- Bệnh nhân chọn: chấp nhận lộ trình mới hoặc giữ lộ trình cũ. Quyết định ghi nhật ký bất biến: người quyết định, nhãn nguồn (AI hay dự phòng), độ tin cậy, thời điểm. Nhân viên thao tác hộ phải ghi rõ.
- **Không có lộ trình tốt hơn** thì trả «lộ trình hiện tại đã tối ưu», không tạo lộ trình mới.
- **Mọi hàng đợi hợp lệ đều đầy:** trả «Chờ thêm», thông báo nhân viên, thử lại sau `WAIT_RETRY_SECONDS`.
- **Dự phòng:** AI quá `AI_INFERENCE_TIMEOUT_MS` hoặc lỗi thì dùng phương án không dùng AI (chọn hoạt động hợp lệ có thời gian chờ ngắn nhất), gắn nhãn «Dự phòng». Không trả lỗi 500 cho người dùng.
- Dịch vụ nằm ngoài tập hoạt động của mô hình: **[CHỜ CHỐT]**, không tự suy diễn.
- Thời gian dự kiến trên lộ trình luôn là **ước lượng**, hiển thị như vậy.

## 7. Chỉ định của bác sĩ (khám theo triệu chứng)

- Lượt khám có hai loại: theo gói; theo chỉ định của bác sĩ.
- **Chỉ `DOCTOR` được tạo chỉ định.** Chỉ định phải qua kiểm tra ràng buộc, sau đó lộ trình được tính lại cho tập dịch vụ mới.
- Phân biệt được dịch vụ đến từ gói hay từ chỉ định.
- Khi khám theo chỉ định, danh sách dịch vụ của lượt khám **không cố định** lúc tiếp nhận.

## 8. Gợi ý gói cho bệnh nhân chưa biết chọn gì

- Chỉ là **gợi ý theo quy tắc** từ vài câu hỏi (tuổi, giới tính, mục đích khám...). Không chẩn đoán.
- **Bắt buộc hiển thị cảnh báo** ở mọi nơi hiển thị gợi ý: đây chỉ là gợi ý, có thể không phù hợp; muốn được tư vấn trực tiếp thì đến quầy tư vấn. Có triệu chứng nguy hiểm thì đến cấp cứu ngay.

## 9. Nhật ký (ba loại, không gộp)

- **Nhật ký hệ thống:** thao tác quản trị (xác thực, đổi vai trò, vô hiệu hóa, xóa, cấu hình, đổi phương thức).
- **Nhật ký quyết định lộ trình:** bất biến.
- **Mốc dịch vụ:** vào hàng đợi, bắt đầu, hoàn thành (nằm trong tiến độ dịch vụ).

## 10. Tài khoản

- Nhân viên tự đăng ký, Admin xác thực: `PENDING → ACTIVE` hoặc `REJECTED`. Không được chọn `ADMIN` khi đăng ký.
- Trạng thái: `PENDING`, `ACTIVE`, `REJECTED`, `DISABLED`, `DELETED` (xóa mềm).
- Luôn còn ít nhất một `ADMIN`. Admin không đổi vai trò, vô hiệu hóa hay xóa chính mình.
- Đổi vai trò hoặc vô hiệu hóa thì kết thúc các phiên đang mở.
- Bệnh nhân tự đăng ký, có bước xác minh riêng [ĐỀ XUẤT: số điện thoại và mã xác nhận].

## 11. Phân quyền

| Nhóm quyền | `ADMIN` | `COORDINATOR` và `DOCTOR` | `PATIENT` |
|---|---|---|---|
| Quản lý tài khoản, gói, dịch vụ, ràng buộc, doanh nghiệp, cấu hình | ✅ | ❌ | ❌ |
| Dashboard thống kê, kiểm soát nhân viên | ✅ | ❌ | ❌ |
| Tiếp nhận bệnh nhân, cập nhật trạng thái dịch vụ | ❌ | ✅ | ❌ |
| Xem danh sách, tiến độ, hàng đợi, lịch sử hành trình | ✅ chỉ xem | ✅ | Chỉ của mình |
| Hỗ trợ lộ trình (xem, yêu cầu tính lại hộ) | ❌ | ✅ | ✅ của mình |
| **Chỉ định dịch vụ** | ❌ | ✅ chỉ `DOCTOR` | ❌ |
| Quyết định lộ trình mới hoặc giữ cũ | ❌ | ✅ thao tác hộ, ghi rõ | ✅ |
| Xem nhật ký quyết định | ✅ tất cả | ✅ phần của mình | ❌ |

- Phân quyền **luôn kiểm tra ở backend**, theo **tên quyền** (ví dụ `progress:update_status`), gán quyền cho vai trò ở **một chỗ duy nhất**. Không rải `if role == ...`.
- Bệnh nhân chỉ truy cập dữ liệu của chính mình; mọi truy vấn dữ liệu bệnh nhân lọc theo chủ sở hữu.
- **[CHỜ CHỐT]** Bác sĩ có bị giới hạn theo điểm phụ trách. Mặc định: điểm phụ trách chỉ làm mặc định hiển thị, không giới hạn quyền.

## 12. Bảng thuật ngữ Việt–Anh (đồng bộ với ERD)

| Tiếng Việt | Tên trong code |
|---|---|
| Tài khoản | `Account` |
| Vai trò | `Role` (`ADMIN`, `COORDINATOR`, `DOCTOR`, `PATIENT`) |
| Bệnh nhân | `Patient` |
| Lượt khám | `Visit` |
| Dịch vụ khám (trước là «hoạt động») | `ExamService` |
| Tiến độ dịch vụ của lượt khám | `VisitProgress` |
| Gói khám, cấp độ gói | `Package`, `PackageTier` |
| Ràng buộc | `Constraint` |
| Doanh nghiệp, đăng ký gói của doanh nghiệp | `Company`, `CompanyPackageRegistration` |
| Hàng đợi | `Queue` (dẫn xuất, không có bảng) |
| Lộ trình, bước lộ trình, quyết định lộ trình | `Route`, `RouteStep`, `RouteDecision` |
| Chỉ định của bác sĩ | `ServiceOrder` |
| Thông báo | `Notification` |
| Phương thức điều phối | `DispatchMethod` |
| Nhật ký hệ thống | `SystemLog` |

Ghi chú: tên `ExamService` tránh nhầm với tầng `services/` ở backend. ERD đổi tên thì sửa bảng này trước.
