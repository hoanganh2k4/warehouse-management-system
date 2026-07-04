# Task 01 — Cài dependency (react-router-dom, axios)

## 🎯 Mục tiêu
Cài 2 thư viện nền tảng cho toàn bộ dự án: `react-router-dom` (để có nhiều trang/route) và `axios` (để gọi API dễ hơn `fetch`). Sau task này chưa có gì thay đổi trên giao diện — đây chỉ là bước chuẩn bị.

## 📖 Giải thích nghiệp vụ
Hiện app chỉ có 1 trang duy nhất. Sắp tới sẽ có thêm Login, Product List, Product Detail, Create, Edit — mỗi trang cần 1 địa chỉ URL riêng, nên cần `react-router-dom`.

`axios` là thư viện gọi API, tương tự `fetch` đang dùng trong `App.tsx` nhưng viết ngắn hơn và dễ gắn "interceptor" (bộ chặn tự động gắn token vào mọi request) — việc này sẽ dùng ở Task 11.

**Không dùng react-query** cho dự án này (quyết định của Tech Lead): vì react-query cần cấu hình `QueryClientProvider` bọc toàn bộ app ngay từ đầu, nếu cấu hình sai sẽ sập cả app — không phù hợp cho người mới làm task nhỏ, rủi ro thấp.

## 🧠 Giải thích React cần biết
- Không cần biết React. Chỉ cần biết chạy lệnh `npm install` trong terminal.

## 📖 Các file cần đọc trước
- `apps/frontend/package.json` (chỉ để xem danh sách thư viện hiện có, không sửa tay)

## 📂 File được phép sửa
- `apps/frontend/package.json` (tự động sửa bởi `npm install`, không tự sửa tay)
- `apps/frontend/package-lock.json` (tự động sinh ra, không sửa tay)

## 📂 File KHÔNG được sửa
- Tất cả file khác trong `apps/frontend/src/`
- Toàn bộ `apps/backend/*`

## 🔌 API cần dùng
Không có.

## 🪜 Các bước thực hiện
1. Mở terminal.
2. Chạy: `cd apps/frontend` (kiểm tra bằng lệnh `pwd`, phải thấy đường dẫn kết thúc bằng `apps/frontend`).
3. Chạy: `npm install react-router-dom axios`
4. Đợi lệnh chạy xong, không có dòng chữ đỏ "error".
5. Mở file `package.json`, kiểm tra thấy 2 dòng mới trong mục `"dependencies"`: `"react-router-dom": "..."` và `"axios": "..."`.
6. Chạy `npm run dev`, kiểm tra app vẫn chạy bình thường như trước (chưa có gì đổi trên giao diện — đây là điều đúng, không phải lỗi).

## 💻 Ví dụ code
Không có — task này không viết code, chỉ chạy lệnh cài đặt.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/01.txt`
(Task này đơn giản, không bắt buộc phải dùng AI — nhưng nếu lệnh `npm install` báo lỗi, copy nguyên văn lỗi vào prompt đó để AI giúp sửa.)

## ✅ Checklist nghiệm thu
- ☐ `npm install` chạy xong không có lỗi màu đỏ
- ☐ `package.json` có `react-router-dom` và `axios` trong `dependencies`
- ☐ `npm run dev` chạy được, giao diện y hệt như trước khi làm task
- ☐ Không có gì khác bị sửa ngoài `package.json` và `package-lock.json`

## ❌ Lỗi thường gặp
- **Chạy `npm install` ở sai thư mục** (thư mục gốc `smart-wms` thay vì `apps/frontend`) → thư viện bị cài nhầm chỗ, `apps/frontend/package.json` không đổi gì. Luôn `pwd` kiểm tra trước.
- **Mạng yếu / bị chặn** → lệnh treo hoặc báo lỗi network. Thử lại, hoặc báo Tech Lead nếu môi trường mạng công ty chặn npm registry.

## 🔄 Cách test
1. `cat package.json` (hoặc mở file), tìm dòng `"axios"` và `"react-router-dom"`.
2. `npm run dev` → mở trình duyệt → giao diện Products hiển thị như cũ.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/package.json apps/frontend/package-lock.json
```
rồi làm lại từ Bước 3.

## 📝 Commit message
```
chore: install react-router-dom and axios
```

## 🔀 PR title
```
[Task 01] Install dependencies (react-router-dom, axios)
```
