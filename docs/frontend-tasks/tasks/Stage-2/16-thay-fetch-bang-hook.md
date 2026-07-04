# Task 16 — Thay fetch thủ công trong `ProductList.tsx` bằng `useProducts`

**Nhóm:** B – Product List
**Thời lượng ước tính:** 1 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 04 (đã di dời dashboard từ `App.tsx` sang `ProductList.tsx`), Task 15 (`useProducts` đã có)

## Bối cảnh

Sau Task 04, `ProductList.tsx` đang chứa nguyên khối code fetch cũ được di dời từ `App.tsx`:

```ts
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const controller = new AbortController();
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', { signal: controller.signal });
      ...
    } ...
  };
  fetchProducts();
  return () => controller.abort();
}, []);
```

Task này **chỉ** thay khối trên bằng lời gọi `useProducts`. Chưa xử lý search server-side (Task 17), chưa có pagination/sort (Task 18/19) — tạm thời gọi hook với params cố định `{ page: 1, limit: 20 }`.

## Yêu cầu

1. Xoá toàn bộ `useState` (products/loading/error) và `useEffect` fetch thủ công.
2. Thay bằng:
   ```ts
   const { items, meta, loading, error, refetch } = useProducts({ page: 1, limit: 20 });
   ```
3. Đổi mọi chỗ đang dùng biến `products` thành `items` (ví dụ trong tính `stats`, trong `<ProductTable products={...} totalCount={...} />`).
4. `totalCount` truyền vào `ProductTable` đổi từ `products.length` thành `meta?.total ?? 0`.
5. Giữ nguyên biến `query` và logic lọc client-side `filteredProducts` — **task này chưa xoá phần đó**, việc chuyển `query` thành param server-side thuộc Task 17. Tạm thời `useProducts` gọi với `keyword` cố định là `undefined`.
6. Import `useProducts` từ `../../hooks/useProducts` (điều chỉnh đường dẫn theo vị trí thật của file `ProductList.tsx` sau Task 04).

## Không được làm

- Không xoá biến `query`/`filteredProducts` — sẽ được tái sử dụng và sửa dần ở Task 17.
- Không sửa `ProductTable.tsx`.
- Không thêm pagination hay sort UI ở task này (Task 18/19).
- Không xoá `refetch` dù chưa dùng tới — sẽ cần ở Task 38 (xoá sản phẩm xong thì refetch).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Trang Product List load được danh sách sản phẩm thật từ API qua hook (không còn `fetch('/api/products')` thủ công trong file).
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Mở tab Network trong DevTools, thấy đúng 1 request `GET /api/products?page=1&limit=20` khi load trang (không gọi lặp lại liên tục — nếu bị loop, kiểm tra lại Task 15 dependency array).
- [ ] Ô tìm kiếm vẫn lọc được (client-side, tạm thời) như hành vi cũ.

## Prompt AI (copy nguyên văn)

```
Tôi cần sửa file apps/frontend/src/pages/products/ProductList.tsx trong dự án React + TypeScript.

Hiện tại file có đoạn code fetch thủ công như sau (dán nguyên đoạn thật từ file của bạn vào đây trước khi chạy prompt):
[DÁN ĐOẠN useState + useEffect fetch cũ VÀO ĐÂY]

Tôi đã có sẵn hook apps/frontend/src/hooks/useProducts.ts, dùng như sau:
const { items, meta, loading, error, refetch } = useProducts({ page: 1, limit: 20 });
- items: Product[]
- meta: { page, limit, total, totalPages } | null
- loading: boolean
- error: string | null
- refetch: () => void

Yêu cầu:
1. Xoá toàn bộ useState (products, loading, error) và useEffect fetch thủ công cũ.
2. Thay bằng lời gọi useProducts({ page: 1, limit: 20 }) như trên.
3. Đổi mọi nơi đang dùng biến "products" thành "items".
4. Đổi totalCount truyền cho <ProductTable /> từ "products.length" thành "meta?.total ?? 0".
5. GIỮ NGUYÊN biến "query" và logic filteredProducts lọc client-side hiện có — không xoá, không sửa logic đó ở bước này.
6. Import useProducts đúng đường dẫn tương đối tới hooks/useProducts.ts.

Chỉ sửa phần liên quan đến fetch dữ liệu, không đổi bố cục JSX, không đổi các component con khác.
Trả về toàn bộ nội dung file sau khi sửa.
```
