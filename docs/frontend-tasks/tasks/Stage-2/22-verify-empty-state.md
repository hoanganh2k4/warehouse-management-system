# Task 22 — Verify empty state (không viết code mới)

**Nhóm:** B – Product List
**Thời lượng ước tính:** 30 phút
**File sửa:** Không có — task kiểm tra thuần
**Phụ thuộc bắt buộc:** Task 17 (search server-side), Task 18 (pagination)

## Bối cảnh

`ProductTable.tsx` có sẵn 2 nhánh empty khác nhau, phân biệt bằng `totalCount` (tổng số sản phẩm trong toàn hệ thống, không phụ thuộc tìm kiếm) so với `products.length` (số sản phẩm sau khi lọc bởi trang/tìm kiếm hiện tại):

```tsx
if (totalCount === 0) {
  return ( /* "No products yet" — chưa seed dữ liệu nào */ );
}

if (products.length === 0) {
  return ( /* "No matches for {query}" — có dữ liệu nhưng tìm kiếm không ra */ );
}
```

Sau Task 16, `totalCount` được truyền là `meta?.total ?? 0` — đây là tổng số sản phẩm **khớp với điều kiện tìm kiếm hiện tại** trả về từ backend (`meta.total` trong `PaginatedResult`), **không phải** tổng số sản phẩm toàn hệ thống không điều kiện. Đây là điểm khác biệt quan trọng so với hành vi gốc của `App.tsx` (nơi `totalCount = products.length` khi chưa lọc, vì lọc là client-side).

**Cần xác nhận rõ**: với cách nối dây hiện tại (Task 16–19), nhánh "No products yet" sẽ hiển thị cả khi tìm kiếm không ra kết quả nào (vì `meta.total` lúc đó cũng bằng 0), chứ không chỉ khi database trống. Nhánh "No matches for..." trong `products.length === 0` gần như sẽ không bao giờ được kích hoạt nữa (vì nếu `items` rỗng thì `meta.total` cũng rỗng, luôn rơi vào nhánh đầu trước).

## Yêu cầu (chỉ kiểm tra, không sửa code trừ khi phát hiện vấn đề thật)

1. Test case 1 — Database trống thật sự: xoá hết dữ liệu products (hoặc test trên môi trường/DB test riêng), tải trang → xác nhận thấy "No products yet".
2. Test case 2 — Tìm kiếm không ra kết quả: database có dữ liệu, gõ từ khoá không tồn tại (ví dụ "zzzxyz123") → theo phân tích ở trên, sẽ thấy "No products yet" thay vì "No matches for...". Xác nhận đây có đúng là hành vi hiện tại không.
3. **Ghi lại kết quả quan sát** vào một bình luận ngắn trong PR/task tracker (không sửa file), ví dụ:
   > "Xác nhận: tìm kiếm không ra kết quả hiện đang hiển thị 'No products yet' thay vì 'No matches'. Đây là do totalCount đang bind vào meta.total (đã lọc theo keyword) thay vì tổng số sản phẩm toàn hệ thống. Giữ nguyên theo đúng Quyết định 3 (không đụng ProductTable.tsx, không viết thêm state mới) — báo anh Đăng quyết định có cần fix ở release sau không."
4. Nếu anh Đăng xác nhận đây là bug cần fix: đó sẽ là task riêng ngoài 41 task hiện tại (cần thêm 1 request phụ lấy tổng số sản phẩm không điều kiện, hoặc backend trả thêm field `totalUnfiltered`) — **không tự ý fix trong task 22**.

## Không được làm

- Không sửa `ProductTable.tsx`, `ProductList.tsx`, `useProducts.ts`, hay bất kỳ file nào.
- Không tự thêm state/logic để phân biệt 2 trường hợp trên — nếu thấy cần, dừng lại, báo cáo, chờ quyết định thêm task mới.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Đã test cả 2 case và ghi lại quan sát thực tế (đúng như phân tích hoặc khác — báo cáo trung thực).
- [ ] Không có commit code nào cho task này, chỉ có ghi chú/báo cáo.

## Prompt AI (copy nguyên văn)

```
Tôi muốn bạn giúp tôi PHÂN TÍCH (không sửa code) hành vi empty-state của component sau, không cần viết lại gì:

[DÁN NỘI DUNG ProductTable.tsx VÀO ĐÂY]

Component này được gọi từ ProductList.tsx như sau:
<ProductTable products={items} totalCount={meta?.total ?? 0} loading={loading} error={error} query={inputValue} />

trong đó "meta" lấy từ hook useProducts, meta.total là tổng số bản ghi KHỚP với điều kiện keyword tìm kiếm hiện tại (trả về từ backend), không phải tổng số sản phẩm toàn hệ thống không điều kiện.

Câu hỏi:
1. Khi người dùng tìm kiếm một từ khoá không có kết quả nào, component này sẽ hiển thị nhánh "No products yet" hay nhánh "No matches for {query}"? Giải thích tại sao dựa trên thứ tự if/else trong code.
2. Nhánh "No matches for {query}" (dựa trên products.length === 0) có còn khả năng được kích hoạt trong thực tế với cách truyền props hiện tại không? Trong trường hợp nào?

Không đề xuất sửa code — tôi chỉ cần phân tích để quyết định có cần một task riêng để fix hay không.
```
