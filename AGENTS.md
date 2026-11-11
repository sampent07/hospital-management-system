# AGENTS.md — Smart OPD Orchestration Platform

> Áp dụng cho toàn repo. Thư mục nào có AGENTS.md riêng (`backend/`, `ai-service/`, `frontend/`) thì file gần file đang sửa nhất được ưu tiên. Yêu cầu trực tiếp của người dùng trong chat luôn ưu tiên hơn file này.
> Nhãn: **[ĐỀ XUẤT]** = BA/trưởng nhóm đề xuất, nhóm có thể đổi. **[CHỜ CHỐT]** = nhóm chưa quyết định, AI **không được tự chọn**.

## 1. Dự án trong 30 giây

Hệ thống điều phối khám chữa bệnh, giúp **giảm tối đa thời gian khám** của bệnh nhân (không cam kết một con số cố định). Mô hình học tăng cường đã huấn luyện sẵn chỉ dùng để suy luận. Nhóm 4 thành viên, dữ liệu hoàn toàn là dữ liệu mẫu.

Vai trò: `PATIENT` (web/app: tự tiếp nhận, xem lộ trình, yêu cầu tính lại, nhận thông báo), `COORDINATOR` và `DOCTOR` (cùng nhóm quyền vận hành; chỉ `DOCTOR` được chỉ định dịch vụ), `ADMIN` (quản trị, dashboard, kiểm soát nhân viên; không vận hành luồng bệnh nhân).

**Ngoài phạm vi, tuyệt đối không thêm:** mô phỏng (SimPy, kịch bản, tác vụ mô phỏng); dữ liệu y tế thật; huấn luyện lại hay sửa mô hình; chẩn đoán hoặc quyết định y khoa.

## 2. Cấu trúc repo

```
backend/      API nghiệp vụ         → có AGENTS.md riêng
ai-service/   suy luận, sinh lộ trình → có AGENTS.md riêng
frontend/     web-staff/ (nhân viên + Admin), patient-app/ (bệnh nhân) → có AGENTS.md riêng
seed/         dữ liệu mẫu và script nạp
docs/         đề cương, UC, ERD, đặc tả, DOMAIN_RULES.md
docker-compose.yml
```

**Bắt buộc:** trước khi tạo hoặc sửa code trong một thư mục, AI phải **đọc AGENTS.md của thư mục đó (nếu có)** và các AGENTS.md ở thư mục cha cho tới gốc repo. Không dựa vào việc công cụ tự nạp. Với Claude Code, mỗi thư mục có AGENTS.md đều có `CLAUDE.md` chỉ chứa dòng `@AGENTS.md`.

**Trước khi sửa logic nghiệp vụ, đọc `docs/DOMAIN_RULES.md`.** File đó là nguồn duy nhất cho quy tắc nghiệp vụ, phân quyền và bảng thuật ngữ; không lặp lại ở đây.

## 3. Lệnh thường dùng

Lệnh theo công nghệ mặc định, **[CHỜ CHỐT]** cho đến khi nhóm chốt stack. Sửa lại cho khớp trước khi dùng.

```bash
docker compose up -d                 # chạy toàn hệ thống (backend, ai-service, CSDL)

# backend/
ruff check . && ruff format --check .  # lint
mypy app                              # kiểm tra kiểu
pytest -q                             # test
alembic upgrade head                  # áp migration
alembic revision --autogenerate -m "<mô tả>"   # tạo migration

# frontend/<app>/
pnpm lint && pnpm typecheck && pnpm test

# seed/
python seed/load.py                   # nạp dữ liệu mẫu
```

**Trước mỗi commit phải chạy lint, kiểm tra kiểu và test của phần mình sửa. Không commit khi còn lỗi.**

## 4. Nguyên tắc cốt lõi

