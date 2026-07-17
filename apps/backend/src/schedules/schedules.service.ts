import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  ScheduleStatus,
  ScheduleType,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { SlotScoringService } from '../common/services/slot-scoring.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { formatSlotLocation } from '../common/utils/location.util';
import { AuthUser } from '../common/decorators/current-user.decorator';
import {
  CreateInboundScheduleDto,
  InboundSuggestionPreviewDto,
} from './dto/inbound-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';

// Kết quả Smart Location Suggestion dùng chung cho cả preview (chưa lưu) và
// lúc tạo lịch (lưu snapshot vào Schedule).
export interface InboundSuggestionResult {
  slotId: string;
  zoneCode: string;
  rackCode: string;
  levelNumber: number;
  slotCode: string;
  slotPath: string;
  capacityBefore: number;
  capacityAfter: number;
  maxCapacity: number;
  score: number; // 0-100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  splitRequired: boolean; // true nếu 1 slot không đủ chứa hết số lượng
}

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotScoring: SlotScoringService,
  ) {}

  // ===================== Smart Location Suggestion (Inbound) =====================

  // Lưu ý: tại thời điểm Đặt lịch, hệ thống CHƯA biết hạn sử dụng (HSD) thực tế
  // của lô hàng sắp nhập (form Đặt lịch nhập không thu thập HSD - theo đúng yêu
  // cầu). SlotScoringService cần 1 mốc "incoming expiry" để tính điểm FEFO phụ
  // (trọng số 0.3/1.0) khi so khớp với các lô cùng SKU đã có trong slot. Ta dùng
  // tạm ngày nhập dự kiến (scheduledDate) làm mốc xấp xỉ; đây chỉ là ước lượng ở
  // bước lập kế hoạch — khi "Thực hiện lịch" (Bước 6), hệ thống sẽ chạy lại toàn
  // bộ thuật toán với dữ liệu batch/HSD thật để chốt vị trí chính thức.
  private async computeInboundSuggestion(
    productId: string,
    quantity: number,
    scheduledDate: Date,
  ): Promise<InboundSuggestionResult> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    const allocations = await this.slotScoring.findBestSlots(
      product,
      quantity,
      scheduledDate,
    );

    if (allocations.length === 0) {
      throw new NotFoundException(
        'Không tìm được vị trí phù hợp để đề xuất (kho có thể đã đầy hoặc không có slot hợp lệ cho sản phẩm này)',
      );
    }

    // Chỉ hiển thị 1 slot chính (đề xuất tốt nhất) trên Card, đúng theo thiết kế UI.
    const top = allocations[0];
    const splitRequired = allocations.length > 1 || top.allocateQty < quantity;

    const slotDetail = await this.prisma.slot.findUniqueOrThrow({
      where: { id: top.slot.id },
      include: {
        level: { include: { rack: { include: { zone: true } } } },
      },
    });

    const capacityBefore = slotDetail.usedCapacity;
    const capacityAfter = capacityBefore + top.allocateQty;
    const score = Math.round(top.score * 100);

    const reasons: string[] = [];
    if (slotDetail.currentProductId === product.id) {
      reasons.push('✓ Cùng SKU với hàng đang lưu trong slot.');
    } else {
      reasons.push('✓ Slot trống, phù hợp để lưu SKU mới.');
    }
    if (!splitRequired) reasons.push('✓ Đủ sức chứa cho toàn bộ số lượng.');
    if (score >= 65) reasons.push('✓ Gần cổng nhập.');
    if (
      slotDetail.maxCapacity > 0 &&
      capacityAfter / slotDetail.maxCapacity <= 0.95
    ) {
      reasons.push('✓ Tỷ lệ sử dụng phù hợp sau khi nhập.');
    }
    if (splitRequired) {
      reasons.push(
        `⚠ Số lượng vượt sức chứa 1 slot, hệ thống sẽ cần dùng thêm ${
          allocations.length - 1
        } vị trí khác khi thực hiện.`,
      );
    }

    const priority: InboundSuggestionResult['priority'] =
      score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';

    return {
      slotId: slotDetail.id,
      zoneCode: slotDetail.level.rack.zone.code,
      rackCode: slotDetail.level.rack.code,
      levelNumber: slotDetail.level.levelNumber,
      slotCode: slotDetail.code,
      slotPath: formatSlotLocation({
        zoneCode: slotDetail.level.rack.zone.code,
        rackCode: slotDetail.level.rack.code,
        levelNumber: slotDetail.level.levelNumber,
        slotCode: slotDetail.code,
      }),
      capacityBefore,
      capacityAfter,
      maxCapacity: slotDetail.maxCapacity,
      score,
      priority,
      reasons,
      splitRequired,
    };
  }

  // Preview: gọi khi người dùng vừa điền xong Sản phẩm/Số lượng/Ngày nhập trong
  // Modal "Đặt lịch nhập" — KHÔNG ghi gì vào DB (mục 7-9 trong yêu cầu).
  async previewInboundSuggestion(dto: InboundSuggestionPreviewDto) {
    return this.computeInboundSuggestion(
      dto.productId,
      dto.quantity,
      new Date(dto.scheduledDate),
    );
  }

  async createInboundSchedule(dto: CreateInboundScheduleDto, user: AuthUser) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, deletedAt: null },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const scheduledAt = combineDateAndTime(
      dto.scheduledDate,
      dto.scheduledTime,
    );

    const suggestion = await this.computeInboundSuggestion(
      dto.productId,
      dto.quantity,
      new Date(dto.scheduledDate),
    );

    const schedule = await this.prisma.schedule.create({
      data: {
        type: ScheduleType.INBOUND,
        status: ScheduleStatus.PENDING,
        scheduledAt,
        productId: dto.productId,
        quantity: dto.quantity,
        batchCode: dto.batchCode,
        supplierId: dto.supplierId,
        note: dto.note,
        suggestedSlotId: suggestion.slotId,
        suggestionScore: suggestion.score,
        suggestionReasons: suggestion.reasons,
        suggestedAt: new Date(),
        createdById: user.id,
      },
      include: scheduleInclude,
    });

    return { schedule: toScheduleView(schedule), suggestion };
  }

  // ===================== Danh sách / Chi tiết lịch =====================

  async findAll(query: ScheduleQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ScheduleWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.productId) where.productId = query.productId;

    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        ...skipTake(page, limit),
        orderBy: { scheduledAt: 'asc' },
        include: scheduleInclude,
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return paginate(items.map(toScheduleView), page, limit, total);
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: scheduleInclude,
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return toScheduleView(schedule);
  }
}

