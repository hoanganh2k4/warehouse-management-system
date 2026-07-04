# Task 02 — Tạo cấu trúc thư mục rỗng

## 🎯 Mục tiêu
Tạo sẵn các thư mục sẽ dùng cho toàn bộ dự án, để không ai phải tự đặt tên/tự bịa cấu trúc thư mục riêng khi làm task của mình.

## 📖 Giải thích nghiệp vụ
Hiện tại `apps/frontend/src/` chỉ có `components/` và vài file lẻ ở gốc. Sắp tới cần chỗ chứa:
- `pages/` — mỗi trang (Login, ProductList, ProductDetail...) là 1 thư mục con trong đây
- `services/` — nơi chứa các hàm gọi API (ví dụ `product.service.ts`)
- `hooks/` — nơi chứa các "custom hook" tái sử dụng logic (ví dụ `useAuth.ts`)
- `lib/` — nơi chứa các đoạn code tiện ích dùng chung (ví dụ `api-client.ts`)

## 🧠 Giải thích React cần biết
Không cần biết React. Đây thuần tuý là tạo thư mục, giống tạo folder trên Windows/Mac.

## 📖 Các file cần đọc trước
- `apps/frontend/src/` (xem cấu trúc hiện tại bằng lệnh `ls` hoặc mở trong VS Code)

## 📂 File được phép sửa / tạo mới
Tạo mới các thư mục (rỗng), mỗi thư mục có 1 file `.gitkeep` bên trong:
- `apps/frontend/src/pages/.gitkeep`
- `apps/frontend/src/services/.gitkeep`
- `apps/frontend/src/hooks/.gitkeep`
- `apps/frontend/src/lib/.gitkeep`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/*`
- `apps/frontend/src/App.tsx`, `App.css`, `index.css`, `main.tsx`, `types.ts`

## 🔌 API cần dùng
Không có.

## 🪜 Các bước thực hiện
1. Trong `apps/frontend/src/`, tạo 4 thư mục mới: `pages`, `services`, `hooks`, `lib`.
2. Trong mỗi thư mục, tạo 1 file rỗng tên `.gitkeep` (Git không lưu thư mục rỗng, file `.gitkeep` là quy ước để giữ thư mục lại trong Git).
3. Chạy `git status`, kiểm tra thấy 4 file `.gitkeep` mới xuất hiện.

## 💻 Ví dụ code
Không có.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/02.txt`
(Task này không bắt buộc cần AI, có thể tự tạo thư mục bằng tay hoặc dùng lệnh terminal.)

## ✅ Checklist nghiệm thu
- ☐ 4 thư mục tồn tại: `pages/`, `services/`, `hooks/`, `lib/`
- ☐ Mỗi thư mục có file `.gitkeep`
- ☐ Không có file/thư mục nào khác bị đổi tên hoặc xoá
- ☐ `npm run dev` vẫn chạy bình thường

## ❌ Lỗi thường gặp
- **Tạo nhầm thư mục ở `apps/backend` thay vì `apps/frontend`** → kiểm tra kỹ đường dẫn trước khi tạo.
- **Đặt sai tên** (ví dụ `page` thay vì `pages`, số ít/số nhiều) → các task sau sẽ tìm không thấy thư mục. Đặt đúng tên số nhiều như trên.

## 🔄 Cách test
```
ls apps/frontend/src/pages apps/frontend/src/services apps/frontend/src/hooks apps/frontend/src/lib
```
Mỗi lệnh phải in ra `.gitkeep`, không báo lỗi "No such file or directory".

## 🔙 Cách rollback nếu sai
Xoá các thư mục vừa tạo, làm lại. Không ảnh hưởng gì đến phần còn lại của dự án vì thư mục đang rỗng.

## 📝 Commit message
```
chore: scaffold folder structure (pages, services, hooks, lib)
```

## 🔀 PR title
```
[Task 02] Scaffold base folder structure
```
