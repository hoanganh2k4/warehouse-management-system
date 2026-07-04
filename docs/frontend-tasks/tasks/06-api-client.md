# Task 06 — Tạo API Client (lib/api-client.ts)

## 🎯 Mục tiêu
Tạo 1 file duy nhất chứa "cục axios" đã cấu hình sẵn base URL và tự động "bóc vỏ" (unwrap) response của backend, để mọi service sau này (`product.service.ts`, `auth.service.ts`...) chỉ cần gọi `apiClient.get(...)` thay vì tự viết `fetch` + tự parse JSON như code cũ.

## 📖 Giải thích nghiệp vụ
Mọi API của backend đều trả về theo đúng 1 khuôn:
- Thành công: `{ "success": true, "data": <dữ liệu thật> }`
- Thất bại: `{ "success": false, "message": "<mô tả lỗi>" }`

Thay vì mỗi nơi gọi API đều phải tự viết `if (json.success) {...} else {...}` (dễ quên, dễ sai), ta viết 1 lần duy nhất trong `api-client.ts`. Từ đó về sau, mọi service chỉ cần gọi `apiClient.get('/products')` và nhận thẳng về `data` (đã bóc vỏ), hoặc bị ném lỗi (throw) nếu backend trả `success: false`.

## 🧠 Giải thích React cần biết
- Không cần React cho task này — đây là code JavaScript/TypeScript thuần, không có JSX/component.
- **axios interceptor** là 1 "bộ chặn" chạy tự động trên MỌI request/response đi qua axios instance đó — giống như 1 trạm kiểm soát mà mọi xe đều phải qua trước khi tới đích.

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/products/ProductList.tsx` (xem đoạn `fetch('/api/products', ...)` và cách nó đọc `json.data?.items` — đây chính là hành vi cần chuyển vào `api-client.ts`)
- Tài liệu API: `docs/04-api-spec.md` (mục Products) để thấy rõ khuôn `{ success, data }` / `{ success, message }`

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/frontend/src/lib/api-client.ts`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/pages/products/ProductList.tsx` (task này CHƯA đổi cách ProductList gọi API — việc thay `fetch` bằng `apiClient` là Task 16)
- Mọi file khác

## 🔌 API cần dùng
Không gọi API cụ thể nào — đây là lớp hạ tầng dùng chung cho mọi API sau này. Base URL: `/api` (giữ nguyên như code cũ, Vite dev server đã tự proxy `/api` → backend, xem `vite.config.ts`).

## 🪜 Các bước thực hiện
1. Copy prompt trong `prompts/06.txt`, dán vào Claude/Cursor.
2. AI trả về nội dung file `lib/api-client.ts`.
3. Dán vào file mới `src/lib/api-client.ts`.
4. Task này không cần test riêng trên UI (chưa có ai gọi nó) — chỉ cần `npm run build` không lỗi TypeScript là đạt.

## 💻 Ví dụ code (minh hoạ ý tưởng, để AI viết bản đầy đủ theo prompt)
```ts
// lib/api-client.ts — minh hoạ
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
});

// Bóc vỏ { success, data } / ném lỗi khi { success: false, message }
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.success === false) {
      return Promise.reject(new Error(body.message ?? 'Request failed'));
    }
    return body?.data;
  },
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  },
);
```
Lưu ý cho AI: interceptor phải trả về **đúng `data` đã bóc vỏ**, không trả về nguyên `response` — để mọi service sau này viết `const products = await apiClient.get('/products')` là dùng được ngay, không phải viết `.data.data` lòng vòng.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/06.txt`

## ✅ Checklist nghiệm thu
- ☐ File `lib/api-client.ts` tồn tại, export ra 1 axios instance tên `apiClient`
- ☐ `baseURL` là `/api`
- ☐ Có interceptor response: request thành công trả thẳng `data` (không phải nguyên object `{success, data}`)
- ☐ Request thất bại (`success: false` hoặc lỗi mạng/HTTP) đều bị `throw`/`reject` với message rõ ràng, lấy từ `message` của backend nếu có
- ☐ `npm run build` không lỗi TypeScript
- ☐ Chưa có file nào khác bị sửa (kiểm tra `git status`)

## ❌ Lỗi thường gặp
- **Quên xử lý trường hợp lỗi HTTP (401, 404, 409...)** — với axios, các mã lỗi HTTP sẽ rơi vào nhánh `error` của interceptor (không phải nhánh `response` thành công), phải đọc `error.response?.data?.message` để lấy đúng message backend trả về (ví dụ lỗi 409 khi trùng SKU).
- **Trả nhầm nguyên `response` thay vì `response.data`** → mọi service sau này phải viết `.data.data` dài dòng, dễ sai. Kiểm tra kỹ interceptor trả đúng phần đã bóc vỏ.
- **Đặt sai `baseURL`** (ví dụ `http://localhost:3000/api` cứng) → sẽ lỗi CORS khi build production. Giữ `/api` để tận dụng proxy có sẵn của Vite.

## 🔄 Cách test
Vì chưa có ai gọi `apiClient` ở bước này, cách test duy nhất:
1. `npm run build` — không có lỗi TypeScript.
2. Đọc lại code, đối chiếu với checklist ở trên.
3. (Tuỳ chọn, không bắt buộc) Mở Console trình duyệt, gõ tạm `import('/src/lib/api-client.ts')` để chắc chắn file không có lỗi cú pháp — nếu không quen thao tác này, bỏ qua, Task 07 sẽ test gián tiếp qua Auth Service.

## 🔙 Cách rollback nếu sai
```
rm apps/frontend/src/lib/api-client.ts
```
Không ảnh hưởng gì đến phần còn lại vì chưa ai import file này.

## 📝 Commit message
```
feat: add shared axios API client with envelope unwrapping
```

## 🔀 PR title
```
[Task 06] Add API client (axios + envelope unwrap)
```
