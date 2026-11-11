# ai-service/AGENTS.md — Dịch vụ suy luận và sinh lộ trình

> Áp dụng cho `ai-service/`. Bổ sung cho `/AGENTS.md`; nếu mâu thuẫn thì file này ưu tiên. Quy tắc nghiệp vụ ở `/docs/DOMAIN_RULES.md` (mục «Lộ trình và AI»).

## Stack và lệnh

Python, FastAPI, PyTorch. Tách riêng khỏi backend để chạy và nâng phiên bản độc lập.

```bash
uvicorn app.main:app --reload
ruff check . && mypy app && pytest -q
```

## Vai trò

Nhận **trạng thái bệnh nhân** và **danh sách hoạt động hợp lệ** từ backend; trả hoạt động hoặc lộ trình đề xuất, độ tin cậy, phương pháp, thời gian dự kiến. Dịch vụ **không quyết định ràng buộc** và **không quyết định y khoa**.

## Quy tắc

- **Stateless.** Không lưu dữ liệu bệnh nhân, không đọc CSDL của backend. Mọi thứ cần thiết nằm trong request.
- **Chỉ trả hoạt động nằm trong danh sách hợp lệ** backend gửi. Danh sách hợp lệ rỗng thì trả kết quả «chờ thêm», không bịa hoạt động.
- Validate đầu vào bằng Pydantic; thiếu hoặc sai thì trả `422` rõ ràng.
- Hợp đồng request/response có **phiên bản** (`/v1/...`). Đổi hợp đồng phải báo nhóm backend trước.
- Đầu vào dùng **thời lượng (giây hoặc phút)**, không nhận giờ địa phương. Nếu có thời điểm thì UTC ISO 8601.
- **Mô hình có phiên bản**, nạp lúc khởi động và kiểm tra nạp được. Không nạp được thì báo trạng thái lỗi ở endpoint sức khỏe (`/health`), **không tự chuyển sang phương pháp khác mà không gắn nhãn**.
- **Không huấn luyện lại, không sửa trọng số.** Chỉ suy luận.
- Lộ trình đầy đủ được suy ra bằng cách áp dụng chính sách lặp lại trên ước lượng thời gian chờ. Giới hạn số bước lặp; ghi giới hạn này vào tài liệu và vào phản hồi (thời gian dự kiến là **ước lượng**).
- Trả «**không có lộ trình tốt hơn**» khi không tìm được lộ trình tiết kiệm từ `ROUTE_MIN_IMPROVEMENT_MINUTES` trở lên; không tạo lộ trình chỉ để có kết quả.
- Mỗi phản hồi ghi: phiên bản mô hình, độ trễ, phương pháp thực dùng.
- Không import code từ `backend/`. Hai dịch vụ chỉ nói chuyện qua hợp đồng API.

## Test

- Dùng **dữ liệu cố định và seed cố định** để kết quả lặp lại được.
- Bộ test «đầu vào chuẩn → đầu ra mong đợi» cho: hoạt động hợp lệ duy nhất, nhiều hoạt động, danh sách rỗng, không có lộ trình tốt hơn.
- Kiểm tra độ trễ một lần suy luận so với `AI_INFERENCE_TIMEOUT_MS`.
- Khi có gói thực tế (tập con của tập hoạt động mô hình): **[CHỜ CHỐT]** kiểm chứng chất lượng gợi ý trước khi dùng.
