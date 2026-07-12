# Kế hoạch chia task — Dashboard / Inventory / Racking / Transactions / Team

Tiếp nối Stage 1-5 (Products, đã có sẵn trong `tasks/Stage-1..5`), tài liệu này chia nhỏ 5 mục còn lại trên
Sidebar (`Dashboard`, `Inventory`, `Racking`, `Transactions`, `Team`) thành **40 task atomic** (Task 42-81),
đánh số tiếp nối, theo đúng format và convention đã dùng cho Products: mỗi task có 1 file `.md` (bối cảnh,
yêu cầu, không được làm, DoD, cách tự kiểm tra) + 1 file `.txt` (prompt sẵn để dán cho AI coding assistant).

**Toàn bộ nội dung được đối chiếu trực tiếp với code backend thật** (controller/DTO/swagger-examples trong
`apps/backend/src`), không suy đoán — đúng tinh thần "code facts over aspirational docs".

## Tổng quan

| Stage | Module | Task | Ghi chú quan trọng |
|---|---|---|---|
| 6 | **Dashboard** | 42-45 (4 task) | `GET /dashboard/summary` — **cần đăng nhập**. Component `StatCard` đã có sẵn, chưa dùng. |
| 7 | **Inventory** | 46-56 (11 task) | `GET /inventory` **public**; `POST /inventory/inbound`, `/outbound` cần đăng nhập. Xuất kho dùng FEFO tự động, không chọn lô thủ công. |
| 8 | **Racking** | 57-71 (15 task) | Cấu trúc phân cấp Zone → Rack → Level → Slot. Zone/Rack/Level: toàn bộ cần đăng nhập, `GET` trả mảng thuần (không phân trang). **Slot khác biệt**: `GET` public + có phân trang, field `maxCapacity/usedCapacity/availableCapacity/occupancyRate` (không phải `capacity`). |
| 9 | **Transactions** | 72-76 (5 task) | `GET /transactions` — **cần đăng nhập**, chỉ đọc (dữ liệu tự sinh từ Inbound/Outbound). |
| 10 | **Team** | 77-81 (5 task) | ⚠️ **Task 77 là task BACKEND** — hiện chưa có endpoint `/users` nào dù bảng `User` đã có trong Prisma. Phải làm xong Task 77 trước khi bắt đầu 78-81 (frontend). |

## Điểm cần lưu ý khi phân task cho người khác

1. **Auth khác nhau theo từng endpoint** — không phải cứ "module mới" là mặc định cần đăng nhập:
   - Public (không cần token): `GET /products`, `GET /products/:id`, `GET /inventory`, `GET /inventory/:id`, `GET /slots`, `GET /slots/:id`.
   - Cần đăng nhập: tất cả các endpoint còn lại, bao gồm toàn bộ `GET` của Dashboard/Zones/Racks/Levels/Transactions.
   - Route frontend phải bọc `<ProtectedRoute>` đúng theo bảng trên — sai chỗ này sẽ gây lỗi 401 khó hiểu cho intern.
2. **Slot không giống Zone/Rack/Level** — có phân trang, field capacity đặt tên khác (`maxCapacity` không phải `capacity`),
   và có các field backend tự tính (`usedCapacity`, `availableCapacity`, `occupancyRate`, `currentProductId`) tuyệt đối
   không gửi lên khi tạo/sửa.
3. **Team đang bị chặn bởi backend** — đã thêm Task 77 (nhóm "I – Team (Backend)") để tạo `GET /users` trước,
   theo đúng lựa chọn anh đã chọn. Task 77 nên giao cho người có kinh nghiệm NestJS/Prisma (không phải intern),
   các task 78-81 (frontend) chỉ nên bắt đầu sau khi Task 77 merge xong.
4. **Thứ tự ưu tiên tổng thể** (theo lựa chọn của anh): Dashboard → Inventory → Racking → Transactions → Team.
   Trong đó Team có thể chạy song song sớm hơn ở phần backend (Task 77) vì không phụ thuộc gì vào 4 module kia.

## Cấu trúc file

```
docs/frontend-tasks/
├── tasks/
│   ├── Stage-6/   (42-45  — Dashboard)
│   ├── Stage-7/   (46-56  — Inventory)
│   ├── Stage-8/   (57-71  — Racking)
│   ├── Stage-9/   (72-76  — Transactions)
│   └── Stage-10/  (77-81  — Team, gồm 1 task backend)
└── prompts/
    ├── Stage-6/ ... Stage-10/   (file .txt tương ứng từng task)
```

## Cách dùng (giống Stage 1-5 đã làm)

1. Giao mỗi task cho 1 người/1 AI coding session — mỗi task đủ nhỏ (~1-2.5 giờ) để làm độc lập, ít conflict merge.
2. Người làm mở file `tasks/Stage-X/NN-*.md`, đọc Bối cảnh + Yêu cầu + Không được làm.
3. Mở file `prompts/Stage-X/NN.txt`, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật lấy từ repo, gửi cho AI.
4. Trước khi merge, tick đủ checklist "Kết quả kỳ vọng (Definition of Done)" trong file task.
