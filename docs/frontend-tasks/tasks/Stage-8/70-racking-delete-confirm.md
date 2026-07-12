# Task 70 — Xoá Zone/Rack/Level/Slot + `ConfirmDialog` dùng chung

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**Files liên quan:** 
- `apps/frontend/src/components/ConfirmDialog.tsx (tạo mới — chưa tồn tại trong dự án dù Task 37 của Products có nhắc tới, kiểm tra lại trước khi tạo trùng)`
- `apps/frontend/src/pages/racking/RackingPage.tsx (sửa)`
**Phụ thuộc:** Task 66-69

## Bối cảnh

Backend chặn xoá nếu còn dữ liệu con (vd. `rackHasLevels` 409 khi xoá Rack còn Level). Phải hiển thị đúng
message lỗi đó, không cho người dùng tưởng nhầm là lỗi hệ thống.
**Lưu ý:** nếu `ConfirmDialog.tsx` đã được tạo bởi Task 37 (Products) trước khi task này chạy, hãy tái sử dụng
thay vì tạo file trùng — kiểm tra `components/` trước khi bắt đầu.


## Yêu cầu

1. Tạo `ConfirmDialog` dùng chung (nếu chưa có): props `message`, `onConfirm`, `onCancel`.
2. Thêm nút Xoá cho mỗi item ở cả 4 cột (Zone/Rack/Level/Slot), bấm vào mở `ConfirmDialog`.
3. Confirm → gọi `remove(id)` tương ứng, thành công thì refresh danh sách + reset `selected*Id` nếu vừa xoá item đang chọn.
4. Lỗi 409 (còn dữ liệu con) → hiện `Toast` với đúng message backend (`rackHasLevels` và tương tự cho zone/level/slot).

## Không được làm

- Không dùng `window.confirm` mặc định của trình duyệt — phải dùng `ConfirmDialog` để đồng bộ UI toàn app.
- Không xoá âm thầm khi còn lỗi — phải chờ xác nhận rõ ràng qua Toast.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Xoá thành công → item biến mất khỏi danh sách ngay.
- [ ] Xoá 1 Rack còn Level bên trong → bị chặn, thấy đúng Toast lỗi.
- [ ] Xoá item đang được chọn (đang xem con của nó) → các cột con bên phải reset về rỗng, không còn tham chiếu tới ID đã xoá.

## Cách tự kiểm tra

Thử xoá theo thứ tự từ trong ra ngoài (Slot → Level → Rack → Zone) để tránh case lỗi 409, sau đó thử xoá ngược lại để xác nhận bị chặn đúng.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/70.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
