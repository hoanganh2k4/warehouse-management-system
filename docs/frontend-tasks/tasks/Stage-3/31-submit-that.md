# Task 31 — Submit thật, điều hướng khi thành công

**Nhóm:** D – Create
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductCreate.tsx`
**Phụ thuộc bắt buộc:** Task 29 (hàm `validate()` đã có), Task 30 (`createProduct` đã có trong service)

## Bối cảnh

Task này nối `validate()` (Task 29) với `createProduct()` (Task 30) thành luồng submit hoàn chỉnh, **trừ phần xử lý lỗi 409/Toast** — phần đó thuộc Task 32 (tách riêng vì lỗi 409 cần UI thông báo dạng khác, không phải lỗi inline dưới field). Ở task này, nếu request thất bại vì bất kỳ lý do gì, tạm thời chỉ cần **không crash trang** (dùng `try/catch` cơ bản, log lỗi ra console) — Task 32 sẽ thay phần `catch` này bằng Toast thật.

## Yêu cầu

1. Thêm state `submitting: boolean` để disable nút trong lúc gọi API (tránh double-submit khi người dùng bấm nhiều lần).
2. Viết hàm `handleSubmit`, gắn vào `<form onSubmit={handleSubmit}>` (đổi thẻ bọc form từ `<div>` sang `<form>` nếu Task 27 chưa dùng `<form>` — nhớ gọi `e.preventDefault()`):
   ```ts
   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     const validationErrors = validate();
     setErrors(validationErrors);
     if (Object.keys(validationErrors).length > 0) return;

     setSubmitting(true);
     try {
       const created = await productService.createProduct({
         skuCode: form.skuCode.trim(),
         name: form.name.trim(),
         category: form.category,
         unit: form.unit.trim(),
         isHeavy: form.isHeavy,
       });
       navigate(`/products/${created.id}`);
     } catch (err) {
       // Task 32 sẽ thay đoạn này bằng Toast thật
       console.error(err);
     } finally {
       setSubmitting(false);
     }
   }
   ```
3. Import `useNavigate` từ `react-router-dom`, khởi tạo `const navigate = useNavigate();`.
4. Sau khi tạo thành công, điều hướng tới trang chi tiết sản phẩm vừa tạo (`/products/${created.id}`) — tái sử dụng route đã có từ Task 23, không tạo trang "thành công" riêng.
5. Nút submit disable khi `submitting === true`, đổi text tạm thời thành "Đang tạo..." trong lúc chờ.

## Không được làm

- Không xử lý riêng lỗi 409 ở task này (Task 32).
- Không tạo `Toast.tsx` ở task này (Task 32).
- Không đổi route điều hướng thành công sang chỗ khác ngoài `/products/:id` — giữ nhất quán, tận dụng lại trang Detail đã có.
- Không tự thêm `window.confirm` hay dialog xác nhận trước khi submit — không có trong yêu cầu.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Điền đủ form hợp lệ, bấm "Tạo sản phẩm" → tạo thành công, tự động chuyển sang `/products/<id-vừa-tạo>`, thấy đúng dữ liệu vừa nhập.
- [ ] Để trống field bắt buộc, bấm submit → không gọi API (kiểm tra tab Network không có request mới), lỗi hiển thị đúng dưới field (từ Task 29).
- [ ] Bấm submit nhiều lần liên tiếp khi đang `submitting` → không tạo trùng nhiều bản ghi (nút đã bị disable).
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-3/31.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
