# Task 11 — Gắn Authorization header (axios interceptor)

## 🎯 Mục tiêu
Sửa `lib/api-client.ts` để **mọi** request gửi đi đều tự động đính kèm header `Authorization: Bearer <token>` nếu đã đăng nhập (có token trong `localStorage`). Sau task này, các service ở Task 30 (Create), Task 35 (Edit), Task 38 (Delete) không cần tự viết gì thêm về token — cứ gọi `apiClient.post(...)`/`put(...)`/`delete(...)` bình thường là tự động có token đính kèm.

## 📖 Giải thích nghiệp vụ
Backend yêu cầu các route ghi dữ liệu (`POST/PUT/DELETE /products`) phải có header:
```
Authorization: Bearer <accessToken>
```
Nếu thiếu, backend trả lỗi 401. Việc gắn header này ở 1 chỗ duy nhất (interceptor) giúp tránh phải nhớ gắn thủ công ở từng service.

## 🧠 Giải thích React cần biết
- Không cần React — đây là cấu hình axios thuần.
- **axios request interceptor**: khác với response interceptor (Task 06, chạy sau khi có kết quả trả về), request interceptor chạy TRƯỚC khi request được gửi đi — đúng chỗ để "gắn thêm header".

## 📖 Các file cần đọc trước
- `apps/frontend/src/lib/api-client.ts` (từ Task 06)
- `apps/frontend/src/hooks/useAuth.ts` (từ Task 10, hàm `getToken`)

## 📂 File được phép sửa
- `apps/frontend/src/lib/api-client.ts`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/hooks/useAuth.ts` (chỉ đọc, dùng lại hàm `getToken` — nếu `getToken` không phải hàm độc lập mà nằm trong hook React, có thể cần đọc token trực tiếp từ `localStorage` bằng đúng key đã dùng ở Task 10, KHÔNG gọi hook React bên trong file không phải component)

## 🔌 API cần dùng
Không có API mới — đây là hạ tầng dùng chung cho mọi API ghi dữ liệu.

## 🪜 Các bước thực hiện
1. Đọc lại `api-client.ts` và `useAuth.ts`.
2. Copy prompt trong `prompts/11.txt`, dán kèm 2 file trên.
3. AI trả về `api-client.ts` mới, có thêm 1 request interceptor: đọc token trực tiếp từ `localStorage` (dùng đúng key đã đặt ở Task 10, ví dụ `wms_access_token`), nếu có thì gắn `config.headers.Authorization = 'Bearer ' + token`.
4. Dán code, `npm run build` không lỗi.
5. Test thủ công: đăng nhập, mở tab Network (F12), thử gọi 1 request ghi bất kỳ (có thể tạm test bằng cách gọi thử `apiClient.post('/products', {...})` trong Console) — kiểm tra request đó có header `Authorization`.

## 💻 Ví dụ code (minh hoạ)
```ts
// api-client.ts — bổ sung request interceptor, minh hoạ
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_access_token'); // đúng key của Task 10
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
Lưu ý quan trọng cho AI: **không import `useAuth` (hook React) vào file này** — `api-client.ts` không phải là component/hook nên không được gọi hook React bên trong. Đọc thẳng `localStorage.getItem(...)` bằng đúng key.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/11.txt`

## ✅ Checklist nghiệm thu
- ☐ `api-client.ts` có thêm request interceptor
- ☐ Khi đã đăng nhập (có token trong `localStorage`), mọi request qua `apiClient` đều có header `Authorization: Bearer <token>` (kiểm tra bằng tab Network của F12)
- ☐ Khi chưa đăng nhập (không có token), request vẫn gửi được bình thường, chỉ là không có header đó (để các API công khai như `GET /products` không bị ảnh hưởng)
- ☐ Không import hook React (`useAuth`) vào `api-client.ts`
- ☐ `npm run build` không lỗi

## ❌ Lỗi thường gặp
- **Gọi `useAuth()` (hook) trong file không phải component** → lỗi "Invalid hook call". Đọc thẳng `localStorage` bằng key, không qua hook.
- **Dùng sai key `localStorage`** (không khớp với key đã lưu ở Task 10) → token luôn `null`, header không bao giờ được gắn. Kiểm tra kỹ tên key ở cả 2 file phải giống hệt nhau.
- **Gắn cứng token demo vào code** — tuyệt đối không hardcode token thật vào source code, dù chỉ để test tạm — phải xoá trước khi commit.

## 🔄 Cách test
1. Đăng nhập thành công (từ Task 10).
2. F12 → tab Network.
3. Vào Console, gõ thử: `import('/src/lib/api-client.ts').then(m => m.apiClient.get('/products'))` (hoặc để dành test tự nhiên hơn khi tới Task 14–16 khi `ProductList` đã dùng `apiClient`).
4. Kiểm tra request đó trong tab Network có header `Authorization`.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/lib/api-client.ts
```

## 📝 Commit message
```
feat: auto-attach Authorization header via axios interceptor
```

## 🔀 PR title
```
[Task 11] Attach auth token to outgoing requests
```
