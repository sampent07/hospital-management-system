# Kế hoạch triển khai nghiệp vụ Bệnh nhân trên App

> **Trạng thái: Kế hoạch nền + triển khai MVP đang thực hiện.** Các quyết định người phụ trách đã xác nhận được ghi ở dưới. Ý tưởng gắn `[CHỜ THẦY CHỐT]` vẫn chưa phải yêu cầu triển khai.
> **Phạm vi đầu vào:** các UC01–UC05 tại `PATIENT_USE_CASES.md`; các quy tắc bắt buộc tại `AGENTS.md`, `frontend/AGENTS.md`, `docs/DOMAIN_RULES.md`.

## 1. Mục tiêu

Hoàn thiện luồng bệnh nhân trên ứng dụng trong phạm vi UC đã được giao, theo kiến trúc và API thực tế của repository. Bệnh nhân chỉ được đọc dữ liệu của chính mình; backend giữ quyền quyết định nghiệp vụ và quyền truy cập. MVP có thể bổ sung đăng ký/xác minh giả lập để demo sau khi chốt luồng; không tự mở rộng sang xác minh thật, sổ sức khỏe/đơn thuốc/bản đồ, tự tiếp nhận, lộ trình AI hoặc UC khác khi chưa có đặc tả và tiêu chí được duyệt.

## 2. Hiện trạng đã quan sát

- `frontend/patient-app/` là ứng dụng React 18 + TypeScript + Vite dành riêng cho bệnh nhân. UI, điều hướng, component và PWA nằm trong thư mục này; không sửa `frontend/web-staff/` để tránh xung đột phần việc của nhóm.
- Patient App và web staff kết nối tại backend: dùng chung API, phân quyền và CSDL. Dữ liệu App tạo ra được backend lưu để các luồng nhân viên có thể đọc/cập nhật theo quyền. Ví dụ API duyệt đăng ký gói dành cho `COORDINATOR`; web staff chưa có màn hình duyệt trong phạm vi phần việc này, nên demo duyệt qua API/Swagger cho tới khi nhóm web tích hợp.
- Đã có manifest/service worker cho app shell; PWA này không đồng nghĩa có offline nghiệp vụ hoặc push notification.
- `package.json` có scripts `dev`, `build`, `lint`, `typecheck`, `test`, nhưng lựa chọn package manager trong hướng dẫn còn `[CHỜ CHỐT]`; không tự đổi lockfile hay công cụ.
- Đặc tả bệnh nhân hiện có UC01–UC05; theo định hướng của bạn sẽ dùng mã `PAT-xx` trong danh mục và lập bảng ánh xạ, không đổi mã hàng loạt.
- Tên API, schema, trạng thái và mô hình dữ liệu phải xác minh từ OpenAPI/backend đang có; không dùng tên ví dụ trong danh mục UC như một hợp đồng API đã tồn tại. API mới cho luồng bệnh nhân nằm ở backend dùng chung.

### Ranh giới phần việc

- **Được sửa:** `frontend/patient-app/`, backend dùng chung (router/service/schema/model/permission/migration), seed và tài liệu/kiểm tra liên quan trực tiếp tới luồng bệnh nhân.
- **Không sửa:** `frontend/web-staff/` và các màn hình/luồng staff do thành viên khác phụ trách.
- **Điểm nối:** backend là hợp đồng tích hợp. App không gọi trực tiếp database hoặc phụ thuộc component của web staff. Các thao tác staff cần thiết được cung cấp bằng API có phân quyền để nhóm web tích hợp độc lập.
- **Giới hạn demo:** API điều phối viên duyệt đăng ký gói đã có; do không sửa web staff, thao tác duyệt thực hiện qua Swagger cho tới khi nhóm tích hợp giao diện.

## 3. Nguyên tắc xuyên suốt

1. Trước mỗi thay đổi, đọc AGENTS từ gốc đến thư mục sửa; đọc `docs/DOMAIN_RULES.md` trước mọi logic nghiệp vụ.
2. Backend xác thực quyền và quyền sở hữu dữ liệu. UI guard chỉ hỗ trợ trải nghiệm, không thay thế bảo mật backend.
3. Không tự tính lại thời gian chờ/trạng thái/lộ trình ở frontend; hiển thị kết quả backend. Backend dùng UTC, frontend chỉ định dạng giờ địa phương theo cấu hình/múi giờ cơ sở.
4. Lộ trình AI luôn là gợi ý; bệnh nhân phải xác nhận chấp nhận hoặc giữ lộ trình cũ. Ghi nhãn dự phòng theo quy tắc; không đưa lỗi kỹ thuật thô cho bệnh nhân.
5. Gợi ý gói phải có cảnh báo bắt buộc từ `frontend/AGENTS.md` và `docs/DOMAIN_RULES.md` ở mọi nơi hiển thị.
6. Mỗi màn hình có đủ tải, lỗi, rỗng, có dữ liệu; luồng realtime có trạng thái mất kết nối và giữ dữ liệu gần nhất theo UC.
7. Không thêm thư viện/công nghệ, đổi API/schema/phân quyền hoặc cấu trúc thư mục nếu chưa được duyệt theo `AGENTS.md`.
8. Chỉ dùng dữ liệu mẫu; không ghi thông tin sức khỏe thật, token, mật khẩu hoặc dữ liệu cá nhân vào log, fixture hay prompt.

## 4. Kế hoạch theo giai đoạn

