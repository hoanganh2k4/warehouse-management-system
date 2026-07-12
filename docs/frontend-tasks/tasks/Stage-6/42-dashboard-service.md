# Task 42 — `dashboard.service.ts`: hàm `getSummary()`

**Nhóm:** E – Dashboard
**Thời lượng ước tính:** 1 giờ
**File:** `apps/frontend/src/services/dashboard.service.ts` (tạo mới)
**Phụ thuộc:** Task 06 (`api-client.ts`), Task 11 (auth interceptor — endpoint này cần Bearer token)

## Bối cảnh

Backend đã có sẵn `GET /dashboard/summary` (`DashboardController`, không có `@Public()`
→ **bắt buộc phải đăng nhập**, khác với Product list vốn public).
Response thật (`SUCCESS_EXAMPLES.dashboard`):

```json
{
  "success": true,
  "data": {
    "products": 4,
    "batches": 8,
    "totalSlots": 5000,
    "availableSlots": 4980,
    "occupiedSlots": 20,
    "occupancyPercent": 0,
    "inventory": 4300,
    "expiringSoon": 2,
    "inboundToday": 200,
    "outboundToday": 50
  }
}
```
`apiClient` đã tự bóc `{success, data}` nên hàm chỉ cần trả thẳng kết quả của `apiClient.get()`.


## Yêu cầu

1. Thêm type `DashboardSummary` vào `types.ts` với đúng 10 field ở trên (kiểu `number` cho tất cả).
2. Tạo `apps/frontend/src/services/dashboard.service.ts`, export `dashboardService.getSummary(): Promise<DashboardSummary>`.
3. Gọi `GET /dashboard/summary` qua `apiClient` (không tự thêm `/api`, baseURL đã cấu hình).
4. Không truyền param nào — endpoint này không nhận query string.

## Không được làm

- Không tự tính toán lại `occupancyPercent` ở frontend — backend đã tính sẵn, chỉ hiển thị.
- Không gọi `fetch()` trực tiếp, bắt buộc dùng `apiClient` đã có interceptor gắn token.
- Không xử lý loading/error trong service — đó là việc của hook ở Task 43.

## Kết quả kỳ vọng (Definition of Done)

- [ ] File `dashboard.service.ts` tồn tại, export `dashboardService.getSummary`.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử `dashboardService.getSummary()` (đã đăng nhập) trả về đúng object 10 field ở trên.
- [ ] Gọi thử khi CHƯA đăng nhập → phải nhận lỗi 401 (xác nhận token thật sự bắt buộc).

## Cách tự kiểm tra

Backend chạy `npm run start:dev`. Đăng nhập trước (Task 09) để có token trong localStorage, sau đó gọi hàm trong console DevTools và so sánh field trả về với response mẫu ở trên.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-6/42.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
