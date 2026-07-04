# Task 32 — Xử lý lỗi 409 (`skuExists`) + `Toast.tsx` dùng chung

**Nhóm:** D – Create
**Thời lượng ước tính:** 2 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductCreate.tsx`
**File tạo mới:** `apps/frontend/src/components/Toast.tsx`
**Phụ thuộc bắt buộc:** Task 31 (submit thật đã có, đang tạm `console.error` khi lỗi)

## Bối cảnh

`Toast.tsx` đặt trong `components/` (ngang hàng `ProductTable.tsx`, `Sidebar.tsx`...) vì đây là component **dùng chung** — Task 36 (nhóm E – Edit) sẽ tái sử dụng y hệt cách gọi ở đây, không viết lại.

Lỗi 409 từ backend trả về (qua axios) có dạng lỗi HTTP với `err.response.status === 409` và `err.response.data.message === 'SKU already exists'`. Cần phân biệt rõ 2 loại lỗi khi submit thất bại:

- **409 (SKU trùng)**: lỗi nghiệp vụ, người dùng sửa được ngay — hiển thị Toast lỗi với message rõ ràng bằng tiếng Việt, **không** điều hướng đi đâu, giữ nguyên dữ liệu form để họ sửa lại `skuCode`.
- **Lỗi khác** (network, 500, 400 validate sót...): cũng hiển thị Toast lỗi, message chung chung hơn ("Không thể tạo sản phẩm, vui lòng thử lại"), vẫn giữ nguyên form.

## Yêu cầu

### 1. Tạo `Toast.tsx`

```tsx
import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
  durationMs?: number;
};

export function Toast({ message, type = 'error', onClose, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <p>{message}</p>
      <button className="toast-close" onClick={onClose} aria-label="Đóng thông báo">
        ×
      </button>
    </div>
  );
}
```

Component nhận `message`, `type` (mặc định `'error'`), `onClose`, tự động biến mất sau `durationMs` (mặc định 4 giây) hoặc khi bấm nút đóng.

### 2. Thêm CSS cho Toast vào `App.css`

Tối thiểu: `.toast` (position fixed, góc trên-phải hoặc dưới-phải màn hình, padding, border-radius, box-shadow), `.toast-error` (nền đỏ nhạt/viền đỏ), `.toast-success` (nền xanh nhạt/viền xanh, dùng ở Task 31/35 nếu sau này cần thông báo thành công — không bắt buộc dùng ngay), `.toast-close`.

### 3. Sửa `ProductCreate.tsx`

1. Thêm state:
   ```ts
   const [toastMessage, setToastMessage] = useState<string | null>(null);
   ```
2. Sửa nhánh `catch` trong `handleSubmit` (thay cho `console.error` tạm ở Task 31):
   ```ts
   } catch (err) {
     if (isAxiosError(err) && err.response?.status === 409) {
       setToastMessage(err.response.data?.message === 'SKU already exists'
         ? 'Mã SKU này đã tồn tại. Vui lòng chọn mã khác.'
         : 'Dữ liệu bị trùng, vui lòng kiểm tra lại.');
     } else {
       setToastMessage('Không thể tạo sản phẩm. Vui lòng thử lại.');
     }
   }
   ```
   Import `isAxiosError` từ `axios` để kiểm tra type an toàn (`import { isAxiosError } from 'axios';`) — tránh dùng `any` hay ép kiểu thủ công không an toàn.
3. Render `Toast` có điều kiện, đặt ở đầu JSX return (ngoài `<form>` hoặc trong, miễn hiển thị `position: fixed` nên vị trí trong cây DOM không quan trọng):
   ```tsx
   {toastMessage && (
     <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
   )}
   ```
4. Import `Toast` từ `../../components/Toast`.

## Không được làm

- Không dùng Toast để hiển thị lỗi validate inline (Task 29) — 2 cơ chế khác nhau, không gộp.
- Không tạo global toast context/provider — theo đúng tinh thần "task cực nhỏ, blast radius thấp", mỗi trang tự quản lý toast state riêng của nó (Task 36 sẽ copy pattern này sang `ProductEdit.tsx`, không refactor thành context dùng chung).
- Không đổi hành vi điều hướng khi thành công (vẫn giữ nguyên từ Task 31).
- Không sửa `product.service.ts`.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Tạo sản phẩm với `skuCode` đã tồn tại → thấy Toast đỏ hiện góc màn hình với message "Mã SKU này đã tồn tại. Vui lòng chọn mã khác.", form vẫn giữ nguyên dữ liệu đã nhập (không bị reset).
- [ ] Toast tự biến mất sau 4 giây, hoặc biến mất ngay khi bấm nút "×".
- [ ] Tắt backend, thử submit → Toast hiện với message chung chung "Không thể tạo sản phẩm. Vui lòng thử lại.".
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] `Toast.tsx` không import gì từ `ProductCreate.tsx` (component thuần, nhận props, không biết gì về nơi gọi nó).

## Prompt AI (copy nguyên văn)

```
Tôi cần làm 2 việc trong dự án React + TypeScript + axios:

1. Tạo file mới apps/frontend/src/components/Toast.tsx — component thuần dùng chung, KHÔNG biết gì về ProductCreate hay bất kỳ trang nào gọi nó:
   - Props: message (string), type ('error' | 'success', mặc định 'error'), onClose (function), durationMs (number, mặc định 4000).
   - Tự động gọi onClose sau durationMs bằng useEffect + setTimeout (nhớ cleanup bằng clearTimeout).
   - Render 1 div class "toast toast-{type}", có nút đóng (×) gọi onClose khi bấm.

2. Sửa file apps/frontend/src/pages/products/ProductCreate.tsx (dán bản thật vào đây, file này hiện có hàm handleSubmit với catch tạm chỉ console.error):
[DÁN NỘI DUNG THẬT ProductCreate.tsx VÀO ĐÂY]

Yêu cầu sửa:
- Thêm state toastMessage (string | null, mặc định null).
- Import { isAxiosError } from 'axios'.
- Thay đoạn catch (err) { console.error(err); } bằng logic:
  + Nếu isAxiosError(err) && err.response?.status === 409: set toastMessage = 'Mã SKU này đã tồn tại. Vui lòng chọn mã khác.' (nếu message backend là 'SKU already exists'), ngược lại set toastMessage = 'Dữ liệu bị trùng, vui lòng kiểm tra lại.'
  + Các lỗi khác: set toastMessage = 'Không thể tạo sản phẩm. Vui lòng thử lại.'
- Import Toast từ '../../components/Toast', render có điều kiện khi toastMessage khác null: <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
- KHÔNG reset state "form" khi có lỗi — giữ nguyên dữ liệu người dùng đã nhập.

Thêm CSS tối thiểu vào apps/frontend/src/App.css cho .toast (position: fixed, góc trên phải màn hình, padding, border-radius, box-shadow), .toast-error (nền đỏ nhạt viền đỏ), .toast-success (nền xanh nhạt viền xanh), .toast-close (nút đóng).

Trả về: (1) toàn bộ nội dung Toast.tsx, (2) toàn bộ nội dung ProductCreate.tsx sau khi sửa, (3) đoạn CSS thêm vào App.css.
```
