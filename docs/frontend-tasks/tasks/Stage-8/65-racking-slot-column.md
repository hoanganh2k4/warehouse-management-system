# Task 65 — Cột Slot trong `RackingPage` (hiện theo Level đang chọn, kèm trạng thái còn/hết chỗ)

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/pages/racking/RackingPage.tsx (sửa)
**Phụ thuộc:** Task 64 (cột Level đã chọn được), Task 61 (`slot.service.ts`)

## Bối cảnh

Khác 3 cột trước: `slotService.getAll` nhận 1 object params (`{ levelId, page, limit }`) và trả về
`PaginatedResult<Slot>` (có `meta`) chứ không phải mảng thuần — nhớ xử lý `meta`/phân trang nếu số
slot trong 1 level nhiều (mặc định `limit=50`). Vì `GET /slots` là public, cột này vẫn gọi được
ngay cả khi chưa đăng nhập — chỉ thao tác Tạo/Sửa/Xoá (Task 69/70) mới cần đăng nhập.


## Yêu cầu

1. Thêm state `selectedSlotId`, `slots: Slot[]`, `slotsMeta: PaginationMeta | null`.
2. Khi `selectedLevelId` đổi, gọi `slotService.getAll({ levelId: selectedLevelId, page: 1, limit: 50 })`, reset `selectedSlotId` về `null`.
3. Render cột Slot bên phải cột Level, mỗi item hiện `code` + badge trạng thái: `usedCapacity < maxCapacity` → "Còn chỗ" (xanh), ngược lại → "Đầy" (đỏ). Có thể hiện thêm `occupancyRate`% cho trực quan.
4. Nếu `slotsMeta.totalPages > 1`, thêm nút phân trang Trước/Sau cho cột Slot.
5. Nếu danh sách rỗng, hiện "Chưa có Slot nào".

## Không được làm

- Không gọi `slotService.getAll(selectedLevelId)` kiểu positional string như 3 service kia — chữ ký của `slotService.getAll` là 1 object params, gọi sai kiểu sẽ lỗi TypeScript.
- Không tự động chọn sẵn Slot đầu tiên khi load.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Chọn Level bất kỳ → cột Slot load đúng danh sách Slot của Level đó, đúng field `maxCapacity`/`usedCapacity`.
- [ ] Badge "Còn chỗ"/"Đầy" hiển thị đúng theo dữ liệu thật.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Chọn 1 Level có sẵn nhiều Slot (nếu có), xác nhận phân trang hoạt động; đối chiếu badge còn/hết chỗ với giá trị `usedCapacity`/`maxCapacity` thật trong response Swagger `/slots`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/65.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
