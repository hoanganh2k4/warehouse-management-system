# Task 43 — Hook `useDashboard()`

**Nhóm:** E – Dashboard
**Thời lượng ước tính:** 1 giờ
**File:** `apps/frontend/src/hooks/useDashboard.ts` (tạo mới)
**Phụ thuộc:** Task 42 (`dashboard.service.ts`)

## Bối cảnh

Theo đúng convention của `useProducts.ts` (Task 15): hook tự quản lý `loading`/`error`,
gọi service trong `useEffect`, trả về `refetch` để component chủ động load lại
(ví dụ sau khi nhập/xuất kho ở trang Inventory, người dùng quay lại Dashboard).
Dashboard không cần polling tự động như Products — chỉ fetch 1 lần khi mount + khi `refetch()` được gọi.


## Yêu cầu

1. Tạo hook `useDashboard()` không nhận tham số.
2. State: `summary: DashboardSummary | null`, `loading: boolean`, `error: string | null`.
3. Gọi `dashboardService.getSummary()` trong `useEffect` khi mount.
4. Trả về `{ summary, loading, error, refetch }`, `refetch` set lại một `reloadToken` để trigger gọi lại.
5. Bắt lỗi bằng try/catch (hoặc `.catch`), set `error` bằng `err.message` nếu có, fallback `'Đã có lỗi xảy ra'`.

## Không được làm

- Không thêm polling/`setInterval` — Dashboard chỉ cần load khi vào trang, khác Products.
- Không gọi `dashboardService` trực tiếp trong component — mọi component chỉ được dùng qua hook này.
- Không xử lý JSX/UI trong file này — hook thuần logic.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Hook tồn tại, đúng signature `useDashboard(): { summary, loading, error, refetch }`.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Viết 1 component test tạm (hoặc dùng React DevTools) xác nhận `loading` chuyển `true → false` sau khi có data.

## Cách tự kiểm tra

Tạo tạm 1 route test gọi `console.log` giá trị hook trả về, xác nhận đúng 10 field sau khi load xong, rồi xoá route test đó trước khi nộp.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-6/43.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
