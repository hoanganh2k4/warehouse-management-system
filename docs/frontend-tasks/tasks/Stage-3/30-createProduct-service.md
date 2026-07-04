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

## Prompt AI (copy nguyên văn)

```
Tôi cần MỞ RỘNG 2 file đã có trong dự án React + TypeScript + axios (không tạo file mới):

1. apps/frontend/src/types.ts (dán nội dung thật vào đây):
[DÁN NỘI DUNG THẬT types.ts VÀO ĐÂY]

2. apps/frontend/src/services/product.service.ts (dán nội dung thật vào đây):
[DÁN NỘI DUNG THẬT product.service.ts VÀO ĐÂY]

Backend có endpoint POST /products yêu cầu Bearer token (đã được apiClient tự động gắn sẵn qua interceptor, không cần code thêm ở đây), nhận body:
{ skuCode: string; name: string; category: 'MILK' | 'CRACKER'; unit: string; isHeavy?: boolean }
Trả về Product vừa tạo nếu thành công (201). Nếu skuCode trùng, trả lỗi 409.

Yêu cầu:
1. Trong types.ts, thêm type CreateProductPayload theo đúng cấu trúc body trên (dùng lại type ProductCategory đã có). Không xoá gì đang có.
2. Trong product.service.ts, thêm 1 hàm mới vào object productService đã có: createProduct(payload: CreateProductPayload): Promise<Product>, gọi apiClient.post('/products', payload) và trả kết quả. KHÔNG tự try/catch lỗi 409, để lỗi tự throw ra ngoài.

Ràng buộc:
- Không tạo file mới.
- Không sửa các hàm đã có (getProducts, getProductById).
- Không tự thêm header Authorization thủ công.

Trả về toàn bộ nội dung của cả 2 file sau khi sửa.
```