| Giai đoạn | Công việc | Công cụ/kỹ thuật | Đầu ra và điều kiện qua bước |
|---|---|---|---|
| 0. Chốt phạm vi | Dùng định hướng PWA và mã PAT-xx đã thống nhất trong trao đổi; xác nhận phạm vi demo, ánh xạ UC và các phần chưa quyết định. | `PATIENT_USE_CASES.md`, `USE_CASES.md`, `DOMAIN_RULES.md`, trao đổi nhóm/giảng viên, bảng quyết định bên dưới. | Định hướng đã ghi nhận; các chi tiết còn mở (như luồng đăng ký demo) được chốt trước khi code phần phụ thuộc. |
| 1. Khảo sát nền tảng hiện có | Đọc cấu trúc app, component, auth flow, API/OpenAPI, backend services/schemas, cấu hình môi trường và test scripts. Đối chiếu UI hiện tại với UC. | VS Code; `rg`; `Get-Content`; `git status`/`git log`; OpenAPI hiện hành; npm/pnpm chỉ theo package manager đã được nhóm chốt. | Bảng “đã có / thiếu / sai khác / phụ thuộc backend”; không giả định endpoint từ tên file hoặc bảng UC. |
| 2. Chốt luồng và hợp đồng dữ liệu | Viết tiêu chí chấp nhận từng UC; xác minh dữ liệu trả về, lỗi, quyền sở hữu, phân trang/làm mới và sự kiện realtime. Đánh dấu chỗ backend chưa hỗ trợ. | Đặc tả UC; OpenAPI/backend; sơ đồ luồng; tài liệu API trong repo. | Mỗi màn hình/luồng có đầu vào, đầu ra, lỗi và hành vi quyền rõ ràng. API/schema mới nếu cần phải được duyệt riêng. |
| 3. Chuẩn bị giao diện dùng chung | Xác lập điều hướng, layout mobile-first, thành phần hiển thị trạng thái, thông báo lỗi và định dạng thời gian theo cấu trúc đang có. Không dựng design system mới nếu chưa cần. | React + TypeScript hiện có; Tailwind hiện có; công cụ browser devtools; tài nguyên chuỗi tiếng Việt theo hướng dẫn frontend. | Khung điều hướng và pattern trạng thái nhất quán; không thêm dependency. |
| 4. D-03 Đăng ký/xác minh giả lập | Sau khi chốt UX demo, tạo tài khoản bệnh nhân mẫu/luồng đăng ký demo và bước xác nhận giả lập. Không gọi SMS/email thật; tách rõ trạng thái demo khỏi xác minh thật. | React form; backend auth contract hiện có; dữ liệu seed; browser network tools. | Có thể trình diễn đăng ký và xác nhận theo quy trình demo đã duyệt. Không lưu mã xác nhận thật/secret trong source; backend vẫn kiểm tra role và dữ liệu. Nếu cần endpoint/schema mới, xin duyệt trước. |
| 5. UC01 Đăng nhập | Form tên đăng nhập/mật khẩu; gửi xác thực qua hợp đồng hiện hành; xử lý sai thông tin/tài khoản bị khóa hoặc vô hiệu hóa; điều hướng khi thành công; xử lý phiên an toàn. | Component React; service/hook theo cấu trúc hiện có; OpenAPI client theo quy trình repo nếu có; browser network tools. | Không lưu token dài hạn trong `localStorage`; cơ chế cookie/session cần tuân thủ backend. Backend từ chối tài khoản không hợp lệ; không tiết lộ quá mức thông tin tài khoản. |
| 6. UC02 Hồ sơ cá nhân | Tải và hiển thị hồ sơ của bệnh nhân đang đăng nhập; cho sửa các trường được ERD/model/API hỗ trợ sau khi chốt trường nhạy cảm và kiểm soát cập nhật. | React page/component; API contract hiện có; form theo thư viện đã có/chốt; kiểm tra network và quyền backend. | Không nhận `patient_id` tùy ý để đọc/sửa hồ sơ khác; chỉ lưu các field được backend cho phép và xác thực. |
| 7. UC03 Gói khám | Hiển thị danh sách/chi tiết; đăng ký nhiều gói; hiển thị chờ duyệt; sau khi duyệt cho chạy bước thanh toán giả lập thành công theo luồng demo. | React; API thực tế; UI xác nhận; browser responsive/devtools; trạng thái/backend contract đã duyệt. | Mỗi đăng ký gắn đúng bệnh nhân/gói; không thanh toán thật. Cần duyệt mô hình đăng ký cá nhân, trạng thái, quyền duyệt và API/schema trước khi tích hợp. |
| 8. UC04 Tiến độ khám | Hiển thị dịch vụ theo trạng thái backend; tải lần đầu qua REST; áp dụng cập nhật realtime; báo mất kết nối và giữ snapshot gần nhất. | Hook WebSocket dùng chung theo `frontend/AGENTS.md`; REST fallback; React state tối giản; kiểm tra event schema backend. | Bệnh nhân chỉ thấy lượt khám của mình; UI không tự chuyển trạng thái, xếp lại thứ tự hoặc suy diễn thời gian hoàn tất. |
| 9. UC05 Hàng đợi | Hiển thị tổng hợp hàng đợi liên quan và tiến độ riêng của bệnh nhân; nhận cập nhật realtime và xử lý mất kết nối. Gợi ý điều phối chỉ hiển thị theo hợp đồng hợp lệ. | Hook WebSocket chung; REST snapshot; event schema; kiểm tra quyền dữ liệu. | Không lộ danh tính/thông tin bệnh nhân khác; không tự áp dụng gợi ý hay tạo lộ trình mới từ giao diện. |
| 10. Rà soát luồng và hoàn thiện | Kiểm tra điều hướng, phiên hết hạn, lỗi mạng, tải lại, bàn phím, kích thước màn hình, nhãn/độ tương phản, trạng thái PWA và copy cảnh báo. | Browser DevTools; responsive mode; công cụ accessibility có sẵn; lint/typecheck/build/test scripts hiện có. | Không còn lỗi luồng đã xác định; mọi trạng thái tải/lỗi/rỗng/có dữ liệu rõ; không lộ dữ liệu cá nhân trong log. |
| 11. Bàn giao | Ghi kết quả, file đổi, quyết định đã chốt/còn mở và cách chạy/kiểm tra; tạo commit theo quy ước khi đủ kiểm tra. | Git; checklist UC; lệnh đúng trong `package.json` và hướng dẫn repo. | PR/commit gắn mã UC chính thức, ghi phần AI hỗ trợ và kết quả kiểm tra theo quy định. |

## 5. Tiêu chí nghiệm thu tối thiểu theo UC

