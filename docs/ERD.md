# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (ERD SPECIFICATION)

> Đồng bộ 100% với file thiết kế `ERD.drawio.png` và tài liệu quy tắc nghiệp vụ `docs/DOMAIN_RULES.md`.

---

## 1. Danh sách bảng và thực thể (28 bảng)

### Nhóm 1: Quản trị, Tài khoản & Phân quyền
1. `accounts` (TAIKHOAN)
   - `id`: UUID, Primary Key, default `gen_random_uuid()`
   - `username`: VARCHAR(50), Unique, Not Null
   - `hashed_password`: VARCHAR(255), Not Null (Argon2 / BCrypt)
   - `full_name`: VARCHAR(100), Not Null
   - `employee_code`: VARCHAR(50), Nullable (Mã số nhân viên nếu là nhân viên)
   - `role`: VARCHAR(20), Not Null (`ADMIN`, `COORDINATOR`, `DOCTOR`, `PATIENT`)
   - `status`: VARCHAR(20), Not Null (`PENDING`, `ACTIVE`, `REJECTED`, `DISABLED`, `DELETED`)
   - `created_at`: TIMESTAMPTZ, Not Null, default UTC now
   - `last_login_at`: TIMESTAMPTZ, Nullable
   - `assigned_service_point_id`: UUID, Nullable, Foreign Key -> `service_points(id)`

2. `staff_members` (NHANVIENPHONGKHAM)
   - `id`: UUID, Primary Key, Foreign Key -> `accounts(id)`
   - `staff_type`: VARCHAR(30), Not Null (`DOCTOR`, `COORDINATOR`, `ADMIN`)
   - `phone_number`: VARCHAR(20), Nullable
   - `email`: VARCHAR(100), Nullable

3. `doctors` (BACSI)
   - `id`: UUID, Primary Key, Foreign Key -> `staff_members(id)`
   - `specialty`: VARCHAR(100), Not Null (Chuyên khoa)
   - `license_number`: VARCHAR(50), Not Null (Số chứng chỉ hành nghề)

4. `authorizations` (UYQUYEN)
   - `id`: UUID, Primary Key
   - `doctor_id`: UUID, Not Null, Foreign Key -> `doctors(id)`
   - `coordinator_id`: UUID, Not Null, Foreign Key -> `staff_members(id)`
   - `scope`: VARCHAR(255), Not Null (Phạm vi ủy quyền)
   - `started_at`: TIMESTAMPTZ, Not Null
   - `ended_at`: TIMESTAMPTZ, Nullable
   - `accepted_at`: TIMESTAMPTZ, Nullable
   - `status`: VARCHAR(20), Not Null (`PENDING`, `ACTIVE`, `EXPIRED`, `REVOKED`)

5. `system_logs` (NHATKYHETHONG - Bất biến, Không UPDATE/DELETE)
   - `id`: UUID, Primary Key
   - `actor_id`: UUID, Nullable, Foreign Key -> `accounts(id)`
   - `action_type`: VARCHAR(50), Not Null (CREATE, UPDATE, DELETE, LOGIN, ROLE_CHANGE, CONFIG_CHANGE...)
   - `target_type`: VARCHAR(50), Not Null (ACCOUNT, SERVICE_POINT, PACKAGE, CONSTRAINT...)
   - `target_id`: VARCHAR(100), Nullable
   - `details`: JSONB, Not Null, default '{}'
   - `created_at`: TIMESTAMPTZ, Not Null, default UTC now

---

### Nhóm 2: Điểm dịch vụ & Danh mục dịch vụ khám
6. `service_points` (DIEMDICHVU)
   - `id`: UUID, Primary Key
   - `code`: VARCHAR(50), Unique, Not Null
   - `name`: VARCHAR(100), Not Null (Lễ tân, Khám Nội, Siêu âm...)
   - `room_number`: VARCHAR(50), Nullable
   - `resource_count`: INT, Not Null, default 1 (Số bác sĩ / bàn khám đồng thời)
   - `avg_service_duration_seconds`: INT, Not Null, default 600 (Thời gian phục vụ TB)
   - `queue_capacity`: INT, Not Null, default 50 (Sức chứa tối đa của hàng đợi)
   - `result_wait_duration_seconds`: INT, Not Null, default 0 (Thời gian chờ kết quả nếu có)
   - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

