# Task 63 — Cột Rack trong `RackingPage` (hiện theo Zone đang chọn)

**Nhóm:** G – Racking
**Thời lượng ước tính:** 1.5 giờ
**File:** apps/frontend/src/pages/racking/RackingPage.tsx (sửa)
**Phụ thuộc:** Task 62 (cột Zone đã chọn được)

## Bối cảnh

Khi người dùng chọn 1 Zone, cột Rack bên phải phải load danh sách Rack thuộc Zone đó qua `rackService.getAll(zoneId)`. Nếu chưa chọn Zone nào, cột Rack hiện trạng thái rỗng ("Chọn Zone để xem Rack").

## Yêu cầu

1. Thêm state `selectedRackId` trong `RackingPage`.
2. Khi `selectedZoneId` đổi, gọi `rackService.getAll(zoneId: selectedZoneId)`, reset `selectedRackId` về `null`.
3. Render cột Rack bên phải cột Zone, danh sách bấm chọn được giống cột Zone.
4. Nếu danh sách rỗng, hiện thông báo "Chưa có dữ liệu" thay vì để trống trơn.

## Không được làm

- Không tự động chọn sẵn Rack đầu tiên khi load — để người dùng tự bấm chọn, tránh gây nhầm lẫn dữ liệu đang xem.
- Không gọi lại `rackService.getAll` nếu `selectedZoneId` không đổi (tránh gọi API thừa mỗi lần re-render).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Chọn Zone bất kỳ → cột Rack load đúng danh sách con của Zone đó.
- [ ] Đổi sang Zone khác → cột Rack (và các cột con xa hơn nếu có) reset đúng.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Chọn qua lại 2-3 Zone khác nhau, xác nhận cột Rack luôn đúng dữ liệu tương ứng, không bị dữ liệu cũ sót lại.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/63.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