- **UC01:** đăng nhập hợp lệ dẫn tới vùng bệnh nhân; sai mật khẩu cho phép thử lại; tài khoản bị khóa/vô hiệu hóa bị từ chối; session được lưu/refresh theo cơ chế backend đã chốt.
- **UC02:** chỉ hiển thị hồ sơ người đang đăng nhập; có trạng thái tải, lỗi, rỗng và dữ liệu; chỉ sửa field ERD được backend cho phép, không sửa hồ sơ của người khác.
- **UC03:** xem danh sách/chi tiết; có thể rời luồng mà không đăng ký; xác nhận mới gửi đăng ký nhiều gói; chọn lịch hẹn thông minh qua **Bảng lịch khả dụng của Bác sĩ theo Gói khám (theo ERD LICHKHAM)** với 3 trạng thái màu trực quan (Xanh: Còn chỗ, Vàng: Kín chỗ, Xám: Không khả dụng); chọn slot khung giờ, bác sĩ và phòng khám cụ thể trước khi xác nhận; theo dõi chờ duyệt và thanh toán giả lập thành công sau duyệt; không gọi cổng thanh toán thật.
- **UC04:** phân biệt đúng các trạng thái backend; khi realtime ngắt, thông báo rõ và giữ dữ liệu mới nhất đã tải; sau kết nối lại tải lại snapshot theo API.
- **UC05:** hiển thị dữ liệu hàng đợi liên quan theo quyền; không rò rỉ nhận dạng người khác; thể hiện mất kết nối; chỉ trình bày gợi ý, quyết định lộ trình vẫn do bệnh nhân.

## 6. Công cụ cụ thể

### Đã có trong repository

- **VS Code**: điều hướng project, tìm symbol và xem diff.
- **React 18, TypeScript strict, Vite, Tailwind CSS**: công nghệ hiện có của `patient-app`; chỉ dùng trong phạm vi web hiện tại cho tới khi nền tảng mobile được chốt.
- **Git**: nhánh theo UC, diff, review và commit. Không commit trực tiếp `main`, không force push.
- **Scripts trong `frontend/patient-app/package.json`**: `dev`, `build`, `lint`, `typecheck`, `test`. Trước khi chạy phải kiểm tra dependency/script đã cài và dùng đúng package manager được nhóm chốt.
- **Browser DevTools**: kiểm tra responsive UI, request/response, cookie/session, WebSocket, console và lỗi mạng; không xuất log có dữ liệu cá nhân.
- **OpenAPI/backend hiện hữu**: nguồn để xác nhận API và kiểu. Không tự tạo endpoint hay viết type trùng nếu repo có quy trình sinh type.

### Chưa tự ý thêm

- React Native/Expo/Capacitor/PWA tooling, thư viện routing, data fetching, form, state management, WebSocket hoặc UI kit mới.
- Dịch vụ SMS/OTP, push notification hoặc analytics bên ngoài.
- Bất kỳ dependency mới nào cần ghi vào manifest/lockfile.

Nếu phát sinh nhu cầu, mô tả lý do, phương án thay thế bằng công cụ sẵn có, ảnh hưởng lockfile/CI/triển khai rồi xin nhóm chốt trước.

## 7. Danh sách quyết định/nghiệp vụ cần chốt hoặc ghi nhận

| Mã | Câu hỏi | Trạng thái trong tài liệu hiện tại | Cách xử lý kế hoạch |
|---|---|---|---|
| D-01 | Patient App là web mobile-first, PWA hay ứng dụng native? Có chia sẻ mã với web staff không? | **Định hướng đã chọn trong chat:** B – PWA, ưu tiên giao diện mobile trực quan, gần trải nghiệm app. | Lập kế hoạch PWA trên React/Vite hiện có. Trước cấu hình manifest/service worker, rà soát build và cài đặt; không thêm thư viện nếu chưa được duyệt. |
| D-02 | Mã UC chính thức là `UC01`–`UC05` hay `PAT-xx`? | **Định hướng đã chọn trong chat:** B – dùng `PAT-xx` với bảng ánh xạ. | Tham chiếu PAT-01 (phần đăng nhập), PAT-02, PAT-03, PAT-06, PAT-07. Phần đăng ký tài khoản của PAT-01 chưa có trong đặc tả UC gửi. |
| D-03 | Bệnh nhân đăng ký/xác minh tài khoản bằng cách nào? | **Đã chọn:** luồng đăng ký/xác nhận demo trước, xác minh thật tích hợp sau. | Mã ngẫu nhiên có hạn trả trực tiếp để demo; không gửi SMS/email, mã được băm khi lưu và tài khoản chỉ hoạt động sau xác nhận. |
| D-04 | UC02 cho phép sửa những trường nào và xác minh thay đổi ra sao? | **Định hướng đã chọn trong chat:** cho sửa trường hồ sơ dựa trên ERD. | ERD liệt kê tên, ngày sinh, giới tính, tình trạng hôn nhân, điện thoại, email, địa chỉ, số giấy tờ. Xác minh với model/API hiện có; xử lý trường định danh nhạy cảm và audit cần chốt. |
| D-05 | Gói khám đăng ký lúc nào, cho phép nhiều gói/trùng không, trạng thái nào và có thanh toán không? | **Đã chọn:** nhiều đăng ký; điều phối viên duyệt; bệnh nhân xác nhận thành công thanh toán demo. | Đã có entity/API đăng ký cá nhân, snapshot giá và người/thời điểm duyệt; các trạng thái là `PENDING_APPROVAL → APPROVED → PAID`. Không kết nối cổng thanh toán thật. |
| D-06 | Tự tiếp nhận cần QR hay mã hẹn? | **Đã chọn:** QR và mã hẹn cùng áp dụng cho một lịch hẹn/lượt check-in. | QR hiển thị trong App và nhập mã dùng chung một endpoint; backend kiểm tra chủ sở hữu và chống tạo visit trùng. |
| D-07 | Dịch vụ nằm ngoài tập hoạt động AI xử lý thế nào và ai phụ trách? | **Đã chốt hướng:** tham khảo quy trình thực tế nhưng giữ role/quy tắc hiện tại. | Điều phối viên duyệt đăng ký và hỗ trợ tiếp nhận/hướng dẫn; chỉ bác sĩ được chỉ định dịch vụ. Không tạo role thu ngân/kỹ thuật viên hoặc tự thêm dịch vụ; App đọc/cập nhật trạng thái dùng chung qua backend. |
| D-08 | Cách tính lại lộ trình, cooldown, ngưỡng cải thiện và quyền bệnh nhân/nhân viên? | **Định hướng hiện tại:** bệnh nhân tự yêu cầu tính lại và tự quyết định nhận/giữ. Tự phát hiện lộ trình tốt hơn là ý tưởng chờ thầy chốt, chưa triển khai. | Không tính lại tự động khi hàng đợi đổi. Ghi ý tưởng và mối lo tải hệ thống riêng; không biến thành yêu cầu hiện hành. |
| D-09 | Hàng đợi nào liên quan tới bệnh nhân và được hiển thị những trường nào? | **Định hướng đã chọn trong chat:** A+B – số liệu tổng hợp điểm trong lộ trình và tiến độ riêng của bệnh nhân. | Chỉ hiển thị thông tin backend cho phép; không hiển thị định danh bệnh nhân khác. Xác minh endpoint và quyền patient self-view. |
| D-10 | Múi giờ cơ sở lấy từ cấu hình nào và backend trả ra sao? | **Định hướng đã chọn trong chat:** A – lấy theo cấu hình cơ sở để hỗ trợ nhiều bệnh viện. | Backend lưu/tính UTC; frontend dùng formatter chung và múi giờ cơ sở, mặc định theo DOMAIN_RULES khi chưa có cấu hình. |