1. **AI chỉ gợi ý, con người quyết định.** Không tự áp dụng lộ trình mới cho bệnh nhân khi chưa có xác nhận.
2. **Hệ thống không quyết định y khoa.** Bác sĩ chỉ định; hệ thống chỉ tối ưu thứ tự và thời gian chờ.
3. **Không hardcode quy tắc nghiệp vụ.** Thứ tự, điều kiện đối tượng, loại trừ, phụ thuộc, cấp độ gói nằm trong **bảng ràng buộc**. Không viết cứng số hoạt động (19, 20, 21) hay mã hoạt động.
4. **Mọi thay đổi trạng thái ghi người thực hiện và thời điểm.** Nhật ký bất biến (không UPDATE, không DELETE). Tài khoản xóa mềm.
5. **Phân quyền kiểm tra ở backend**, không chỉ ẩn nút ở giao diện.
6. **Ngưỡng thời gian không viết cứng** (2 giây cập nhật, 500 ms một lần suy luận...): đặt ở cấu hình, xem bảng trong `docs/DOMAIN_RULES.md`.
7. **Chỉ dùng dữ liệu mẫu.** Không dán dữ liệu thật hoặc secret vào code hay prompt.
8. **Đơn giản trước (Simplicity First).** Không over-engineering: không thêm lớp trừu tượng, pattern hay thư viện khi chưa cần. Viết code tuần tự, tường minh.
9. **Thay đổi nhỏ, đúng phạm vi.** Không refactor ngoài việc được giao.
10. **Logic nghiệp vụ phải có test.**

## 5. Quy ước code chung

- **Đặt tên:** định danh (biến, hàm, lớp, bảng, cột, endpoint) bằng tiếng Anh, theo bảng thuật ngữ ở `docs/DOMAIN_RULES.md`. Chuỗi hiển thị tiếng Việt đặt trong file tài nguyên, không rải trong code.
- **Hàm ngắn, một nhiệm vụ** (khoảng 50 dòng trở xuống, trừ trường hợp đặc biệt như transaction chuyển trạng thái). **Dùng guard clause** (return sớm) thay vì lồng điều kiện sâu hơn 3 tầng.
- **Không số ma thuật.** Hằng hoặc cấu hình có tên.
- **Lỗi:** dùng exception nghiệp vụ có tên (`InvalidStatusTransition`, `ConstraintViolation`, `QueueFull`...). Không nuốt lỗi.
- **Log:** có cấu trúc, **không log thông tin cá nhân hay mật khẩu.**
- **Thời gian:** backend tính toán và lưu ở **UTC (ISO 8601)**; chỉ đổi sang giờ địa phương khi hiển thị ở frontend. Chi tiết và ngoại lệ ở `docs/DOMAIN_RULES.md`, mục «Quy tắc thời gian».
- **Không thêm dependency, đổi công nghệ hay cấu trúc thư mục khi chưa hỏi.**

### Chú thích (comment) bằng tiếng Việt

Mỗi hàm public ở service hoặc endpoint có docstring ngắn: nhiệm vụ, tham số, giá trị trả về, lỗi có thể ném.

```python
def complete_progress(progress_id: UUID, actor: Account) -> VisitProgress:
    """Ghi nhận hoàn thành một dịch vụ của lượt khám.

    Args:
        progress_id: ID tiến độ dịch vụ cần hoàn thành.
        actor: Người thực hiện (dùng để ghi nhật ký).

    Returns:
        Bản ghi tiến độ sau khi cập nhật.

    Raises:
        InvalidStatusTransition: nếu dịch vụ chưa ở trạng thái đang thực hiện.
        ConcurrentUpdateError: nếu người khác vừa cập nhật cùng bản ghi.
    """
```

**Comment trong dòng chỉ viết ở logic đặc thù**, giải thích *vì sao*, không lặp lại code làm gì:
- chuyển trạng thái đồng thời (khóa phiên bản);
- kiểm tra ràng buộc và sinh hoạt động hợp lệ;
- dự phòng khi AI quá hạn hoặc lỗi;
- tính lại lộ trình và ngưỡng cải thiện;
- múi giờ (lưu UTC) và gửi lại thông báo.

