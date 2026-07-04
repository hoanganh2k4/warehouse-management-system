# Task 13 — Mở rộng `types.ts` cho danh sách sản phẩm

**Nhóm:** B – Product List
**Thời lượng ước tính:** 1 giờ
**File sửa:** `apps/frontend/src/types.ts` (file đã tồn tại — chỉ thêm, không xoá gì)
**Phụ thuộc:** Không phụ thuộc task nào trong nhóm B, có thể làm song song với Task 04/05

## Bối cảnh

`types.ts` hiện tại chỉ có type `Product`, khớp đúng với `ProductDto` bên backend:

```ts
export type Product = {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  unit: string;
  isHeavy: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Backend giới hạn `category` chỉ có 2 giá trị (`enum ProductCategory { MILK CRACKER }` trong Prisma schema). Từ Task 14 trở đi, `product.service.ts` cần các type cho tham số phân trang/tìm kiếm và cho kết quả trả về dạng `{ items, meta }` (đúng theo `PaginatedResult<T>` bên backend). Task này chỉ tạo type, **không viết logic gọi API**.

## Yêu cầu

1. Thêm union type `ProductCategory`:
   ```ts
   export type ProductCategory = 'MILK' | 'CRACKER';
   ```
2. Sửa field `category` trong `Product` từ `string` thành `ProductCategory`.
3. Thêm type mô tả phân trang, khớp đúng field name với backend (`page, limit, total, totalPages` — không đổi tên, không thêm field thừa):
   ```ts
   export type PaginationMeta = {
     page: number;
     limit: number;
     total: number;
     totalPages: number;
   };

   export type PaginatedResult<T> = {
     items: T[];
     meta: PaginationMeta;
   };
   ```
4. Thêm type tham số cho việc lấy danh sách sản phẩm (dùng ở Task 14/15/17/18/19):
   ```ts
   export type ProductSort = 'name' | 'sku' | 'category';

   export type GetProductsParams = {
     page?: number;
     limit?: number;
     keyword?: string;
     sort?: ProductSort;
   };
   ```

## Không được làm

- Không tạo file mới — chỉ sửa `types.ts`.
- Không đổi tên field đã có trong `Product` (sẽ làm vỡ `ProductTable.tsx` đang import type này).
- Không thêm `CreateProductPayload` / `UpdateProductPayload` ở task này — hai type đó thuộc Task 27 và Task 33, thêm sớm sẽ gây trùng lặp khi merge.
- Không import gì từ backend (`generated/prisma/client`) — frontend không có quyền truy cập thư mục đó.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `types.ts` build không lỗi TypeScript (`npx tsc --noEmit` trong `apps/frontend`).
- [ ] `Product.category` là `ProductCategory`, không còn là `string`.
- [ ] Có đủ 5 type mới: `ProductCategory`, `PaginationMeta`, `PaginatedResult<T>`, `ProductSort`, `GetProductsParams`.
- [ ] Không có file nào khác bị sửa (kiểm tra bằng `git status`).

## Cách tự kiểm tra

```bash
cd apps/frontend
npx tsc --noEmit
git status   # chỉ được thấy "modified: src/types.ts"
```

Nếu `tsc` báo lỗi ở `ProductTable.tsx` hoặc `App.tsx` vì `category` giờ là union thay vì `string` — đó là lỗi ở nơi khác đang gán giá trị `string` bất kỳ vào field này. Báo lại cho anh Đăng, không tự ý nới lỏng type về lại `string`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-2/13.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
