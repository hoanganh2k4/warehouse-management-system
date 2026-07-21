# Task 96 [BACKEND] — Unit test cho `SlotScoringService` (hàng nặng, hàng tiêu chuẩn, tie-break Slot 1)

## 🎯 Mục tiêu
Viết bộ unit test cho `SlotScoringService` để khoá lại đúng 2 hành vi vừa sửa ở Task 94 + 95 (hàng nặng ưu
tiên level thấp, Slot 1 được lấp trước khi điểm ngang nhau), đồng thời xác nhận hàng tiêu chuẩn **không bị
ảnh hưởng** — tránh việc sau này có người sửa lại code làm hỏng 2 hành vi này mà không hay biết.

**Điều kiện tiên quyết: Task 94 và Task 95 đã merge.**

## 📖 Giải thích nghiệp vụ
Đây là loại thuật toán rất dễ bị "sửa hỏng" âm thầm về sau (không có test, chỉ đổi 1 con số trọng số là có
thể lệch hoàn toàn hành vi mà không ai phát hiện ra cho tới khi nhân viên kho báo lỗi lại — đúng như tình
huống ban đầu dẫn tới các Task 94/95 này). Viết test rõ ràng, dễ đọc, dùng dữ liệu giả lập tối giản (không
cần DB thật — mock `PrismaService`).

## 🧠 Giải thích NestJS/Jest cần biết
- `SlotScoringService` không có dependency ngoài `PrismaService` — mock method `prisma.slot.findMany` để
  trả về danh sách slot giả lập theo từng kịch bản test, không cần kết nối DB thật.
- Dùng `Test.createTestingModule` chuẩn NestJS (xem lại cách viết ở `categories.service.spec.ts` từ Task 88
  nếu đã có, để đồng bộ style test trong dự án).

## 📖 Các file cần đọc trước
- `apps/backend/src/common/services/slot-scoring.service.ts` (bản đã sửa xong Task 94 + 95)
- `apps/backend/src/categories/categories.service.spec.ts` (từ Task 88, tham khảo style viết test hiện có
  trong dự án, nếu đã tồn tại)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/backend/src/common/services/slot-scoring.service.spec.ts`

## 📂 File KHÔNG được sửa
- `slot-scoring.service.ts` — task này chỉ viết test, không sửa lại code (nếu phát hiện bug khi viết test,
  ghi chú lại và báo trước khi tự sửa, không âm thầm đổi logic)

## 🔌 API cần dùng
Không có — test gọi trực tiếp method của service, không qua HTTP.

## 🪜 Các bước thực hiện
1. Tạo file `slot-scoring.service.spec.ts`, setup `TestingModule` với `SlotScoringService` và
   `PrismaService` mock (chỉ cần mock `slot.findMany`).
2. Viết helper tạo slot giả lập (factory function) để không lặp lại code trong từng test case, tham số gồm:
   `id, code, levelNumber, maxCapacity, usedCapacity, distanceToGate, outboundFrequencyScore`.
3. **Test case 1 — Hàng nặng ưu tiên level thấp**: 2 slot cùng rack, khác level (level 1 và level 2), level
   2 có `distanceToGate` thấp hơn hẳn (gần cổng hơn) để nếu KHÔNG có ưu tiên level thì slot level 2 sẽ thắng
   theo điểm D. Gọi `findBestSlots` với product `isHeavy: true` — assert slot level 1 phải được xếp trước
   (dù distanceToGate kém hơn).
4. **Test case 2 — Hàng tiêu chuẩn không bị ảnh hưởng**: dùng lại đúng 2 slot ở test case 1, gọi
   `findBestSlots` với product `isHeavy: false` — assert slot có `distanceToGate` thấp hơn (level 2) được
   xếp trước, đúng hành vi gốc trước khi có Task 94.
5. **Test case 3 — Slot 1 lấp trước khi điểm ngang nhau**: 3 slot cùng level (S01, S02, S03), điểm gần bằng
   nhau (chênh distanceToGate rất nhỏ, trong ngưỡng epsilon 0.02) — assert thứ tự trả về đúng là S01, S02,
   S03.
6. **Test case 4 — Không tie-break khi điểm chênh lệch rõ ràng**: 2 slot cùng level, slot mã lớn hơn (S02)
   có `distanceToGate` tốt hơn NHIỀU (chênh điểm vượt ngưỡng epsilon) — assert S02 vẫn được xếp trước S01
   (không bị ép theo mã slot).
7. **Test case 5 — Không tie-break khi khác level dù điểm gần bằng nhau**: 2 slot khác level, điểm gần bằng
   nhau — assert thứ tự vẫn theo điểm số (không áp dụng so sánh mã slot).
8. Chạy `npm run test --workspace=backend -- slot-scoring.service.spec`, toàn bộ pass.

## 💻 Ví dụ code (khung sườn test)
```ts
import { Test } from '@nestjs/testing';
import { SlotScoringService } from './slot-scoring.service';
import { PrismaService } from '../../prisma.service';

