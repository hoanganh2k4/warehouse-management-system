# Deploy miễn phí: Backend (Render) + Frontend (Vercel) + Database (Neon)

## 🏗️ Kiến trúc tổng quan

```
GitHub repo (monorepo)
│
├── apps/backend  ──push──▶ Render (Web Service, free)  ──▶ Neon PostgreSQL (free)
│
└── apps/frontend ──push──▶ Vercel (Static, free)
                              │
                              └── vercel.json rewrite /api/* ──▶ Render backend
```

- **CI (kiểm tra chất lượng):** GitHub Actions tự chạy lint + build + test mỗi khi có Pull Request hoặc push vào `main`. Đây là 2 file `.github/workflows/backend-ci.yml` và `frontend-ci.yml`.
- **CD (tự động deploy):** Render và Vercel tự kết nối trực tiếp với GitHub repo — mỗi lần code mới được merge vào `main`, cả 2 tự build và deploy lại, không cần thao tác tay.
- Tất cả đều **miễn phí**, không cần thẻ tín dụng (trừ hạn chế nêu ở mục "Giới hạn cần biết" bên dưới).

---

## Bước 1 — Tạo Database miễn phí trên Neon

1. Vào https://neon.tech → **Sign up** (dùng GitHub cho nhanh).
2. Tạo project mới, đặt tên ví dụ `smart-wms`.
3. Vào tab **Connection Details** (hoặc **Dashboard**), chọn:
   - Connection type: **Direct connection** (KHÔNG chọn "Pooled connection" — app này chạy như 1 server thường trực trên Render, không phải serverless function, nên không cần PgBouncer).
   - Copy chuỗi kết nối, dạng:
     ```
     postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
     ```
4. Giữ lại chuỗi này — sẽ dán vào Render ở Bước 2.

📌 Giới hạn free: 0.5 GB lưu trữ/project, không giới hạn thời gian (không tự xoá như 1 số nền tảng khác), đủ dùng cho dự án học tập/demo.

---

## Bước 2 — Deploy Backend (NestJS) lên Render

Repo đã có sẵn file `render.yaml` (Blueprint) ở thư mục gốc, tự khai báo toàn bộ cấu hình.

