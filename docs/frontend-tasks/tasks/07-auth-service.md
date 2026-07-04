# Task 07 — Tạo Auth Service (services/auth.service.ts)

## 🎯 Mục tiêu
Viết 1 file chứa các hàm gọi API liên quan đến đăng nhập: `login(username, password)`. File này KHÔNG chứa giao diện, chỉ chứa hàm gọi API thuần — giao diện Login là Task 08.

## 📖 Giải thích nghiệp vụ
Backend có endpoint `POST /auth/login`, nhận `{ username, password }`, trả về:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 86400
  }
}
```
Nếu sai tài khoản/mật khẩu, backend trả lỗi 401 với `message` mô tả lỗi.

`accessToken` chính là "vé thông hành" — phải đính kèm vào các request cần đăng nhập (Create/Edit/Delete Product) ở Task 11. Task này chỉ lo phần gọi API lấy token, chưa lo phần lưu trữ hay gắn header (đó là Task 10, 11).

## 🧠 Giải thích React cần biết
- Không cần React — đây là hàm JS/TS thuần, dùng `apiClient` từ Task 06.
- `async/await` = cách viết code chờ kết quả gọi API mà không bị "đơ" giao diện.

## 📖 Các file cần đọc trước
- `apps/frontend/src/lib/api-client.ts` (từ Task 06)
- `docs/04-api-spec.md`, mục Auth → `POST /auth/login`

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/services/auth.service.ts`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/lib/api-client.ts`
- Mọi file khác

## 🔌 API cần dùng
`POST /auth/login`
- Request body: `{ "username": string, "password": string }`
- Response `data`: `{ "accessToken": string, "refreshToken": string, "expiresIn": number }`

## 🪜 Các bước thực hiện
1. Đọc `api-client.ts` để biết cách gọi (`apiClient.post(url, body)`).
2. Copy prompt trong `prompts/07.txt`, dán vào Claude/Cursor kèm nội dung `api-client.ts`.
3. AI trả về nội dung `auth.service.ts` với 1 hàm `login`.
4. Dán vào file mới.
5. `npm run build` không lỗi TypeScript.

## 💻 Ví dụ code (minh hoạ)
```ts
// services/auth.service.ts — minh hoạ
import { apiClient } from '../lib/api-client';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiClient.post('/auth/login', { username, password });
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/07.txt`

## ✅ Checklist nghiệm thu
- ☐ File `services/auth.service.ts` tồn tại
- ☐ Có hàm `login(username, password)` gọi đúng `POST /auth/login` qua `apiClient`
- ☐ Có type `LoginResponse` với đúng 3 field: `accessToken`, `refreshToken`, `expiresIn`
- ☐ Hàm là `async`, trả về `Promise<LoginResponse>`
- ☐ `npm run build` không lỗi TypeScript

## ❌ Lỗi thường gặp
- **Gọi sai tên field** (ví dụ `email` thay vì `username`) → backend trả lỗi 400 validation. Đối chiếu đúng tên field trong `docs/04-api-spec.md`.
- **Quên `export`** hàm `login` → các file khác (Task 09) không import được.
- **Tự ý thêm logic lưu token vào file này** — task này KHÔNG lưu token, chỉ gọi API và trả kết quả về. Lưu token là việc của `useAuth.ts` (Task 10).

## 🔄 Cách test
Vì chưa có UI gọi hàm này, có thể test tạm bằng cách gọi thử trong Console trình duyệt hoặc chờ Task 09 (UI Login gọi API thật) để test end-to-end. Nếu muốn tự kiểm tra sớm, có thể viết tạm 1 dòng gọi thử trong `ProductList.tsx` rồi xoá đi trước khi commit (không được để lại trong code).

## 🔙 Cách rollback nếu sai
```
rm apps/frontend/src/services/auth.service.ts
```

## 📝 Commit message
```
feat: add auth service (login API call)
```

## 🔀 PR title
```
[Task 07] Add auth service
```
