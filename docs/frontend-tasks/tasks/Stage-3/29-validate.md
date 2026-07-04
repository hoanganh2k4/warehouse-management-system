# Task 29 — Validate form `ProductCreate.tsx`

**Nhóm:** D – Create
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductCreate.tsx`
**Phụ thuộc bắt buộc:** Task 28 (state binding đã có)

## Bối cảnh

Validate phía client để giảm request thừa và cho UX tốt hơn, **nhưng không thay thế** validate backend (`class-validator` ở `CreateProductDto` vẫn là nguồn sự thật cuối cùng — lỗi 400 từ backend vẫn có thể xảy ra nếu client validate thiếu, xử lý lỗi 400 chung chung thuộc Task 32 cùng với 409). Quy tắc validate client khớp đúng ràng buộc backend đã có:

- `skuCode`: bắt buộc, không rỗng sau khi trim.
- `name`: bắt buộc, không rỗng sau khi trim.
- `category`: luôn hợp lệ vì `<select>` chỉ có 2 option (không cần validate riêng, nhưng vẫn nên có type-check phòng hờ).
- `unit`: bắt buộc, không rỗng sau khi trim.
- `isHeavy`: không cần validate (checkbox luôn có giá trị boolean hợp lệ).

## Yêu cầu

1. Thêm state lỗi riêng biệt với `form`:
   ```ts
   type FormErrors = Partial<Record<keyof ProductFormState, string>>;
   const [errors, setErrors] = useState<FormErrors>({});
   ```
2. Viết hàm `validate(): FormErrors` chạy trước khi submit (submit thật thuộc Task 31 — task này chỉ chuẩn bị hàm validate và hiển thị lỗi, có thể tạm gọi validate khi bấm nút submit và `console.log` kết quả để test, hoặc để trống hành động submit thật cho Task 31 nối tiếp):
   ```ts
   function validate(): FormErrors {
     const next: FormErrors = {};
     if (!form.skuCode.trim()) next.skuCode = 'Vui lòng nhập mã SKU';
     if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm';
     if (!form.unit.trim()) next.unit = 'Vui lòng nhập đơn vị tính';
     return next;
   }
   ```
3. Hiển thị lỗi ngay dưới từng input, chỉ khi field đó có lỗi:
   ```tsx
   <input ... />
   {errors.skuCode && <p className="form-error">{errors.skuCode}</p>}
   ```
4. Thêm class CSS `.form-error` vào `App.css` (màu đỏ, font-size nhỏ) nếu chưa có.
5. Xoá lỗi của 1 field ngay khi người dùng sửa lại field đó (UX tốt hơn là chỉ xoá lỗi lúc submit lại) — trong `updateField`, có thể xoá key tương ứng khỏi `errors` mỗi lần gọi.

## Không được làm

- Không gọi API ở task này (Task 30/31).
- Không validate độ dài tối đa, định dạng SKU (regex...) — backend không yêu cầu, tự thêm sẽ tạo ràng buộc không khớp thực tế.
- Không chặn submit bằng `disabled` cứng dựa trên validate real-time mọi lúc — chỉ chạy `validate()` và chặn tại thời điểm bấm submit (sẽ nối vào Task 31), tránh làm nút bị disable ngay từ đầu gây khó hiểu cho người mới thao tác.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Để trống `skuCode`/`name`/`unit`, gọi thử `validate()` (test tạm qua console hoặc nút submit tạm) → trả về đúng lỗi tương ứng.
- [ ] Điền đủ 3 field → `validate()` trả về object rỗng `{}`.
- [ ] Lỗi hiển thị đúng dưới từng input, biến mất khi field đó được sửa lại.
- [ ] `npx tsc --noEmit` không lỗi.

## Prompt AI (copy nguyên văn)

```
Tôi cần sửa file apps/frontend/src/pages/products/ProductCreate.tsx trong dự án React + TypeScript.

Nội dung hiện tại (đã bind state ở task trước, dán bản thật vào đây):
[DÁN NỘI DUNG THẬT ProductCreate.tsx VÀO ĐÂY]

File hiện có type ProductFormState = { skuCode, name, category, unit, isHeavy } và state "form" + hàm "updateField".

Yêu cầu:
1. Thêm type FormErrors = Partial<Record<keyof ProductFormState, string>> và state errors bằng useState<FormErrors>({}).
2. Viết hàm validate(): FormErrors kiểm tra:
   - form.skuCode.trim() rỗng → lỗi "Vui lòng nhập mã SKU"
   - form.name.trim() rỗng → lỗi "Vui lòng nhập tên sản phẩm"
   - form.unit.trim() rỗng → lỗi "Vui lòng nhập đơn vị tính"
   Không validate category (luôn hợp lệ vì chỉ có 2 option trong select).
3. Sửa hàm updateField hiện có để xoá lỗi của field đó khỏi state errors mỗi khi field được cập nhật (dùng object rest/destructure để loại bỏ key tương ứng).
4. Hiển thị lỗi ngay dưới input tương ứng (chỉ hiển thị khi errors[field] có giá trị), dùng thẻ <p className="form-error">{errors.field}</p>.
5. Thêm class CSS .form-error vào App.css (màu đỏ, font-size nhỏ khoảng 13px), không sửa class khác.
6. KHÔNG gọi API, chỉ chuẩn bị hàm validate() để dùng ở bước submit sau này (không cần gắn vào nút submit thật ở bước này, có thể để tạm 1 console.log(validate()) trong onClick nút submit để test).

Trả về toàn bộ nội dung file ProductCreate.tsx sau khi sửa, và đoạn CSS .form-error thêm vào App.css.
```