## 8. Ngoài phạm vi của kế hoạch này

- Xây lại AI, huấn luyện mô hình hoặc mô phỏng SimPy.
- Dữ liệu bệnh nhân thật, chẩn đoán, tư vấn y khoa hay tự quyết định dịch vụ.
- Sổ sức khỏe, đơn thuốc, bản đồ và lịch sử khám thuộc giai đoạn sau/chưa có tiêu chí được duyệt.
- Tự phát hiện lộ trình tốt hơn vẫn chờ thầy chốt; không triển khai tự động. Xác minh thật vẫn ngoài phạm vi hiện tại.
- Thay đổi backend API, schema CSDL, phân quyền, kiến trúc app hoặc thêm thư viện. Nếu cần, lập yêu cầu riêng và xin chốt theo `AGENTS.md`.

## 9. Trạng thái các quyết định và câu hỏi còn mở

Các lựa chọn dưới đây ghi nhận điều bạn vừa phản hồi. Chúng chỉ là định hướng cho kế hoạch; thay đổi API/schema, quyền hoặc công nghệ vẫn phải đi theo quy trình duyệt trong `AGENTS.md`.

| Mã | Lựa chọn/định hướng hiện tại | Việc cần làm rõ trước khi code |
|---|---|---|
| D-01 | **B – PWA**, giao diện mobile trực quan, gần trải nghiệm app. | Chốt mức hỗ trợ cài đặt/offline; không mặc định có push notification. |
| D-02 | **B – dùng PAT-xx** và bảng ánh xạ. | UC01→PAT-01 (chỉ đăng nhập), UC02→PAT-02, UC03→PAT-03, UC04→PAT-06, UC05→PAT-07. PAT-01 còn phần đăng ký chưa được đặc tả. |
| D-03 | MVP có thể code luồng demo trước, xác minh thật tích hợp sau. | Chốt cách giả lập; an toàn demo, không SMS thật hoặc thể hiện như định danh thật. UC đăng ký chưa thuộc 5 UC đang mô tả. |
| D-04 | Cho chỉnh sửa thông tin hồ sơ dựa trên ERD. | Đối chiếu các trường với model/API hiện tại và chốt kiểm soát thay đổi số giấy tờ, nhật ký. |
| D-05 | Đăng ký nhiều gói, chờ điều phối viên duyệt, sau đó giả lập thanh toán thành công. | Backend có trạng thái và API dùng chung cho App/staff; không tích hợp thanh toán thật. Duyệt qua Swagger trong demo cho tới khi web staff tích hợp UI. |
| D-06 | Hỗ trợ cả QR và mã hẹn; hai cách tra cứu cùng một lịch hẹn và chỉ tạo một check-in. | Phần D-06 phía dưới; cần API/schema, token dùng một lần hoặc cơ chế tra cứu an toàn, kiểm tra quyền sở hữu và chống tạo lượt khám trùng. |
| D-07 | Hướng thực hiện nghiệp vụ thực tế đã được chấp thuận trong chat, với role hiện có và không mở rộng quyền nghiệp vụ. | Điều phối viên phụ trách tiếp nhận/hướng dẫn; chỉ bác sĩ chỉ định dịch vụ; trạng thái do nhân viên được backend phân quyền cập nhật. Dịch vụ chưa có trong seed chưa được tự thêm vào fixture. |
| D-08 | Bệnh nhân chủ động yêu cầu tính lại; bệnh nhân quyết định nhận/giữ. | Ý tưởng tự phát hiện lộ trình nhanh hơn ghi riêng là chờ thầy chốt, chưa đưa vào triển khai. |
| D-09 | **A+B** – tổng hợp hàng đợi liên quan và tiến độ của chính bệnh nhân. | Xác minh API, quyền xem và tránh lộ danh tính người khác. |
| D-10 | **A** – dùng cấu hình múi giờ của cơ sở. | Xác minh nơi cấu hình; tuân thủ UTC backend và formatter chung frontend. |

### D-06 – Check-in bằng mã hẹn và QR

**Nghiệp vụ dự kiến:** bệnh nhân đã có lịch hẹn/gói hợp lệ, đến cơ sở và tự báo “tôi đã đến” trên App hoặc kiosk. Hệ thống xác định đúng lịch hẹn của chính bệnh nhân, kiểm tra trạng thái/thời điểm, ghi nhận check-in, tạo hoặc kích hoạt lượt khám, rồi đưa bệnh nhân vào bước tiếp theo của quy trình. Nhân viên tại quầy vẫn là đường hỗ trợ khi bệnh nhân không dùng được App.

