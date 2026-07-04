# Task 21 — Wire `error` vào props có sẵn của `ProductTable`

**Nhóm:** B – Product List
**Thời lượng ước tính:** 45 phút
**File sửa:** `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 16 (đã có `error` từ `useProducts`)

## Bối cảnh

`ProductTable.tsx` đã tự render error panel dựa trên prop `error: string | null` có sẵn:

```tsx
if (error) {
  return (
    <div className="state-panel state-error">
      <AlertIcon size={22} />
      <p className="state-title">Couldn't load the catalog</p>
      <p className="state-body">{error}. Check that the API is running and try again.</p>
    </div>
  );
}
```

Chú ý: `ProductTable` tự nối thêm `. Check that the API is running and try again.` sau `{error}` — nghĩa là `error` truyền vào **không nên** tự thêm dấu chấm hay lặp lại câu tương tự, nếu không câu hiển thị sẽ bị lặp/kỳ (ví dụ: "Network Error. Check that the API is running and try again." là ổn, nhưng "Network Error. Vui lòng thử lại. Check that the API is running and try again." sẽ bị dư).

## Yêu cầu

1. Xác nhận prop `error={error}` truyền vào `ProductTable` đang lấy đúng từ `useProducts`, không phải state `error` cũ còn sót từ trước Task 16.
2. Trong `useProducts` (Task 15), đảm bảo message lỗi lấy ra ngắn gọn, không có dấu chấm cuối câu, ví dụ dùng `err.message` từ axios (thường là `"Network Error"`, `"Request failed with status code 500"`...) — **không sửa lại `useProducts.ts` ở task này nếu nó đã đúng**, chỉ sửa nếu phát hiện message đang lồng thêm câu dư thừa.
3. Test giả lập lỗi thật: tắt backend (`Ctrl+C` ở terminal chạy `npm run start:dev`), reload trang frontend, xác nhận panel lỗi hiện ra đúng với message hợp lý.

## Không được làm

- Không sửa `ProductTable.tsx`.
- Không tự thêm text tiếng Việt che message lỗi gốc (ví dụ không đổi thành `error="Đã có lỗi xảy ra, vui lòng thử lại sau. Check that..."`) — giữ nguyên message kỹ thuật từ `err.message` để dễ debug, việc làm đẹp UI lỗi cho người dùng cuối không thuộc scope task này.
- Không catch lỗi 2 lần (một lần ở `product.service.ts`, một lần ở `useProducts.ts`) — chỉ catch ở hook, service để lỗi tự throw lên.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Tắt backend, reload frontend → thấy đúng panel "Couldn't load the catalog" với message lỗi thật (không phải trắng trang hay crash React).
- [ ] Bật lại backend, bấm "Trang trước/sau" hoặc gõ lại tìm kiếm (trigger refetch) → panel lỗi biến mất, dữ liệu load lại bình thường.
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-2/21.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
