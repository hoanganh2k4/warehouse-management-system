import { Injectable } from '@nestjs/common';
import { Product, Slot } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';

// Ngưỡng dung sai khi so điểm 2 slot: chênh lệch nhỏ hơn mức này được coi là
// "ngang điểm", chuyển sang so mã slot thay vì để sai số nhỏ tự quyết định.
const SCORE_TIE_EPSILON = 0.02;

// Mã slot dạng "S01", "S02"... — phải trích phần SỐ ra để so sánh, so chuỗi
// trực tiếp sẽ sai (vd "S10" < "S2" theo thứ tự chuỗi, nhưng 10 > 2).
function extractSlotNumber(code: string): number {
  const digits = code.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export interface ScoredSlot extends Slot {
  score: number;
  availableCapacity: number;
  level: { levelNumber: number };
}

@Injectable()
export class SlotScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async findBestSlots(
    product: Product,
    quantity: number,
    incomingExpiry: Date,
  ): Promise<{ slot: Slot; allocateQty: number; score: number }[]> {
    const slots = await this.prisma.slot.findMany({
      where: { availableCapacity: { gt: 0 } },
      include: {
        currentProduct: true,
        level: true,
        inventories: { include: { batch: true } },
      },
    });

    const valid = slots.filter((slot) => this.isValidSlot(slot, product));

    if (valid.length === 0) return [];

    const maxDistance = Math.max(...valid.map((s) => s.distanceToGate), 1);
    const maxFrequency = Math.max(
      ...valid.map((s) => s.outboundFrequencyScore),
      1,
    );
    const maxLevelNumber = Math.max(
      ...valid.map((s) => s.level.levelNumber),
      1,
    );

    const scored: ScoredSlot[] = valid.map((slot) => ({
      ...slot,
      score: this.computeScore(
        slot,
        product,
        incomingExpiry,
        maxDistance,
        maxFrequency,
        maxLevelNumber,
      ),
    }));

    scored.sort((a, b) => {
      // Nếu slot đang chứa đúng sản phẩm cần nhập, ưu tiên lấp phần dung lượng
      // còn lại trước để tránh dàn cùng SKU sang quá nhiều slot.
      const aHasSameProduct = a.currentProductId === product.id;
      const bHasSameProduct = b.currentProductId === product.id;

      if (aHasSameProduct !== bHasSameProduct) {
        return aHasSameProduct ? -1 : 1;
      }

      // Ngoài ưu tiên gom cùng SKU, vẫn giữ nguyên thuật toán chấm điểm:
      // hàng tiêu chuẩn ưu tiên khoảng cách/FEFO/dung lượng/tần suất; hàng nặng
      // ưu tiên level thấp. Mã S01 chỉ dùng để phân xử khi hai slot cùng level
      // và điểm gần như ngang nhau, đúng yêu cầu Task 95.
      const scoreDiff = b.score - a.score;
      const sameLevel = a.level.levelNumber === b.level.levelNumber;

      if (sameLevel && Math.abs(scoreDiff) < SCORE_TIE_EPSILON) {
        return extractSlotNumber(a.code) - extractSlotNumber(b.code);
      }

      return scoreDiff;
    });

    const allocations: { slot: Slot; allocateQty: number; score: number }[] =
      [];
    let remaining = quantity;

    for (const slot of scored) {
      if (remaining <= 0) break;
      const allocateQty = Math.min(remaining, slot.availableCapacity);
      allocations.push({ slot, allocateQty, score: slot.score });
      remaining -= allocateQty;
    }

    return allocations;
  }

  private isValidSlot(
    slot: Slot & {
      currentProduct: Product | null;
      level: { levelNumber: number };
      inventories: { batch: { expiryDate: Date; productId: string } }[];
    },
    product: Product,
  ): boolean {
    if (slot.availableCapacity <= 0) return false;

    if (slot.currentProductId && slot.currentProductId !== product.id) {
      return false;
    }

    if (
      slot.currentProduct &&
      slot.currentProduct.categoryId !== product.categoryId
    ) {
      return false;
    }

    if (product.isHeavy && slot.level.levelNumber > 2) {
      return false;
    }

    return true;
  }

  private computeScore(
    slot: Slot & {
      currentProduct: Product | null;
      inventories: { batch: { expiryDate: Date } }[];
      level: { levelNumber: number };
    },
    product: Product,
    incomingExpiry: Date,
    maxDistance: number,
    maxFrequency: number,
    maxLevelNumber: number,
  ): number {
    const D = 1 - slot.distanceToGate / maxDistance;
    const C = slot.availableCapacity / slot.maxCapacity;
    const O = slot.outboundFrequencyScore / maxFrequency;
    const F = this.computeFefoScore(slot, incomingExpiry);
    const L = this.computeLevelScore(slot.level.levelNumber, maxLevelNumber);

    if (product.isHeavy) {
      return 0.5 * L + 0.2 * D + 0.2 * F + 0.1 * C;
    }
    return 0.4 * D + 0.3 * F + 0.2 * C + 0.1 * O;
  }

  // Level càng thấp, điểm càng cao — chỉ có ý nghĩa với hàng nặng (isHeavy).
  // Nếu chỉ có 1 level hợp lệ (maxLevelNumber <= 1) thì trả thẳng 1, tránh
  // chia cho 0 làm NaN lan ra toàn bộ điểm số.
  private computeLevelScore(
    levelNumber: number,
    maxLevelNumber: number,
  ): number {
    if (maxLevelNumber <= 1) return 1;
    return 1 - (levelNumber - 1) / (maxLevelNumber - 1);
  }

  private computeFefoScore(
    slot: Slot & { inventories: { batch: { expiryDate: Date } }[] },
    incomingExpiry: Date,
  ): number {
    if (!slot.currentProductId || slot.inventories.length === 0) return 1;

    const slotExpiries = slot.inventories.map((i) =>
      i.batch.expiryDate.getTime(),
    );
    const avgExpiry =
      slotExpiries.reduce((a, b) => a + b, 0) / slotExpiries.length;
    const daysDiff =
      Math.abs(incomingExpiry.getTime() - avgExpiry) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 7) return 1;
    if (daysDiff <= 30) return 0.7;
    return 0.3;
  }
}