ERD hiện có `appointments.status` (`SCHEDULED`, `CONFIRMED`, `CHECKED_IN`, `CANCELLED`), `visits.reception_channel` (`KIOSK`, `COUNTER`, `APP`) và `visits.status`; đây là các khái niệm hỗ trợ luồng, không đồng nghĩa toàn bộ quy trình đã được triển khai đúng. Trong ERD chưa thấy trường mã hẹn hoặc QR token. API tạo visit hiện nhận `patient_id` trong request; trước khi cho bệnh nhân gọi, backend phải lấy bệnh nhân từ phiên đăng nhập và kiểm tra quyền sở hữu, không tin ID do App gửi.

| Cách check-in | Luồng | Ưu/nhược điểm |
|---|---|---|
| Nhập mã hẹn | Bệnh nhân nhập mã trên màn hình → backend tìm lịch hẹn thuộc tài khoản đó → kiểm tra trạng thái/thời điểm → ghi check-in. | Dễ demo, không cần camera; cần mã đủ khó đoán và giới hạn thử sai. ERD hiện chưa có trường mã nên có thể cần schema/API. |
| Quét QR | App quét QR của lịch hẹn/điểm tiếp nhận → backend xác thực token → ghi check-in. | Ít thao tác; cần quyền camera, token có hạn/chống dùng lại và QR được phát hành an toàn. Cũng chưa có QR token trong ERD. |
| Kết hợp | Hỗ trợ QR và nhập mã thay thế. | Dễ tiếp cận khi camera lỗi nhưng nhiều trạng thái/kiểm thử hơn. |
| Nhân viên tại quầy | Điều phối viên tìm bệnh nhân/lịch hẹn, xác nhận rồi tiếp nhận hộ. | Có sẵn vai trò `COORDINATOR` và use case STAFF-04; phù hợp làm kênh dự phòng. Không phải tự check-in trên App. |

**Luồng MVP đã chọn:** mở lịch hẹn của chính mình → quét QR do App hiển thị hoặc nhập mã hẹn → backend kiểm tra chủ sở hữu/trạng thái → đánh dấu đã check-in và tạo tối đa một visit → trả mã lượt. Hai cách hội tụ vào một endpoint; QR chỉ chứa mã hẹn. Check-in sớm/muộn và lịch không gắn gói chưa được tự quyết định; API hiện chỉ nhận lịch `CONFIRMED`.

### D-07 – Quy trình thực tế trong phạm vi role hiện có

**Điều xác minh được từ repository:** seed hiện có sáu dịch vụ mẫu:

| Dịch vụ trong seed | Điểm dịch vụ | Nhân sự gán trong seed | Nhận định theo dữ liệu hiện có |
|---|---|---|---|
| Khám Nội Tổng Quát | Phòng Khám Nội Tổng Quát | Có tài khoản `DOCTOR` gán cho điểm Nội. | Có trong seed; chưa có bảng mapping sang action ID của mô hình. |
| Khám Chuyên Khoa Mắt | Phòng Khám Mắt | Chưa thấy nhân sự được gán. | Có trong seed; chưa xác nhận được hỗ trợ bởi mô hình. |
| Khám Tai Mũi Họng | Phòng Khám Tai Mũi Họng | Chưa thấy nhân sự được gán. | Có trong seed; chưa xác nhận được hỗ trợ bởi mô hình. |
| Chụp X-Quang Ngực Thẳng | Phòng Chụp X-Quang | Chưa thấy nhân sự được gán; chưa có vai trò kỹ thuật viên trong ma trận quyền. | Có trong seed; chưa xác nhận được hỗ trợ bởi mô hình. |
| Tổng Phân Tích Tế Bào Máu (CBC) | Phòng Lấy Mẫu Xét Nghiệm | Chưa thấy nhân sự được gán; chưa có vai trò kỹ thuật viên trong ma trận quyền. | Có trong seed; chưa xác nhận được hỗ trợ bởi mô hình. |
| Siêu Âm Ổ Bụng Tổng Quát | Phòng Siêu Âm Tổng Quát | Chưa thấy nhân sự được gán; vai trò người thực hiện chưa rõ từ seed. | Có trong seed; chưa xác nhận được hỗ trợ bởi mô hình. |

Tìm thấy danh mục 21 action trong khóa luận tại `NextBestActionWithDRL/data/raw/activity_info.json`. Sáu dịch vụ trong seed có ứng viên đối chiếu theo tên: General Medicine Examination ↔ Khám Nội; Eye Examination ↔ Khám Mắt; ENT Examination ↔ Tai Mũi Họng; Blood Test ↔ CBC; General Ultrasound ↔ Siêu Âm Ổ Bụng; Chest X-ray ↔ X-Quang Ngực. Đây chỉ là **đối chiếu tên sơ bộ**, nhóm nghiệp vụ cần xác nhận cùng mã/action thực sự được mô hình dùng.

Các action còn lại trong danh mục 21 mà chưa thấy dịch vụ tương ứng trong seed hiện tại là: Registration, Payment, Get Triage Number, Measure Vital Signs, Dental Examination, Gynecological Examination, Breast Examination, Urine Test, In-depth Eye Examination, ENT Endoscopy, Electrocardiogram (ECG), Post-bronchodilator Spirometry, Cardiac Ultrasound, DEXA Bone Density Scan và Conclusion. Đây là “chưa có dịch vụ tương ứng trong seed”, **chưa thể khẳng định** tất cả đều phải vận hành ngoài AI: ví dụ Registration/Payment/Get Triage Number/Conclusion có thể là bước tiếp nhận, thanh toán, xếp số, kết luận chứ không phải `ExamService` độc lập trong thiết kế mới. Cần quyết định bước nào là nghiệp vụ hệ thống, bước nào là dịch vụ khám, bước nào bỏ khỏi phạm vi.

Để trả lời phần “nhân viên nào làm gì”, bảng sau là **phân công ứng viên để thảo luận**, dựa trên tên action và không phải quy trình chuyên môn đã được bệnh viện xác nhận. Các chức danh ngoài `DOCTOR`/`COORDINATOR` hiện chưa có trong mô hình quyền của project.

