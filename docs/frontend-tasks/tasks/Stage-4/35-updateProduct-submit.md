# Task 35 — `updateProduct` + submit thật

**Nhóm:** E – Edit
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** `apps/frontend/src/services/product.service.ts` (mở rộng), `apps/frontend/src/pages/products/ProductEdit.tsx`
**Phụ thuộc bắt buộc:** Task 34 (form prefill đã có), Task 30 (pattern gọi service tương tự `createProduct`)

## Bối cảnh

Endpoint `PUT /products/:id` nhận `UpdateProductDto` — **tất cả field đều optional** (`name?`, `category?`, `unit?`, `isHeavy?`), **không có `skuCode`**. Vì form ở Task 34 đã load đủ giá trị hiện tại vào state (không để trống field nào), submit ở đây gửi đủ cả 4 field mỗi lần (không cần logic "chỉ gửi field đã đổi" — đơn giản hơn cho task atomic, và backend chấp nhận việc gửi lại giá trị y hệt cũ vì field nào cũng optional).

## Yêu cầu

### 1. `product.service.ts` — thêm hàm mới

```ts
updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  return apiClient.put(`/products/${id}`, payload);
},
```

Thêm type vào `types.ts`:
```ts
export type UpdateProductPayload = {
  name?: string;
  category?: ProductCategory;
  unit?: string;
  isHeavy?: boolean;
};
```

### 2. `ProductEdit.tsx` — submit thật

1. Thêm state `submitting: boolean` (giống Task 31).
2. Đổi phần bọc form thành `<form onSubmit={handleSubmit}>` nếu chưa phải `<form>`.
3. Viết `handleSubmit` (validate sẽ nối ở Task 36 — task này tạm submit thẳng không validate, giống thứ tự Task 27→31 đã làm cho Create):
   ```ts
   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     if (!form || !id) return;

     setSubmitting(true);
     try {
       await productService.updateProduct(id, {
         name: form.name.trim(),
         category: form.category,
         unit: form.unit.trim(),
         isHeavy: form.isHeavy,
       });
       navigate(`/products/${id}`);
     } catch (err) {
       console.error(err); // Task 36 sẽ thay bằng Toast thật
     } finally {
       setSubmitting(false);
     }
   }
   ```
4. Import `useNavigate`, khởi tạo `navigate`.
5. Sau khi cập nhật thành công, điều hướng về trang chi tiết (`/products/${id}`) — **không** về trang danh sách.
6. Nút submit disable khi `submitting`, đổi text "Đang lưu..." trong lúc chờ.

## Không được làm

- Không validate ở task này (Task 36).
- Không xử lý riêng lỗi 404 (sản phẩm bị xoá bởi người khác trong lúc đang sửa) bằng UI đặc biệt — nằm ngoài scope 41 task, để `catch` chung xử lý tạm như trên.
- Không gửi `skuCode` trong payload dưới bất kỳ hình thức nào.
- Không đổi hành vi của `getProducts`/`getProductById`/`createProduct` đã có trong service.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Sửa `name` hoặc field khác, bấm "Lưu" → cập nhật thành công, điều hướng về đúng trang detail, thấy dữ liệu mới.
- [ ] Vào Prisma Studio (hoặc gọi lại `getProductById`) xác nhận dữ liệu trong DB đã đổi đúng.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Không có request nào gửi kèm `skuCode` trong body (kiểm tra tab Network → Payload).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-4/35.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