1. Push toàn bộ code (bao gồm `render.yaml`, `.github/workflows/*`, các thay đổi trong `apps/backend/src/main.ts`) lên GitHub nếu chưa push.
2. Vào https://dashboard.render.com → **New** → **Blueprint**.
3. Chọn repo GitHub của dự án → Render tự đọc `render.yaml` và hiện preview 1 Web Service tên `smart-wms-backend`.
4. Bấm **Apply**/**Deploy Blueprint**.
5. Sau khi service được tạo, vào tab **Environment** của `smart-wms-backend`, điền 2 biến còn thiếu (đánh dấu `sync: false` trong `render.yaml` nên Render sẽ hỏi bạn nhập tay):
   - `DATABASE_URL` = chuỗi kết nối Neon ở Bước 1.
   - `FRONTEND_URL` = để trống trước, quay lại điền sau khi có domain Vercel ở Bước 3.
6. Chờ build xong (vài phút). Khi status là **Live**, mở `https://<tên-service>.onrender.com/api/health` — thấy `{ "status": "ok", ... }` là backend đã chạy.
7. Vào `https://<tên-service>.onrender.com/api-docs` để xem Swagger UI (danh sách API).

📌 Giới hạn free của Render:
- Service "ngủ" sau 15 phút không có ai gọi, request đầu tiên sau đó sẽ chậm ~30-60 giây để "thức dậy" — bình thường, không phải lỗi.
- Tổng cộng 750 giờ chạy free/tháng cho cả workspace — nếu chỉ chạy 1 backend service thì dư sức chạy 24/7 cả tháng.

---

## Bước 3 — Deploy Frontend (React + Vite) lên Vercel

1. Sửa file `apps/frontend/vercel.json`, thay `smart-wms-backend.onrender.com` bằng domain thật của Render ở Bước 2, ví dụ:
   ```json
   "destination": "https://smart-wms-backend-xxxx.onrender.com/api/$1"
   ```
   Commit + push thay đổi này lên `main`.
2. Vào https://vercel.com → **Add New** → **Project** → chọn repo GitHub.
3. Ở bước cấu hình:
   - **Root Directory:** bấm Edit, chọn `apps/frontend`.
   - **Framework Preset:** Vercel tự nhận diện Vite.
   - **Build Command:** `npm run build` (mặc định, giữ nguyên).
   - **Output Directory:** `dist` (mặc định).
4. Bấm **Deploy**. Sau khi xong, Vercel cho 1 domain dạng `https://<tên-project>.vercel.app`.
5. Quay lại Render (Bước 2), điền biến `FRONTEND_URL` = domain Vercel này, rồi **Manual Deploy** lại backend 1 lần để áp dụng CORS.

Từ giờ, mỗi lần push code mới vào `main`:
- Render tự build + deploy lại backend.
- Vercel tự build + deploy lại frontend, đồng thời tạo **Preview Deployment** riêng cho mỗi Pull Request (rất tiện để review trước khi merge).

📌 Vì sao không cần sửa code gọi API? Nhờ `vercel.json` proxy `/api/*` sang Render, nên `apiClient` trong frontend (Task 06) chỉ cần gọi `baseURL: '/api'` y hệt lúc chạy `npm run dev` ở máy — không cần phân biệt local/production.

---

## Bước 4 — Bật CI bắt buộc trước khi merge (khuyến nghị)

Để không ai merge code lỗi vào `main` (kéo theo deploy lỗi):

1. Vào GitHub repo → **Settings** → **Branches** → **Add branch protection rule**.
2. Branch name pattern: `main`.
3. Tick **Require status checks to pass before merging**, chọn 2 check: `Backend CI` và `Frontend CI` (chỉ hiện ra sau khi 2 workflow đã chạy ít nhất 1 lần).
4. Tick **Require a pull request before merging**.
5. Save.

Từ giờ, mọi thay đổi phải qua Pull Request + CI xanh mới được merge → mới trigger deploy.

---

## Luồng làm việc hằng ngày cho team

```
1. Tạo nhánh mới từ main (ví dụ: task-13-mo-rong-types)
2. Code + commit + push nhánh đó lên GitHub
3. Mở Pull Request vào main
   → GitHub Actions tự chạy Backend CI / Frontend CI (tuỳ file đổi)
   → Vercel tự tạo Preview Deployment kèm link xem thử
4. Review, sửa nếu CI đỏ
5. Merge vào main
   → Render tự deploy lại backend (nếu đổi apps/backend/**)
   → Vercel tự deploy lại frontend (nếu đổi apps/frontend/**)
```

---

## Troubleshooting thường gặp

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Frontend gọi API bị lỗi CORS | Chưa điền `FRONTEND_URL` trên Render, hoặc điền sai domain | Kiểm tra đúng domain Vercel (kể cả `https://`), Manual Deploy lại backend |
| Trang trắng / gọi `/api/...` trả về HTML | `vercel.json` chưa trỏ đúng domain Render | Sửa lại `destination` trong `vercel.json`, push lại |
| Backend "Live" nhưng `/api/health` lỗi 502 | Sai `DATABASE_URL`, hoặc migrate thất bại lúc start | Xem tab **Logs** trên Render, kiểm tra lại chuỗi kết nối Neon |
| Request đầu tiên rất chậm (~30-60s) | Render free service bị "ngủ" do 15 phút không ai gọi | Bình thường với free tier, không phải lỗi |
| Backend CI báo lỗi migrate | Migration mới có vấn đề | Chạy `npx prisma migrate dev` ở local trước khi push để phát hiện sớm |

---

## Bí mật (Secrets) cần biết

Dự án này **không cần khai báo GitHub Secrets** cho việc deploy, vì Render và Vercel tự kết nối trực tiếp với GitHub (không đi qua GitHub Actions để deploy). GitHub Actions chỉ dùng để **kiểm tra chất lượng code (CI)**, không cần token của Render/Vercel.