| Action khóa luận | Vai trò ứng viên nếu nghiệp vụ được giữ | Tình trạng trong project bệnh viện |
|---|---|---|
| Registration | `COORDINATOR` tiếp nhận hồ sơ/lượt khám | Có điểm quầy tiếp nhận và role điều phối. |
| Payment | Nhân viên thu ngân/kế toán | Chưa có role hay luồng thanh toán; MVP có thể chỉ giả lập kết quả, không nhận tiền thật. |
| Get Triage Number | `COORDINATOR` cấp/hiển thị số lượt | Có queue number trong Visit và điểm tiếp nhận; cần xác nhận thao tác thuộc check-in. |
| Measure Vital Signs | Điều dưỡng/nhân viên được phân công đo | Chưa có role/điểm dịch vụ cụ thể; cần xác nhận có thuộc phạm vi. |
| General Medicine Examination | `DOCTOR` tại Khám Nội | Có dịch vụ mẫu và một bác sĩ gán cho điểm Nội. |
| Eye Examination | Bác sĩ chuyên khoa mắt | Có dịch vụ/điểm mẫu; chưa có nhân sự gán hoặc specialty-based permission. |
| ENT Examination | Bác sĩ Tai Mũi Họng | Có dịch vụ/điểm mẫu; chưa có nhân sự gán hoặc specialty-based permission. |
| Dental Examination | Bác sĩ Răng Hàm Mặt | Chưa có dịch vụ/điểm/role trong seed. |
| Gynecological Examination | Bác sĩ phụ khoa | Chưa có dịch vụ/điểm/role trong seed; mọi điều kiện đối tượng phải là dữ liệu ràng buộc đã được duyệt. |
| Breast Examination | Bác sĩ phù hợp theo quy trình bệnh viện | Chưa có dịch vụ/điểm/role trong seed; cần xác nhận cách mô hình hóa, không suy diễn điều kiện. |
| Blood Test | Nhân viên xét nghiệm lấy mẫu/xử lý mẫu | Có CBC và điểm lấy mẫu; chưa có role kỹ thuật viên hoặc nhân sự được gán. |
| Urine Test | Nhân viên xét nghiệm; cách lấy mẫu theo quy trình cơ sở | Chưa có dịch vụ riêng trong seed; cần xác nhận có đưa vào danh mục. |
| In-depth Eye Examination | Bác sĩ mắt và/hoặc nhân sự vận hành thiết bị theo quy trình cơ sở | Chưa có dịch vụ/điểm/nhân sự riêng trong seed. |
| ENT Endoscopy | Bác sĩ Tai Mũi Họng và nhân sự hỗ trợ theo quy trình cơ sở | Chưa có dịch vụ/điểm/nhân sự riêng trong seed. |
| Electrocardiogram (ECG) | Nhân viên được phân công đo; bác sĩ phụ trách đọc/ghi nhận kết quả theo quy trình | Chưa có dịch vụ/điểm/role trong seed. |
| Post-bronchodilator Spirometry | Nhân sự vận hành thiết bị; bác sĩ phụ trách theo quy trình | Chưa có dịch vụ/điểm/role trong seed. |
| General Ultrasound | Bác sĩ/chuyên viên siêu âm theo quy trình cơ sở | Có dịch vụ/điểm mẫu; chưa có nhân sự gán hoặc role chuyên môn riêng. |
| Cardiac Ultrasound | Bác sĩ/chuyên viên siêu âm tim theo quy trình cơ sở | Chưa có dịch vụ riêng trong seed; không đồng nhất với siêu âm ổ bụng. |
| Chest X-ray | Kỹ thuật viên chẩn đoán hình ảnh; bác sĩ phụ trách kết quả theo quy trình | Có dịch vụ/điểm mẫu; chưa có role kỹ thuật viên hoặc nhân sự được gán. |
| DEXA Bone Density Scan | Nhân viên chẩn đoán hình ảnh theo quy trình cơ sở | Chưa có dịch vụ/điểm/role trong seed. |
| Conclusion | `DOCTOR` phụ trách tổng hợp/kết luận | Có UC bác sĩ lập kết luận ở danh mục chung, nhưng chưa thấy action này là `ExamService` riêng trong seed. |

Các vai trò “điều dưỡng”, “thu ngân”, “kỹ thuật viên” và các chuyên khoa chỉ là tên vai trò ứng viên để thảo luận. Thêm chúng vào hệ thống sẽ đổi role matrix, phân quyền và có thể schema; không được tự thêm khi chưa chốt. Nếu MVP chỉ giữ `COORDINATOR` và `DOCTOR`, cần chỉ rõ thao tác demo nào được giao cho từng vai trò và không gán họ làm nghiệp vụ chuyên môn không được phê duyệt.

Lưu ý về hiện trạng kỹ thuật: `ai-service/app/services/routing_engine.py` của project bệnh viện hiện sắp xếp `valid_activities` được backend gửi theo chi phí hàng đợi (baseline), và tài liệu code nói sẵn sàng nạp trọng số PyTorch; chưa thấy model artifact hoặc mapping 21 action được nạp trong AI service hiện tại. Vì vậy phải xác nhận nhóm đang tích hợp mô hình nào và action ID nào trước khi gọi đây là phạm vi AI đã hỗ trợ.

**Vai trò theo phân quyền hiện có và khoảng trống nhân sự:**

- `COORDINATOR`: tiếp nhận, hỗ trợ quy trình và cập nhật trạng thái dịch vụ theo quyền. Không được chỉ định dịch vụ/ra quyết định chuyên môn.
- `DOCTOR`: khám/chỉ định dịch vụ bổ sung; có quyền cập nhật tiến độ theo ma trận hiện tại.
- `ADMIN`: quản trị và giám sát; không vận hành luồng khám.
- Seed hiện chỉ gán điều phối viên cho quầy tiếp nhận và bác sĩ cho điểm Khám Nội. Không thấy vai trò/kỹ thuật viên xét nghiệm, X-quang hay siêu âm, hoặc nhân sự được gán cho các điểm còn lại. Vì vậy không thể khẳng định nhân viên cụ thể thực hiện các kỹ thuật này chỉ từ project.
- `activity_info.json` của khóa luận chỉ có số lượng staff và mã vị trí cho mỗi action, không khai báo chức danh/loại chuyên môn. Không nên diễn giải `staff: 2` thành hai bác sĩ hay hai kỹ thuật viên.

