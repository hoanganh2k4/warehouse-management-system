# Task 17 — Search chuyển thành param `keyword` server-side

**Nhóm:** B – Product List
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 05 (search đã nằm trong `ProductList.tsx`, không còn ở `Topbar.tsx`), Task 16 (đã dùng `useProducts`)

## Bối cảnh

Backend `products.service.ts` đã hỗ trợ tìm theo `keyword` (tìm trong `name` và `skuCode`, `mode: 'insensitive'`):

```ts
if (query.keyword) {
  where.OR = [
    { name: { contains: query.keyword, mode: 'insensitive' } },
    { skuCode: { contains: query.keyword, mode: 'insensitive' } },
  ];
}
```

Lưu ý: backend **không tìm theo `category`**, dù `ProductTable.tsx` cũ từng lọc cả category ở client. Đây là hành vi khác biệt thật cần chấp nhận — không tự thêm lọc category phía client để "bù" lại, vì Quyết định 3 yêu cầu không viết thêm UI/logic ngoài kế hoạch. Nếu cần tìm theo category, đó là việc của một task khác chưa có trong kế hoạch — báo anh Đăng, không tự ý mở rộng.

## Yêu cầu

1. Xoá logic lọc client-side `filteredProducts` (đoạn `useMemo` lọc theo `query` bằng `.filter()`).
2. Truyền `query` (đổi tên biến state thành `keyword` nếu muốn rõ nghĩa hơn — không bắt buộc) trực tiếp vào `useProducts({ page: 1, limit: 20, keyword: query || undefined })`.
3. **Bắt buộc debounce** ô input 300–400ms trước khi cập nhật giá trị dùng làm param gọi API — gõ mỗi ký tự gọi API ngay sẽ tạo quá nhiều request. Cách làm: giữ 2 state riêng — `inputValue` (cập nhật ngay theo mỗi keystroke, bind vào ô input) và `debouncedKeyword` (cập nhật sau debounce, dùng làm param cho `useProducts`).
4. Đổi `<ProductTable products={...} query={...} />` — prop `products` giờ nhận thẳng `items` từ hook (không qua `.filter()` nữa), prop `query` vẫn nhận `inputValue` (dùng để hiển thị "No matches for ..." trong `ProductTable.tsx` — không đổi gì bên đó).
5. `totalCount` vẫn là `meta?.total ?? 0` (giữ từ Task 16).

Code tham khảo debounce (không cần thư viện ngoài, tự viết bằng `useEffect` + `setTimeout`):

```ts
const [inputValue, setInputValue] = useState('');
const [debouncedKeyword, setDebouncedKeyword] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedKeyword(inputValue), 350);
  return () => clearTimeout(timer);
}, [inputValue]);

const { items, meta, loading, error, refetch } = useProducts({
  page: 1,
  limit: 20,
  keyword: debouncedKeyword || undefined,
});
```

## Không được làm

- Không xoá `useProducts` từ Task 16, chỉ thêm `keyword` vào params truyền vào.
- Không thêm thư viện debounce (`lodash.debounce`, `use-debounce`...) — tự viết bằng `setTimeout` như trên, giữ đúng tinh thần "không phụ thuộc thư viện ngoài kế hoạch".
- Không sửa `ProductTable.tsx` hay backend.
- Không lọc theo category ở client để bù cho việc backend không hỗ trợ — nếu thấy cần, dừng lại và hỏi, không tự quyết định mở rộng scope.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Gõ vào ô tìm kiếm → sau ~350ms mới thấy request `GET /api/products?...&keyword=...` trong tab Network (không phải mỗi phím gõ 1 request).
- [ ] Gõ tên hoặc SKU có thật trong database → ra đúng kết quả từ server.
- [ ] Gõ category (ví dụ "MILK") → theo đúng hành vi backend, **không** ra kết quả nếu tên/SKU không chứa chuỗi đó (đây là hành vi đúng, không phải bug).
- [ ] Xoá hết ô tìm kiếm → danh sách quay lại đầy đủ.
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-2/17.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
