# Hướng dẫn Git cho Frontend Tasks

Tài liệu này dành cho người **không rành code**, làm theo từng bước — chỉ cần copy đúng lệnh vào terminal, đổi đúng chỗ ghi `<...>` bằng thông tin thật của bạn.

Áp dụng cho mọi task trong `docs/frontend-tasks/tasks/`.

---

## 0. Trước khi bắt đầu bất kỳ task nào

Luôn đảm bảo máy bạn đang có code **mới nhất** từ `main` trước khi tạo nhánh mới, tránh làm việc trên code cũ/thiếu.

```bash
cd đường-dẫn-tới-repo/warehouse-management-system
git checkout main
git pull origin main
```

Nếu lệnh `git pull` báo lỗi "divergent branches" hoặc tương tự, dừng lại, đừng tự đoán — chụp màn hình hỏi lại trước khi tiếp tục (tránh mất code).

---

## 1. Tạo nhánh mới cho task

Đặt tên nhánh theo mẫu: `feature/frontend-task-<số-task>-<mô-tả-ngắn>`

Ví dụ, làm Task 13 (mở rộng types):

```bash
git checkout -b feature/frontend-task-13-mo-rong-types
```

Ví dụ làm gộp nhiều task liên tiếp (ví dụ task 1-3):

```bash
git checkout -b feature/frontend-task-01-03
```

> 💡 Không bắt buộc đúng tuyệt đối cú pháp tên nhánh, nhưng **nên có số task** để cả nhóm nhìn tên nhánh là biết đang làm gì.

---

## 2. Làm task

- Mở đúng file task tương ứng trong `docs/frontend-tasks/tasks/Stage-X/`.
- Copy prompt trong `docs/frontend-tasks/prompts/Stage-X/<số-task>.txt`, dán code thật vào chỗ `[DÁN NỘI DUNG ... VÀO ĐÂY]`, gửi cho AI.
- Nhận code AI trả về, lưu đè vào đúng file trong repo (theo đúng đường dẫn file task ghi rõ).

---

## 3. Kiểm tra trước khi commit (rất quan trọng — đừng bỏ qua)

Trong thư mục `apps/frontend`:

```bash
cd apps/frontend
npm run lint
npm run build
```

Nếu cả 2 lệnh chạy xong **không báo lỗi màu đỏ** → mới sang bước tiếp theo.
Nếu báo lỗi, copy nguyên đoạn lỗi gửi cho AI để sửa tiếp, đừng commit code đang lỗi.

---

## 4. `git add`, `git commit`

Quay lại thư mục gốc repo:

```bash
cd đường-dẫn-tới-repo/warehouse-management-system
```

Xem những file nào đã thay đổi:

```bash
git status
```

Thêm đúng những file liên quan tới task đang làm (không dùng `git add .` một cách mù quáng nếu không chắc mọi thay đổi đều thuộc về task này):

```bash
git add apps/frontend/src/đường-dẫn-file-đã-sửa.tsx
```

Commit — dùng **đúng commit message** ghi sẵn trong file task (mục "Commit message gợi ý" hoặc tương tự), ví dụ:

```bash
git commit -m "feat: add router and Layout wrapper (Sidebar + Topbar + Outlet)"
```

> Nếu 1 nhánh làm nhiều task liên tiếp, cứ `add` + `commit` riêng từng task — mỗi lần 1 commit, giữ lịch sử rõ ràng, dễ tra lại sau này.

---

## 5. Đẩy nhánh lên GitHub

```bash
git push origin tên-nhánh-của-bạn
```

Ví dụ:

```bash
git push origin feature/frontend-task-13-mo-rong-types
```

Lần đầu push nhánh mới, Git có thể nhắc thêm `-u`:

```bash
git push -u origin feature/frontend-task-13-mo-rong-types
```

(chỉ cần thêm `-u` ở lần push đầu tiên của nhánh đó; các lần sau chỉ cần `git push`)

---

## 6. Kiểm tra CI chạy qua chưa

Vào GitHub → tab **Actions** → tìm đúng lần chạy ứng với nhánh/commit vừa push → chờ tới khi thấy dấu ✅ xanh ở cả `Backend CI` (nếu có sửa backend) và `Frontend CI` (nếu có sửa frontend).

Nếu thấy ❌ đỏ, bấm vào xem log lỗi, copy gửi AI để sửa tiếp trước khi merge.

---

## 7. Merge vào `main`

Nhóm mình **không dùng Pull Request bắt buộc** — merge trực tiếp bằng lệnh, miễn CI đã xanh ở bước 6:

```bash
git checkout main
git pull origin main
git merge tên-nhánh-của-bạn
git push origin main
```

> ⚠️ Luôn `git pull origin main` trước khi merge — phòng trường hợp trong lúc bạn làm task, có người khác đã merge việc khác vào `main` rồi.

---

## 8. Dọn nhánh sau khi đã merge xong (không bắt buộc, nhưng nên làm)

```bash
git branch -d tên-nhánh-của-bạn
git push origin --delete tên-nhánh-của-bạn
```

---

## Tóm tắt nhanh (cheat sheet copy 1 lần)

```bash
# 0. Cập nhật main
git checkout main
git pull origin main

# 1. Tạo nhánh
git checkout -b feature/frontend-task-XX-mo-ta

# 2-3. (Làm task, kiểm tra build/lint trong apps/frontend)

# 4. Commit
git add <file-đã-sửa>
git commit -m "<commit message theo file task>"

# 5. Push nhánh
git push -u origin feature/frontend-task-XX-mo-ta

# 6. Kiểm tra CI xanh trên tab Actions (GitHub)

# 7. Merge vào main
git checkout main
git pull origin main
git merge feature/frontend-task-XX-mo-ta
git push origin main

# 8. Dọn nhánh
git branch -d feature/frontend-task-XX-mo-ta
git push origin --delete feature/frontend-task-XX-mo-ta
```

---

## Xử lý sự cố thường gặp

| Tình huống | Cách xử lý |
|---|---|
| `git pull` báo "divergent branches" | Chạy `git log --oneline -5` và `git log --oneline origin/main -5` so sánh, gửi ảnh hỏi trước khi tự ý `reset --hard` |
| `git push` báo bị từ chối (rejected) | Có thể `main` trên GitHub đã có commit mới hơn — chạy `git pull origin main` trước, xử lý conflict nếu có, rồi push lại |
| Commit nhầm vào `main` thay vì nhánh riêng | Báo ngay, đừng tự sửa — dễ làm rối lịch sử git |
| Không nhớ đang ở nhánh nào | Chạy `git branch` — nhánh có dấu `*` ở đầu là nhánh hiện tại |
| Build/lint lỗi sau khi AI sửa code | Copy nguyên lỗi gửi AI, đừng commit khi còn lỗi đỏ |