7. `exam_services` (DICHVUKHAM)
   - `id`: UUID, Primary Key
   - `code`: VARCHAR(50), Unique, Not Null
   - `name`: VARCHAR(150), Not Null
   - `category`: VARCHAR(50), Not Null (Lâm sàng, Chẩn đoán hình ảnh, Xét nghiệm...)
   - `description`: TEXT, Nullable
   - `has_result_waiting`: BOOLEAN, Not Null, default false (Có chờ kết quả hay không)
   - `default_service_point_id`: UUID, Not Null, Foreign Key -> `service_points(id)`
   - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

---

### Nhóm 3: Gói khám & Cấp độ
8. `package_tiers` (CAPDOGOI)
   - `id`: UUID, Primary Key
   - `code`: VARCHAR(50), Unique, Not Null
   - `name`: VARCHAR(100), Not Null (Cơ bản, Tiêu chuẩn, Nâng cao, VIP)
   - `description`: TEXT, Nullable
   - `tier_order`: INT, Not Null

9. `packages` (GOIKHAM)
   - `id`: UUID, Primary Key
   - `code`: VARCHAR(50), Unique, Not Null
   - `name`: VARCHAR(150), Not Null
   - `package_type`: VARCHAR(50), Not Null (`INDIVIDUAL`, `ENTERPRISE`)
   - `target_group`: VARCHAR(100), Nullable (Nam, Nữ, Nữ có gia đình, Mọi đối tượng)
   - `description`: TEXT, Nullable
   - `base_price`: DECIMAL(12, 2), Not Null, default 0
   - `package_tier_id`: UUID, Nullable, Foreign Key -> `package_tiers(id)`
   - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

10. `package_service_items` (Bảng nối GOIKHAM - DICHVUKHAM)
    - `id`: UUID, Primary Key
    - `package_id`: UUID, Not Null, Foreign Key -> `packages(id)`
    - `exam_service_id`: UUID, Not Null, Foreign Key -> `exam_services(id)`
    - `is_mandatory`: BOOLEAN, Not Null, default true

---

### Nhóm 4: Bảng ràng buộc (CONSTRAINTS - Khai báo bằng DỮ LIỆU)
11. `constraints` (RANGBUOC)
    - `id`: UUID, Primary Key
    - `code`: VARCHAR(50), Unique, Not Null
    - `name`: VARCHAR(150), Not Null
    - `description`: TEXT, Nullable
    - `constraint_level`: VARCHAR(20), Not Null (`STRICT`, `WARNING`)
    - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

12. `package_constraints` (RBGIUAGOI)
    - `id`: UUID, Primary Key
    - `constraint_id`: UUID, Not Null, Foreign Key -> `constraints(id)`
    - `source_package_id`: UUID, Not Null, Foreign Key -> `packages(id)`
    - `target_package_id`: UUID, Not Null, Foreign Key -> `packages(id)`
    - `relation_type`: VARCHAR(30), Not Null (`MUTEX` - Loại trừ, `REQUIRED` - Phải đi kèm, `INCLUDES` - Bao gồm)

13. `package_tier_constraints` (RBGOI&CAPDO)
    - `id`: UUID, Primary Key
    - `constraint_id`: UUID, Not Null, Foreign Key -> `constraints(id)`
    - `package_id`: UUID, Not Null, Foreign Key -> `packages(id)`
    - `package_tier_id`: UUID, Not Null, Foreign Key -> `package_tiers(id)`
    - `relation_type`: VARCHAR(30), Not Null
    - `condition_json`: JSONB, Nullable

14. `step_constraints` (RBGIUABUOC - Ràng buộc thứ tự/phụ thuộc giữa các dịch vụ)
    - `id`: UUID, Primary Key
    - `constraint_id`: UUID, Not Null, Foreign Key -> `constraints(id)`
    - `prior_service_id`: UUID, Not Null, Foreign Key -> `exam_services(id)`
    - `later_service_id`: UUID, Not Null, Foreign Key -> `exam_services(id)`
    - `relation_type`: VARCHAR(30), Not Null (`PRECEDES` - Phải trước, `MUTEX` - Không cùng lúc, `FASTING_REQUIRED` - Nhịn ăn...)

