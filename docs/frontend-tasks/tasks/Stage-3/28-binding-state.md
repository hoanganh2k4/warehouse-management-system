# Task 28 — Binding state cho form `ProductCreate.tsx`

**Nhóm:** D – Create
**Thời lượng ước tính:** 1 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductCreate.tsx`
**Phụ thuộc bắt buộc:** Task 27 (form tĩnh đã có)

## Bối cảnh

Chuyển form từ uncontrolled (Task 27) sang controlled với 1 state object duy nhất — cách này dễ mở rộng và dễ tái sử dụng ở Task 34 (`ProductEdit.tsx` load dữ liệu prefill cũng dùng cùng shape state).

## Yêu cầu

1. Thêm type cục bộ (hoặc import nếu đã thêm vào `types.ts` ở Task 30) mô tả form state:
   ```ts
   type ProductFormState = {
     skuCode: string;
     name: string;
     category: 'MILK' | 'CRACKER';
     unit: string;
     isHeavy: boolean;
   };
   ```
2. Khởi tạo state:
   ```ts
   const [form, setForm] = useState<ProductFormState>({
     skuCode: '',
     name: '',
     category: 'MILK',
     unit: '',
     isHeavy: false,
   });
   ```
3. Viết 1 hàm handler chung để cập nhật field theo tên, tránh viết 5 hàm `onChange` riêng lẻ:
   ```ts
   function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
     setForm((prev) => ({ ...prev, [key]: value }));
   }
   ```
4. Gắn `value`/`checked` + `onChange` cho từng input:
   ```tsx
   <input
     value={form.skuCode}
     onChange={(e) => updateField('skuCode', e.target.value)}
   />
   ...
   <select
     value={form.category}
     onChange={(e) => updateField('category', e.target.value as 'MILK' | 'CRACKER')}
   >
   ...
   <input
     type="checkbox"
     checked={form.isHeavy}
     onChange={(e) => updateField('isHeavy', e.target.checked)}
   />
   ```

## Không được làm

- Không validate ở task này (Task 29).
- Không gọi API (Task 30/31).
- Không tách mỗi field thành 1 `useState` riêng — dùng đúng 1 object state như trên để nhất quán với cách `ProductEdit.tsx` sẽ tái sử dụng ở Task 34.
- Không đổi cấu trúc JSX/layout đã dựng ở Task 27, chỉ thêm `value`/`onChange`.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Gõ vào từng input → giá trị hiển thị đúng theo những gì gõ (không bị "input bị khoá"/không gõ được — lỗi thường gặp nếu thiếu `onChange`).
- [ ] Đổi `category` bằng dropdown → state cập nhật đúng giá trị.
- [ ] Tick checkbox `isHeavy` → state đổi `true`/`false` đúng.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Console log tạm `form` (xoá trước khi commit) để xác nhận state đúng shape khi gõ đủ 5 field.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-3/28.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
