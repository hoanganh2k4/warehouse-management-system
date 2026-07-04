# Task 20 — Wire `loading` vào props có sẵn của `ProductTable`

**Nhóm:** B – Product List
**Thời lượng ước tính:** 30 phút
**File sửa:** `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 16 (đã có `loading` từ `useProducts`)

## Bối cảnh

Quyết định 3: `ProductTable.tsx` **đã** tự render skeleton dựa trên prop `loading` có sẵn — không viết UI mới, không đụng vào `ProductTable.tsx`. Nhìn lại component:

```tsx
export function ProductTable({ products, totalCount, loading, error, query }: ProductTableProps) {
  if (loading) {
    return ( /* bảng skeleton có sẵn */ );
  }
  ...
}
```

Nhiều khả năng qua các Task 16–19, `loading` đã được truyền đúng rồi (vì destructure từ `useProducts` và truyền thẳng vào JSX cũ). Task này là bước **rà soát và xác nhận**, không phải viết mới.

## Yêu cầu

1. Mở `ProductList.tsx`, tìm chỗ render `<ProductTable ... />`.
2. Xác nhận prop `loading={loading}` đang trỏ đúng vào biến `loading` lấy từ `useProducts` (không phải một state `loading` cũ nào còn sót lại từ code trước Task 16).
3. Nếu phát hiện còn state `loading` cũ trùng tên chưa bị xoá ở Task 16 (dễ xảy ra nếu Task 16 làm ẩu) — dọn dẹp, chỉ giữ 1 nguồn `loading` duy nhất từ hook.
4. Không thêm điều kiện `if (loading)` nào khác trong `ProductList.tsx` — việc hiển thị skeleton hoàn toàn do `ProductTable.tsx` tự lo.

## Không được làm

- Không sửa `ProductTable.tsx` dưới bất kỳ hình thức nào (kể cả style skeleton).
- Không thêm spinner, overlay, hay loading indicator nào khác ngoài cái `ProductTable` đã có.
- Không thêm logic `loading` giả (ví dụ `setTimeout` delay loading) để "test cho đẹp" — giữ đúng trạng thái thật từ hook.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Reload trang, thấy đúng khoảnh khắc bảng hiện skeleton (6 dòng xám) trước khi dữ liệu thật hiện ra.
- [ ] Throttle mạng trong DevTools (Slow 3G) để xác nhận rõ trạng thái loading kéo dài đúng như mong đợi.
- [ ] Không có file nào bị sửa ngoài `ProductList.tsx` (và chỉ khi thực sự cần dọn state thừa).

## Prompt AI (copy nguyên văn)

```
Tôi cần rà soát file apps/frontend/src/pages/products/ProductList.tsx trong dự án React + TypeScript.

File này dùng hook useProducts trả về { items, meta, loading, error, refetch } và render:
<ProductTable products={items} totalCount={meta?.total ?? 0} loading={...} error={...} query={inputValue} />

Hãy kiểm tra và cho tôi biết:
1. Prop "loading" truyền vào ProductTable có đang trỏ đúng vào biến "loading" lấy ra từ useProducts hay không, hay đang trỏ nhầm vào một state "loading" cũ khác còn sót lại trong file.
2. Nếu có state "loading" trùng tên/thừa còn sót lại từ code cũ (trước khi dùng hook), hãy xoá state thừa đó và chỉ giữ lại loading từ hook.
3. Không sửa bất kỳ file nào khác, không sửa ProductTable.tsx.
4. Không thêm loading indicator mới nào khác ngoài cái ProductTable đã tự có sẵn.

Nếu mọi thứ đã đúng, xác nhận lại là không cần sửa gì và giải thích ngắn gọn tại sao đã đúng.
Nếu cần sửa, trả về toàn bộ nội dung file sau khi sửa.
```
