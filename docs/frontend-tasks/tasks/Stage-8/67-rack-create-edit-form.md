# Task 67 — Form Tạo/Sửa Rack (modal) + wiring `create`/`update`

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/pages/racking/RackingPage.tsx (sửa), apps/frontend/src/components/RackFormModal.tsx (tạo mới)
**Phụ thuộc:** Task 66, Task 59 (`rack.service.ts`)

## Bối cảnh

Thêm nút "+ Thêm Rack" ở đầu mỗi cột, gắn với `zoneId` của Zone đang được chọn trong cột bên trái. Dùng lại modal pattern đơn giản (không cần thư viện ngoài, `position: fixed` overlay là đủ, tham khảo cách `Toast` đang render nổi trên layout).

## Yêu cầu

1. Tạo `RackFormModal` nhận props `mode: 'create' | 'edit'`, `initialData?: Rack`, `onSubmit`, `onClose`.
2. Field form đúng theo `CreateRackPayload`/`UpdateRackPayload` (xem lại Task 57).
3. Nút "+ Thêm Rack" mở modal `mode="create""; bấm vào 1 item có sẵn → mở modal `mode="edit"` prefill dữ liệu.
4. Submit gọi `rackService.create` hoặc `.update` tương ứng, thành công thì đóng modal + gọi lại `getAll` để refresh danh sách.

## Không được làm

- Không dùng `window.confirm`/`alert` cho phần thông báo lỗi — dùng `Toast` sẵn có.
- Không cho submit form Rack rỗng — validate field bắt buộc trước khi gọi API.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Tạo mới Rack thành công → xuất hiện ngay trong danh sách không cần reload trang.
- [ ] Sửa Rack thành công → dữ liệu trong danh sách cập nhật đúng.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Tạo mới 1 Rack, sửa lại nó, xác nhận danh sách luôn phản ánh đúng trạng thái mới nhất.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/67.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
