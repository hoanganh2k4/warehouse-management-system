# Task 10 — Lưu token, tạo hooks/useAuth.ts

## 🎯 Mục tiêu
Tạo 1 custom hook `useAuth()` để: lưu `accessToken` sau khi đăng nhập thành công, đọc lại token đó ở bất kỳ đâu trong app, và biết được người dùng "đã đăng nhập hay chưa". Sửa `Login.tsx` để gọi hook này thay vì chỉ `console.log(result)`.

## 📖 Giải thích nghiệp vụ
Sau khi đăng nhập, token cần được lưu lại để: (1) không phải đăng nhập lại mỗi lần load trang, (2) các request Create/Edit/Delete Product (Task 11 trở đi) có cái để đính kèm vào header. Nơi lưu: `localStorage` của trình duyệt (dữ liệu tồn tại kể cả khi tắt tab, đến khi bị xoá).

## 🧠 Giải thích React cần biết
- **Custom hook** là 1 hàm bắt đầu bằng chữ `use...`, cho phép tái sử dụng logic có state ở nhiều component khác nhau. Ví dụ `useAuth()` có thể gọi ở `Login.tsx`, ở `ProtectedRoute.tsx` (Task 12), ở bất kỳ đâu cần biết "user đã đăng nhập chưa".
- `localStorage.setItem('key', value)` / `localStorage.getItem('key')` — API có sẵn của trình duyệt, không cần cài thư viện.

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/login/Login.tsx` (từ Task 09)
- `apps/frontend/src/services/auth.service.ts` (để biết kiểu `LoginResponse`)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/hooks/useAuth.ts`
- Sửa: `apps/frontend/src/pages/login/Login.tsx` (thay `console.log(result)` bằng gọi hook)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/services/auth.service.ts`
- `apps/frontend/src/lib/api-client.ts`

## 🔌 API cần dùng
Không gọi API mới — chỉ xử lý dữ liệu trả về từ Task 09.

## 🪜 Các bước thực hiện
1. Đọc `Login.tsx` hiện tại (sau Task 09).
2. Copy prompt trong `prompts/10.txt`, dán vào Claude/Cursor kèm nội dung `Login.tsx` và `auth.service.ts`.
3. AI trả về `useAuth.ts` mới (hàm `saveToken`, `getToken`, `isAuthenticated`, `logout`) và `Login.tsx` đã sửa (gọi `saveToken(result.accessToken)` sau khi đăng nhập thành công, rồi điều hướng tới `/products` bằng `useNavigate()` của react-router-dom).
4. Dán code, test đăng nhập thành công → tự chuyển sang trang Products.
5. Kiểm tra `localStorage` (F12 → Application → Local Storage) thấy có lưu token.

## 💻 Ví dụ code (minh hoạ)
```ts
// hooks/useAuth.ts — minh hoạ
const TOKEN_KEY = 'wms_access_token';

export function useAuth() {
  const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const isAuthenticated = () => !!getToken();
  const logout = () => localStorage.removeItem(TOKEN_KEY);

  return { saveToken, getToken, isAuthenticated, logout };
}
```
```tsx
// Login.tsx — sau khi sửa, minh hoạ phần trong try
const { saveToken } = useAuth();
const navigate = useNavigate();
// ...
const result = await login(username, password);
saveToken(result.accessToken);
navigate('/products');
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/10.txt`

## ✅ Checklist nghiệm thu
- ☐ `hooks/useAuth.ts` có đủ 4 hàm: `saveToken`, `getToken`, `isAuthenticated`, `logout`
- ☐ Đăng nhập thành công → token xuất hiện trong `localStorage` (kiểm tra bằng F12 → Application)
- ☐ Đăng nhập thành công → tự động chuyển hướng sang `/products`
- ☐ Đăng nhập sai vẫn hiển thị lỗi như Task 09 (không bị ảnh hưởng)
- ☐ `npm run build` không lỗi

## ❌ Lỗi thường gặp
- **Đặt tên key trong `localStorage` trùng với key khác đã dùng ở đâu đó** — dùng đúng tên `wms_access_token` (hoặc tên do AI đặt nhưng phải nhất quán, ghi rõ trong code) để Task 11/12 tìm đúng.
- **Quên `useNavigate()` phải được gọi bên trong component (không gọi ở ngoài function component)** — nếu lỗi "Invalid hook call", kiểm tra vị trí gọi.
- **Lưu cả `refreshToken` nhưng chưa dùng đến** — task này chỉ cần `accessToken`, không bắt buộc xử lý refresh token (ngoài phạm vi 41 task hiện tại, có thể để dành làm sau nếu cần).

## 🔄 Cách test
1. `npm run dev`, đăng nhập đúng tài khoản.
2. Kiểm tra tự động chuyển sang `/products`.
3. F12 → Application → Local Storage → thấy token đã lưu.
4. Refresh lại trang (F5) — token vẫn còn trong Local Storage (không bị mất, vì đây là hành vi đúng của `localStorage`).

## 🔙 Cách rollback nếu sai
```
rm apps/frontend/src/hooks/useAuth.ts
git checkout apps/frontend/src/pages/login/Login.tsx
```

## 📝 Commit message
```
feat: add useAuth hook to persist access token
```

## 🔀 PR title
```
[Task 10] Add useAuth hook (token persistence)
```
