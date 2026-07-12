# Task 71 — Responsive + lint/build kiểm tra Racking

**Nhóm:** G – Racking
**Thời lượng ước tính:** 1.5 giờ
**File:** CSS liên quan Racking (tạo/sửa nếu cần)
**Phụ thuộc:** Task 62-70

## Bối cảnh

Layout 4 cột song song rất dễ vỡ trên mobile — cần phương án riêng, khác các module trước.

## Yêu cầu

1. Trên màn hình < 768px, chuyển layout 4 cột thành dạng "drill-down" từng bước (chỉ hiện 1 cột tại 1 thời điểm + nút "Quay lại") hoặc cho phép cuộn ngang (`overflow-x: auto`) — chọn 1 trong 2 phương án, ghi rõ lựa chọn trong PR.
2. Chạy `npm run lint` và `npm run build`, sửa hết lỗi/cảnh báo liên quan Racking.

## Không được làm

- Không để layout 4 cột tràn ngang không kiểm soát trên mobile — phải chọn rõ 1 phương án responsive.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npm run lint` sạch, `npm run build` thành công.
- [ ] Racking dùng được (không vỡ layout) ở 375px và 1440px.

## Cách tự kiểm tra

DevTools responsive mode 375px/768px/1440px, thử full luồng chọn Zone → Rack → Level → Slot ở từng kích thước.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/71.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
