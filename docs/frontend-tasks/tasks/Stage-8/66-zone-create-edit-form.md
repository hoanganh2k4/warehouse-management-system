# Task 66 — Form Tạo/Sửa Zone (modal) + wiring `create`/`update`

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/pages/racking/RackingPage.tsx (sửa), apps/frontend/src/components/ZoneFormModal.tsx (tạo mới)
**Phụ thuộc:** Task 62, Task 58 (`zone.service.ts`)

## Bối cảnh

Thêm nút "+ Thêm Zone" ở đầu mỗi cột. Dùng lại modal pattern đơn giản (không cần thư viện ngoài, `position: fixed` overlay là đủ, tham khảo cách `Toast` đang render nổi trên layout).

## Yêu cầu

1. Tạo `ZoneFormModal` nhận props `mode: 'create' | 'edit'`, `initialData?: Zone`, `onSubmit`, `onClose`.
2. Field form đúng theo `CreateZonePayload`/`UpdateZonePayload` (xem lại Task 57).
3. Nút "+ Thêm Zone" mở modal `mode="create""; bấm vào 1 item có sẵn → mở modal `mode="edit"` prefill dữ liệu.
4. Submit gọi `zoneService.create` hoặc `.update` tương ứng, thành công thì đóng modal + gọi lại `getAll` để refresh danh sách.

## Không được làm

- Không dùng `window.confirm`/`alert` cho phần thông báo lỗi — dùng `Toast` sẵn có.
- Không cho submit form Zone rỗng — validate field bắt buộc trước khi gọi API.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Tạo mới Zone thành công → xuất hiện ngay trong danh sách không cần reload trang.
- [ ] Sửa Zone thành công → dữ liệu trong danh sách cập nhật đúng.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Tạo mới 1 Zone, sửa lại nó, xác nhận danh sách luôn phản ánh đúng trạng thái mới nhất.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/66.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
