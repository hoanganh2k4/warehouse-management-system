# Task 41 — Test thủ công toàn luồng + report

**Nhóm:** G – Hoàn thiện
**Thời lượng ước tính:** 3 giờ
**File tạo mới:** `docs/test-report.md`
**Phụ thuộc bắt buộc:** Task 01–40 đã xong (đây là task cuối cùng trong 41 task)

## Bối cảnh

Task cuối cùng — test end-to-end toàn bộ luồng CRUD sản phẩm đã xây trong Nhóm A–G, ghi lại kết quả thành 1 báo cáo. Đây **không phải** viết automated test (E2E test tự động không nằm trong 41 task này) — là test tay có checklist, ghi chú lại pass/fail rõ ràng để bàn giao.

## Yêu cầu

Test đủ các luồng sau, theo đúng thứ tự (luồng sau phụ thuộc dữ liệu luồng trước):

### A. Auth
- [ ] Login đúng tài khoản → vào được app, token được lưu.
- [ ] Login sai mật khẩu → thấy lỗi 401 hiển thị rõ ràng, không crash.
- [ ] Gõ thẳng URL `/products/new` khi chưa đăng nhập → redirect về Login.
- [ ] Sau khi login, gõ lại URL đó → vào được bình thường.

### B. Danh sách sản phẩm
- [ ] Load trang chủ → thấy danh sách + 4 `StatCard` đúng số liệu.
- [ ] Gõ tìm kiếm ra kết quả đúng (theo tên hoặc SKU).
- [ ] Gõ tìm kiếm không ra kết quả → xem lại đúng như kết luận ở Task 22 (không phải bug, là hành vi đã biết).
- [ ] Đổi trang (nếu đủ dữ liệu > 20 sản phẩm).
- [ ] Đổi sort (name/sku/category) → thứ tự đổi đúng.

### C. Chi tiết sản phẩm
- [ ] Vào chi tiết 1 sản phẩm có batches → hiển thị đúng dữ liệu + bảng batches sắp theo hạn dùng.
- [ ] Vào chi tiết 1 sản phẩm không có batch nào → thấy "Chưa có lô hàng nào", không lỗi layout.
- [ ] Vào chi tiết với id không tồn tại → thấy panel lỗi, bấm "Thử lại" hoạt động.

### D. Tạo sản phẩm
- [ ] Tạo thành công với dữ liệu hợp lệ → điều hướng đúng sang trang chi tiết sản phẩm vừa tạo.
- [ ] Để trống field bắt buộc → lỗi hiện đúng dưới field, không gọi API.
- [ ] Tạo với SKU trùng → Toast lỗi hiện đúng message, dữ liệu form không mất.

### E. Sửa sản phẩm
- [ ] Sửa và lưu thành công → điều hướng về Detail, dữ liệu mới hiển thị đúng.
- [ ] SKU hiển thị dạng chỉ đọc, không sửa được ở bất kỳ đâu trong form.
- [ ] Để trống field bắt buộc → lỗi hiện đúng.
- [ ] Xoá sản phẩm ở tab khác trong lúc form Edit đang mở, bấm Lưu → Toast lỗi 404 hiện đúng (theo Task 36), không crash trang.

### F. Xoá sản phẩm
- [ ] Bấm Xoá → `ConfirmDialog` hiện đúng tên sản phẩm.
- [ ] Xác nhận xoá → sản phẩm biến mất khỏi danh sách/điều hướng đúng (tuỳ Phương án A/B đã chọn ở Task 38).
- [ ] Bấm "Huỷ" trong dialog → không xoá gì, dialog đóng lại.

### G. Responsive
- [ ] Test nhanh ở 375px và 768px cho toàn bộ 6 mục A–F ở trên (không cần lặp lại chi tiết, chỉ xác nhận không vỡ layout nghiêm trọng).

### H. Lint/Build
- [ ] Xác nhận lại `npm run lint` và `npm run build` vẫn sạch tại thời điểm test (đề phòng có thay đổi phát sinh sau Task 40).

