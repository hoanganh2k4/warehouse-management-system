# Task 18 — Pagination (`page`, `limit`, `meta.totalPages`)

**Nhóm:** B – Product List
**Thời lượng ước tính:** 2 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 17 (search server-side đã xong, có `debouncedKeyword`)

## Bối cảnh

Backend giới hạn `limit` tối đa 100 (`@Max(100)` trong `PaginationDto`), mặc định `page=1`, `limit=20`. Response có `meta.totalPages` tính sẵn — frontend không tự tính lại, chỉ hiển thị.

## Yêu cầu

1. Thêm state `page` (number, mặc định `1`).
2. Truyền `page` vào `useProducts({ page, limit: 20, keyword: debouncedKeyword || undefined })`.
3. **Khi `debouncedKeyword` đổi, phải reset `page` về `1`** — nếu không, tìm kiếm mới có thể rơi vào trang không có dữ liệu (ví dụ đang ở trang 3, tìm từ khoá mới chỉ có 1 trang kết quả). Dùng `useEffect` riêng theo dõi `debouncedKeyword` để reset `page`.
4. Thêm UI điều khiển trang ở dưới bảng, trong `ProductList.tsx` (không sửa `ProductTable.tsx`):
   - Nút "Trang trước" (disable khi `page <= 1`).
   - Nút "Trang sau" (disable khi `meta` là `null` hoặc `page >= meta.totalPages`).
   - Hiển thị text dạng "Trang {page} / {meta?.totalPages ?? 1}".
5. Khi `loading === true`, disable cả 2 nút để tránh double-click gọi API chồng chéo.

Code tham khảo:

```tsx
useEffect(() => {
  setPage(1);
}, [debouncedKeyword]);

// trong JSX, ngay dưới </ProductTable>:
<div className="pagination-controls">
  <button disabled={loading || page <= 1} onClick={() => setPage((p) => p - 1)}>
    Trang trước
  </button>
  <span>
    Trang {page} / {meta?.totalPages ?? 1}
  </span>
  <button
    disabled={loading || !meta || page >= meta.totalPages}
    onClick={() => setPage((p) => p + 1)}
  >
    Trang sau
  </button>
</div>
```

## Không được làm

- Không đổi `limit` — giữ cố định `20` ở task này (không có yêu cầu cho người dùng chọn số dòng/trang).
- Không sửa `ProductTable.tsx` để thêm pagination bên trong đó — pagination UI đặt ở `ProductList.tsx`, ngoài `ProductTable`.
- Không dùng thư viện pagination ngoài (ví dụ MUI Pagination) — component đơn giản tự viết bằng `<button>`.
- Không style phức tạp — CSS cơ bản đủ dùng, việc responsive/hoàn thiện UI thuộc Task 39.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Có ít nhất 25 sản phẩm trong database để thấy được nhiều hơn 1 trang (kiểm tra qua Prisma Studio hoặc seed data) — nếu database hiện có ít hơn 20 sản phẩm, báo lại để seed thêm trước khi test.
- [ ] Bấm "Trang sau" → thấy request `GET /api/products?page=2&limit=20...`, danh sách đổi.
- [ ] Ở trang cuối, nút "Trang sau" bị disable.
- [ ] Ở trang 1, nút "Trang trước" bị disable.
- [ ] Gõ từ khoá tìm kiếm mới trong khi đang ở trang > 1 → tự động quay về trang 1.
- [ ] `npx tsc --noEmit` không lỗi.

## Prompt AI (copy nguyên văn)

```
Tôi cần sửa file apps/frontend/src/pages/products/ProductList.tsx trong dự án React + TypeScript.

Hiện tại file đang gọi:
const { items, meta, loading, error, refetch } = useProducts({ page: 1, limit: 20, keyword: debouncedKeyword || undefined });
trong đó meta có dạng { page, limit, total, totalPages } | null.

Yêu cầu:
1. Thêm state "page" (number, mặc định 1) bằng useState.
2. Sửa lời gọi useProducts để dùng "page" thay vì số 1 cố định: useProducts({ page, limit: 20, keyword: debouncedKeyword || undefined }).
3. Thêm 1 useEffect theo dõi debouncedKeyword: mỗi khi debouncedKeyword đổi, gọi setPage(1) để reset về trang 1.
4. Thêm UI điều khiển trang, đặt ngay sau component <ProductTable />, gồm:
   - nút "Trang trước": disabled khi loading hoặc page <= 1, onClick giảm page đi 1
   - đoạn text hiển thị "Trang {page} / {meta?.totalPages ?? 1}"
   - nút "Trang sau": disabled khi loading hoặc !meta hoặc page >= meta.totalPages, onClick tăng page lên 1

Ràng buộc:
- Không đổi limit, giữ cố định 20.
- Không sửa ProductTable.tsx.
- Không dùng thư viện pagination ngoài, chỉ dùng thẻ <button> thường.
- CSS đơn giản là đủ, không cần hoàn thiện responsive ở bước này.

Trả về toàn bộ nội dung file sau khi sửa.
```
