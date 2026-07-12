# Task 56 — Test thủ công + báo cáo hoàn thành module Inventory

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1 giờ
**File:** Không tạo file code — chỉ báo cáo (đính kèm trong PR hoặc file `docs/frontend-tasks/reports/inventory-report.md`)
**Phụ thuộc:** Task 42 → 55 (toàn bộ module Inventory)

## Bối cảnh

Giống Task 41 (test-report) đã làm cho Products — chốt sổ trước khi merge.

## Yêu cầu

1. Test full luồng: xem danh sách tồn kho (public) → đăng nhập → nhập kho thành công → xuất kho thành công → xem lại danh sách để xác nhận số liệu cập nhật đúng.
2. Test 2 luồng lỗi: nhập kho vượt sức chứa slot, xuất kho vượt tồn kho — xác nhận Toast lỗi đúng nội dung backend trả.
3. Ghi lại kết quả vào file report ngắn gọn (bảng test case / kết quả Pass-Fail).

## Không được làm

- Không bỏ qua case lỗi 409 — đây là phần dễ bị quên nhất khi merge vội.

## Kết quả kỳ vọng (Definition of Done)

- [ ] File report tồn tại, liệt kê đủ các case ở trên với kết quả Pass.

## Cách tự kiểm tra

Thực hiện thủ công từng bước trên trình duyệt thật, chụp lại nếu cần làm bằng chứng.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/56.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
