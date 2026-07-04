# Task 40 — Lint + Build + kiểm tra Console/Network

**Nhóm:** G – Hoàn thiện
**Thời lượng ước tính:** 1.5 giờ
**File sửa:** Không có — task kiểm tra/dọn dẹp thuần (chỉ sửa nếu lint/build báo lỗi thật)
**Phụ thuộc bắt buộc:** Toàn bộ Task 01–39 đã xong

## Bối cảnh

Task cuối cùng trước khi viết test report (Task 41) — đảm bảo codebase sạch trước khi bàn giao. Không viết thêm feature ở task này.

## Yêu cầu

### 1. Lint

```bash
cd apps/frontend
npm run lint
```

- Sửa mọi lỗi ESLint báo ra. Nếu là warning không quan trọng (ví dụ `react-hooks/exhaustive-deps` ở những chỗ đã cố tình dùng `eslint-disable-next-line` có lý do rõ ràng như trong `useProducts.ts`/`useProductDetail.ts` — xem lại Task 15/25), giữ nguyên comment disable đã có, không xoá.
- Không tắt rule ESLint ở cấp file/project để "cho qua" lỗi — sửa lỗi thật.

### 2. Build

```bash
npm run build
```

Lệnh này chạy `tsc -b && vite build` — nghĩa là **mọi lỗi TypeScript trong toàn bộ dự án** (kể cả những chỗ trước đây chỉ chạy `tsc --noEmit` cục bộ ở từng task) đều phải được phát hiện và sửa ở bước này. Đây là lưới an toàn cuối cùng bắt các lỗi type bị bỏ sót qua từng task nhỏ lẻ.

- Nếu build lỗi, xác định file nào gây lỗi, sửa đúng chỗ đó — không sửa bằng cách ép kiểu `as any` để né lỗi.
- Build thành công phải sinh ra thư mục `dist/` không có warning nghiêm trọng (cảnh báo bundle size lớn có thể bỏ qua, không thuộc scope task này).

### 3. Console — kiểm tra bằng tay qua từng trang

Mở DevTools Console, click qua đủ các luồng chính, xác nhận **không có bất kỳ error nào đỏ** (warning React key, warning `defaultValue`... nếu có phải xử lý; error thật sự — ví dụ `Cannot read properties of undefined` — bắt buộc phải sửa):

- [ ] Trang danh sách (`/`): load, tìm kiếm, đổi trang, đổi sort.
- [ ] Trang chi tiết (`/products/:id`): load thành công, load với id không tồn tại.
- [ ] Trang Login: đăng nhập đúng, đăng nhập sai.
- [ ] Trang Tạo sản phẩm: submit hợp lệ, submit trùng SKU, submit thiếu field.
- [ ] Trang Sửa sản phẩm: load, sửa, submit.
- [ ] Luồng Xoá sản phẩm (từ List hoặc Detail tuỳ Phương án đã chọn ở Task 38).

### 4. Network — kiểm tra không có request thừa

Mở tab Network, xác nhận:

- [ ] Gõ tìm kiếm không gọi API dồn dập từng phím (debounce từ Task 17 hoạt động đúng).
- [ ] Không có request nào gọi lặp vô hạn (nếu thấy request tự động lặp lại liên tục không dừng — thường do `useEffect` thiếu/sai dependency array, quay lại kiểm tra `useProducts.ts`/`useProductDetail.ts`).
- [ ] Request tới các endpoint cần auth (`POST/PUT/DELETE /products`) có header `Authorization: Bearer ...` đính kèm.
- [ ] Không có request gọi tới domain lạ/sai (ví dụ do `baseURL` cấu hình nhầm ở `api-client.ts`).

## Không được làm

- Không thêm feature mới ở task này.
- Không dùng `// eslint-disable` tràn lan để né lỗi lint thay vì sửa nguyên nhân.
- Không dùng `@ts-ignore`/`as any` để né lỗi build.
- Không bỏ qua warning React key (`key` prop thiếu trong `.map()`) — đây là lỗi thật cần sửa nếu phát hiện, dù không chặn build.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npm run lint` chạy sạch, không lỗi (0 error, warning nếu còn phải giải thích được lý do).
- [ ] `npm run build` thành công, không lỗi TypeScript.
- [ ] Đã tick đủ checklist Console ở Mục 3 và Network ở Mục 4.
- [ ] Ghi lại danh sách bug đã phát hiện + đã fix (nếu có) trong PR description, chuẩn bị dữ liệu cho Task 41.

## Prompt AI (copy nguyên văn)

```
Tôi vừa chạy lệnh sau trong thư mục apps/frontend và gặp lỗi/warning dưới đây:

[DÁN OUTPUT THẬT CỦA "npm run lint" HOẶC "npm run build" VÀO ĐÂY]

Đây là nội dung file đang bị báo lỗi (dán đúng file được chỉ ra trong thông báo lỗi):
[DÁN NỘI DUNG FILE LIÊN QUAN VÀO ĐÂY]

Yêu cầu:
1. Giải thích ngắn gọn nguyên nhân gây lỗi/warning này.
2. Sửa đúng nguyên nhân gốc — KHÔNG dùng eslint-disable, @ts-ignore, hay ép kiểu "as any" để né lỗi, trừ khi tôi xác nhận đây là false-positive cần disable có lý do rõ ràng (nếu vậy, giải thích tại sao trước khi đề xuất disable).
3. Chỉ sửa phần code liên quan trực tiếp đến lỗi này, không refactor thêm gì khác trong file.

Trả về đoạn code đã sửa (không cần trả toàn bộ file nếu chỉ sửa 1 đoạn nhỏ, nhưng phải nêu rõ vị trí/dòng để tôi dễ áp dụng).
```