// Gộp Ngày (yyyy-mm-dd) + Giờ (HH:mm) người dùng nhập tách rời trên form thành
// 1 mốc DateTime duy nhất để lưu vào cột scheduledAt.
export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [hh, mm] = timeStr.split(':').map((n) => parseInt(n, 10) || 0);
  const date = new Date(dateStr);
  date.setUTCHours(hh, mm, 0, 0);
  return date;
}

export const scheduleInclude = {
  product: { select: { id: true, skuCode: true, name: true, unit: true } },
  supplier: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true } },
  suggestedSlot: {
    select: {
      code: true,
      level: {
        select: {
          levelNumber: true,
          rack: { select: { code: true, zone: { select: { code: true } } } },
        },
      },
    },
  },
  actualSlot: {
    select: {
      code: true,
      level: {
        select: {
          levelNumber: true,
          rack: { select: { code: true, zone: { select: { code: true } } } },
        },
      },
    },
  },
  suggestedBatch: { select: { id: true, batchCode: true, expiryDate: true } },
  actualBatch: { select: { id: true, batchCode: true, expiryDate: true } },
  createdBy: { select: { id: true, username: true, fullName: true } },
  executedBy: { select: { id: true, username: true, fullName: true } },
} satisfies Prisma.ScheduleInclude;

type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: typeof scheduleInclude;
}>;

// Làm phẳng dữ liệu cho FE: tách Ngày/Giờ từ scheduledAt, gộp path Zone/Rack/
// Level/Slot thành chuỗi dễ đọc, giữ nguyên các field trạng thái/allocation.
function toScheduleView(item: ScheduleWithRelations) {
  const slotPath = (
    slot: ScheduleWithRelations['suggestedSlot'],
  ): string | null =>
    slot
      ? formatSlotLocation({
          zoneCode: slot.level.rack.zone.code,
          rackCode: slot.level.rack.code,
          levelNumber: slot.level.levelNumber,
          slotCode: slot.code,
        })
      : null;

  return {
    id: item.id,
    type: item.type,
    status: item.status,
    scheduledDate: item.scheduledAt.toISOString().slice(0, 10),
    scheduledTime: item.scheduledAt.toISOString().slice(11, 16),
    product: item.product,
    quantity: item.quantity,
    batchCode: item.batchCode,
    supplier: item.supplier,
    customer: item.customer,
    partnerName: item.supplier?.name ?? item.customer?.name ?? null,
    note: item.note,
    suggestion: item.suggestedSlotId
      ? {
          slotPath: slotPath(item.suggestedSlot),
          score: item.suggestionScore,
          reasons: item.suggestionReasons,
          batchCode: item.suggestedBatch?.batchCode ?? null,
          suggestedAt: item.suggestedAt,
        }
      : null,
    actual: item.actualSlotId
      ? {
          slotPath: slotPath(item.actualSlot),
          batchCode: item.actualBatch?.batchCode ?? null,
          allocationMethod: item.allocationMethod,
          selectionMethod: item.selectionMethod,
          overrideReason: item.overrideReason,
          overrideReasonNote: item.overrideReasonNote,
        }
      : null,
    executedBy: item.executedBy,
    executedAt: item.executedAt,
    transactionId: item.transactionId,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    cancelledAt: item.cancelledAt,
    cancelReason: item.cancelReason,
  };
}
