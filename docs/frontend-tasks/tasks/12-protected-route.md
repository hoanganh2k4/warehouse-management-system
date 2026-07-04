# Task 12 — Tạo `ProtectedRoute.tsx`, bọc route Create/Edit/Delete

## 🎯 Mục tiêu
Chặn người **chưa đăng nhập** không cho vào các trang cần token (tạo/sửa/xoá sản phẩm). Nếu chưa đăng nhập mà cố vào các URL đó, tự động đá về `/login`.

Đây là task cuối cùng của Nhóm A — làm xong task này, "cổng vào" của cả app đã hoàn chỉnh: Nhóm B/C/D/E/F có thể bắt đầu làm song song mà không đụng nhau.

## 📖 Giải thích nghiệp vụ
Backend đã bắt buộc `POST/PUT/DELETE /products` phải có Bearer token (nếu không có, backend trả lỗi 401). Nhưng hiện tại ở phía frontend, nếu người dùng gõ thẳng URL `/products/new` (trang tạo sản phẩm) mà chưa đăng nhập, họ vẫn **vào được giao diện form** — chỉ khi bấm "Lưu" mới bị lỗi 401 từ backend. Trải nghiệm đó xấu (vào form, điền hết, bấm lưu mới báo lỗi).

`ProtectedRoute` là một "trạm gác" đặt trước các route Create/Edit/Delete: kiểm tra `isAuthenticated()` (từ `useAuth.ts` — Task 10) trước, nếu chưa đăng nhập thì chuyển hướng thẳng tới `/login`, không cho vào form.

## 🧠 Giải thích React cần biết
- **Component "bọc" route (route guard)**: một component không tự vẽ giao diện của chính nó, mà chỉ quyết định "cho hiển thị route con hay không". Nếu được phép, nó render `<Outlet />` (giống `Layout.tsx` ở Task 03); nếu không được phép, nó gọi `<Navigate to="/login" />` để chuyển hướng.
- `<Navigate to="..." />` là component của `react-router-dom`, dùng để điều hướng ngay khi render (khác với `useNavigate()` dùng bên trong hàm xử lý sự kiện như click).

## 📖 Các file cần đọc trước
- `apps/frontend/src/hooks/useAuth.ts` (Task 10 — dùng hàm `isAuthenticated`)
- `apps/frontend/src/App.tsx` (bản hiện tại, sau Task 04 — xem cấu trúc `<Routes>` đang có)
- `apps/frontend/src/components/Layout.tsx` (Task 03 — để hiểu cách route lồng nhau đang hoạt động)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/components/ProtectedRoute.tsx`
- Sửa: `apps/frontend/src/App.tsx` — **chỉ thêm khai báo route mới cho `/products/new`, `/products/:id/edit`, bọc trong `<ProtectedRoute />`**. Các route đã có (`/products`, `/login`) giữ nguyên, không đổi.

> Lưu ý: route `/products/new` và `/products/:id/edit` ở bước này **chưa có component thật** (Task 27 và Task 33 mới tạo `ProductCreate.tsx`/`ProductEdit.tsx`). Tạm thời dùng 1 component giữ chỗ (placeholder) đơn giản, ví dụ `<div>Coming soon</div>`, để không chặn Nhóm D/E làm việc sau này — họ chỉ cần thay placeholder bằng component thật, không cần đụng lại phần khai báo route/`ProtectedRoute`.

## 📂 File KHÔNG được sửa
- `apps/frontend/src/hooks/useAuth.ts`
- `apps/frontend/src/components/Layout.tsx`
- `apps/frontend/src/pages/login/Login.tsx`
- `apps/frontend/src/pages/products/ProductList.tsx`
- `apps/frontend/src/lib/api-client.ts`

## 🔌 API cần dùng
Không gọi API nào trực tiếp — chỉ đọc trạng thái đăng nhập qua `isAuthenticated()` (Task 10, đọc `localStorage`).

## 🪜 Các bước thực hiện
1. Đọc `useAuth.ts` và `App.tsx` hiện tại.
2. Copy prompt trong `prompts/12.txt`, dán vào Claude/Cursor kèm nội dung 2 file trên.
3. AI trả về:
   - `ProtectedRoute.tsx` mới.
   - `App.tsx` đã thêm 2 route mới (`/products/new`, `/products/:id/edit`) bọc trong `<ProtectedRoute />`, dùng component placeholder tạm thời.
4. Dán code vào đúng file.
5. Test theo mục "Cách test" bên dưới.

## 💻 Ví dụ code (minh hoạ ý tưởng, không copy tay)
```tsx
// components/ProtectedRoute.tsx — minh hoạ
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

```tsx
// App.tsx — minh hoạ phần thêm mới (giữ nguyên phần route cũ đã có)
<Route element={<Layout />}>
  <Route path="/products" element={<ProductList />} />

  {/* MỚI: bọc trong ProtectedRoute */}
  <Route element={<ProtectedRoute />}>
    <Route path="/products/new" element={<div>Coming soon (Task 27)</div>} />
    <Route path="/products/:id/edit" element={<div>Coming soon (Task 33)</div>} />
  </Route>
</Route>
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/12.txt`

## ✅ Checklist nghiệm thu
- ☐ File `ProtectedRoute.tsx` được tạo, dùng `isAuthenticated()` từ `useAuth.ts`
- ☐ Chưa đăng nhập (xoá token trong Local Storage), gõ thẳng URL `/products/new` → tự động chuyển về `/login`
- ☐ Đã đăng nhập (có token) → vào `/products/new` bình thường, thấy placeholder "Coming soon"
- ☐ Route `/products` và `/login` không bị ảnh hưởng, vẫn vào được như cũ dù đã/chưa đăng nhập
- ☐ Không sửa nội dung `useAuth.ts`, `Layout.tsx`
- ☐ `npm run build` không lỗi

## ❌ Lỗi thường gặp
- **Bọc luôn cả `/products` vào `ProtectedRoute`** — SAI. `/products` (xem danh sách) không cần đăng nhập theo đúng backend (`GET /products` là public). Chỉ bọc `/products/new` và `/products/:id/edit`.
- **Dùng `useNavigate()` thay vì `<Navigate />`** bên trong component không phải sự kiện click — vẫn chạy được nhưng dễ gây lỗi "gọi hook ngoài component" nếu làm sai chỗ. Cứ theo đúng ví dụ minh hoạ ở trên (`<Navigate to="/login" replace />` trong phần return).
- **Quên `replace`** trong `<Navigate to="/login" replace />` — thiếu nó thì bấm nút "Back" của trình duyệt sẽ quay lại trang bị chặn rồi lại bị đá ra, gây vòng lặp khó chịu (không phải lỗi nghiêm trọng nhưng nên có).

## 🔄 Cách test
1. F12 → Application → Local Storage → xoá key `wms_access_token` (giả lập "chưa đăng nhập").
2. Gõ thẳng `http://localhost:5173/products/new` trên thanh địa chỉ → phải tự chuyển về `/login`.
3. Đăng nhập lại (Task 08/09), sau khi có token, gõ lại `/products/new` → phải vào được, thấy chữ "Coming soon (Task 27)".
4. Vào `/products` (không đăng nhập) → vẫn vào được bình thường, không bị đá.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/App.tsx
rm apps/frontend/src/components/ProtectedRoute.tsx
```

## 📝 Commit message
```
feat: add ProtectedRoute guard for create/edit product routes
```

## 🔀 PR title
```
[Task 12] Add ProtectedRoute for authenticated-only routes
```
