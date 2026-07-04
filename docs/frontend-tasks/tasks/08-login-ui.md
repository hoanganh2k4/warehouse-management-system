# Task 08 — UI Login (pages/login/Login.tsx)

## 🎯 Mục tiêu
Tạo giao diện trang đăng nhập: 2 ô nhập (username, password) + 1 nút "Đăng nhập". Task này CHƯA gọi API thật — bấm nút chỉ cần `console.log({ username, password })`. Việc gọi API thật là Task 09.

## 📖 Giải thích nghiệp vụ
App hiện chưa có khái niệm "đăng nhập" — mọi request đọc (`GET`) đều công khai, nhưng request ghi (Create/Edit/Delete Product) cần token. Cần 1 trang để người dùng nhập tài khoản trước khi được phép tạo/sửa/xoá sản phẩm.

## 🧠 Giải thích React cần biết
- **Controlled input**: input mà giá trị của nó được điều khiển hoàn toàn bởi state React (`value={username}`, `onChange={(e) => setUsername(e.target.value)}`) — đây là cách viết form chuẩn trong React, khác với HTML thường.
- **`onSubmit` của `<form>`**: phải gọi `event.preventDefault()` để trang không bị load lại khi bấm nút submit (hành vi mặc định của trình duyệt).

## 📖 Các file cần đọc trước
- `apps/frontend/src/App.css` (tìm class hiện có gần giống form/input để tái sử dụng style — ví dụ `.topbar-search input` có style input sẵn; nếu không có class form nào phù hợp, có thể thêm class mới NHƯNG phải đặt trong 1 file CSS riêng `Login.css`, không sửa `App.css` dùng chung)
- `apps/frontend/src/components/StatCard.tsx` (chỉ để tham khảo cách 1 component nhỏ được viết trong dự án này — quy ước đặt type Props, cách export)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/pages/login/Login.tsx`
- Tạo mới (nếu cần style riêng): `apps/frontend/src/pages/login/Login.css`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/App.css` (không thêm class dùng chung vào đây cho riêng trang Login)
- `apps/frontend/src/App.tsx` (việc thêm route `/login` là Task 09, gộp chung khi API đã chạy được, để tránh 2 lần đụng file này)
- Mọi component trong `components/`

## 🔌 API cần dùng
Chưa gọi API nào ở task này.

## 🪜 Các bước thực hiện
1. Copy prompt trong `prompts/08.txt`, dán vào Claude/Cursor.
2. AI trả về nội dung `Login.tsx` (và `Login.css` nếu cần).
3. Tạo file, dán code.
4. Vì `App.tsx` chưa có route `/login`, để xem thử giao diện: tạm thời sửa `App.tsx` thêm 1 dòng route test, xem xong thì **xoá dòng đó đi, không commit** (route thật sẽ được thêm chính thức ở Task 09).

## 💻 Ví dụ code (minh hoạ)
```tsx
// pages/login/Login.tsx — minh hoạ
import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log({ username, password }); // Task 09 sẽ thay dòng này bằng gọi API thật
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/08.txt`

## ✅ Checklist nghiệm thu
- ☐ File `Login.tsx` có 2 input (username, password) và 1 nút submit
- ☐ Input password có `type="password"` (ẩn ký tự khi gõ)
- ☐ Bấm nút submit không load lại trang (đã gọi `preventDefault`)
- ☐ Bấm nút submit in ra Console đúng giá trị đã gõ
- ☐ Giao diện không bị vỡ layout (kiểm tra bằng cách xem tạm qua route test rồi xoá route đó)
- ☐ `npm run build` không lỗi

## ❌ Lỗi thường gặp
- **Quên `event.preventDefault()`** → trang bị load lại mỗi lần bấm nút, mất hết dữ liệu đã nhập.
- **Để lại route test trong `App.tsx` khi commit** → phải xoá trước khi commit, route thật thuộc về Task 09.
- **Dùng input không kiểm soát (uncontrolled)** — tức không gắn `value`/`onChange` — sẽ khó lấy giá trị khi submit và không đúng convention của dự án.

## 🔄 Cách test
1. Thêm tạm route `/login` vào `App.tsx` để xem (nhớ xoá sau khi test xong).
2. Gõ vào 2 ô input, bấm "Đăng nhập".
3. Mở Console (F12), kiểm tra thấy in ra đúng `{ username: "...", password: "..." }`.

## 🔙 Cách rollback nếu sai
```
rm -rf apps/frontend/src/pages/login
git checkout apps/frontend/src/App.tsx
```

## 📝 Commit message
```
feat: add login page UI (no API call yet)
```

## 🔀 PR title
```
[Task 08] Add Login page UI
```
