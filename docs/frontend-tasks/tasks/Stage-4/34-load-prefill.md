# Task 34 — Load dữ liệu prefill (tái dùng hook Task 25)

**Nhóm:** E – Edit
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductEdit.tsx`
**Phụ thuộc bắt buộc:** Task 25 (`useProductDetail` đã có), Task 33 (khung trang đã có)

## Bối cảnh

Tái sử dụng chính xác `useProductDetail(id)` đã viết ở Task 25 (không viết hook mới, không copy code sang hook khác). Hook trả về `product: ProductDetail | null` — cần "đổ" dữ liệu này vào 1 state form **loại bỏ `skuCode`** (vì không sửa được — xem Task 33) và loại bỏ `batches` (không sửa trong form này).

## Yêu cầu

1. Import và gọi hook:
   ```ts
   const { product, loading, error, refetch } = useProductDetail(id);
   ```
2. Định nghĩa state form cục bộ, **khác** `ProductFormState` của `ProductCreate.tsx` (không import chéo giữa 2 trang) — thiếu `skuCode`:
   ```ts
   type EditFormState = {
     name: string;
     category: 'MILK' | 'CRACKER';
     unit: string;
     isHeavy: boolean;
   };

   const [form, setForm] = useState<EditFormState | null>(null);
   ```
3. Dùng `useEffect` để khởi tạo `form` **một lần** khi `product` load xong (không tự động ghi đè lại `form` mỗi khi `product` đổi sau đó, để tránh mất dữ liệu người dùng đang gõ dở nếu `refetch()` được gọi lại vì lý do khác):
   ```ts
   useEffect(() => {
     if (product && form === null) {
       setForm({
         name: product.name,
         category: product.category,
         unit: product.unit,
         isHeavy: product.isHeavy,
       });
     }
   }, [product, form]);
   ```
4. Xử lý 3 trạng thái hiển thị, tương tự `ProductDetail.tsx` (Task 26) — viết riêng trong file này, không import từ `ProductDetail.tsx`:
   - `loading` → skeleton đơn giản (tái dùng class `skeleton`).
   - `error` → `state-panel state-error` kèm nút thử lại gọi `refetch()`.
   - `product` tồn tại nhưng `form` chưa kịp khởi tạo (khoảnh khắc giữa 2 lần render) → có thể return `null` tạm hoặc skeleton, không cần xử lý cầu kỳ.
5. Hiển thị `skuCode` dạng **chỉ đọc** (không phải input) ngay trên form, ví dụ:
   ```tsx
   <div className="form-group">
     <label className="form-label">Mã SKU</label>
     <p className="muted-cell">{product.skuCode} (không thể chỉnh sửa)</p>
   </div>
   ```
6. Render các input còn lại (`name`, `category`, `unit`, `isHeavy`) theo đúng pattern controlled input đã dùng ở Task 28 (`ProductCreate.tsx`) — viết lại tương tự cho `EditFormState`, chấp nhận trùng lặp code nhỏ giữa 2 trang (không refactor thành component `ProductForm` dùng chung — ngoài scope 41 task hiện tại).

## Không được làm

- Không cho sửa `skuCode` dưới bất kỳ hình thức nào (không input, không hidden input gửi lên khi submit).
- Không tự động ghi đè `form` mỗi khi `product` thay đổi sau lần khởi tạo đầu — chỉ khởi tạo 1 lần như code mẫu ở trên.
- Không gọi API update ở task này (Task 35).
- Không import `ProductFormState` từ `ProductCreate.tsx` hay ngược lại.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Vào `/products/<id>/edit` với id thật → thấy đúng dữ liệu hiện tại của sản phẩm đổ sẵn vào form (`name`, `category`, `unit`, `isHeavy`), SKU hiển thị dạng text, không sửa được.
- [ ] Gõ sửa `name` → giá trị thay đổi bình thường trên input (state hoạt động).
- [ ] Vào với id không tồn tại → thấy đúng panel lỗi (tái dùng behavior của `useProductDetail`).
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-4/34.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