---

### Nhóm 5: Khách hàng (Bệnh nhân & Doanh nghiệp)
15. `patients` (BENHNHAN)
    - `id`: UUID, Primary Key
    - `account_id`: UUID, Nullable, Foreign Key -> `accounts(id)`
    - `full_name`: VARCHAR(100), Not Null
    - `date_of_birth`: DATE, Not Null
    - `gender`: VARCHAR(10), Not Null (`MALE`, `FEMALE`, `OTHER`)
    - `marital_status`: VARCHAR(20), Nullable (`SINGLE`, `MARRIED`, `DIVORCED`)
    - `phone_number`: VARCHAR(20), Not Null
    - `email`: VARCHAR(100), Nullable
    - `address`: TEXT, Nullable
    - `id_card_number`: VARCHAR(30), Nullable
    - `created_at`: TIMESTAMPTZ, Not Null, default UTC now

16. `companies` (DOANHNGHIEP)
    - `id`: UUID, Primary Key
    - `code`: VARCHAR(50), Unique, Not Null
    - `name`: VARCHAR(200), Not Null
    - `tax_code`: VARCHAR(50), Not Null
    - `contact_person`: VARCHAR(100), Nullable
    - `phone_number`: VARCHAR(20), Nullable
    - `email`: VARCHAR(100), Nullable
    - `address`: TEXT, Nullable
    - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

17. `company_package_registrations` (DANGKYGOIDOANHNGHIEP)
    - `id`: UUID, Primary Key
    - `company_id`: UUID, Not Null, Foreign Key -> `companies(id)`
    - `package_id`: UUID, Not Null, Foreign Key -> `packages(id)`
    - `target_group`: VARCHAR(100), Not Null (e.g., Nhân viên kỹ thuật, Cán bộ quản lý...)
    - `quantity_registered`: INT, Not Null
    - `registered_at`: TIMESTAMPTZ, Not Null, default UTC now
    - `valid_from`: TIMESTAMPTZ, Not Null
    - `valid_to`: TIMESTAMPTZ, Not Null
    - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

---

### Nhóm 6: Lịch hẹn & Hồ sơ bệnh án
18. `appointments` (LICHHEN)
    - `id`: UUID, Primary Key
    - `patient_id`: UUID, Not Null, Foreign Key -> `patients(id)`
    - `package_id`: UUID, Nullable, Foreign Key -> `packages(id)`
    - `appointment_time`: TIMESTAMPTZ, Not Null
    - `appointment_type`: VARCHAR(30), Not Null (`FIRST_VISIT`, `FOLLOW_UP`, `PERIODIC`)
    - `notes`: TEXT, Nullable
    - `status`: VARCHAR(20), Not Null, default 'SCHEDULED' (`SCHEDULED`, `CONFIRMED`, `CHECKED_IN`, `CANCELLED`)

19. `medical_records` (HOSOBENHAN)
    - `id`: UUID, Primary Key
    - `patient_id`: UUID, Not Null, Foreign Key -> `patients(id)`
    - `medical_history`: TEXT, Nullable (Tiền sử bệnh lý bản thân)
    - `family_history`: TEXT, Nullable (Tiền sử gia đình)
    - `allergies`: TEXT, Nullable (Dị ứng thuốc/thực phẩm)
    - `created_at`: TIMESTAMPTZ, Not Null, default UTC now

---

