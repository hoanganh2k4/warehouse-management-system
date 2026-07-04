# Task 14 — `product.service.ts`: hàm `getProducts(params)`

**Nhóm:** B – Product List
**Thời lượng ước tính:** 1.5 giờ
**File tạo mới:** `apps/frontend/src/services/product.service.ts`
**Phụ thuộc:** Task 06 (`lib/api-client.ts` đã có), Task 13 (đã có `GetProductsParams`, `PaginatedResult`)

## Bối cảnh

Đây là task đầu tiên tạo `product.service.ts` — thư mục `services/` đã được tạo rỗng ở Task 02, và `services/auth.service.ts` đã có từ Task 07 (dùng làm ví dụ về cách gọi `apiClient`).

⚠️ **Trước khi làm task này**, mở `apps/frontend/src/lib/api-client.ts` (tạo ở Task 06) và xác nhận `apiClient` unwrap envelope theo kiểu nào:

- Nếu `apiClient.get<T>(url)` trả thẳng `Promise<T>` (đã bóc `{success, data}` ở response interceptor) → dùng đúng như code mẫu bên dưới.
- Nếu `apiClient` vẫn trả `AxiosResponse` nguyên bản (`response.data.data`) → phải tự bóc `.data.data` trong file này thay vì `.data`.

Endpoint backend thật: `GET /api/products?page=&limit=&keyword=&sort=` → trả về
`{ success: true, data: { items: Product[], meta: { page, limit, total, totalPages } } }`.

## Yêu cầu

1. Tạo file `apps/frontend/src/services/product.service.ts`.
2. Viết hàm `getProducts(params: GetProductsParams): Promise<PaginatedResult<Product>>`.
3. Gọi `GET /products` (không có tiền tố `/api` — `apiClient` đã cấu hình `baseURL` ở Task 06) kèm `params` làm query string qua option `{ params }` của axios.
4. Import type `Product`, `GetProductsParams`, `PaginatedResult` từ `../types`.
5. Không tự chuyển đổi/format dữ liệu — trả nguyên `PaginatedResult<Product>` để hook ở Task 15 xử lý.

Code tham khảo (điều chỉnh theo đúng contract thật của `apiClient`):

```ts
import { apiClient } from '../lib/api-client';
import type { Product, PaginatedResult, GetProductsParams } from '../types';

export const productService = {
  getProducts(params: GetProductsParams): Promise<PaginatedResult<Product>> {
    return apiClient.get('/products', { params });
  },
};
```

## Không được làm

- Không gọi `fetch()` trực tiếp — bắt buộc dùng `apiClient` đã cấu hình sẵn interceptor/token (nếu không dùng, sau này khi thêm auth header ở Task 11 sẽ phải sửa lại toàn bộ service).
- Không thêm `getProductById`, `createProduct`... trong file này — các hàm đó thuộc Task 24/30/35/38, thêm bây giờ dễ gây conflict merge với người làm nhóm C/D.
- Không xử lý loading/error trong service — đó là việc của hook (Task 15) và component, service chỉ gọi API và trả dữ liệu hoặc để lỗi tự throw.
- Không đổi tên export `productService` nếu nhóm đã thống nhất convention đặt tên khác — hỏi anh Đăng nếu không chắc.

## Kết quả kỳ vọng (Definition of Done)

- [ ] File `product.service.ts` tồn tại, export `productService.getProducts`.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Test thủ công bằng cách gọi tạm trong console trình duyệt hoặc file test nhỏ: `productService.getProducts({ page: 1, limit: 20 })` trả về object có `items` (mảng) và `meta` (object 4 field).
- [ ] Không sửa `App.tsx`, `ProductList.tsx`, hay bất kỳ component nào — task này chỉ tạo service.

## Cách tự kiểm tra

Backend phải đang chạy (`npm run start:dev` ở `apps/backend`). Tạm thời gọi hàm này từ một chỗ bất kỳ (ví dụ console DevTools qua `window`) để xác nhận response đúng hình dạng `{ items: [...], meta: {...} }` trước khi báo hoàn thành.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-2/14.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
