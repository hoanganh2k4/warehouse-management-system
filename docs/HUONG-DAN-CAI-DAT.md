# Hướng dẫn cài đặt từ con số 0

Tài liệu này hướng dẫn cài đặt môi trường phát triển **Smart Warehouse Management System (WMS)** trên **Windows + WSL2 (Ubuntu)** từ đầu, dành cho người mới chưa cài gì.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Cài phần mềm trên Windows](#2-cài-phần-mềm-trên-windows)
3. [Khởi động lại máy](#3-khởi-động-lại-máy)
4. [Cấu hình Docker Desktop](#4-cấu-hình-docker-desktop)
5. [Cài đặt trong Ubuntu (WSL)](#5-cài-đặt-trong-ubuntu-wsl)
6. [Clone mã nguồn](#6-clone-mã-nguồn)
7. [Khởi động hạ tầng Docker](#7-khởi-động-hạ-tầng-docker)
8. [Cài đặt dự án](#8-cài-đặt-dự-án)
9. [Chạy ứng dụng](#9-chạy-ứng-dụng)
10. [Kiểm tra hoạt động](#10-kiểm-tra-hoạt-động)
11. [Xử lý sự cố thường gặp](#11-xử-lý-sự-cố-thường-gặp)

---

## 1. Tổng quan

### Yêu cầu hệ thống

| Thành phần | Ghi chú |
|---|---|
| Hệ điều hành | Windows 10/11 (64-bit) |
| RAM | Tối thiểu 8 GB (khuyến nghị 16 GB) |
| Ổ cứng trống | Tối thiểu 10 GB |
| Quyền admin | Cần để cài WSL, Docker |

### Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js (NestJS) |
| Database | PostgreSQL 17 |
| Cache | Redis 7 |
| Quản lý DB | pgAdmin 4 |

### Luồng cài đặt tóm tắt

```
Microsoft Store (Terminal, Ubuntu, Docker Desktop)
        ↓
Cài Git + VS Code → Restart máy
        ↓
Bật WSL Integration trong Docker Desktop
        ↓
Ubuntu: clone repo → cài Node.js 22 → docker compose up
        ↓
npm install → Prisma migrate & seed
        ↓
Chạy frontend + backend (2 terminal)
```

---

## 2. Cài phần mềm trên Windows

### Bước 2.1 — Mở Microsoft Store

Nhấn phím `Windows`, gõ **Microsoft Store** và mở ứng dụng.

### Bước 2.2 — Cài các ứng dụng từ Store

Tìm và cài lần lượt:

| Ứng dụng | Mục đích |
|---|---|
| **Windows Terminal** | Terminal hiện đại, hỗ trợ nhiều tab |
| **Ubuntu** | Môi trường Linux (WSL2) để chạy lệnh phát triển |
| **Docker Desktop** | Chạy PostgreSQL, Redis, pgAdmin bằng Docker |

> Sau khi cài **Ubuntu**, mở ứng dụng Ubuntu lần đầu để hoàn tất cài đặt WSL. Hệ thống sẽ yêu cầu tạo **username** và **password** cho Linux — hãy ghi nhớ.

### Bước 2.3 — Cài Git

Tải và cài Git cho Windows:

- Trang chính thức: [https://git-scm.com/download/win](https://git-scm.com/download/win)

Trong quá trình cài, giữ các tùy chọn mặc định là được.

Kiểm tra sau khi cài (mở **PowerShell** hoặc **Windows Terminal**):

```powershell
git --version
```

### Bước 2.4 — Cài Visual Studio Code

Tải và cài VS Code:

- Trang chính thức: [https://code.visualstudio.com/](https://code.visualstudio.com/)

Khuyến nghị cài thêm extension:

- **WSL** — làm việc trực tiếp với code trong Ubuntu
- **Docker** — quản lý container từ VS Code

---

## 3. Khởi động lại máy

Sau khi cài xong Terminal, Ubuntu, Docker Desktop, Git và VS Code:

1. Lưu công việc đang làm
2. **Restart** máy tính

Việc restart giúp WSL2 và Docker Desktop hoạt động ổn định.

---

## 4. Cấu hình Docker Desktop

### Bước 4.1 — Mở Docker Desktop

Sau khi restart, mở **Docker Desktop** từ Start Menu. Đợi đến khi trạng thái hiển thị **Docker is running**.

### Bước 4.2 — Bật WSL Integration (Resources)

1. Mở **Docker Desktop**
2. Vào **Settings** (biểu tượng bánh răng)
3. Chọn **Resources** → **WSL Integration**
4. Bật:
   - **Enable integration with my default WSL distro**
   - Bật riêng cho **Ubuntu**
5. Nhấn **Apply & Restart**

### Bước 4.3 — Kiểm tra Docker trong Ubuntu

Mở **Windows Terminal**, chọn tab **Ubuntu**, chạy:

```bash
docker --version
docker compose version
```

Nếu hiện phiên bản (ví dụ `Docker version 27.x`, `Docker Compose version v2.x`) là thành công.

---

## 5. Cài đặt trong Ubuntu (WSL)

Mở **Windows Terminal** → tab **Ubuntu**, chạy lần lượt:

### Bước 5.1 — Cập nhật hệ thống

```bash
sudo apt update
sudo apt upgrade -y
```

### Bước 5.2 — Cài các gói cơ bản

```bash
sudo apt install -y curl git build-essential
```

> Lưu ý: Không cần dùng `apt install nodejs` nếu bạn sẽ cài Node.js qua **nvm** (khuyến nghị, để có đúng phiên bản 22).

### Bước 5.3 — Cài NVM (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Nạp lại cấu hình shell:

```bash
source ~/.bashrc
```

Kiểm tra nvm:

```bash
nvm --version
```

### Bước 5.4 — Cài Node.js 22

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

Kiểm tra:

```bash
node -v    # v22.x.x
npm -v     # 10.x.x
```

---

## 6. Clone mã nguồn

Trong terminal Ubuntu, chọn thư mục làm việc (ví dụ `~/projects`):

```bash
mkdir -p ~/projects
cd ~/projects
```

Clone repository:

```bash
git clone https://github.com/hoanganh2k4/warehouse-management-system.git
cd warehouse-management-system
```

### Tạo file môi trường

```bash
cp .env.example .env
```

File `.env` mặc định đã cấu hình sẵn cho môi trường local:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_wms"
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 7. Khởi động hạ tầng Docker

Đứng tại **thư mục gốc** của dự án (`warehouse-management-system`):

```bash
docker compose up -d
```

Kiểm tra container đang chạy:

```bash
docker ps
```

Kết quả mong đợi — 3 container:

| Container | Mô tả | Port |
|---|---|---|
| `smart-wms-postgres` | PostgreSQL 17 | 5432 |
| `smart-wms-pgadmin` | Giao diện quản lý DB | 5050 |
| `smart-wms-redis` | Redis cache | 6379 |

### Thông tin đăng nhập PostgreSQL

| Thuộc tính | Giá trị |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `smart_wms` |
| Username | `postgres` |
| Password | `postgres` |

### Truy cập pgAdmin (tùy chọn)

Mở trình duyệt: [http://localhost:5050](http://localhost:5050)

| Thuộc tính | Giá trị |
|---|---|
| Email | `admin@smartwms.com` |
| Password | `admin` |

Để kết nối server PostgreSQL trong pgAdmin:

| Trường | Giá trị |
|---|---|
| Name | `Smart WMS Local` |
| Host | `postgres` *(không dùng localhost)* |
| Port | `5432` |
| Database | `smart_wms` |
| Username | `postgres` |
| Password | `postgres` |

---

## 8. Cài đặt dự án

### Bước 8.1 — Cài dependencies (thư mục gốc)

```bash
cd ~/projects/warehouse-management-system
npm install
```

> Dự án dùng **npm workspaces** — lệnh `npm install` ở thư mục gốc sẽ cài dependency cho cả `frontend` và `backend`.

### Bước 8.2 — Thiết lập database (backend)

```bash
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npm run seed
cd ../..
```

Giải thích từng lệnh:

| Lệnh | Mục đích |
|---|---|
| `prisma generate` | Tạo Prisma Client từ schema |
| `prisma migrate deploy` | Áp dụng migration vào PostgreSQL |
| `npm run seed` | Nạp dữ liệu mẫu ban đầu |

---

## 9. Chạy ứng dụng

Cần **2 tab terminal** (hoặc 2 cửa sổ terminal) Ubuntu, cả hai đều đứng tại thư mục gốc dự án:

```bash
cd ~/projects/warehouse-management-system
```

### Tab 1 — Backend

```bash
npm run backend
```

Backend chạy tại: [http://localhost:3000](http://localhost:3000)

### Tab 2 — Frontend

```bash
npm run frontend
```

Frontend chạy tại: [http://localhost:5173](http://localhost:5173) (port mặc định của Vite)

> Frontend tự proxy request `/api` sang backend `http://localhost:3000`.

---

## 10. Kiểm tra hoạt động

| Dịch vụ | URL | Trạng thái mong đợi |
|---|---|---|
| Frontend | [http://localhost:5173](http://localhost:5173) | Giao diện React hiển thị |
| Backend API | [http://localhost:3000](http://localhost:3000) | API phản hồi |
| Swagger (nếu bật) | [http://localhost:3000/api](http://localhost:3000/api) | Tài liệu API |
| pgAdmin | [http://localhost:5050](http://localhost:5050) | Trang đăng nhập pgAdmin |

Kiểm tra nhanh container:

```bash
docker ps
```

Kiểm tra phiên bản công cụ:

```bash
node -v
npm -v
git --version
docker --version
```

---

## 11. Xử lý sự cố thường gặp

### Docker không chạy được trong WSL

- Mở **Docker Desktop** trên Windows, đợi trạng thái **running**
- Kiểm tra lại **Settings → Resources → WSL Integration → Ubuntu** đã bật
- Restart Docker Desktop

### Lỗi `port is already allocated` (port bị chiếm)

Kiểm tra process đang dùng port (ví dụ 5432):

```bash
sudo lsof -i :5432
```

Hoặc dừng container cũ:

```bash
docker compose down
docker compose up -d
```

### Lỗi kết nối database khi chạy Prisma

Đảm bảo PostgreSQL container đang chạy:

```bash
docker ps | grep postgres
docker compose logs postgres
```

Đợi container healthy rồi chạy lại:

```bash
cd apps/backend
npx prisma migrate deploy
npm run seed
```

### `nvm: command not found`

```bash
source ~/.bashrc
# hoặc mở terminal Ubuntu mới
```

### Reset database và seed lại từ đầu

```bash
cd apps/backend
npx prisma migrate reset --force
npm run seed
```

> Cảnh báo: Lệnh này **xóa toàn bộ dữ liệu** trong database local.

### Dừng toàn bộ hạ tầng Docker

```bash
docker compose down
```

Xóa cả dữ liệu persistent (volume):

```bash
docker compose down -v
```

---

## Lệnh tham khảo nhanh

```bash
# === Một lần khi setup ===
git clone https://github.com/hoanganh2k4/warehouse-management-system.git
cd warehouse-management-system
cp .env.example .env
docker compose up -d
npm install
cd apps/backend && npx prisma generate && npx prisma migrate deploy && npm run seed && cd ../..

# === Mỗi lần phát triển ===
docker compose up -d          # nếu container chưa chạy
npm run backend               # tab 1
npm run frontend              # tab 2
```

---

## Tài liệu liên quan

- [00-docker-setup.md](./00-docker-setup.md) — Chi tiết Docker & pgAdmin (tiếng Anh)
- [01-project-setup.md](./01-project-setup.md) — Project setup (tiếng Anh)
- [README.md](../README.md) — Mô tả nghiệp vụ và kiến trúc hệ thống