**Nếu chọn phương án A (không để AI tự điều phối dịch vụ không được hỗ trợ), luồng đề xuất để bạn xem xét:**

1. Bác sĩ là người xác định/ra chỉ định chuyên môn khi dịch vụ cần thiết; App hoặc AI không tự thêm hay bỏ dịch vụ.
2. Backend đánh dấu dịch vụ cần xử lý thủ công và không đưa ra lộ trình AI cho đến khi có quy tắc phù hợp. Không bỏ qua dịch vụ bắt buộc.
3. Điều phối viên nhận thông tin cần hỗ trợ, hướng dẫn bệnh nhân tới điểm dịch vụ theo quy trình đã được bệnh viện/nhóm chốt; điều phối viên không thay bác sĩ quyết định chỉ định.
4. Nhân sự chuyên môn tại điểm (nếu có trong nghiệp vụ bệnh viện) thực hiện dịch vụ. Người có quyền trong hệ thống ghi `WAITING → IN_PROGRESS → COMPLETED`; hiện ma trận chỉ mô hình hóa `DOCTOR`/`COORDINATOR`, nên nhóm cần chốt ai đại diện kỹ thuật viên hay có cần vai trò mới. Không tự thêm vai trò vì đó là thay đổi phân quyền.
5. Sau khi hoàn thành dịch vụ, backend có thể tính lộ trình tiếp theo từ các dịch vụ còn lại nếu hợp đồng/ràng buộc đã được xác định; vẫn cần bệnh nhân xác nhận mọi lộ trình mới.

Hướng được chọn để lập luồng MVP: `COORDINATOR` xác nhận tiếp nhận, hướng dẫn bệnh nhân và hỗ trợ điều phối; `DOCTOR` thực hiện khám/ra chỉ định và là role duy nhất tạo chỉ định; dịch vụ khám chỉ được đưa vào lộ trình nếu đã có trong danh mục và qua kiểm tra ràng buộc backend. Trạng thái dịch vụ chỉ do nhân viên đã được backend cấp quyền cập nhật, không gán quyền cho bệnh nhân.

Không tạo role thu ngân/kỹ thuật viên hay thêm 15 action còn lại chỉ để làm dữ liệu demo. Thanh toán giả lập chỉ biểu diễn trạng thái demo theo D-05, không thu tiền thật; quyền duyệt đăng ký gói cần gắn với role có quyền sẵn có sau khi được xác minh trong backend. Phần chuyên môn/xét nghiệm/chẩn đoán hình ảnh chưa được ánh xạ tới nhân sự cụ thể vì mô hình hiện không có các role đó. Nếu muốn demo đúng người thực hiện ở từng khoa, cần quyết định mở rộng role/quyền riêng trước.

Đối chiếu sáu dịch vụ seed với action trong khóa luận hiện chỉ là ánh xạ tên sơ bộ; chưa dùng để khẳng định mô hình AI hỗ trợ. Luồng MVP không được gửi dịch vụ chưa xác nhận vào AI; nếu engine hiện hữu không nhận diện dịch vụ, backend phải dùng phương án không-AI đã quy định hoặc báo trạng thái nghiệp vụ phù hợp, tuyệt đối không để AI quyết định chỉ định lâm sàng.

### D-08 – Ý tưởng tự phát hiện lộ trình tốt hơn (chờ thầy chốt)

Ý tưởng bạn nêu: khi dữ liệu hàng đợi thay đổi, hệ thống kiểm tra xem lộ trình khác có giảm thời gian dự kiến ít nhất một ngưỡng cấu hình hay không; nếu có thì **chỉ gửi gợi ý**, bệnh nhân quyết định chấp nhận hoặc giữ lộ trình cũ. Đây là ý tưởng cần thầy xác nhận, **không thuộc yêu cầu triển khai hiện tại**.

Mối lo quá tải là hợp lý nếu gọi mô hình cho mọi bệnh nhân sau mỗi event hàng đợi. Các cách giảm tải có thể thảo luận sau khi thầy chốt phạm vi:

- Chỉ đánh dấu lượt khám “có thể cần tính lại” khi thay đổi ảnh hưởng một điểm trên lộ trình, thay vì gọi AI ngay.
- Gom nhiều cập nhật ngắn thành một cửa sổ debounce; chỉ chạy một tác vụ cho mỗi lượt khám đang hoạt động.
- Áp dụng cooldown theo lượt khám, cấu hình giới hạn đồng thời và hàng đợi xử lý; bỏ yêu cầu cũ nếu đã có snapshot mới hơn.
- Chỉ tính lại khi bệnh nhân mở màn hình/yêu cầu, hoặc khi tiết kiệm sơ bộ vượt ngưỡng; phương án này giảm tải hơn nhưng không chủ động thông báo ngay.
- Đo số lần suy luận, độ trễ, hàng đợi worker và tỷ lệ gợi ý hữu ích bằng dữ liệu mẫu; không dùng mô phỏng vì ngoài phạm vi theo `AGENTS.md`.

Không chọn thuật toán/tần suất/ngưỡng cụ thể ở đây. Nếu được duyệt, cần cập nhật UC, cấu hình và kiến trúc backend/AI trước khi thực hiện; quyết định lộ trình vẫn thuộc bệnh nhân.

### Các quyết định còn chờ

- D-06: đã chọn cả QR và mã hẹn; còn chờ duyệt thay đổi API/schema và cơ chế bảo vệ mã.
- D-07: hướng luồng nghiệp vụ đã chọn ở mức kế hoạch; cần nhóm quyết định nếu muốn thêm role kỹ thuật/thu ngân hoặc mở rộng danh mục dịch vụ ngoài seed.
- D-08: ý tưởng tự phát hiện lộ trình chỉ lưu để hỏi thầy; không triển khai cho tới khi có xác nhận.

## 10. Checklist trước khi bắt đầu mỗi UC

