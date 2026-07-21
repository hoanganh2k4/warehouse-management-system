# Task 87 [BACKEND] — Sửa "Sản phẩm đã gán" đếm cả sản phẩm đã xoá mềm

## 🎯 Mục tiêu
Sửa `CategoriesService` để `_count.products` chỉ đếm sản phẩm **chưa bị xoá mềm** (`deletedAt: null`), khớp
với cách "Tổng sản phẩm" được đếm ở những nơi khác trong hệ thống — dứt điểm hiện tượng "Sản phẩm đã gán ghi
là 6 nhưng tổng sản phẩm chỉ là 5".

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Đã xác nhận đúng nguyên nhân trong code, không phải lỗi ngẫu nhiên:

- `apps/backend/src/categories/categories.service.ts`, hàm `findAll()`/`findOne()`:
  ```ts
  include: { _count: { select: { products: true } } },
  ```
  Prisma `_count` mặc định đếm **TẤT CẢ** row trong bảng `products` có `categoryId` trỏ tới category đó,
  **kể cả sản phẩm đã xoá mềm** (`Product.deletedAt != null`) — vì `_count` không tự áp filter nào cả.

- Trong khi đó, "Tổng sản phẩm" toàn hệ thống (Dashboard, `products.service.ts`) luôn lọc
  `where: { deletedAt: null }`. Vậy nếu 1 category có 6 sản phẩm nhưng 1 sản phẩm trong đó đã bị xoá mềm,
  "Sản phẩm đã gán" của category đó vẫn hiện 6, còn "Tổng sản phẩm" toàn hệ thống chỉ hiện 5 (hoặc ít hơn
  tuỳ category khác) — đúng như hiện tượng anh mô tả.

Cách sửa: Prisma hỗ trợ truyền `where` bên trong `_count.select.products` để lọc quan hệ trước khi đếm.

## 🧠 Giải thích Prisma cần biết
- Cú pháp lọc quan hệ trong `_count` (Prisma >= 4.16, dự án đang dùng bản mới hơn nên hỗ trợ):
  ```ts
  _count: { select: { products: { where: { deletedAt: null } } } }
  ```
  Đây KHÔNG phải lọc category, mà lọc chính relation `products` chỉ trước khi đếm — không ảnh hưởng gì tới
  các field khác của category.

## 📖 Các file cần đọc trước
- `apps/backend/src/categories/categories.service.ts` (toàn bộ)
- `apps/backend/prisma/schema.prisma` — model `Product` (xác nhận field `deletedAt`) và model `Category`

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/categories/categories.service.ts` (2 chỗ dùng `_count` trong `findAll()` và
  `findOne()`)
- Tạo mới (khuyến khích): `apps/backend/src/categories/categories.service.spec.ts` — test cho case sản phẩm
  đã xoá mềm không bị đếm vào `_count.products`

## 📂 File KHÔNG được sửa
- `apps/backend/src/categories/categories.controller.ts`
- `apps/backend/src/categories/dto/category.dto.ts`
- `apps/backend/prisma/schema.prisma`

## 🔌 API cần dùng
`GET /categories`, `GET /categories/:id` — response shape giữ nguyên (`_count.products` vẫn là 1 số), chỉ
giá trị số được tính lại đúng.

## 🪜 Các bước thực hiện
1. Mở `categories.service.ts`, tìm 2 chỗ `include: { _count: { select: { products: true } } }` (dòng 16 và
   23).
2. Đổi cả 2 chỗ thành:
   ```ts
   include: { _count: { select: { products: { where: { deletedAt: null } } } } },
   ```
3. Không đụng gì tới hàm `update()`/`remove()` (dòng ~54 dùng `product.count` riêng để kiểm tra category có
   đang được dùng trước khi xoá — hàm đó **đã lọc đúng** `where: { categoryId: id, deletedAt: null }` từ
   trước, không cần sửa).
4. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code (đoạn diff)
```ts
findAll() {
  return this.prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });
}

async findOne(id: string) {
  const category = await this.prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });
  if (!category) throw new NotFoundException('Category not found');
  return category;
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/87.txt`

## ✅ Checklist nghiệm thu
- ☐ Cả `findAll()` và `findOne()` đều lọc `deletedAt: null` bên trong `_count.select.products`
- ☐ Không đụng tới hàm `update()`/`remove()`/`create()` trong cùng file
- ☐ `npm run build --workspace=backend` không lỗi
- ☐ Test thủ công: tạo 1 category có 6 sản phẩm, xoá mềm 1 sản phẩm trong đó (soft delete qua API xoá sản
  phẩm hiện có) → gọi lại `GET /categories`, `_count.products` phải ra 5, khớp với "Tổng sản phẩm" toàn hệ
  thống nếu category đó là category duy nhất chứa toàn bộ sản phẩm

## ❌ Lỗi thường gặp
- **Chỉ sửa `findAll()` mà quên `findOne()`** (hoặc ngược lại) → 2 API trả số khác nhau cho cùng 1 category,
  tạo ra bug tương tự nhưng ở phạm vi nhỏ hơn.
- **Nhầm lọc ở cấp `category.findMany({ where: ... })` thay vì trong `_count.select.products`** → lọc nhầm
  category (ẩn mất category) thay vì lọc sản phẩm bên trong.

## 🔄 Cách test
1. Vào Prisma Studio, chọn 1 category đang có nhiều sản phẩm.
2. Soft-delete (xoá mềm) 1 sản phẩm thuộc category đó qua `DELETE /products/:id` (API xoá hiện có, kiểm tra
   nó set `deletedAt` chứ không xoá cứng).
3. Gọi `GET /categories`, kiểm tra `_count.products` của category đó đã giảm đúng 1, không còn đếm sản phẩm
   vừa xoá.
4. So sánh tổng `_count.products` cộng dồn qua các category với `GET /dashboard/summary` → `products` (số
   liệu phải nhất quán nếu 1 sản phẩm chỉ thuộc đúng 1 category).

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/categories/categories.service.ts
```

## 📝 Commit message
```
fix(categories): exclude soft-deleted products from _count.products
```

## 🔀 PR title
```
[Task 87] Fix category assigned-products count to exclude soft-deleted products
```
