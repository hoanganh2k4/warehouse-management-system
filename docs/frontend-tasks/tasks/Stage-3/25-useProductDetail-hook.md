# Task 25 — `hooks/useProductDetail.ts`

**Nhóm:** C – Detail
**Thời lượng ước tính:** 1.5 giờ
**File tạo mới:** `apps/frontend/src/hooks/useProductDetail.ts`
**Phụ thuộc bắt buộc:** Task 24 (`getProductById` đã có), Task 15 (dùng làm mẫu pattern — **tái sử dụng ý tưởng, không import chéo hook**)

## Bối cảnh

Đây là hook thứ 2 theo pattern `useState` + `useEffect` (Quyết định 4). Task 34 (nhóm E – Edit) sẽ **tái sử dụng chính hook này** để prefill form edit — vì vậy hook phải trả về đủ dữ liệu và không gắn logic riêng cho trang Detail (ví dụ không tự parse/format ngày tháng trong hook, để nguyên string ISO cho nơi dùng tự format).

## Yêu cầu

1. Tạo `apps/frontend/src/hooks/useProductDetail.ts`.
2. Hook nhận vào `id: string | undefined` (vì `useParams()` có thể trả `undefined` trong lúc React chưa mount xong route param).
3. Trả về:
   ```ts
   {
     product: ProductDetail | null;
     loading: boolean;
     error: string | null;
     refetch: () => void;
   }
   ```
4. Nếu `id` là `undefined` hoặc rỗng — **không gọi API**, set `loading = false`, `error = 'Thiếu id sản phẩm'` (hoặc tương tự), `product = null`. Đây là edge case cần xử lý rõ ràng, không để gọi `getProductById(undefined)` gây lỗi TypeScript hoặc lỗi runtime khó hiểu.
5. Dùng cờ `cancelled` chống race condition giống `useProducts` (Task 15) khi `id` đổi nhanh (ít xảy ra ở Detail nhưng vẫn nên có, vì `refetch` có thể được gọi trong lúc request cũ chưa xong).
6. `refetch` dùng lại ở Task 34 (Edit — sau khi update thành công có thể cần load lại) và có thể dùng ở chính Detail nếu sau này có action thay đổi dữ liệu tại chỗ.

Code tham khảo:

```ts
import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { ProductDetail } from '../types';

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      setError('Thiếu id sản phẩm');
      return;
    }

    let cancelled = false;
    setLoading(true);

    productService
      .getProductById(id)
      .then((result) => {
        if (cancelled) return;
        setProduct(result);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  return { product, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}
```

## Không được làm

- Không dùng react-query.
- Không format ngày tháng, không tính toán hiển thị (ví dụ "còn bao nhiêu ngày hết hạn") trong hook — để nguyên dữ liệu thô, việc format thuộc Task 26 (component).
- Không import `useProducts` (Task 15) vào file này hay ngược lại — 2 hook độc lập, dù giống pattern.
- Không sửa `product.service.ts` hay `types.ts`.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi hook với id thật → `loading` chuyển `true → false`, `product` có dữ liệu kèm `batches`.
- [ ] Gọi hook với id không tồn tại → `error` có message hợp lý (message lỗi 404 từ backend, ví dụ "Request failed with status code 404" hoặc message thật do axios/api-client trả), `product` là `null`.
- [ ] Gọi hook với `id = undefined` → không có request nào được gửi (kiểm tra tab Network), `error = 'Thiếu id sản phẩm'`.

## Prompt AI (copy nguyên văn)

```
Tôi cần tạo file mới: apps/frontend/src/hooks/useProductDetail.ts trong dự án React 19 + TypeScript.

Bối cảnh:
- Đã có apps/frontend/src/services/product.service.ts export "productService.getProductById(id: string): Promise<ProductDetail>".
- Đã có type ProductDetail trong apps/frontend/src/types.ts.
- KHÔNG dùng react-query, chỉ dùng useState/useEffect thuần.

Yêu cầu viết hook "useProductDetail(id: string | undefined)":
1. Trả về: { product: ProductDetail | null; loading: boolean; error: string | null; refetch: () => void }.
2. Nếu id là undefined hoặc chuỗi rỗng: KHÔNG gọi API, set loading=false, error='Thiếu id sản phẩm', product=null, và dừng ngay (return sớm trong useEffect, không tiếp tục code fetch bên dưới).
3. Nếu id hợp lệ: gọi productService.getProductById(id), set loading=true trước khi gọi, cập nhật product/error/loading tương ứng khi resolve/reject.
4. Chống race condition bằng cờ "cancelled" trong cleanup của useEffect.
5. error phải là string (dùng err.message, không phải Error object).
6. refetch() phải trigger gọi lại API (dùng state đếm reloadToken làm dependency phụ trong useEffect, cùng với "id").

Ràng buộc:
- Không tạo file nào khác.
- Không sửa product.service.ts hay types.ts.
- Không format ngày tháng hay xử lý hiển thị gì trong hook này — chỉ trả dữ liệu thô.

Trả về toàn bộ nội dung file hooks/useProductDetail.ts.
```
