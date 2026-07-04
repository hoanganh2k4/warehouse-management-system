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

## Prompt AI (copy nguyên văn)

```
Tôi cần sửa file apps/frontend/src/pages/products/ProductCreate.tsx trong dự án React + TypeScript + react-router-dom.

Nội dung hiện tại (đã có state form, validate(), errors — dán bản thật vào đây):
[DÁN NỘI DUNG THẬT ProductCreate.tsx VÀO ĐÂY]

Đã có sẵn apps/frontend/src/services/product.service.ts với hàm createProduct(payload): Promise<Product>.

Yêu cầu:
1. Thêm state "submitting" (boolean, mặc định false).
2. Import useNavigate từ react-router-dom, khởi tạo navigate.
3. Nếu form hiện đang bọc bởi <div>, đổi thành thẻ <form onSubmit={handleSubmit}>, nút submit đổi type="submit" nếu chưa có.
4. Viết hàm async handleSubmit(e: React.FormEvent):
   - e.preventDefault()
   - gọi validate(), setErrors(kết quả)
   - nếu có lỗi (Object.keys > 0), return ngay, KHÔNG gọi API
   - set submitting = true
   - gọi productService.createProduct với payload: { skuCode: form.skuCode.trim(), name: form.name.trim(), category: form.category, unit: form.unit.trim(), isHeavy: form.isHeavy }
   - nếu thành công: navigate(`/products/${created.id}`)
   - nếu lỗi: tạm thời console.error(err) (sẽ thay bằng Toast ở task sau, không cần làm gì thêm ở đây)
   - finally: set submitting = false
5. Nút submit: disabled={submitting}, text hiển thị "Đang tạo..." khi submitting=true, ngược lại "Tạo sản phẩm".

Ràng buộc:
- Không xử lý riêng lỗi 409 ở bước này.
- Không tạo component Toast ở bước này.
- Không đổi đường điều hướng khi thành công (phải là /products/${created.id}).

Trả về toàn bộ nội dung file sau khi sửa.
```
