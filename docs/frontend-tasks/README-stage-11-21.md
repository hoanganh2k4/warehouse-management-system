# Kế hoạch chia task — Sửa lỗi Fill rate / Hết hạn / Transaction detail / Racking / Scheduling / Inventory

Tiếp nối Stage 1-10 (Task 1-81, đã có sẵn), tài liệu này chia 12 vấn đề đang tồn tại (do anh liệt kê) thành
**11 stage mới (Stage 11 → 21), đánh số task tiếp nối từ Task 82**, đúng format/convention đã dùng ở
Stage 6-10: mỗi task có 1 file `.md` (bối cảnh, yêu cầu, không được làm, DoD) + 1 file `.txt` (prompt dán
sẵn cho AI coding assistant).

**Khác với Stage 1-10 (chỉ frontend), các stage này có cả task backend** vì phần lớn vấn đề bắt nguồn từ
schema/logic backend (giống Task 77 ở Stage 10 trước đây). Task nào là backend sẽ ghi rõ **[BACKEND]**
trong tiêu đề, còn lại là **[FRONTEND]**.

## Nguyên tắc làm việc (theo yêu cầu của anh)

1. Mỗi lần chỉ hoàn thiện **1 stage** (đủ file `.md` + `.txt` cho tất cả task trong stage đó) rồi dừng lại.
2. Anh thêm code / merge xong, nhắn "tiếp tục" thì mình mới làm stage kế tiếp.
3. Thứ tự stage đã được sắp để **stage sau không bị vỡ vì thiếu nền tảng của stage trước** (Stage 11 là
   migration schema — bắt buộc chạy trước, vì Stage 12-17 đều cần các field mới).

## Bảng map: Vấn đề gốc → Stage/Task xử lý (đảm bảo phủ 100%)

| # | Vấn đề anh nêu | Stage xử lý | Task |
|---|---|---|---|
| 1 | Tỷ lệ lấp đầy sai sót, chưa đồng bộ | Stage 12 | 86 |
| 2 | Hàng hết hạn chưa có dữ liệu cụ thể / màu cảnh báo | Stage 13, 18 | 89, 90, 105 |
| 3 | Chưa có detail transaction (trước/sau khi nhập xuất) | Stage 11, 14, 19 | 82, 91, 108 |
| 4 | Hàng nặng ưu tiên xếp dưới, hàng chuẩn xếp bình thường | Stage 15, 18 | 94, 106 |
| 5 | Sản phẩm đã gán ghi 6 nhưng tổng chỉ 5 | Stage 12, 18 | 87, 88, 107 |
| 6 | Racking: Slot 1 các level chưa lấp hết trước, slot khác lấp trước | Stage 15 | 95, 96 |
| 7 | Đặt lịch nhập thêm ngày hết hạn của lô hàng | Stage 11, 16, 19 | 82, 97, 110 |
| 8 | Đặt lịch số lượng nhiều → nhiều lựa chọn chỗ nhập/gợi ý | Stage 11, 16, 19 | 83, 98, 99, 100, 111 |
| 9 | Nhập/xuất cùng ngày → số liệu liên tiếp nhau | Stage 11, 14, 17 | 82, 93, 103 |
| 10 | Nhập/xuất có mã đơn riêng, tra cứu theo mã đơn | Stage 11, 14, 19 | 82, 92, 109 |
| 11 | Inventory nên tách thành Inventory (biến động theo thời điểm) + Detail Inventory (chi tiết theo ngày, sắp theo thứ tự) | Stage 17, 20 | 101, 102, 112, 113 |
| 12 | Tìm kiếm nhập/xuất số lượng ra liên tiếp/liền kề nhau | Stage 11, 17, 20 | 82, 103, 113 |

Không có vấn đề nào bị bỏ sót — mỗi dòng trên đều có ít nhất 1 task cụ thể, có thể tick khi xong.

## Tổng quan Stage

| Stage | Nội dung | Task | Loại |
|---|---|---|---|
| 11 | **Nền tảng dữ liệu** — Prisma schema: orderCode, expiryDate (Schedule), quantityBefore/After + dailySeq (Transaction), bảng ScheduleAllocation (multi-slot) | 82-85 | Backend |
| 12 | **Sửa số liệu sai** — Fill rate tính theo capacity thay vì đếm slot; sửa đếm "sản phẩm đã gán" bị lệch `deletedAt` | 86-88 | Backend |
| 13 | **Cảnh báo hết hạn** — trạng thái OK/WARNING/CRITICAL/EXPIRED, API trả danh sách chi tiết | 89-90 | Backend |
| 14 | **Chi tiết giao dịch & mã đơn** — ghi before/after, sinh mã đơn, sort liên tiếp cùng ngày | 91-93 | Backend |
| 15 | **Thuật toán xếp kho** — hàng nặng ưu tiên level thấp, lấp slot tuần tự | 94-96 | Backend |
| 16 | **Đặt lịch nâng cao** — nhập HSD lúc đặt lịch, gợi ý nhiều vị trí, bỏ chặn cứng 1-slot | 97-100 | Backend |
| 17 | **Tách Inventory/Detail Inventory (API)** | 101-103 | Backend |
| 18 | **Frontend: Dashboard/Racking/Category** — hiển thị đúng fill rate, màu hết hạn, cờ hàng nặng, sửa số liệu category | 104-107 | Frontend |
| 19 | **Frontend: Transaction detail, mã đơn, form đặt lịch, multi-slot UI** | 108-111 | Frontend |
| 20 | **Frontend: 2 trang Inventory / Detail Inventory** | 112-113 | Frontend |
| 21 | **Kiểm thử & rollout toàn hệ thống** | 114-115 | Backend+Frontend |

## Cấu trúc file (giống Stage 1-10)

```
docs/frontend-tasks/
├── tasks/
│   ├── Stage-11/   (82-85  — Nền tảng dữ liệu)
│   ├── Stage-12/   (86-88  — Sửa số liệu sai)
│   ├── Stage-13/   (89-90  — Cảnh báo hết hạn)
│   ├── Stage-14/   (91-93  — Chi tiết giao dịch & mã đơn)
│   ├── Stage-15/   (94-96  — Thuật toán xếp kho)
│   ├── Stage-16/   (97-100 — Đặt lịch nâng cao)
│   ├── Stage-17/   (101-103 — Inventory/Detail Inventory API)
│   ├── Stage-18/   (104-107 — Frontend Dashboard/Racking/Category)
│   ├── Stage-19/   (108-111 — Frontend Transaction/Schedule/Multi-slot)
│   ├── Stage-20/   (112-113 — Frontend Inventory/Detail Inventory)
│   └── Stage-21/   (114-115 — Test & rollout)
└── prompts/
    └── (tương ứng từng Stage ở trên)
```

## Trạng thái hiện tại

- [x] Stage 11 — đã viết đủ task 82-85 (xem `tasks/Stage-11/`, `prompts/Stage-11/`)
- [ ] Stage 12 → 21 — sẽ viết lần lượt khi anh nhắn "tiếp tục"

## Bắt buộc trước khi coi 1 task hoàn thành

Task backend (đụng `apps/backend`):
```
npm run lint --workspace=backend
npm run build --workspace=backend
npx prisma migrate dev   # nếu có đổi schema.prisma
```

Task frontend (đụng `apps/frontend`):
```
npm run lint --workspace=frontend
npm run build --workspace=frontend
```