### Nhóm 7: Vòng đời Lượt khám (VISIT) & Tiến độ dịch vụ (VISIT PROGRESS)
20. `visits` (LUOTKHAM)
    - `id`: UUID, Primary Key
    - `visit_code`: VARCHAR(50), Unique, Not Null (e.g. `VK-20261111-001`)
    - `patient_id`: UUID, Not Null, Foreign Key -> `patients(id)`
    - `package_id`: UUID, Nullable, Foreign Key -> `packages(id)`
    - `company_registration_id`: UUID, Nullable, Foreign Key -> `company_package_registrations(id)`
    - `visit_type`: VARCHAR(30), Not Null (`PACKAGE`, `SYMPTOM_ORDER`)
    - `reception_channel`: VARCHAR(30), Not Null (`KIOSK`, `COUNTER`, `APP`)
    - `is_priority`: BOOLEAN, Not Null, default false (Ưu tiên người già, trẻ nhỏ, cấp bách)
    - `queue_number`: INT, Not Null (Số thứ tự trong ngày)
    - `status`: VARCHAR(20), Not Null, default 'REGISTERED' (`REGISTERED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
    - `check_in_at`: TIMESTAMPTZ, Not Null, default UTC now
    - `completed_at`: TIMESTAMPTZ, Nullable
    - `created_by_id`: UUID, Nullable, Foreign Key -> `accounts(id)`

21. `visit_progress` (TIENDODICHVU - Có khóa lạc quan version)
    - `id`: UUID, Primary Key
    - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
    - `exam_service_id`: UUID, Not Null, Foreign Key -> `exam_services(id)`
    - `service_point_id`: UUID, Not Null, Foreign Key -> `service_points(id)`
    - `service_source`: VARCHAR(20), Not Null (`PACKAGE`, `DOCTOR_ORDER`)
    - `status`: VARCHAR(20), Not Null, default 'NOT_STARTED' (`NOT_STARTED` -> `WAITING` -> `IN_PROGRESS` -> `COMPLETED`)
    - `assigned_at`: TIMESTAMPTZ, Not Null, default UTC now
    - `queued_at`: TIMESTAMPTZ, Nullable
    - `started_at`: TIMESTAMPTZ, Nullable
    - `completed_at`: TIMESTAMPTZ, Nullable
    - `performed_by_id`: UUID, Nullable, Foreign Key -> `accounts(id)`
    - `is_proxy_action`: BOOLEAN, Not Null, default false (Cập nhật thay người phụ trách)
    - `version`: INT, Not Null, default 1 (Khóa lạc quan phòng race condition)

---

### Nhóm 8: Lộ trình thông minh (ROUTE) & Quyết định bệnh nhân (ROUTE DECISION)
22. `routes` (LOTRINH)
    - `id`: UUID, Primary Key
    - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
    - `version`: INT, Not Null, default 1
    - `creation_reason`: VARCHAR(50), Not Null (`INITIAL`, `RECALC_REQUEST`, `OVERDUE_FALLBACK`)
    - `status`: VARCHAR(20), Not Null, default 'ACTIVE' (`ACTIVE`, `REPLACED`, `REJECTED`)
    - `suggestion_source`: VARCHAR(20), Not Null (`AI_RL`, `HEURISTIC_FALLBACK`, `MANUAL`)
    - `confidence`: FLOAT, Nullable
    - `latency_ms`: INT, Nullable
    - `estimated_total_duration_seconds`: INT, Not Null, default 0
    - `created_at`: TIMESTAMPTZ, Not Null, default UTC now

23. `route_steps` (BUOCLOTRINH)
    - `id`: UUID, Primary Key
    - `route_id`: UUID, Not Null, Foreign Key -> `routes(id)`
    - `visit_progress_id`: UUID, Not Null, Foreign Key -> `visit_progress(id)`
    - `step_order`: INT, Not Null
    - `estimated_wait_seconds`: INT, Not Null, default 0
    - `estimated_service_seconds`: INT, Not Null, default 0

24. `route_decisions` (QUYETDINHLOTRINH - Bất biến)
    - `id`: UUID, Primary Key
    - `route_id`: UUID, Not Null, Foreign Key -> `routes(id)`
    - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
    - `decision_type`: VARCHAR(20), Not Null (`ACCEPTED_NEW`, `KEPT_EXISTING`, `REJECTED`)
    - `decided_by_id`: UUID, Not Null, Foreign Key -> `accounts(id)`
    - `is_proxy_action`: BOOLEAN, Not Null, default false
    - `decided_at`: TIMESTAMPTZ, Not Null, default UTC now

---

### Nhóm 9: Kết quả khám, Chẩn đoán, Đơn thuốc, Kết luận
25. `exam_results` (KETQUAKHAM)
    - `id`: UUID, Primary Key
    - `visit_progress_id`: UUID, Not Null, Foreign Key -> `visit_progress(id)`
    - `result_content`: TEXT, Not Null
    - `attachment_url`: VARCHAR(255), Nullable
    - `recorded_by_id`: UUID, Not Null, Foreign Key -> `accounts(id)`
    - `recorded_at`: TIMESTAMPTZ, Not Null, default UTC now

26. `diagnoses` (CHANDOAN)
    - `id`: UUID, Primary Key
    - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
    - `doctor_id`: UUID, Not Null, Foreign Key -> `doctors(id)`
    - `icd10_code`: VARCHAR(20), Nullable
    - `diagnosis_description`: TEXT, Not Null
    - `diagnosed_at`: TIMESTAMPTZ, Not Null, default UTC now

27. `treatment_plans` (KEHOACHDIEUTRI)
    - `id`: UUID, Primary Key
    - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
    - `doctor_id`: UUID, Not Null, Foreign Key -> `doctors(id)`
    - `plan_content`: TEXT, Not Null
    - `started_at`: TIMESTAMPTZ, Not Null, default UTC now
    - `estimated_duration_days`: INT, Nullable
    - `status`: VARCHAR(20), Not Null, default 'ACTIVE'

28. `prescriptions` (DONTHUOC) & `prescription_items` (CHITIETDONTHUOC)
    - `prescriptions`:
      - `id`: UUID, Primary Key
      - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
      - `doctor_id`: UUID, Not Null, Foreign Key -> `doctors(id)`
      - `prescribed_at`: TIMESTAMPTZ, Not Null, default UTC now
      - `doctor_advice`: TEXT, Nullable
    - `prescription_items`:
      - `id`: UUID, Primary Key
      - `prescription_id`: UUID, Not Null, Foreign Key -> `prescriptions(id)`
      - `drug_name`: VARCHAR(150), Not Null
      - `dosage`: VARCHAR(50), Not Null
      - `unit`: VARCHAR(20), Not Null
      - `quantity`: INT, Not Null
      - `usage_instructions`: TEXT, Not Null

29. `conclusions` (KETLUAN)
    - `id`: UUID, Primary Key
    - `visit_id`: UUID, Not Null, Foreign Key -> `visits(id)`
    - `doctor_id`: UUID, Not Null, Foreign Key -> `doctors(id)`
    - `conclusion_text`: TEXT, Not Null
    - `doctor_recommendation`: TEXT, Nullable
    - `concluded_at`: TIMESTAMPTZ, Not Null, default UTC now

30. `notifications` (THONGBAO)
    - `id`: UUID, Primary Key
    - `recipient_account_id`: UUID, Not Null, Foreign Key -> `accounts(id)`
    - `notification_type`: VARCHAR(50), Not Null (`QUEUE_TURN`, `ROUTE_PROPOSED`, `RESULT_READY`, `WAIT_RETRY`)
    - `content`: TEXT, Not Null
    - `channel`: VARCHAR(20), Not Null (`IN_APP`, `SMS_MOCK`, `WEBSOCKET`)
    - `status`: VARCHAR(20), Not Null, default 'SENT'
    - `is_read`: BOOLEAN, Not Null, default false
    - `created_at`: TIMESTAMPTZ, Not Null, default UTC now

---

## 2. Quy tắc dẫn xuất (Derived Values - KHÔNG lưu bảng thừa)

- **Hàng đợi của điểm dịch vụ:**
  Được tính bằng câu lệnh tổng hợp:
  ```sql
  SELECT
      service_point_id,
      COUNT(*) FILTER (WHERE status = 'WAITING') AS queue_length,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_count
  FROM visit_progress
  GROUP BY service_point_id;
  ```
- **Thời gian chờ ước tính của điểm dịch vụ:**
  $$\text{wait\_time} = \frac{\text{queue\_length} \times \text{avg\_duration}}{\max(1, \text{resource\_count})}$$
- **Vị trí trong hàng đợi của bệnh nhân:**
  `ROW_NUMBER() OVER (PARTITION BY service_point_id ORDER BY is_priority DESC, queued_at ASC)`
