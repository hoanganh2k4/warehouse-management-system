# Task 03 — Tạo Router + Layout.tsx (Sidebar + Topbar + `<Outlet/>`)

## 🎯 Mục tiêu
Tạo bộ khung điều hướng cho cả app: 1 component `Layout.tsx` chứa `Sidebar` + `Topbar` cố định, và phần nội dung ở giữa sẽ đổi theo route (dùng `<Outlet />` của react-router-dom). Sau task này, app vẫn hiển thị y hệt như cũ, nhưng bên dưới đã chạy qua Router.

**Lưu ý quan trọng**: Task này CHƯA di dời logic dashboard (bảng sản phẩm) — việc đó là Task 04. Task 03 chỉ tạo "khung vỏ" rỗng.

## 📖 Giải thích nghiệp vụ
Hiện tại `Sidebar` và `Topbar` được `App.tsx` gọi trực tiếp, nằm chung với toàn bộ logic dashboard. Khi có nhiều trang, ta không muốn viết lại `<Sidebar />` + `<Topbar />` ở từng trang — nên tách chúng vào 1 "khung" chung gọi là `Layout`, mọi trang con sẽ tự động có sẵn Sidebar/Topbar bao quanh.

`<Outlet />` là một component đặc biệt của `react-router-dom`: nó là "chỗ trống" để route con hiển thị nội dung vào đó.

## 🧠 Giải thích React cần biết
- **Route** = 1 cặp (đường dẫn URL, component sẽ hiển thị). Ví dụ route `/products` → hiển thị component `ProductList`.
- **Nested route (route lồng nhau)**: route cha (`Layout`) luôn hiển thị Sidebar/Topbar, còn phần giữa thay đổi tuỳ route con — đó là lý do cần `<Outlet />`.
- Không cần hiểu sâu hơn — prompt bên dưới sẽ có ví dụ cụ thể cho AI làm theo.

## 📖 Các file cần đọc trước
- `apps/frontend/src/components/Sidebar.tsx`
- `apps/frontend/src/components/Topbar.tsx`
- `apps/frontend/src/App.tsx` (chỉ đọc, chưa sửa — xem để hiểu Sidebar/Topbar hiện đang được gọi thế nào)
- `apps/frontend/src/main.tsx`

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/components/Layout.tsx`
- Sửa: `apps/frontend/src/main.tsx` (bọc `<App />` bằng `<BrowserRouter>`)
- Sửa: `apps/frontend/src/App.tsx` — **chỉ sửa phần khai báo route**, KHÔNG xoá/sửa logic dashboard hiện có bên trong (việc di dời logic là Task 04, làm ngay sau task này)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/Sidebar.tsx`
- `apps/frontend/src/components/Topbar.tsx`
- `apps/frontend/src/components/ProductTable.tsx`, `StatCard.tsx`, `ProductCard.tsx`
- `apps/frontend/src/App.css`, `index.css`

## 🔌 API cần dùng
Không có.

## 🪜 Các bước thực hiện
1. Đọc 4 file ở mục "Các file cần đọc trước".
2. Copy prompt trong `prompts/03.txt`, dán vào Claude/Cursor kèm nội dung `Sidebar.tsx`, `Topbar.tsx`, `App.tsx`, `main.tsx` hiện tại.
3. AI sẽ trả về nội dung mới cho `Layout.tsx` (tạo mới), `main.tsx` (thêm Router), và `App.tsx` (chỉ phần khai báo route — tạm thời route `/products` vẫn render nguyên `App.tsx` cũ, chưa tách gì).
4. Dán code vào đúng file tương ứng.
5. Chạy `npm run dev`, kiểm tra giao diện y hệt như trước (Sidebar + Topbar + bảng sản phẩm hiển thị bình thường), thử vào URL `/` xem có tự chuyển hướng về `/products` không (tuỳ theo cách AI cấu hình, miễn giao diện đúng như cũ là đạt).

## 💻 Ví dụ code (minh hoạ ý tưởng, không copy tay)
```tsx
// Layout.tsx — minh hoạ
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        {/* TẠM THỜI truyền query rỗng + hàm rỗng — Task 05 sẽ xoá 2 props này
           khỏi Topbar hẳn và chuyển ô search vào ProductList.tsx */}
        <Topbar query="" onQueryChange={() => {}} />
        <Outlet />
      </div>
    </div>
  );
}
```
Lưu ý: tên class CSS (`app-shell`, `app-main`...) phải lấy đúng từ `App.tsx`/`App.css` hiện có, không tự bịa tên mới — nếu không chắc, để AI đọc `App.css` trước khi viết.

⚠️ **Vì sao truyền `query=""` tạm thời**: `Topbar.tsx` hiện bắt buộc phải nhận 2 props `query` và `onQueryChange` (không cho phép bỏ trống). Task 03 **không được sửa** `Topbar.tsx`, nên phải truyền tạm 2 giá trị rỗng để code biên dịch được. Hệ quả tạm thời: ô search trên Topbar sẽ không hoạt động cho đến khi Task 05 hoàn thành. Đây là hành vi **được chấp nhận tạm thời**, không phải lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/03.txt`

## ✅ Checklist nghiệm thu
- ☐ File `Layout.tsx` mới được tạo, chứa `Sidebar`, `Topbar`, `<Outlet />`
- ☐ `main.tsx` đã bọc `<App />` bằng `<BrowserRouter>`
- ☐ Giao diện chạy `npm run dev` giống hệt như trước khi làm task (không lệch layout, không mất CSS). Riêng ô search trên Topbar được phép **không gõ được** ở bước này — sẽ hoạt động lại sau Task 05.
- ☐ Không sửa nội dung bên trong `Sidebar.tsx`/`Topbar.tsx`
- ☐ `npm run build` không lỗi

## ❌ Lỗi thường gặp
- **Quên bọc `<BrowserRouter>` ở `main.tsx`** → lỗi đỏ "useRoutes() may be used only in the context of a <Router> component" hoặc tương tự. Kiểm tra lại `main.tsx`.
- **Đặt `<Outlet />` sai vị trí** (ngoài phần layout chính) → giao diện bị lệch, Sidebar/Topbar hiện sai chỗ. So sánh trực tiếp với `App.css` để giữ đúng cấu trúc div/class hiện có.
- **Sửa luôn logic dashboard trong `App.tsx`** — task này KHÔNG được làm việc đó, để dành cho Task 04, tránh 2 người đụng cùng 1 thay đổi.

## 🔄 Cách test
1. `npm run dev`, mở trình duyệt, so sánh ảnh chụp màn hình trước/sau — phải giống hệt.
2. Thử đổi URL trên thanh địa chỉ, xem có báo lỗi trắng trang không.
3. F12 → Console, không có dòng đỏ.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/main.tsx apps/frontend/src/App.tsx
rm apps/frontend/src/components/Layout.tsx
```

## 📝 Commit message
```
feat: add router and Layout wrapper (Sidebar + Topbar + Outlet)
```

## 🔀 PR title
```
[Task 03] Add Router and Layout shell
```