- [ ] Đọc `AGENTS.md` gốc và hướng dẫn thư mục liên quan.
- [ ] Đọc mục nghiệp vụ tương ứng trong `DOMAIN_RULES.md` và đặc tả UC.
- [ ] Mã UC và tiêu chí chấp nhận đã thống nhất.
- [ ] Đã kiểm tra code hiện hữu, OpenAPI và API thực tế.
- [ ] Điểm `[CHỜ CHỐT]` ảnh hưởng trực tiếp đã được giải quyết hoặc được ghi rõ là chặn.
- [ ] Không cần dependency/API/schema/quyền/cấu trúc mới chưa được duyệt.
- [ ] Có tiêu chí kiểm thử cho thành công, lỗi, rỗng, tải và quyền sở hữu dữ liệu.

## 11. Tiến độ và các bước tiếp theo

Các luồng D-03, PAT-01–PAT-05 và seed end-to-end đã được bổ sung ở mức code MVP. Chưa xác nhận build/runtime vì công cụ dependency/test chưa có trong môi trường hiện tại. Giữ thay đổi trong Patient App, backend dùng chung, seed và docs; không sửa web staff. Bước tiếp theo là chạy kiểm tra theo package manager nhóm chốt, tích hợp UI duyệt tại web staff do thành viên phụ trách web thực hiện, và xử lý riêng các mục `[CHỜ THẦY CHỐT]`.

## 12. Kế hoạch dữ liệu mock để kiểm thử luồng bệnh nhân

### Phạm vi dữ liệu

Seed sẽ là một đồ thị dữ liệu nhỏ, có khóa ngoại nhất quán, dùng hồ sơ giả hoàn toàn. Mỗi bản ghi phải được một luồng PAT/UC sử dụng hoặc là quan hệ bắt buộc của bản ghi đó; không nhân bản danh mục gói/dịch vụ/điểm đang có trong `seed/seed_data.json`, không thêm kết quả lâm sàng chẩn đoán/đơn thuốc giả để làm đầy dữ liệu.

| Luồng cần kiểm tra | Dữ liệu cần có | Hiện trạng |
|---|---|---|
| PAT-01 đăng nhập | Account PATIENT đang hoạt động, patient profile có liên kết account | Loader đã có account/profile mẫu; cần kiểm tra thông tin demo hiện tại và tránh lặp tài khoản. |
| D-03 đăng ký/xác nhận demo | Account mới và trạng thái xác nhận demo | Đã có auth API đăng ký/xác nhận demo và account/profile seed để đăng nhập kiểm thử. |
| PAT-02 xem/sửa hồ sơ | Profile liên kết đúng account, các trường khớp model/ERD | Model có profile; API đọc/sửa quyền sở hữu cần xác minh/bổ sung. |
| PAT-03 nhiều gói, chờ duyệt, thanh toán demo | Bản ghi đăng ký cá nhân gắn đúng patient/package, trạng thái duyệt và thanh toán demo | Đã có model/service/API và API duyệt cho coordinator; UI duyệt web staff chưa nằm trong phạm vi App. |
| D-06 QR hoặc mã hẹn | Appointment thuộc patient; mã tra cứu và QR cùng trỏ đến appointment đó; check-in liên kết một visit | Đã có trường mã, API check-in theo ownership và liên kết tối đa một visit; cần xác minh runtime và scanner trên thiết bị hỗ trợ. |
| PAT-04 tiến độ/PAT-05 hàng đợi | Visit; VisitProgress chỉ tham chiếu service/điểm hiện có; timestamps UTC, actor hợp lệ; số queue suy ra từ các progress WAITING/IN_PROGRESS | Model đã có nền tảng; loader chưa nạp appointment/visit/progress; cần xác minh bất biến và cấu hình capacity. |
| PAT-05 gợi ý/đổi lộ trình | Route/steps/decision liên kết visit; quyết định giữ/chấp nhận của chính patient; chỉ dùng dịch vụ và constraints hiện có | Model/API nền tảng đã có nhưng ownership cần kiểm tra; không sinh dữ liệu gợi ý giả dựa trên mô hình chưa tích hợp. |

### Bộ fixture tối thiểu đề xuất

1. Giữ danh mục service point, exam service, package, package item, constraints và tài khoản vận hành đang có trong seed làm nguồn chuẩn; mọi ID tham chiếu phải lấy từ các bản ghi đó.
2. Thêm đúng một bệnh nhân demo end-to-end có account/profile và đăng ký gói/liên kết appointment/visit/progress/route khi schema hỗ trợ. Dùng các ngày UTC cố định tương đối với kịch bản chạy demo theo cơ chế hiện có, không ghi ngày giả định là “hôm nay” vào dữ liệu bền vững.
3. Chỉ thêm bệnh nhân/visit hỗ trợ khi cần để chứng minh số người chờ ở hàng đợi; mỗi visit phụ phải có lý do kiểm thử, service point và progress hợp lệ, và không xuất hiện trong dữ liệu riêng tư của patient demo.
4. Route steps phải là một hoán vị hợp lệ của các dịch vụ còn lại theo constraints; completed progress phải có thời điểm/actor; waiting progress có thời điểm vào hàng; không lưu queue length hoặc ETA trùng vì đây là giá trị dẫn xuất.
5. QR và mã hẹn dùng chung appointment; quyết định route liên kết đúng route/version và patient; notification (nếu fixture thật sự cần) trỏ tới account tương ứng. Không tạo orphan, bản sao danh mục, record không được màn hình/luồng nào sử dụng, hoặc dữ liệu cá nhân/thông tin y tế thật.

### Trạng thái seed và giới hạn kiểm chứng

Đã bổ sung entity/API còn thiếu và loader cho dữ liệu demo liên kết: account/profile, đăng ký gói ở nhiều trạng thái, appointment, visit, tiến độ và route; các khóa tham chiếu dùng danh mục hiện có. JSON seed đã qua kiểm tra cú pháp và Python compileall đã qua. Chưa chạy được pytest/typecheck/lint vì công cụ chưa có trong môi trường, và chưa xác nhận luồng qua ứng dụng đang chạy. Không thay quyền `ADMIN`/`COORDINATOR`/`DOCTOR`/`PATIENT` hoặc tạo role thu ngân/kỹ thuật viên trong phạm vi seed này.
