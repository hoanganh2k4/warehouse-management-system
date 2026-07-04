# Task 05 — Tách Search khỏi Topbar.tsx, chuyển vào ProductList.tsx

## 🎯 Mục tiêu
Loại bỏ ô tìm kiếm (search box) ra khỏi `Topbar.tsx`. `Topbar` từ nay chỉ còn là phần "khung tĩnh" dùng chung cho mọi trang (link "API docs" + avatar người dùng), không còn nhận props `query`/`onQueryChange`. Ô search chuyển hẳn vào bên trong `ProductList.tsx`, đặt ở khu vực đầu trang (page header) của riêng trang Products.

## 📖 Giải thích nghiệp vụ
`Topbar` được `Layout.tsx` (Task 03) hiển thị cho **mọi trang** (Products, và sau này là Inventory, Racking...). Nhưng ô search "tìm theo tên/SKU/category" chỉ có ý nghĩa với trang Products — các trang khác trong tương lai sẽ cần ô search khác (ví dụ tìm theo mã lô hàng). Nếu giữ search trong `Topbar` dùng chung, mỗi trang mới sau này đều phải sửa vào `Topbar.tsx` — 1 file chung bị nhiều người đụng vào cùng lúc, dễ conflict Git và dễ gãy các trang khác.

Giải pháp: `Topbar` không biết gì về "search" nữa — nó chỉ là phần vỏ tĩnh. Từng trang tự quyết định có cần ô search hay không, và tự đặt ở đâu trong nội dung riêng của trang đó.

## 🧠 Giải thích React cần biết
- Đây là thao tác "di chuyển state xuống đúng chỗ cần nó" (tiếng Anh: *lifting state down* / đưa state về đúng component sở hữu nó). Hiện `query` đang là state của `ProductList` truyền ngược lên cho `Topbar` hiển thị — việc này không cần thiết vì input search có thể nằm ngay trong `ProductList`.
- Xoá 1 prop khỏi 1 component nghĩa là: xoá dòng khai báo trong `type XxxProps`, xoá tham số nhận vào, và xoá luôn chỗ gọi component đó đang truyền prop thừa.

## 📖 Các file cần đọc trước
- `apps/frontend/src/components/Topbar.tsx`
- `apps/frontend/src/components/Layout.tsx` (đang gọi `<Topbar query="" onQueryChange={() => {}} />` tạm thời từ Task 03)
- `apps/frontend/src/pages/products/ProductList.tsx` (vừa tạo ở Task 04)
- `apps/frontend/src/App.css` (tìm class `.topbar-search` để biết cách style ô search hiện tại, và class `.page-header` để biết nên đặt ô search mới ở đâu trong `ProductList`)

## 📂 File được phép sửa
- `apps/frontend/src/components/Topbar.tsx`
- `apps/frontend/src/components/Layout.tsx` (xoá 2 props tạm thời đang truyền cho Topbar)
- `apps/frontend/src/pages/products/ProductList.tsx`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/Sidebar.tsx`, `ProductTable.tsx`, `StatCard.tsx`
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/App.css` (dùng lại class `.topbar-search` có sẵn, không tạo class mới — nếu cần đặt tên khác, hỏi Tech Lead trước)

## 🔌 API cần dùng
Không có — task này chỉ di chuyển UI, chưa đổi cách gọi API.

## 🪜 Các bước thực hiện
1. Đọc `Topbar.tsx` — ghi nhớ đoạn JSX `<label className="topbar-search">...</label>` (dòng 11–20).
2. Copy prompt trong `prompts/05.txt`, dán vào Claude/Cursor kèm nội dung hiện tại của `Topbar.tsx`, `Layout.tsx`, `ProductList.tsx`.
3. AI trả về:
   - `Topbar.tsx` mới: bỏ hẳn `TopbarProps`, bỏ tham số `{ query, onQueryChange }`, xoá đoạn `<label className="topbar-search">`, chỉ còn `<header className="topbar">` với phần `topbar-actions` (docs-link + user-chip).
   - `Layout.tsx` mới: gọi `<Topbar />` không props.
   - `ProductList.tsx` mới: thêm lại đúng đoạn `<label className="topbar-search">...</label>` (dùng class CSS y hệt, không đổi tên class) vào trong phần `page-header` hoặc ngay phía trên `<section className="panel">`, dùng lại state `query`/`setQuery` đã có sẵn trong `ProductList`.
4. Dán code vào 3 file.
5. `npm run dev`, kiểm tra: gõ vào ô search, danh sách sản phẩm lọc đúng như hành vi cũ (trước khi tách).

## 💻 Ví dụ code (minh hoạ, không copy tay)
```tsx
// Topbar.tsx — sau khi tách, minh hoạ
export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <a className="docs-link" href="http://localhost:3000/api-docs" target="_blank" rel="noreferrer">
          <span>API docs</span>
          <ExternalLinkIcon />
        </a>
        <div className="user-chip" title="Signed in">
          <span className="user-avatar">WM</span>
        </div>
      </div>
    </header>
  );
}
```
```tsx
// ProductList.tsx — thêm search box vào đây, minh hoạ (đặt trong phần page-header hiện có)
<label className="topbar-search">
  <SearchIcon />
  <input
    type="search"
    placeholder="Search by name, SKU or category..."
    value={query}
    onChange={(event) => setQuery(event.target.value)}
    aria-label="Search products"
  />
</label>
```
Lưu ý: `SearchIcon` phải import từ `../../components/icons` (đường dẫn tương đối đổi theo vị trí file mới).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/05.txt`

## ✅ Checklist nghiệm thu
- ☐ `Topbar.tsx` không còn nhận props gì, không còn ô search
- ☐ `Layout.tsx` gọi `<Topbar />` không truyền props
- ☐ Ô search xuất hiện trong trang Products, vị trí hợp lý (gần tiêu đề "Products"), dùng class CSS cũ `.topbar-search`
- ☐ Gõ search lọc đúng danh sách (giữ nguyên hành vi lọc theo tên/SKU/category như code gốc)
- ☐ `npm run build` không lỗi TypeScript (đặc biệt kiểm tra không còn nơi nào gọi `<Topbar query=... />` sót lại)

## ❌ Lỗi thường gặp
- **Quên xoá props tạm ở `Layout.tsx`** → lỗi TypeScript "Property query does not exist on type...". Tìm toàn bộ project (Ctrl+Shift+F) từ khoá `<Topbar` để chắc chắn không còn chỗ nào truyền props cũ.
- **Đặt sai class CSS cho ô search mới** → mất style, ô search bị vỡ giao diện. Copy đúng nguyên className `topbar-search` từ bản gốc.
- **Quên import `SearchIcon` trong `ProductList.tsx`** → lỗi "SearchIcon is not defined".

## 🔄 Cách test
1. `npm run dev`, vào `/products`.
2. Gõ vài ký tự vào ô search mới — danh sách phải lọc giống hệt hành vi trước khi tách (kiểm tra lại bằng cách gõ đúng 1 SKU có trong danh sách).
3. Kiểm tra Topbar không còn ô search cũ, chỉ còn link "API docs" và avatar.
4. `npm run build` không lỗi.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/components/Topbar.tsx apps/frontend/src/components/Layout.tsx apps/frontend/src/pages/products/ProductList.tsx
```

## 📝 Commit message
```
refactor: move search input from Topbar into ProductList page
```

## 🔀 PR title
```
[Task 05] Decouple search from shared Topbar
```
