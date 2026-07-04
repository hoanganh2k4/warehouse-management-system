# Task 19 — Sort (tham số `sort`)

**Nhóm:** B – Product List
**Thời lượng ước tính:** 1 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 18 (pagination đã có state `page`)

## Bối cảnh

Backend `products.service.ts` chỉ nhận 3 giá trị hợp lệ cho `sort`, giá trị khác sẽ rơi vào mặc định (sắp theo `name`):

```ts
const orderBy =
  query.sort === 'sku'
    ? { skuCode: 'asc' }
    : query.sort === 'category'
      ? { category: 'asc' }
      : { name: 'asc' };
```

Type `ProductSort` đã định nghĩa ở Task 13: `'name' | 'sku' | 'category'`. Không có sort giảm dần (`desc`) — backend chỉ hỗ trợ `asc`, không tự thêm UI chọn chiều sort.

## Yêu cầu

1. Thêm state `sort: ProductSort` mặc định `'name'`.
2. Truyền vào `useProducts({ page, limit: 20, keyword: ..., sort })`.
3. Thêm dropdown `<select>` cho phép chọn 1 trong 3 giá trị, label tiếng Việt dễ hiểu:
   - `name` → "Tên sản phẩm"
   - `sku` → "Mã SKU"
   - `category` → "Danh mục"
4. Khi đổi `sort`, **cũng phải reset `page` về 1** (cùng lý do như Task 18 — tránh đứng ở trang không tồn tại sau khi sắp xếp lại). Thêm `sort` vào effect reset page đã viết ở Task 18, hoặc thêm effect riêng theo dõi `sort`.

Code tham khảo:

```tsx
const [sort, setSort] = useState<ProductSort>('name');

useEffect(() => {
  setPage(1);
}, [debouncedKeyword, sort]);

const { items, meta, loading, error, refetch } = useProducts({
  page,
  limit: 20,
  keyword: debouncedKeyword || undefined,
  sort,
});

// JSX, gần ô tìm kiếm:
<select value={sort} onChange={(e) => setSort(e.target.value as ProductSort)}>
  <option value="name">Tên sản phẩm</option>
  <option value="sku">Mã SKU</option>
  <option value="category">Danh mục</option>
</select>
```

## Không được làm

- Không thêm sort giảm dần hay sort theo field khác (`updatedAt`, `isHeavy`...) — backend không hỗ trợ, thêm vào sẽ bị bỏ qua âm thầm và gây hiểu nhầm.
- Không sửa `ProductTable.tsx` để thêm click-to-sort trên header cột — nằm ngoài scope, để cho phase sau nếu cần.
- Không import lại `ProductSort` từ đâu khác ngoài `../../types` (đã có từ Task 13).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Đổi dropdown → thấy request `GET /api/products?...&sort=sku` (hoặc `category`) trong Network tab.
- [ ] Dữ liệu trả về đúng thứ tự tương ứng.
- [ ] Đổi sort trong khi đang ở trang > 1 → tự quay về trang 1.
- [ ] `npx tsc --noEmit` không lỗi.

## Prompt AI (copy nguyên văn)

```
Tôi cần sửa file apps/frontend/src/pages/products/ProductList.tsx trong dự án React + TypeScript.

Hiện tại file có:
- type ProductSort = 'name' | 'sku' | 'category'; (import từ ../../types)
- state "page" và useEffect reset page khi debouncedKeyword đổi (từ task trước)
- lời gọi: useProducts({ page, limit: 20, keyword: debouncedKeyword || undefined })

Yêu cầu:
1. Thêm state "sort" kiểu ProductSort, mặc định 'name'.
2. Thêm "sort" vào params của useProducts.
3. Sửa useEffect reset page hiện có để theo dõi thêm "sort" (mảng dependency gồm cả debouncedKeyword và sort) — khi 1 trong 2 đổi thì setPage(1).
4. Thêm 1 thẻ <select> gần ô tìm kiếm, với 3 option: 
   - value="name" label "Tên sản phẩm"
   - value="sku" label "Mã SKU"  
   - value="category" label "Danh mục"
   onChange gọi setSort(e.target.value as ProductSort).

Ràng buộc:
- Không thêm sort giảm dần hay field sort khác ngoài 3 giá trị trên.
- Không sửa ProductTable.tsx.

Trả về toàn bộ nội dung file sau khi sửa.
```