## Viết báo cáo `docs/test-report.md`

Tạo file với cấu trúc:

```markdown
# Test Report — Product CRUD (Task 01–41)

**Người test:** [tên]
**Ngày:** [ngày]
**Môi trường:** [local / staging], backend commit [hash nếu có]

## Tổng quan
- Tổng số mục test: X
- Pass: X
- Fail: X
- Ghi chú/known issues: ...

## Chi tiết theo từng mục (A–H)

### A. Auth
| # | Mô tả | Kết quả | Ghi chú |
|---|---|---|---|
| A1 | Login đúng tài khoản | ✅ Pass | |
| A2 | Login sai mật khẩu | ✅ Pass | |
...

(lặp lại cho B–H, dùng đúng checklist ở trên)

## Bug phát hiện (nếu có)
1. [Mô tả bug] — [mức độ nghiêm trọng] — [đã fix / chưa fix, lý do]

## Known issues chấp nhận được (không phải bug)
- Tìm kiếm không ra kết quả hiển thị "No products yet" thay vì "No matches" (xem Task 22).
- [Liệt kê thêm nếu phát hiện trong quá trình test 41 task]
```

## Không được làm

- Không tự sửa bug phát hiện được trong lúc viết report ở task này nếu bug đó thuộc phạm vi 1 task cụ thể đã "Done" trước đó — ghi nhận vào report, báo anh Đăng xem có cần mở task fix riêng không (tránh sửa ẩu vào phút chót không qua review).
- Không bỏ qua mục nào trong checklist A–H dù có vẻ "chắc chắn đã đúng" — test tay thật, không suy đoán.
- Không viết report qua loa kiểu "mọi thứ đều ổn" mà không có bằng chứng cụ thể (số liệu, ảnh chụp màn hình nếu cần) cho từng mục.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `docs/test-report.md` tồn tại, đủ cấu trúc như mẫu trên.
- [ ] Toàn bộ checklist A–H đã được thực hiện thật (không đánh dấu pass hàng loạt mà không test), kết quả ghi rõ Pass/Fail cho từng dòng.
- [ ] Nếu có Fail, đã ghi rõ mức độ nghiêm trọng và đề xuất hướng xử lý.

## Prompt AI (copy nguyên văn)

```
Tôi vừa test thủ công xong toàn bộ luồng CRUD sản phẩm của dự án (checklist A-H bên dưới), kết quả từng mục như sau (điền kết quả thật của bạn vào đây thay cho các dòng mẫu):

A1. Login đúng tài khoản: Pass
A2. Login sai mật khẩu: Pass
A3. ...
[ĐIỀN ĐỦ KẾT QUẢ THẬT CỦA BẠN CHO TỪNG MỤC A ĐẾN H]

Hãy giúp tôi tổng hợp thành file docs/test-report.md theo đúng cấu trúc mẫu sau (không tự thêm mục test nào tôi không liệt kê, không tự đoán kết quả cho mục tôi không ghi):

# Test Report — Product CRUD (Task 01–41)
**Người test:** [điền]
**Ngày:** [điền]
**Môi trường:** [điền]

## Tổng quan
(tính tổng số Pass/Fail dựa trên dữ liệu tôi cung cấp)

## Chi tiết theo từng mục (A–H)
(dùng bảng markdown | # | Mô tả | Kết quả | Ghi chú |, điền đúng dữ liệu tôi đưa, không bịa thêm)

## Bug phát hiện (nếu có)
(chỉ liệt kê nếu tôi có ghi Fail ở đâu đó, mô tả lại đúng những gì tôi đã nêu, không suy diễn thêm)

## Known issues chấp nhận được (không phải bug)
- Tìm kiếm không ra kết quả hiển thị "No products yet" thay vì "No matches" (theo phân tích ở Task 22).

Trả về toàn bộ nội dung file docs/test-report.md.
```
