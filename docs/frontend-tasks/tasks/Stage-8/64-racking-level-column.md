# Task 64 — Cột Level trong `RackingPage` (hiện theo Rack đang chọn)

**Nhóm:** G – Racking
**Thời lượng ước tính:** 1.5 giờ
**File:** apps/frontend/src/pages/racking/RackingPage.tsx (sửa)
**Phụ thuộc:** Task 63 (cột Rack đã chọn được)

## Bối cảnh

Khi người dùng chọn 1 Rack, cột Level bên phải phải load danh sách Level thuộc Rack đó qua `levelService.getAll(rackId)`. Nếu chưa chọn Rack nào, cột Level hiện trạng thái rỗng ("Chọn Rack để xem Level").

## Yêu cầu

1. Thêm state `selectedLevelId` trong `RackingPage`.
2. Khi `selectedRackId` đổi, gọi `levelService.getAll(rackId: selectedRackId)`, reset `selectedLevelId` về `null`.
3. Render cột Level bên phải cột Rack, danh sách bấm chọn được giống cột Rack.
4. Nếu danh sách rỗng, hiện thông báo "Chưa có dữ liệu" thay vì để trống trơn.

## Không được làm

- Không tự động chọn sẵn Level đầu tiên khi load — để người dùng tự bấm chọn, tránh gây nhầm lẫn dữ liệu đang xem.
- Không gọi lại `levelService.getAll` nếu `selectedRackId` không đổi (tránh gọi API thừa mỗi lần re-render).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Chọn Rack bất kỳ → cột Level load đúng danh sách con của Rack đó.
- [ ] Đổi sang Rack khác → cột Level (và các cột con xa hơn nếu có) reset đúng.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Chọn qua lại 2-3 Rack khác nhau, xác nhận cột Level luôn đúng dữ liệu tương ứng, không bị dữ liệu cũ sót lại.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/64.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