function makeSlot(opts: {
  id: string;
  code: string;
  levelNumber: number;
  maxCapacity: number;
  usedCapacity?: number;
  distanceToGate: number;
  outboundFrequencyScore?: number;
}) {
  return {
    id: opts.id,
    code: opts.code,
    maxCapacity: opts.maxCapacity,
    usedCapacity: opts.usedCapacity ?? 0,
    availableCapacity: opts.maxCapacity - (opts.usedCapacity ?? 0),
    distanceToGate: opts.distanceToGate,
    outboundFrequencyScore: opts.outboundFrequencyScore ?? 0,
    currentProductId: null,
    currentProduct: null,
    level: { levelNumber: opts.levelNumber },
    inventories: [],
  };
}

describe('SlotScoringService', () => {
  let service: SlotScoringService;
  const prismaMock = { slot: { findMany: jest.fn() } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SlotScoringService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(SlotScoringService);
  });

  it('hàng nặng ưu tiên level thấp dù level cao gần cổng hơn', async () => {
    const level1 = makeSlot({ id: '1', code: 'S01', levelNumber: 1, maxCapacity: 100, distanceToGate: 50 });
    const level2 = makeSlot({ id: '2', code: 'S01', levelNumber: 2, maxCapacity: 100, distanceToGate: 5 });
    prismaMock.slot.findMany.mockResolvedValue([level1, level2]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: true } as any,
      10,
      new Date('2027-01-01'),
    );

    expect(result[0].id).toBe('1'); // level 1 phải thắng dù distanceToGate kém hơn
  });

  it('hàng tiêu chuẩn không bị ảnh hưởng, vẫn ưu tiên distanceToGate', async () => {
    const level1 = makeSlot({ id: '1', code: 'S01', levelNumber: 1, maxCapacity: 100, distanceToGate: 50 });
    const level2 = makeSlot({ id: '2', code: 'S01', levelNumber: 2, maxCapacity: 100, distanceToGate: 5 });
    prismaMock.slot.findMany.mockResolvedValue([level1, level2]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: false } as any,
      10,
      new Date('2027-01-01'),
    );

    expect(result[0].id).toBe('2'); // hành vi gốc: gần cổng hơn thắng
  });

  it('Slot 1 được lấp trước Slot 2, Slot 3 khi điểm gần bằng nhau', async () => {
    const s1 = makeSlot({ id: '1', code: 'S01', levelNumber: 1, maxCapacity: 100, distanceToGate: 10 });
    const s2 = makeSlot({ id: '2', code: 'S02', levelNumber: 1, maxCapacity: 100, distanceToGate: 10.1 });
    const s3 = makeSlot({ id: '3', code: 'S03', levelNumber: 1, maxCapacity: 100, distanceToGate: 10.2 });
    prismaMock.slot.findMany.mockResolvedValue([s3, s1, s2]); // cố tình xáo trộn thứ tự đầu vào

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: false } as any,
      10,
      new Date('2027-01-01'),
    );

    expect(result.map((r) => r.code)).toEqual(['S01', 'S02', 'S03']);
  });
});
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/96.txt`

## ✅ Checklist nghiệm thu
- ☐ Đủ 5 test case như liệt kê ở mục "Các bước thực hiện"
- ☐ Toàn bộ test pass với code đã sửa ở Task 94 + 95
- ☐ Chạy thử trên code TRƯỚC khi có Task 94/95 (checkout lại bản cũ tạm thời) — ít nhất test case 1 và 3
  phải FAIL, để chứng minh test thực sự khoá đúng hành vi mới (không phải test "vô nghĩa" pass với mọi
  code)
- ☐ `npm run test --workspace=backend -- slot-scoring.service.spec` pass toàn bộ
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Viết test quá lỏng lẻo** (ví dụ chỉ assert `result.length > 0`) → không thực sự khoá được hành vi, sau
  này code bị sửa hỏng mà test vẫn pass. Phải assert đúng thứ tự/đúng id slot được chọn.
- **Quên tạo `inventories: []`** trong slot giả lập → hàm `computeFefoScore` bên trong `computeScore` có thể
  lỗi runtime nếu code đang đọc `slot.inventories` mà không có field này.
- **Dùng ngưỡng chênh lệch `distanceToGate` quá lớn ở test case 3** (Slot 1/2/3 lấp gần nhau) → vô tình vượt
  ngưỡng `SCORE_TIE_EPSILON`, test không còn kiểm tra đúng nhánh tie-break nữa mà lại kiểm tra nhánh so điểm
  bình thường — phải tính tay để đảm bảo chênh lệch điểm thực sự nhỏ hơn 0.02.

## 🔄 Cách test
```
cd apps/backend
npm run test -- slot-scoring.service.spec
```
Toàn bộ test phải pass, không có test nào bị skip.

## 🔙 Cách rollback nếu sai
```
rm apps/backend/src/common/services/slot-scoring.service.spec.ts
```

## 📝 Commit message
```
test(slot-scoring): add unit tests for heavy-product level priority and slot-1 tie-break
```

## 🔀 PR title
```
[Task 96] Unit tests for slot scoring: heavy goods + slot fill order
```
