import { Injectable } from '@nestjs/common';
import { Product, Slot } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';

export interface ScoredSlot extends Slot {
  score: number;
  availableCapacity: number;
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

    const scored: ScoredSlot[] = valid.map((slot) => ({
      ...slot,
      score: this.computeScore(
        slot,
        product,
        incomingExpiry,
        maxDistance,
        maxFrequency,
      ),
    }));

    scored.sort((a, b) => b.score - a.score);

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
      slot.currentProduct.category !== product.category
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
    },
    _product: Product,
    incomingExpiry: Date,
    maxDistance: number,
    maxFrequency: number,
  ): number {
    const D = 1 - slot.distanceToGate / maxDistance;
    const C = slot.availableCapacity / slot.maxCapacity;
    const O = slot.outboundFrequencyScore / maxFrequency;
    const F = this.computeFefoScore(slot, incomingExpiry);

    return 0.4 * D + 0.3 * F + 0.2 * C + 0.1 * O;
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
