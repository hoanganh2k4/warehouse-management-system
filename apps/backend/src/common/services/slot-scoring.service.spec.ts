import { Test } from '@nestjs/testing';
import { SlotScoringService } from './slot-scoring.service';
import { PrismaService } from '../../prisma.service';

// Factory tạo 1 slot giả lập cho test, không cần DB thật.
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

  it('[Task 94] hàng nặng ưu tiên level thấp dù level cao gần cổng hơn', async () => {
    const level1 = makeSlot({
      id: '1',
      code: 'S01',
      levelNumber: 1,
      maxCapacity: 100,
      distanceToGate: 50,
    });
    const level2 = makeSlot({
      id: '2',
      code: 'S01',
      levelNumber: 2,
      maxCapacity: 100,
      distanceToGate: 5,
    });
    prismaMock.slot.findMany.mockResolvedValue([level1, level2]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: true } as any,
      10,
      new Date('2027-01-01'),
    );

    // Level 1 phải thắng dù distanceToGate kém hơn hẳn level 2.
    expect(result[0].slot.id).toBe('1');
  });

  it('[Task 94] hàng tiêu chuẩn không bị ảnh hưởng, vẫn ưu tiên distanceToGate', async () => {
    const level1 = makeSlot({
      id: '1',
      code: 'S01',
      levelNumber: 1,
      maxCapacity: 100,
      distanceToGate: 50,
    });
    const level2 = makeSlot({
      id: '2',
      code: 'S01',
      levelNumber: 2,
      maxCapacity: 100,
      distanceToGate: 5,
    });
    prismaMock.slot.findMany.mockResolvedValue([level1, level2]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: false } as any,
      10,
      new Date('2027-01-01'),
    );

    // Hành vi gốc (trước Task 94): slot gần cổng hơn (level 2) vẫn thắng.
    expect(result[0].slot.id).toBe('2');
  });

  it('[Task 95] Slot 1 được lấp trước Slot 2, Slot 3 khi điểm gần bằng nhau', async () => {
    // Chú ý: distanceToGate KHÔNG tăng dần theo đúng thứ tự mã slot (S02 cố
    // tình có điểm nhỉnh hơn S01 một chút) — nếu không có tie-break (code
    // cũ trước Task 95), thứ tự tự nhiên theo điểm sẽ là S02, S01, S03 (SAI
    // với mong muốn nghiệp vụ). Chỉ khi có tie-break đúng, kết quả mới được
    // ép về đúng thứ tự mã slot S01, S02, S03 — nhờ vậy test này thực sự
    // phân biệt được code cũ (chưa sửa) và code mới (đã sửa Task 95).
    const s1 = makeSlot({
      id: '1',
      code: 'S01',
      levelNumber: 1,
      maxCapacity: 4,
      distanceToGate: 10.15,
    });
    const s2 = makeSlot({
      id: '2',
      code: 'S02',
      levelNumber: 1,
      maxCapacity: 4,
      distanceToGate: 10.05,
    });
    const s3 = makeSlot({
      id: '3',
      code: 'S03',
      levelNumber: 1,
      maxCapacity: 4,
      distanceToGate: 10.2,
    });
    // Cố tình xáo trộn thứ tự đầu vào để chắc chắn kết quả không phải do
    // "tình cờ" đầu vào đã đúng thứ tự sẵn.
    prismaMock.slot.findMany.mockResolvedValue([s3, s1, s2]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: false } as any,
      10,
      new Date('2027-01-01'),
    );

    expect(result.map((r) => r.slot.code)).toEqual(['S01', 'S02', 'S03']);
  });

  it('[Task 95] KHÔNG tie-break khi điểm chênh lệch rõ ràng (vượt ngưỡng epsilon)', async () => {
    const s01 = makeSlot({
      id: '1',
      code: 'S01',
      levelNumber: 1,
      maxCapacity: 100,
      distanceToGate: 50,
    });
    const s02 = makeSlot({
      id: '2',
      code: 'S02',
      levelNumber: 1,
      maxCapacity: 100,
      distanceToGate: 5,
    });
    prismaMock.slot.findMany.mockResolvedValue([s01, s02]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: false } as any,
      10,
      new Date('2027-01-01'),
    );

    // S02 gần cổng hơn HẲN (chênh điểm > 0.02) → vẫn thắng dù mã lớn hơn S01.
    expect(result[0].slot.code).toBe('S02');
  });

  it('[Task 95] KHÔNG tie-break khi khác level dù điểm gần bằng nhau', async () => {
    // Cố tình đặt slot mã LỚN hơn (S02) ở level khác nhưng điểm nhỉnh hơn 1
    // chút — nếu code sai (so mã cả khi khác level) sẽ chọn nhầm S01 vì mã
    // nhỏ hơn; code đúng phải chọn theo điểm, tức S02 thắng.
    const level1CodeS02 = makeSlot({
      id: '1',
      code: 'S02',
      levelNumber: 1,
      maxCapacity: 100,
      distanceToGate: 10,
    });
    const level2CodeS01 = makeSlot({
      id: '2',
      code: 'S01',
      levelNumber: 2,
      maxCapacity: 100,
      distanceToGate: 10.05,
    });
    prismaMock.slot.findMany.mockResolvedValue([
      level2CodeS01,
      level1CodeS02,
    ]);

    const result = await service.findBestSlots(
      { id: 'p1', isHeavy: false } as any,
      10,
      new Date('2027-01-01'),
    );

    // Khác level nên KHÔNG so mã — phải theo điểm, slot id '1' (điểm cao hơn
    // dù mã "lớn hơn") phải đứng trước.
    expect(result[0].slot.id).toBe('1');
  });
});
