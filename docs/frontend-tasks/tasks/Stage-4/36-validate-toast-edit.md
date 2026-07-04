# Task 36 — Validate + Toast (tái dùng Task 29/32)

**Nhóm:** E – Edit
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductEdit.tsx`
**Phụ thuộc bắt buộc:** Task 35 (submit thật đã có), Task 29 (mẫu logic validate), Task 32 (`Toast.tsx` đã có sẵn trong `components/`)

## Bối cảnh

Đây là task cuối của Nhóm E, ghép validate + Toast theo đúng pattern đã dùng ở `ProductCreate.tsx`. **Không viết `Toast.tsx` mới** — import thẳng component đã có ở Task 32 (`components/Toast.tsx`), component đó vốn đã được thiết kế thuần/tái sử dụng được (nhận props, không phụ thuộc trang nào).

Khác biệt so với validate ở Task 29: **không có field `skuCode`** để validate (Edit không sửa SKU).

## Yêu cầu

### 1. Validate (giống cấu trúc Task 29, áp dụng cho `EditFormState`)

```ts
type EditFormErrors = Partial<Record<keyof EditFormState, string>>;
const [errors, setErrors] = useState<EditFormErrors>({});

function validate(): EditFormErrors {
  if (!form) return {};
  const next: EditFormErrors = {};
  if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm';
  if (!form.unit.trim()) next.unit = 'Vui lòng nhập đơn vị tính';
  return next;
}
```

Gắn vào đầu `handleSubmit` (trước khi gọi `updateProduct`), giống thứ tự đã làm ở Task 31:
```ts
const validationErrors = validate();
setErrors(validationErrors);
if (Object.keys(validationErrors).length > 0) return;
```

Hiển thị lỗi dưới từng input bằng class `.form-error` đã có (từ Task 29), xoá lỗi field khi field đó được sửa (giống `updateField` ở Task 29).

### 2. Toast lỗi (tái dùng component có sẵn, giống Task 32)

```ts
import { Toast } from '../../components/Toast';
import { isAxiosError } from 'axios';

const [toastMessage, setToastMessage] = useState<string | null>(null);
```

Trong `catch` của `handleSubmit` (thay cho `console.error` tạm ở Task 35):
```ts
} catch (err) {
  if (isAxiosError(err) && err.response?.status === 404) {
    setToastMessage('Sản phẩm không còn tồn tại (có thể đã bị xoá).');
  } else {
    setToastMessage('Không thể lưu thay đổi. Vui lòng thử lại.');
  }
}
```

Render:
```tsx
{toastMessage && (
  <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
)}
```

Lưu ý: `PUT /products/:id` không có lỗi 409 (chỉ `create` mới check trùng SKU, và SKU không sửa được ở đây) — trường hợp lỗi thực tế đáng quan tâm nhất ở Edit là **404** (sản phẩm bị xoá bởi người khác giữa lúc đang sửa), không phải 409 như Create.

## Không được làm

- Không tạo `Toast.tsx` mới hay sửa `Toast.tsx` đã có — chỉ import và dùng.
- Không copy nguyên văn logic 409 từ Task 32 sang đây — Edit không có lỗi 409, dùng đúng 404 như mô tả ở trên.
- Không validate `category` (luôn hợp lệ vì chỉ có 2 option trong select, giống lý do ở Task 29).
- Không cho phép validate hay submit đụng tới `skuCode` dưới bất kỳ hình thức nào.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Xoá trắng `name` hoặc `unit`, bấm "Lưu" → không gọi API, lỗi hiện đúng dưới field.
- [ ] Sửa hợp lệ, bấm "Lưu" → cập nhật thành công, điều hướng về Detail.
- [ ] Giả lập lỗi 404: sửa 1 sản phẩm, sau đó xoá thẳng sản phẩm đó qua Prisma Studio trong lúc form Edit đang mở, bấm "Lưu" → thấy Toast "Sản phẩm không còn tồn tại (có thể đã bị xoá)." thay vì crash trang.
- [ ] `npx tsc --noEmit` không lỗi.

## Prompt AI (copy nguyên văn)

```
Tôi cần sửa file apps/frontend/src/pages/products/ProductEdit.tsx trong dự án React + TypeScript + axios.

Nội dung hiện tại (đã có submit thật ở task trước, dán bản thật vào đây):
[DÁN NỘI DUNG THẬT ProductEdit.tsx VÀO ĐÂY]

Đã có sẵn component dùng chung apps/frontend/src/components/Toast.tsx với props: message (string), type ('error'|'success'), onClose (function). KHÔNG cần sửa component này, chỉ import và dùng.

Yêu cầu:
1. Thêm type EditFormErrors = Partial<Record<keyof EditFormState, string>> và state errors bằng useState<EditFormErrors>({}).
2. Viết hàm validate(): EditFormErrors — nếu form là null trả về {}; kiểm tra form.name.trim() rỗng → lỗi 'Vui lòng nhập tên sản phẩm'; form.unit.trim() rỗng → lỗi 'Vui lòng nhập đơn vị tính'. Không validate category.
3. Trong handleSubmit đã có, thêm đoạn gọi validate() và setErrors() ngay đầu hàm (sau khi check !form || !id), nếu có lỗi thì return sớm, không gọi API.
4. Hiển thị lỗi dưới từng input tương ứng bằng class "form-error" đã có sẵn (chỉ hiện khi errors[field] có giá trị).
5. Sửa hàm cập nhật field (updateField hoặc tương đương) để xoá lỗi của field đó khỏi errors mỗi khi field được sửa.
6. Thêm state toastMessage (string | null, mặc định null).
7. Import { isAxiosError } from 'axios' và Toast từ '../../components/Toast'.
8. Thay đoạn catch (err) { console.error(err); } hiện có bằng:
   - Nếu isAxiosError(err) && err.response?.status === 404: setToastMessage('Sản phẩm không còn tồn tại (có thể đã bị xoá).')
   - Ngược lại: setToastMessage('Không thể lưu thay đổi. Vui lòng thử lại.')
9. Render Toast có điều kiện: {toastMessage && <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />}

Ràng buộc:
- Không tạo hay sửa components/Toast.tsx.
- Không xử lý lỗi 409 (Edit không có lỗi này).
- Không validate hay cho sửa skuCode.

Trả về toàn bộ nội dung file ProductEdit.tsx sau khi sửa.
```
