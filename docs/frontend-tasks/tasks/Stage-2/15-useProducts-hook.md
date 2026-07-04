# Task 15 — `hooks/useProducts.ts`

**Nhóm:** B – Product List
**Thời lượng ước tính:** 2 giờ
**File tạo mới:** `apps/frontend/src/hooks/useProducts.ts`
**Phụ thuộc:** Task 13 (types), Task 14 (`product.service.ts`)

## Bối cảnh

Theo Quyết định 4: **không dùng react-query**, dùng `useState` + `useEffect` thủ công. Đây là pattern chung sẽ được tái sử dụng ở Task 25 (`useProductDetail.ts`) — viết đúng chuẩn ở đây để không phải sửa lại sau.

Hook này thay thế đoạn `useEffect` fetch thủ công hiện đang nằm trong `App.tsx` (sẽ được di dời sang `ProductList.tsx` ở Task 04, và Task 16 sẽ thay nó bằng hook này).

## Yêu cầu

1. Tạo `apps/frontend/src/hooks/useProducts.ts`.
2. Hook nhận vào `params: GetProductsParams` (từ Task 13).
3. Hook trả về object:
   ```ts
   {
     items: Product[];
     meta: PaginationMeta | null;
     loading: boolean;
     error: string | null;
     refetch: () => void;
   }
   ```
4. Bên trong dùng `useEffect` gọi `productService.getProducts(params)` mỗi khi `params` thay đổi.
5. **Bắt buộc dùng `AbortController` hoặc cờ `isCancelled`** để tránh race condition khi người dùng gõ tìm kiếm nhanh (giữ đúng pattern đang có trong `App.tsx` gốc — file đó đã dùng `AbortController`, chỉ là axios không nhận `signal` theo cùng cách `fetch` nhận, nên dùng cờ boolean nếu `apiClient` không hỗ trợ `signal` trực tiếp).
6. `error` phải là `string | null` (không phải `Error` object) — vì `ProductTable.tsx` (Task 20/21) nhận prop `error: string | null` và render thẳng `{error}` trong JSX có sẵn, không tự bọc lại.
7. `refetch` dùng để gọi lại thủ công (ví dụ sau khi xoá sản phẩm ở Task 38).
8. So sánh `params` bằng cách liệt kê từng field ra dependency array của `useEffect` (`params.page, params.limit, params.keyword, params.sort`) — **không** để nguyên object `params` làm dependency, vì object mới được tạo ra mỗi lần render sẽ gây loop vô hạn.

Code tham khảo:

```ts
import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { GetProductsParams, PaginationMeta, Product } from '../types';

export function useProducts(params: GetProductsParams) {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    productService
      .getProducts(params)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setMeta(result.meta);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.keyword, params.sort, reloadToken]);

  return { items, meta, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}
```

## Không được làm

- Không dùng react-query, SWR, hay bất kỳ thư viện fetch nào khác ngoài `useState`/`useEffect` thủ công.
- Không debounce keyword trong hook này — debounce là việc của `ProductList.tsx` (Task 17), hook chỉ nhận params đã sẵn sàng.
- Không sửa `product.service.ts` hay `types.ts`.
- Không throw lỗi ra ngoài — mọi lỗi phải được bắt và đưa vào state `error` dạng string.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi hook với params cố định trong một component test tạm → thấy `loading` chuyển `true → false`, `items` có dữ liệu.
- [ ] Đổi `params.keyword` liên tục (giả lập gõ nhanh) → không thấy dữ liệu "nhấp nháy" sai thứ tự (request cũ ghi đè request mới).
- [ ] Không sửa file nào ngoài `hooks/useProducts.ts`.

## Prompt AI (copy nguyên văn)

```
Tôi cần tạo file mới: apps/frontend/src/hooks/useProducts.ts trong dự án React 19 + TypeScript.

Bối cảnh:
- Đã có apps/frontend/src/services/product.service.ts export "productService.getProducts(params)" trả về Promise<PaginatedResult<Product>>.
- Đã có type trong apps/frontend/src/types.ts: GetProductsParams, PaginationMeta, Product, PaginatedResult<T>.
- KHÔNG được dùng react-query hay bất kỳ thư viện data-fetching nào — chỉ dùng useState/useEffect thuần của React.

Yêu cầu viết hook "useProducts(params: GetProductsParams)":
1. Trả về object gồm: items (Product[]), meta (PaginationMeta | null), loading (boolean), error (string | null), refetch (function không tham số).
2. Gọi lại productService.getProducts mỗi khi các field của params thay đổi (page, limit, keyword, sort) — liệt kê từng field vào dependency array của useEffect, KHÔNG để nguyên object params (tránh loop vô hạn do object mới mỗi lần render).
3. Chống race condition: dùng cờ "cancelled" trong cleanup function của useEffect, bỏ qua kết quả nếu request đã cũ.
4. error phải là string, không phải Error object — bắt lỗi bằng try/catch hoặc .catch() và convert err.message.
5. refetch() phải trigger gọi lại API (dùng một state đếm làm dependency phụ, ví dụ reloadToken).

Ràng buộc:
- Không tạo thêm file nào khác.
- Không sửa product.service.ts hay types.ts.
- Không debounce trong hook này.

Trả về toàn bộ nội dung file hooks/useProducts.ts.
```
