# Task 24 — Thêm `getProductById` vào `product.service.ts`

**Nhóm:** C – Detail
**Thời lượng ước tính:** 1 giờ
**File sửa:** `apps/frontend/src/services/product.service.ts` (file đã tồn tại từ Task 14 — **mở rộng**, không tạo file mới)
**Phụ thuộc bắt buộc:** Task 14 (`product.service.ts` đã có `getProducts`)

## Bối cảnh

Endpoint backend thật: `GET /api/products/:id` →

```ts
async findOne(id: string) {
  const product = await this.prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: { batches: { orderBy: { expiryDate: 'asc' } } },
  });
  if (!product) throw new NotFoundException('Product not found');
  return product;
}
```

Response thật trả về **product kèm mảng `batches`** (không phải chỉ `Product` thuần như trong `types.ts`). Mỗi phần tử `batches` có dạng (theo `model Batch` trong Prisma schema):

```ts
{
  id: string;
  productId: string;
  batchCode: string;
  manufactureDate: string; // ISO date string qua JSON
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}
```

Nếu `id` không tồn tại → backend trả `404` với body `{ success: false, message: "Product not found" }`. `apiClient` (Task 06/11) khi gặp lỗi HTTP sẽ throw exception (axios ném lỗi cho status ngoài 2xx theo mặc định) — hàm này **không** tự bắt lỗi, để cho hook ở Task 25 xử lý, giống pattern `getProducts`.

## Yêu cầu

1. Trong `types.ts`, thêm type mới cho batch và product-detail (đây là phần mở rộng nhỏ đi kèm task này, vẫn tính vào "mở rộng" chứ không tạo file mới):
   ```ts
   export type Batch = {
     id: string;
     productId: string;
     batchCode: string;
     manufactureDate: string;
     expiryDate: string;
     createdAt: string;
     updatedAt: string;
   };

   export type ProductDetail = Product & {
     batches: Batch[];
   };
   ```
2. Trong `product.service.ts`, thêm hàm mới vào object `productService` đã có (không tạo object thứ 2, không tạo file thứ 2):
   ```ts
   getProductById(id: string): Promise<ProductDetail> {
     return apiClient.get(`/products/${id}`);
   },
   ```
3. Import thêm type `ProductDetail` từ `../types`.

## Không được làm

- Không tạo file `product-detail.service.ts` riêng — chỉ thêm hàm vào file `product.service.ts` đã có.
- Không tự bắt lỗi 404 trong service này (không `try/catch` rồi trả `null`) — để lỗi tự throw, hook `useProductDetail` (Task 25) sẽ bắt.
- Không đổi chữ ký hay hành vi của `getProducts` đã viết ở Task 14.
- Không thêm `updateProduct`/`deleteProduct` ở task này — thuộc Task 35/38.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Test thủ công: gọi `productService.getProductById('<id-thật>')` (lấy id thật từ response `getProducts` hoặc Prisma Studio) → trả về object có field `batches` là mảng.
- [ ] Gọi với id không tồn tại (ví dụ chuỗi UUID ngẫu nhiên) → promise bị reject/throw, không phải trả về `undefined` âm thầm.
- [ ] Không sửa file nào khác ngoài `types.ts` và `product.service.ts`.

## Prompt AI (copy nguyên văn)

```
Tôi cần MỞ RỘNG 2 file đã có trong dự án React + TypeScript + axios (không tạo file mới):

1. apps/frontend/src/types.ts — hiện đã có type Product, PaginatedResult<T>, v.v. (dán nội dung thật vào đây):
[DÁN NỘI DUNG THẬT types.ts VÀO ĐÂY]

2. apps/frontend/src/services/product.service.ts — hiện đã có object productService với hàm getProducts (dán nội dung thật vào đây):
[DÁN NỘI DUNG THẬT product.service.ts VÀO ĐÂY]

Backend có endpoint GET /products/:id trả về Product kèm thêm field "batches" là mảng batch, mỗi batch có dạng:
{ id, productId, batchCode, manufactureDate, expiryDate, createdAt, updatedAt } — manufactureDate/expiryDate/createdAt/updatedAt là ISO date string.
Nếu id không tồn tại, backend trả lỗi 404 (axios sẽ tự throw).

Yêu cầu:
1. Trong types.ts, thêm 2 type mới: "Batch" (theo cấu trúc trên) và "ProductDetail" (= Product & { batches: Batch[] }). Không xoá gì đang có.
2. Trong product.service.ts, thêm 1 hàm mới vào object productService đã có: getProductById(id: string): Promise<ProductDetail>, gọi apiClient.get(`/products/${id}`) và trả kết quả. Không tự try/catch, để lỗi tự throw.

Ràng buộc:
- Không tạo file mới.
- Không sửa/xoá hàm getProducts đã có.
- Không thêm hàm nào khác ngoài getProductById.

Trả về toàn bộ nội dung của cả 2 file sau khi sửa.
```
