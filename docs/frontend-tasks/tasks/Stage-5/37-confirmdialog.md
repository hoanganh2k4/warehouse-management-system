# Task 37 — `ConfirmDialog.tsx` dùng chung

**Nhóm:** F – Delete
**Thời lượng ước tính:** 1.5 giờ
**File tạo mới:** `apps/frontend/src/components/ConfirmDialog.tsx`
**Phụ thuộc bắt buộc:** Không phụ thuộc task nào trong Nhóm F, có thể làm song song/trước Task 38

## Bối cảnh

Component thuần dùng chung (đặt trong `components/`, ngang hàng `Toast.tsx`), sẽ được gọi từ cả `ProductList.tsx` và `ProductDetail.tsx` ở Task 38 để xác nhận trước khi xoá sản phẩm. Không có state library — component **controlled hoàn toàn bởi nơi gọi nó** (giống pattern `Toast.tsx` ở Task 32: nhận props, tự vẽ, không tự quản lý việc mở/đóng).

## Yêu cầu

1. Tạo `apps/frontend/src/components/ConfirmDialog.tsx`:
   ```tsx
   type ConfirmDialogProps = {
     open: boolean;
     title: string;
     message: string;
     confirmLabel?: string;
     cancelLabel?: string;
     onConfirm: () => void;
     onCancel: () => void;
     loading?: boolean;
   };

   export function ConfirmDialog({
     open,
     title,
     message,
     confirmLabel = 'Xác nhận',
     cancelLabel = 'Huỷ',
     onConfirm,
     onCancel,
     loading = false,
   }: ConfirmDialogProps) {
     if (!open) return null;

     return (
       <div className="dialog-overlay" onClick={onCancel}>
         <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
           <h3 className="dialog-title">{title}</h3>
           <p className="dialog-message">{message}</p>
           <div className="dialog-actions">
             <button className="btn-secondary" onClick={onCancel} disabled={loading}>
               {cancelLabel}
             </button>
             <button className="btn-danger" onClick={onConfirm} disabled={loading}>
               {loading ? 'Đang xử lý...' : confirmLabel}
             </button>
           </div>
         </div>
       </div>
     );
   }
   ```
2. `open === false` → không render gì (`null`) — nơi gọi tự quản lý state `open` bằng `useState`.
3. Bấm vào lớp phủ nền (`dialog-overlay`) → coi như huỷ (gọi `onCancel`), nhưng bấm vào hộp thoại (`dialog-box`) không được đóng theo (dùng `e.stopPropagation()` như code mẫu).
4. `loading` dùng để disable 2 nút trong lúc đang gọi API xoá (tránh double-click), hiển thị "Đang xử lý..." trên nút xác nhận.
5. Thêm CSS vào `App.css`: `.dialog-overlay` (position fixed, full màn hình, nền đen mờ, flex center), `.dialog-box` (nền trắng, border-radius, padding, max-width vừa phải), `.dialog-title`, `.dialog-message`, `.dialog-actions` (flex, gap, justify-content: flex-end), `.btn-danger` (nền đỏ, chữ trắng — màu khác `.btn-primary` đã có).

## Không được làm

- Không tự quản lý state mở/đóng bên trong `ConfirmDialog` — hoàn toàn controlled qua prop `open`.
- Không gọi API trong component này — chỉ nhận `onConfirm`/`onCancel` là callback, logic xoá thật thuộc Task 38.
- Không dùng `window.confirm()` thay thế — mục tiêu chính là có UI nhất quán, không dùng dialog gốc trình duyệt.
- Không import gì từ `ProductList.tsx`/`ProductDetail.tsx`/`Toast.tsx`.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Test tạm: render `<ConfirmDialog open={true} title="Test" message="Test message" onConfirm={() => alert('confirmed')} onCancel={() => alert('cancelled')} />` trong 1 trang bất kỳ → thấy overlay + hộp thoại đúng như mong đợi, bấm nền ngoài → cancelled, bấm nút "Xác nhận" → confirmed, bấm bên trong hộp thoại không tự đóng.
- [ ] Xoá đoạn test tạm trước khi coi task hoàn thành (không để lại code test trong file khác).

## Prompt AI (copy nguyên văn)

```
Tôi cần tạo file mới: apps/frontend/src/components/ConfirmDialog.tsx trong dự án React + TypeScript.

Đây là component dùng chung, PHẢI hoàn toàn controlled bởi props (không tự quản lý state mở/đóng bên trong).

Yêu cầu:
1. Props: open (boolean), title (string), message (string), confirmLabel (string, mặc định 'Xác nhận'), cancelLabel (string, mặc định 'Huỷ'), onConfirm (function), onCancel (function), loading (boolean, mặc định false).
2. Nếu open === false, component return null (không render gì).
3. Khi open === true, render:
   - 1 div overlay class "dialog-overlay", onClick gọi onCancel
   - bên trong là 1 div class "dialog-box", onClick gọi e.stopPropagation() để bấm vào bên trong hộp thoại KHÔNG đóng theo overlay
   - trong dialog-box: <h3 className="dialog-title">{title}</h3>, <p className="dialog-message">{message}</p>, và 1 div class "dialog-actions" chứa 2 nút:
     + nút class "btn-secondary": {cancelLabel}, onClick={onCancel}, disabled={loading}
     + nút class "btn-danger": onClick={onConfirm}, disabled={loading}, text là "Đang xử lý..." nếu loading=true, ngược lại {confirmLabel}

Thêm CSS vào apps/frontend/src/App.css (không sửa class nào đã có):
- .dialog-overlay: position fixed, top/left/right/bottom 0, background rgba đen mờ (ví dụ rgba(0,0,0,0.5)), display flex, align-items và justify-content center, z-index cao (ví dụ 1000)
- .dialog-box: background trắng, border-radius, padding, max-width khoảng 400px, box-shadow
- .dialog-title: font-weight đậm, margin-bottom nhỏ
- .dialog-message: màu chữ phụ (xám), margin-bottom
- .dialog-actions: display flex, gap, justify-content: flex-end
- .btn-danger: nền đỏ, chữ trắng, border-radius giống .btn-primary đã có nhưng khác màu

Ràng buộc:
- KHÔNG gọi API trong component này.
- KHÔNG dùng window.confirm().
- KHÔNG tự thêm state bên trong component.

Trả về toàn bộ nội dung file ConfirmDialog.tsx và đoạn CSS thêm vào App.css.
```
