# Task 04 — Di dời dashboard từ App.tsx → ProductList.tsx

## 🎯 Mục tiêu
Chuyển **nguyên trạng** toàn bộ code dashboard sản phẩm (đang nằm trong `App.tsx`) sang file mới `src/pages/products/ProductList.tsx`. Sau task này, `App.tsx` chỉ còn khai báo route, không còn logic gì cả.

**Nguyên tắc bắt buộc của task này: KHÔNG SỬA LOGIC, CHỈ DI DỜI.** Không đổi tên biến, không đổi cách fetch, không tối ưu code. Việc cải tiến (dùng service/hook riêng) là các task 14–21 ở Nhóm B, không phải task này.

## 📖 Giải thích nghiệp vụ
Trước khi có Router, `App.tsx` vừa là layout (Sidebar/Topbar) vừa là trang dashboard (fetch sản phẩm, tính stats, hiển thị bảng) — tất cả gộp chung 1 file. Từ Task 03, `Layout.tsx` đã đảm nhận phần Sidebar/Topbar. Vậy phần dashboard (state `products`, `loading`, `error`, `query`, hàm fetch, `filteredProducts`, `stats`, và JSX từ `<main className="app-content">` trở xuống) cần chuyển sang 1 "trang" riêng — đó là `ProductList.tsx` — để `/products` route tới đúng component này qua `<Outlet />`.

Nếu bỏ qua task này, Task 06/14 (viết `product.service.ts`, `useProducts.ts`) sẽ không biết đặt code vào đâu vì logic fetch cũ vẫn còn nằm chết trong `App.tsx`, gây trùng lặp / xung đột.

## 🧠 Giải thích React cần biết
- "Di dời nguyên trạng" nghĩa là: cắt nguyên khối code, dán sang file mới, chỉ sửa phần `import` (đường dẫn file thay đổi vì `ProductList.tsx` nằm sâu hơn `App.tsx` một cấp thư mục).
- Component gốc `App` đổi vai trò: không còn là "trang dashboard" mà là "cấu hình định tuyến" — chỉ chứa `<Routes>`, `<Route>`.

## 📖 Các file cần đọc trước
- `apps/frontend/src/App.tsx` (bản hiện tại, sau Task 03)
- `apps/frontend/src/components/Layout.tsx` (vừa tạo ở Task 03)
- `apps/frontend/src/types.ts`

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/pages/products/ProductList.tsx`
- Sửa: `apps/frontend/src/App.tsx` (xoá toàn bộ logic dashboard, chỉ giữ lại khai báo `<Routes>`)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/Layout.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `ProductTable.tsx`, `StatCard.tsx`
- `apps/frontend/src/App.css`, `index.css`
- `apps/frontend/src/types.ts`

## 🔌 API cần dùng
Không có API mới — vẫn dùng nguyên `fetch('/api/products', ...)` y hệt code cũ. Việc thay bằng service/hook là Task 14–16.

## 🪜 Các bước thực hiện
1. Mở `App.tsx` hiện tại, copy **toàn bộ nội dung hàm `App()`** (từ dòng khai báo `useState` đầu tiên đến hết phần `return (...)`), TRỪ phần `<Sidebar />` và `<Topbar query={query} onQueryChange={setQuery} />` — 2 dòng này bị xoá vì `Layout.tsx` đã lo phần đó rồi.
2. Copy prompt trong `prompts/04.txt`, dán vào Claude/Cursor kèm theo:
   - Nội dung `App.tsx` hiện tại (đầy đủ)
   - Nội dung `Layout.tsx` (để AI biết Sidebar/Topbar đã có sẵn, không lặp lại)
3. AI trả về 2 file:
   - `ProductList.tsx` mới: chứa toàn bộ state/logic/JSX cũ, nhưng bỏ `<div className="app-shell">`, `<Sidebar />`, `<div className="app-main">`, `<Topbar .../>` — chỉ giữ lại từ `<main className="app-content">` trở xuống.
   - `App.tsx` mới: chỉ còn `<Routes>` với ít nhất 1 route `path="/products"` render `<ProductList />` bên trong `<Route element={<Layout />}>`.
4. Dán code vào đúng 2 file.
5. Chạy `npm run dev`, vào `/products`, kiểm tra dashboard hiển thị y hệt như trước khi di dời (số liệu StatCard, bảng sản phẩm, loading/error đều còn nguyên).

## 💻 Ví dụ code (minh hoạ cấu trúc App.tsx sau khi di dời)
```tsx
// App.tsx — sau khi di dời, minh hoạ
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProductList from './pages/products/ProductList';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/products" element={<ProductList />} />
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
```
`ProductList.tsx` giữ nguyên toàn bộ `useState`, `useEffect`, `useMemo`, hàm fetch y hệt bản gốc trong `App.tsx` — chỉ đổi phần JSX bọc ngoài cùng (bỏ `app-shell`/`Sidebar`/`Topbar`, giữ nguyên `<main className="app-content">...</main>`).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/04.txt`

## ✅ Checklist nghiệm thu
- ☐ `ProductList.tsx` chứa đầy đủ state, effect, JSX y hệt bản gốc (không thiếu StatCard nào, không thiếu logic filter)
- ☐ `App.tsx` không còn `useState`/`useEffect`/logic dashboard — chỉ còn khai báo Route
- ☐ Vào `/products`, giao diện giống 100% so với trước khi di dời (chụp ảnh so sánh nếu cần)
- ☐ Loading, error, danh sách sản phẩm đều hoạt động như cũ
- ☐ `npm run build` không lỗi TypeScript
- ☐ Không sửa bất kỳ dòng nào trong `Layout.tsx`, `Sidebar.tsx`, `Topbar.tsx`

## ❌ Lỗi thường gặp
- **Copy thiếu 1 phần JSX** (ví dụ quên 1 `StatCard`) → giao diện thiếu số liệu. So sánh kỹ với bản gốc trước khi commit.
- **Quên đổi đường dẫn import** — ví dụ `import './App.css'` trong `ProductList.tsx` phải sửa thành `import '../../App.css'` vì file giờ nằm sâu hơn 2 cấp thư mục. Import `Product` type cũng phải đổi đường dẫn tương tự.
- **Giữ luôn `<Sidebar />`/`<Topbar />` trong `ProductList.tsx`** → bị hiển thị 2 lần (1 từ Layout, 1 từ ProductList). Đây là lỗi hay gặp nhất — kiểm tra kỹ giao diện có bị lặp Sidebar/Topbar không.

## 🔄 Cách test
1. `npm run dev`, vào `/products`.
2. So sánh với ảnh chụp màn hình trước khi làm task (nên tự chụp lại trước khi bắt đầu để đối chiếu).
3. Sidebar/Topbar chỉ xuất hiện đúng 1 lần.
4. Tắt mạng / sửa tạm URL API sai để test trạng thái lỗi vẫn hiển thị đúng như trước.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/App.tsx
rm -rf apps/frontend/src/pages/products
```

## 📝 Commit message
```
refactor: move product dashboard logic from App.tsx to pages/products/ProductList.tsx
```

## 🔀 PR title
```
[Task 04] Migrate dashboard logic into ProductList page
```
