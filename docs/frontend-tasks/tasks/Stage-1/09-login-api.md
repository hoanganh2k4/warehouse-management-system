# Task 09 — Gọi API Login thật, xử lý lỗi 401

## 🎯 Mục tiêu
Thay dòng `console.log` trong `Login.tsx` (Task 08) bằng lệnh gọi thật tới `auth.service.ts` (Task 07). Nếu sai tài khoản/mật khẩu, hiển thị thông báo lỗi ngay trên form — không phải alert của trình duyệt.

**Lưu ý**: task này CHƯA lưu token vào đâu cả (đó là Task 10) — chỉ cần gọi API thành công và tạm `console.log(result)` để thấy token trả về, cộng với xử lý hiển thị lỗi khi sai tài khoản.

## 📖 Giải thích nghiệp vụ
Khi người dùng bấm "Đăng nhập":
- Nếu đúng tài khoản → backend trả `accessToken` (task này chỉ cần log ra, chưa lưu).
- Nếu sai tài khoản/mật khẩu → backend trả lỗi 401 với message (ví dụ "Sai tài khoản hoặc mật khẩu") → phải hiển thị message này cho người dùng thấy trên giao diện, không phải chỉ log trong Console.

## 🧠 Giải thích React cần biết
- Gọi API là hành động **bất đồng bộ** (mất thời gian) — trong lúc chờ, nên có trạng thái "đang xử lý" (ví dụ disable nút bấm) để người dùng không bấm nhiều lần liên tiếp.
- Bắt lỗi bằng `try/catch`: nếu `apiClient` (Task 06) đã được viết đúng, mọi lỗi từ backend sẽ đi vào khối `catch` dưới dạng `Error` với `.message` là nội dung lỗi thật từ backend.

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/login/Login.tsx` (từ Task 08)
- `apps/frontend/src/services/auth.service.ts` (từ Task 07)
- `apps/frontend/src/components/ProductTable.tsx` — chỉ để tham khảo cách project này hiển thị trạng thái lỗi (`.state-panel`, `.state-error` trong `App.css`) để dùng lại đúng class, không tự bịa UI lỗi mới

## 📂 File được phép sửa
- `apps/frontend/src/pages/login/Login.tsx`

## 📂 File KHÔNG được sửa
- `apps/frontend/src/services/auth.service.ts`
- `apps/frontend/src/lib/api-client.ts`
- `apps/frontend/src/App.css` (dùng lại class lỗi có sẵn, không thêm class mới)

## 🔌 API cần dùng
`POST /auth/login` (qua hàm `login()` đã có trong `auth.service.ts`, không gọi `apiClient` trực tiếp trong `Login.tsx`)

## 🪜 Các bước thực hiện
1. Đọc lại `Login.tsx` và `auth.service.ts`.
2. Copy prompt trong `prompts/09.txt`, dán vào Claude/Cursor kèm nội dung 2 file trên.
3. AI trả về `Login.tsx` mới: thêm state `loading`, `error`; hàm `handleSubmit` gọi `await login(username, password)` trong `try/catch`; hiển thị `error` bằng đúng class `.state-panel.state-error` đã có trong `App.css`; disable nút bấm khi `loading === true`.
4. Dán code, `npm run dev`, test thử đăng nhập sai để xem thông báo lỗi.

## 💻 Ví dụ code (minh hoạ)
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const result = await login(username, password);
    console.log(result); // Task 10 sẽ thay dòng này bằng việc lưu token thật
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
  } finally {
    setLoading(false);
  }
};
```
```tsx
{error && <div className="state-panel state-error">{error}</div>}
<button type="submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
```
Lưu ý: tên class `state-panel state-error` phải kiểm tra đúng trong `App.css` — nếu tên thật khác, dùng đúng tên đang tồn tại, không tự đặt tên mới.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/09.txt`

## ✅ Checklist nghiệm thu
- ☐ Đăng nhập đúng tài khoản (dùng tài khoản seed sẵn trong backend, ví dụ `admin`) → Console log ra `accessToken`
- ☐ Đăng nhập sai mật khẩu → hiển thị thông báo lỗi trên giao diện (không phải alert trình duyệt, không phải chỉ trong Console)
- ☐ Trong lúc chờ API, nút "Đăng nhập" bị disable, đổi chữ thành trạng thái đang xử lý
- ☐ Dùng đúng class CSS lỗi có sẵn, không tạo CSS mới
- ☐ `npm run build` không lỗi

## ❌ Lỗi thường gặp
- **Dùng `alert()` để hiển thị lỗi** — không đúng convention của dự án (dự án dùng `.state-panel` cho mọi trạng thái lỗi). Không dùng `alert`.
- **Không disable nút khi đang loading** → người dùng bấm nhiều lần, gửi nhiều request cùng lúc.
- **Quên `event.preventDefault()`** (nếu lỡ xoá mất từ Task 08) → trang load lại mất trạng thái.
- **Tài khoản test không tồn tại** — hỏi Tech Lead tài khoản seed sẵn trong database backend trước khi test (thường có trong `docs/HUONG-DAN-CAI-DAT.md` hoặc file seed).

## 🔄 Cách test
1. `npm run dev`, vào trang Login (dùng route test tạm nếu `App.tsx` chưa có route chính thức).
2. Đăng nhập với tài khoản đúng → Console log ra object có `accessToken`.
3. Đăng nhập với mật khẩu sai → thấy thông báo lỗi đỏ trên form, không phải trắng trang hay alert.
4. Trong lúc chờ (có thể giả lập mạng chậm bằng tab Network của F12) → nút bị disable.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/pages/login/Login.tsx
```

## 📝 Commit message
```
feat: call real login API with error handling
```

## 🔀 PR title
```
[Task 09] Wire Login form to real API
```