## 6. Ranh giới

**Luôn làm**
- Nêu **giả định** ở đầu câu trả lời; hỏi lại khi yêu cầu chưa rõ.
- Với việc lớn (nhiều file hoặc đổi cấu trúc): đưa **kế hoạch ngắn trước**, chờ xác nhận.
- Viết test cùng lúc với code nghiệp vụ.
- Kết thúc bằng: tóm tắt thay đổi, danh sách file đã sửa, cách chạy test.

**Hỏi trước khi làm**
- Thêm thư viện hoặc công nghệ mới.
- Đổi hợp đồng API, schema CSDL, phân quyền hoặc cấu trúc thư mục.
- Sửa migration đã được merge.
- Mọi điểm đang **[CHỜ CHỐT]** (mục 9).

**Không bao giờ**
- Thêm mô phỏng, dữ liệu y tế thật, huấn luyện lại mô hình.
- Tự áp dụng lộ trình mới cho bệnh nhân.
- Bỏ qua bảng ràng buộc hoặc hardcode quy tắc nghiệp vụ.
- Xóa cứng tài khoản; sửa hoặc xóa nhật ký bất biến.
- Đặt logic nghiệp vụ trong router hoặc component giao diện.
- Xóa hay làm yếu test để «cho qua».
- Bịa endpoint, trường dữ liệu hoặc tên thư viện.
- Đưa secret, mật khẩu, token vào code hoặc prompt.

## 7. Git và Pull Request

- **Tên commit:** `[Phân hệ] Nội dung thay đổi`. Ví dụ: `[Visit] Thêm API cập nhật trạng thái dịch vụ`, `[UI-Patient] Màn hình xem lộ trình`.
- Phân hệ gợi ý: `Auth`, `Package`, `Constraint`, `Company`, `Visit`, `Queue`, `Route`, `AI`, `Order`, `Notify`, `Admin`, `UI-Staff`, `UI-Patient`, `DB`, `Seed`, `Infra`, `Docs`.
- **Mỗi commit phải chạy được** (build và test không lỗi), để không chặn thành viên khác.
- Nhánh: `feature/<phân-hệ>-<mô-tả>`, `fix/<mô-tả>`. Không force push, không commit trực tiếp vào `main`.
- PR nhỏ, một mục đích, liên kết mã UC, cần ít nhất một người review. Mô tả PR ghi **phần nào do AI viết** và đã kiểm tra thế nào.

## 8. Giao việc cho AI

Mẫu prompt:

```
Ngữ cảnh: UC <mã, tên>, module <tên>, thực thể <tên>.
Yêu cầu: <một việc nhỏ>.
Tiêu chí chấp nhận: <điều kiện kiểm tra được>.
Log/lỗi hiện tại (khi sửa bug): <dán log lỗi, bước tái hiện, kết quả mong đợi; xóa dữ liệu nhạy cảm trước khi dán>.
File liên quan: <đường dẫn>. Không đụng: <phạm vi cấm>.
Trả lời gồm: giả định, kế hoạch ngắn, code, test, cách chạy.
```

Khi AI vi phạm quy tắc, nhắc: «Vi phạm AGENTS.md mục X, sửa lại». Người commit chịu trách nhiệm: đọc, chạy test và hiểu code trước khi merge.

## 9. Điểm đang chờ chốt

1. Backend: FastAPI hay Node.js (hiện viết theo FastAPI).
2. Công nghệ ứng dụng di động của bệnh nhân và cách dùng chung mã với web.
3. Nhà cung cấp tin nhắn thông báo (hoặc giả lập khi demo).
4. Bác sĩ có bị giới hạn theo điểm phụ trách hay không.
5. Cách xử lý dịch vụ nằm ngoài tập hoạt động của mô hình AI.
6. Ngưỡng cải thiện tối thiểu và giới hạn tần suất tính lại lộ trình.
7. Tên thực thể cuối cùng sau khi chốt ERD (cập nhật bảng thuật ngữ).
