# Task 30 — Thêm `createProduct` vào `product.service.ts`

**Nhóm:** D – Create
**Thời lượng ước tính:** 45 phút
**File sửa:** `apps/frontend/src/services/product.service.ts` (mở rộng, không tạo file mới), `apps/frontend/src/types.ts` (mở rộng)
**Phụ thuộc bắt buộc:** Task 24 (`product.service.ts` đã có `getProductById`), Task 11 (Authorization header đã gắn tự động qua interceptor)

## Bối cảnh

Endpoint `POST /products` yêu cầu Bearer token — **không cần tự thêm header trong file này**, vì Task 11 đã cấu hình `apiClient` tự gắn `Authorization` cho mọi request nếu có token lưu sẵn (qua `useAuth`/`localStorage`, tuỳ cách Task 10/11 đã làm). Response thành công trả về `Product` vừa tạo (status 201). Response lỗi có 2 trường hợp cần phân biệt ở Task 32:
- `409 Conflict`: `{ success: false, message: "SKU already exists" }` khi `skuCode` trùng.
- Lỗi validate 400 nếu client bỏ sót gì đó (không nên xảy ra nếu Task 29 làm đúng, nhưng vẫn có thể xảy ra).

## Yêu cầu

1. Trong `types.ts`, thêm type payload (không trùng với `ProductFormState` cục bộ trong component — type này đại diện đúng body gửi lên API):
   ```ts
   export type CreateProductPayload = {
     skuCode: string;
     name: string;
     category: ProductCategory;
     unit: string;
     isHeavy?: boolean;
   };
   ```
2. Trong `product.service.ts`, thêm hàm mới vào object `productService` đã có:
   ```ts
   createProduct(payload: CreateProductPayload): Promise<Product> {
     return apiClient.post('/products', payload);
   },
   ```
3. Không tự bắt lỗi 409 trong service — để nguyên cho lỗi throw lên, xử lý ở component (Task 32).

## Không được làm

- Không tự thêm header `Authorization` thủ công trong hàm này — nếu `apiClient` chưa tự gắn token, đó là lỗi ở Task 11 cần sửa lại đúng chỗ, không vá tạm ở đây.
- Không tạo file mới, không tạo object `productService` thứ 2.
- Không xử lý lỗi 409/400 trong service — thuộc Task 32 (ở component).
- Không thêm `updateProduct`/`deleteProduct` ở task này — thuộc Task 35/38.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Test thủ công (đã đăng nhập, có token): gọi `productService.createProduct({ skuCode: 'TEST-001', name: 'Test', category: 'MILK', unit: 'hộp' })` → tạo thành công, trả về object `Product` có `id`.
- [ ] Gọi lại với `skuCode` trùng vừa tạo → promise reject với lỗi có `status 409` (kiểm tra qua `err.response.status` nếu dùng axios thuần).
- [ ] Không sửa file nào khác ngoài `types.ts` và `product.service.ts`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-3/30.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
