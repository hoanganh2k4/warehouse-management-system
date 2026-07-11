# 📦 WMS – Hệ Thống Quản Lý Kho Thông Minh
### (Sữa hộp & Bánh đóng gói)

> Website quản lý kho có thuật toán tối ưu vị trí lưu trữ, áp dụng FEFO khi xuất kho, công cụ tìm kiếm trung tâm và sơ đồ kho trực quan (Interactive Warehouse Map).

---

## Mục lục

1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Đối tượng sử dụng & phân quyền](#2-đối-tượng-sử-dụng--phân-quyền)
3. [Cấu trúc kho vật lý](#3-cấu-trúc-kho-vật-lý)
4. [Mô hình lưu trữ hàng hóa](#4-mô-hình-lưu-trữ-hàng-hóa)
5. [Thuật toán nhập kho – gợi ý vị trí](#5-thuật-toán-nhập-kho--gợi-ý-vị-trí)
6. [Thuật toán xuất kho – FEFO & Picking List](#6-thuật-toán-xuất-kho--fefo--picking-list)
7. [Sơ đồ kho trực quan (Warehouse Map)](#7-sơ-đồ-kho-trực-quan-warehouse-map)
8. [Search Engine (Công cụ tìm kiếm)](#8-search-engine-công-cụ-tìm-kiếm)
9. [Dashboard & Báo cáo](#9-dashboard--báo-cáo)
10. [Danh sách chức năng (Modules)](#10-danh-sách-chức-năng-modules)
11. [Cơ sở dữ liệu (Database Schema)](#11-cơ-sở-dữ-liệu-database-schema)
12. [Công nghệ đề xuất (Tech Stack)](#12-công-nghệ-đề-xuất-tech-stack)
13. [Đánh giá đồ án](#13-đánh-giá-đồ-án)

---

## 1. Giới thiệu tổng quan

### Mục tiêu

Xây dựng website quản lý kho cho **sữa hộp và bánh đóng gói**, nhằm:

- Quản lý nhập kho
- Quản lý xuất kho
- Theo dõi tồn kho theo thời gian thực
- **Tối ưu vị trí lưu kho** bằng thuật toán tính điểm (Scoring Algorithm)
- Giảm thời gian tìm kiếm hàng hóa bằng **Search Engine** trung tâm
- Áp dụng **FEFO** (First Expired, First Out) khi xuất kho
- Trực quan hóa toàn bộ kho qua **sơ đồ kho tương tác**

### Điểm nổi bật của đồ án

- Không chỉ là CRUD đơn thuần mà có **thuật toán tối ưu vị trí lưu kho** (đã chuẩn hóa toán học).
- Phạm vi vừa phải, tập trung vào 2 nhóm hàng (sữa, bánh) nhưng vẫn mô phỏng đúng nghiệp vụ WMS thực tế.
- Có Dashboard, biểu đồ trực quan, phân quyền người dùng, lịch sử thao tác.
- Có **Search Engine** dùng chung cho tra cứu công khai và highlight trên sơ đồ kho.
- Có **Interactive Warehouse Map** – điểm nhấn giúp hệ thống "ra chất" WMS chuyên nghiệp.
- Có **Picking List** chi tiết hỗ trợ nhân viên lấy hàng nhanh, đúng thứ tự.

### Công nghệ đề xuất

`React` (Frontend) + `Node.js` (Backend) + `PostgreSQL` (Database)

---

## 2. Đối tượng sử dụng & phân quyền

| Vai trò | Quyền hạn |
|---|---|
| **Quản lý** | Quản lý sản phẩm, quản lý vị trí, xem báo cáo, xem lịch sử, quản lý tài khoản |
| **Nhân viên kho** | Nhập hàng, xuất hàng, xác nhận vị trí, di chuyển hàng |
| **Public** (không cần đăng nhập) | Tra cứu mã hàng, tên hàng, vị trí, tồn kho, HSD, xem sơ đồ kho |

---

## 3. Cấu trúc kho vật lý

Kho được tổ chức theo mô hình phân cấp 4 tầng:

```
Warehouse A
├── Zone A
│   ├── Rack 01
│   │   ├── Level 1
│   │   │   └── Slot 01
```

### Quy mô mô phỏng

| Thành phần | Số lượng |
|---|---|
| Zone | 5 |
| Rack / Zone | 20 |
| Level / Rack | 5 |
| Slot / Level | 10 |
| **Tổng số Slot** | **5 × 20 × 5 × 10 = 5.000 vị trí** |

Quy mô này đủ lớn để mô phỏng một kho thực tế, nhưng vẫn nằm trong khả năng triển khai của một đồ án môn học.

---

## 4. Mô hình lưu trữ hàng hóa

### Nguyên tắc

- ✔ Một **Slot** chỉ chứa **1 SKU** duy nhất.
- ✔ Một **SKU** có thể có **nhiều Batch** (theo từng lần nhập, mỗi lô có HSD khác nhau).
- ✔ Một **Batch** có thể được chia ra **nhiều Slot** (nếu số lượng vượt sức chứa 1 Slot).

### Ví dụ minh họa

| SKU | Batch | Slot | Số lượng |
|---|---|---|---|
| Sữa Vinamilk 180ml | Batch 001 | A01 | 100 hộp |
| Sữa Vinamilk 180ml | Batch 001 | A02 | 80 hộp |
| Sữa Vinamilk 180ml | Batch 002 | A05 | 150 hộp |

Mô hình này khá giống với cách các hệ thống WMS thực tế quản lý tồn kho theo lô (batch-tracking).

---

## 5. Thuật toán nhập kho – gợi ý vị trí

Đây là phần lõi và là điểm nhấn kỹ thuật của đồ án.

### Bước 1 – Lọc các Slot hợp lệ (Điều kiện bắt buộc)

Thuật toán **chỉ xét** các Slot thỏa mãn **tất cả** điều kiện sau:

- Còn sức chứa (chưa đầy).
- Đúng loại hàng (sữa hoặc bánh, không trộn lẫn).
- Nếu Slot đã có hàng thì hàng mới phải **cùng SKU**.
- Tuân thủ quy tắc **hàng nặng ưu tiên ở tầng thấp**.
- Không vượt sức chứa tối đa của Slot.

> 👉 Lọc điều kiện cứng trước giúp thuật toán hợp lý hơn việc chỉ cộng điểm thuần túy.

### Bước 2 – Chuẩn hóa & tính điểm (Score) cho các Slot hợp lệ

Các thành phần trong công thức tính điểm có đơn vị/thang đo khác nhau (mét, %, lần/ngày...) nên **không thể cộng trực tiếp** — cần chuẩn hóa từng thành phần về khoảng **[0, 1]** trước khi cộng theo trọng số.

| Ký hiệu | Ý nghĩa | Công thức chuẩn hóa |
|---|---|---|
| **D** | Điểm khoảng cách (Distance) | `D = 1 - (distance / maxDistance)` → Slot càng gần cửa, D càng cao |
| **F** | Điểm phù hợp FEFO (FEFO Compatibility) | Đã nằm trong khoảng [0, 1] – đo mức độ thuận tiện khi sau này áp dụng FEFO (ví dụ: Slot trống hoàn toàn hoặc cùng SKU có HSD gần nhau sẽ có F cao) |
| **C** | Điểm sức chứa còn trống (Capacity) | `C = available_capacity / max_capacity` |
| **O** | Điểm tần suất xuất (Outbound Frequency) | `O = frequency / maxFrequency` |

Sau khi chuẩn hóa, áp dụng công thức tính điểm cuối cùng:

```
Final Score = 0.4 × D + 0.3 × F + 0.2 × C + 0.1 × O
```

> 💡 `maxDistance`, `maxFrequency` là giá trị lớn nhất quan sát được trong tập Slot hợp lệ tại thời điểm tính toán (hoặc một giá trị cấu hình cố định của kho), dùng để đưa mọi thành phần về cùng thang đo [0, 1] trước khi cộng có trọng số. Cách làm này đảm bảo công thức **đúng về mặt toán học** thay vì cộng trực tiếp các đại lượng có đơn vị khác nhau.

### Bước 3 – Sắp xếp và chọn

```
Sort giảm dần theo Final Score
        ↓
Chọn Slot có điểm cao nhất
        ↓
Nhân viên xác nhận
```

### ⚠️ Lưu ý quan trọng – Tách biệt FEFO và thuật toán nhập kho

**FEFO không dùng để quyết định vị trí khi nhập kho**, mà chỉ dùng để quyết định **thứ tự xuất kho**.

Khi **nhập kho**, thuật toán chỉ nên dựa vào:

- Khoảng cách
- Sức chứa còn lại
- Tần suất xuất của SKU
- Quy tắc hàng nặng ở tầng thấp
- Mức sử dụng của Slot
- Ưu tiên lưu cùng SKU để giảm phân tán (nếu còn chỗ)

Việc tách rõ "nhập kho dùng Score" và "xuất kho dùng FEFO" giúp đúng với nghiệp vụ quản lý kho thực tế và giúp phần thuyết trình chặt chẽ hơn.

---

## 6. Thuật toán xuất kho – FEFO & Picking List

Khi xuất kho, hệ thống **không dùng Score**, chỉ áp dụng **FEFO (First Expired, First Out)**:

```
SKU → Batch (theo FEFO) → Slot
```

### Quy tắc chọn Batch

Sắp xếp các Batch theo HSD tăng dần, luôn xuất Batch có HSD gần nhất trước:

```
Batch A (HSD 10/08) → Batch B (HSD 20/08) → Batch C (HSD 30/08)
```

Hệ thống sẽ luôn ưu tiên xuất theo thứ tự: **10/08 → 20/08 → 30/08**.

### Quy tắc chọn Slot khi 1 Batch nằm ở nhiều Slot

Nếu một Batch được lưu ở nhiều Slot khác nhau, hệ thống ưu tiên lấy hàng từ **Slot gần cửa xuất nhất** trước.

### Quy trình xuất kho tổng quát

```
Nhập đơn hàng
      ↓
Hệ thống chọn Batch (theo FEFO)
      ↓
Hệ thống chọn Slot (gần cửa xuất nhất)
      ↓
In Picking List
      ↓
Xuất kho
```

### 6.1. Picking List (Phiếu lấy hàng) — mô tả chi tiết

`Picking List` là phiếu hướng dẫn nhân viên kho biết chính xác cần lấy **SKU nào, ở Batch nào, tại Slot nào, số lượng bao nhiêu**, được sinh tự động ngay sau khi hệ thống áp dụng FEFO cho đơn hàng.

```
Order (Đơn hàng)
      ↓
SKU
      ↓
Batch (theo FEFO)
      ↓
Slot (gần cửa xuất nhất)
      ↓
Qty (số lượng cần lấy)
      ↓
Route (lộ trình di chuyển tối ưu giữa các Slot)
```

**Ví dụ nội dung Picking List:**

| SKU | Batch | Slot | Số lượng cần lấy | Thứ tự lấy (Route) |
|---|---|---|---|---|
| VINA001 | VN250601 | A-R03-L02-S05 | 50 hộp | 1 |
| VINA001 | VN250620 | A-R03-L02-S08 | 30 hộp | 2 |
| CRACK002 | CK250515 | B-R01-L01-S02 | 20 gói | 3 |

Nhân viên kho chỉ cần di chuyển theo đúng thứ tự **Route** trong phiếu để lấy hàng nhanh nhất, không cần tự tìm vị trí hay tự quyết định lấy batch nào trước.

> 💡 **Route** có thể tính đơn giản bằng cách sắp xếp các Slot trong Picking List theo `distance_to_gate` tăng dần, để nhân viên di chuyển theo lộ trình gần như một đường thẳng, tránh đi qua lại nhiều lần trong kho.

---

## 7. Sơ đồ kho trực quan (Warehouse Map)

> Module được đề xuất bổ sung – tạo điểm nhấn lớn cho đồ án, giúp hệ thống "ra chất" WMS chuyên nghiệp mà không quá khó triển khai.

### Mục đích

Hiển thị trực quan trạng thái các vị trí lưu kho, giúp nhân viên dễ tìm hàng và quản lý dễ theo dõi tình trạng sử dụng kho.

### 7.1. Xem sơ đồ kho

Có thể hiển thị theo 2 dạng:

**Dạng cây (Tree view):**

```
Warehouse A
├── Zone A
│   ├── Rack 01
│   │   ├── Level 1
│   │   │   ├── Slot 01
│   │   │   ├── Slot 02
│   │   │   └── ...
```

**Dạng lưới trực quan (Grid view) – khuyến nghị sử dụng:**

```
Zone A – Rack 01

L5  🟩 🟩 🟥 🟩 🟩
L4  🟩 🟥 🟥 🟩 🟩
L3  🟩 🟨 🟨 🟩 🟥
L2  🟩 🟩 🟩 🟥 🟥
L1  🟩 🟩 🟩 🟩 🟨
     S1  S2  S3  S4  S5
```

### 7.2. Bảng màu trạng thái Slot

| Màu | Trạng thái | Dựa trên |
|---|---|---|
| 🟩 | Trống | `occupancy_rate = 0%` |
| 🟨 | Đang sử dụng (chưa đầy) | `0% < occupancy_rate < 100%` |
| 🟥 | Đầy | `occupancy_rate = 100%` |
| 🟪 | Có hàng sắp hết hạn (ví dụ dưới 30 ngày) | Batch trong Slot có HSD gần đến hạn |

### 7.3. Popup thông tin khi click vào Slot

Khi nhấn vào một Slot, hiển thị popup chi tiết, ví dụ:

```
Vị trí: A-R05-L02-S03
Loại hàng: Sữa
SKU: VINA001
Tên: Vinamilk Có Đường 180ml
Batch: VN250601
HSD: 20/08/2026
Số lượng: 120 hộp
Sức chứa: 200 hộp
Độ lấp đầy: 60%
```

### 7.4. Kết hợp với Search Engine

Khi người dùng tìm kiếm (xem chi tiết tại [Mục 8](#8-search-engine-công-cụ-tìm-kiếm)), kết quả trả về (danh sách Slot) sẽ được gửi sang module này để **tự động highlight** đúng vị trí trên sơ đồ kho (đổi màu xanh dương hoặc hiệu ứng nhấp nháy), giúp nhân viên không cần đọc mã vị trí rồi tự tìm thủ công.

### 7.5. Kết hợp với thuật toán gợi ý vị trí khi nhập kho

```
Nhập SKU → Nhập Batch → Nhập HSD → Nhập số lượng
      ↓
Thuật toán tính Final Score
      ↓
Đề xuất: Zone B – Rack 08 – Level 2 – Slot S07
```

Sơ đồ kho sẽ **highlight Slot được đề xuất**, nhân viên chỉ cần nhấn **Xác nhận** để lưu vào hệ thống.

> 💡 **Gợi ý đặt tên:** thay vì gọi đơn giản là "Sơ đồ kho", có thể đặt tên module này là **Interactive Warehouse Map** hoặc **Warehouse Visualization** để tạo điểm nhấn khi thuyết trình.

---

## 8. Search Engine (Công cụ tìm kiếm)

Hệ thống cần một **công cụ tìm kiếm trung tâm**, dùng chung cho cả khu vực Public (tra cứu) và khu vực nội bộ (nhân viên/quản lý) — không chỉ là tìm kiếm tên đơn giản, mà phải truy vết được từ SKU đến tận vị trí vật lý.

### Luồng xử lý tìm kiếm

```
Search (từ khóa: mã hàng / tên hàng)
      ↓
SKU (tìm trong bảng products)
      ↓
Product (lấy thông tin sản phẩm)
      ↓
Batch (lấy tất cả batch còn tồn của SKU đó)
      ↓
Slot (lấy tất cả vị trí đang lưu các batch trên)
      ↓
Highlight (đánh dấu vị trí trên sơ đồ kho)
```

### Mô tả chi tiết từng bước

1. **Search** – người dùng nhập mã hàng hoặc tên hàng (nên hỗ trợ tìm gần đúng, không phân biệt hoa/thường, có gợi ý autocomplete).
2. **SKU** – hệ thống tìm SKU khớp trong bảng `products`.
3. **Product** – trả về thông tin chi tiết: tên, loại hàng (sữa/bánh), hình ảnh nếu có.
4. **Batch** – truy vấn bảng `batches` để lấy toàn bộ các lô còn tồn của SKU đó, sắp xếp theo HSD tăng dần.
5. **Slot** – truy vấn bảng `inventory` để biết các batch trên đang nằm ở Slot nào, còn bao nhiêu hàng.
6. **Highlight** – gửi danh sách Slot kết quả sang module **Sơ đồ kho (Mục 7)** để tô màu/nhấp nháy đúng các vị trí tìm được.

### Phạm vi áp dụng

| Khu vực | Có thể tìm kiếm theo |
|---|---|
| Public (không đăng nhập) | Mã hàng, tên hàng → xem vị trí, tồn kho, HSD |
| Nhân viên kho / Quản lý | Mã hàng, tên hàng, mã Batch, mã Slot → hỗ trợ nhập/xuất/di chuyển hàng nhanh hơn |

> 💡 Search Engine này chính là "cầu nối" giữa **Module Tra cứu công khai** và **Module Sơ đồ kho** — nên xây dựng dùng chung **một API tìm kiếm duy nhất** cho cả hai khu vực, tránh viết 2 luồng tìm kiếm riêng biệt gây trùng logic.

---

## 9. Dashboard & Báo cáo

### Chỉ số KPI hiển thị trên Dashboard

- Tổng số SKU
- Tổng số Batch
- Tổng số Slot
- Số Slot đã dùng / Slot trống
- Công suất kho (%) — tính từ `occupancy_rate` trung bình của toàn kho
- Số lượng hàng sắp hết hạn
- Số lượng nhập kho hôm nay
- Số lượng xuất kho hôm nay

### Biểu đồ trực quan

| Loại biểu đồ | Nội dung |
|---|---|
| Pie Chart | Công suất sử dụng kho |
| Bar Chart | Tồn kho theo từng SKU |
| Line Chart | Số lượng xuất kho theo ngày |

### Báo cáo

- Báo cáo tồn kho
- Báo cáo công suất kho
- Báo cáo hàng sắp hết hạn

---

## 10. Danh sách chức năng (Modules)

| STT | Module | Mô tả |
|---|---|---|
| 1 | Đăng nhập | Dành cho Quản lý và Nhân viên kho |
| 2 | Quản lý tài khoản | Phân quyền người dùng |
| 3 | Quản lý sản phẩm | Quản lý SKU, loại hàng (sữa/bánh) |
| 4 | Quản lý Batch | Quản lý lô hàng, HSD |
| 5 | Quản lý vị trí lưu kho | Zone, Rack, Level, Slot |
| 6 | Nhập kho | Gợi ý vị trí bằng thuật toán Scoring (đã chuẩn hóa) |
| 7 | Xuất kho | Áp dụng FEFO, tạo Picking List |
| 8 | Di chuyển hàng | Chuyển hàng giữa các Slot, có log |
| 9 | Tra cứu công khai | Tìm theo mã/tên hàng, xem vị trí, tồn kho, HSD (không cần đăng nhập) |
| 10 | Dashboard | Hiển thị KPI và biểu đồ |
| 11 | Báo cáo | Tồn kho, công suất, hàng sắp hết hạn |
| 12 | Lịch sử thao tác | Lịch sử nhập, xuất, di chuyển hàng |
| 13 | Sơ đồ kho (Warehouse Map) | Hiển thị trạng thái kho, highlight vị trí tìm kiếm và vị trí gợi ý |
| 14 | **Search Engine** | Công cụ tìm kiếm trung tâm: Search → SKU → Batch → Slot → Highlight, dùng chung cho Module 9 và Module 13 |

---

## 11. Cơ sở dữ liệu (Database Schema)

Hệ thống đề xuất gồm **11 bảng** chính:

```
users, roles, products, batches,
warehouse, zones, racks, levels, slots,
inventory, transactions
```

### Chi tiết các bảng (đề xuất)

#### `roles`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| name | varchar | Quản lý / Nhân viên kho |
| description | text | |

#### `users`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| username | varchar | |
| password_hash | varchar | |
| full_name | varchar | |
| role_id | FK → roles | |
| created_at | timestamp | |

#### `products` (SKU)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| sku_code | varchar | Mã hàng, unique |
| name | varchar | Tên sản phẩm |
| category | enum | `milk` / `cracker` (sữa/bánh) |
| unit | varchar | Đơn vị tính (hộp, gói...) |
| is_heavy | boolean | Cờ đánh dấu hàng nặng → ưu tiên tầng thấp |
| created_at | timestamp | |

#### `batches`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| product_id | FK → products | |
| batch_code | varchar | Mã lô |
| manufacture_date | date | Ngày sản xuất |
| expiry_date | date | HSD – dùng cho FEFO |
| created_at | timestamp | |

#### `warehouse`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| name | varchar | |
| address | varchar | |

#### `zones`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| warehouse_id | FK → warehouse | |
| code | varchar | Ví dụ: Zone A |

#### `racks`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| zone_id | FK → zones | |
| code | varchar | Ví dụ: Rack 01 |

#### `levels`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| rack_id | FK → racks | |
| level_number | int | Ví dụ: 1–5 (1 = thấp nhất) |

#### `slots`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| level_id | FK → levels | |
| code | varchar | Ví dụ: S01 |
| max_capacity | int | Sức chứa tối đa |
| used_capacity | int | Sức chứa đang sử dụng (tổng số lượng hàng hiện có trong Slot) |
| available_capacity | int | `= max_capacity - used_capacity` → dùng để tính điểm Capacity (C) |
| occupancy_rate | float | `= used_capacity / max_capacity × 100` (%) → dùng cho Dashboard & quyết định màu trên Sơ đồ kho (🟩🟨🟥) |
| current_product_id | FK → products (nullable) | Đảm bảo 1 Slot chỉ 1 SKU |
| distance_to_gate | float | Dùng để tính điểm Distance (D) và Route trong Picking List |
| outbound_frequency_score | float | Cập nhật định kỳ theo lịch sử xuất, dùng để tính điểm Outbound (O) |

> ⚙️ `used_capacity`, `available_capacity` và `occupancy_rate` nên được **tự động cập nhật** (qua trigger hoặc tầng service) mỗi khi có giao dịch nhập/xuất/di chuyển ghi vào bảng `inventory`, để Dashboard và Sơ đồ kho luôn hiển thị đúng theo thời gian thực mà không cần tính toán lại từ đầu mỗi lần truy vấn.

#### `inventory`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| batch_id | FK → batches | |
| slot_id | FK → slots | |
| quantity | int | Số lượng tại slot này |
| updated_at | timestamp | |

> Bảng này đáp ứng yêu cầu **một Batch có thể nằm ở nhiều Slot** và **một Slot biết đang chứa Batch/SKU nào**.

#### `transactions`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | PK | |
| type | enum | `import` / `export` / `move` |
| batch_id | FK → batches | |
| slot_from_id | FK → slots (nullable) | Dùng khi xuất/di chuyển |
| slot_to_id | FK → slots (nullable) | Dùng khi nhập/di chuyển |
| quantity | int | |
| user_id | FK → users | Người thực hiện |
| created_at | timestamp | |
| note | text | |

> Bảng này lưu toàn bộ lịch sử nhập, xuất và di chuyển hàng, phục vụ Module Lịch sử thao tác và Báo cáo.

---

## 12. Công nghệ đề xuất (Tech Stack)

| Thành phần | Công nghệ |
|---|---|
| Frontend | React |
| Backend | Node.js |
| Database | PostgreSQL |
| Biểu đồ | Chart.js / Recharts (cho Dashboard) |
| Sơ đồ kho | SVG / Canvas hoặc lưới HTML-CSS Grid (cho Warehouse Map) |
| Tìm kiếm | API tìm kiếm dùng chung (Search Engine nội bộ) — có thể dùng full-text search của PostgreSQL (`pg_trgm` / `tsvector`) cho tìm gần đúng |

---

