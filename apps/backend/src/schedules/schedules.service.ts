import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  Schedule,
  ScheduleStatus,
  ScheduleType,
  TransactionType,
  AllocationMethod,
  SelectionMethod,
  ScheduleOverrideReason,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { SlotScoringService } from '../common/services/slot-scoring.service';
import { SlotCapacityService } from '../common/services/slot-capacity.service';
import { FefoService } from '../common/services/fefo.service';
import type { PickLine } from '../common/services/fefo.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { formatSlotLocation } from '../common/utils/location.util';
import { getNextDailySeq } from '../common/utils/transaction-seq.util';
import { createScheduleWithOrderCode } from '../common/utils/order-code.util';
import { AuthUser } from '../common/decorators/current-user.decorator';
import {
  CreateInboundScheduleDto,
  InboundSuggestionPreviewDto,
} from './dto/inbound-schedule.dto';
import {
  CreateOutboundScheduleDto,
  OutboundSuggestionPreviewDto,
} from './dto/outbound-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { ExecuteScheduleDto } from './dto/execute-schedule.dto';
import { CancelScheduleDto } from './dto/cancel-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

// Kết quả Smart Location Suggestion dùng chung cho cả preview (chưa lưu) và
// lúc tạo lịch (lưu snapshot vào Schedule).
export interface AlternativeSlot {
  slotId: string;
  slotPath: string;
  allocateQty: number;
  score: number; // 0-100, cùng thang điểm với suggestion.score
}

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
  alternativeSlots: AlternativeSlot[]; // Toàn bộ vị trí cần dùng khi splitRequired, kể cả vị trí chính (top)
}

// Kết quả Smart Picking Suggestion (FEFO) dùng chung cho preview và lúc tạo
// lịch xuất (lưu snapshot vào Schedule).
export interface OutboundSuggestionResult {
  batchId: string;
  batchCode: string;
  expiryDate: Date;
  slotId: string;
  slotPath: string;
  availableQuantity: number;
  quantityToPick: number;
  totalQuantity: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  selectionMethod: 'FEFO';
  reasons: string[];
  splitRequired: boolean; // true nếu cần lấy từ nhiều Batch/Slot mới đủ số lượng
  pickingList: PickLine[];
}

// Outbound (FEFO) không có điểm % "Độ phù hợp" hiển thị trên UI, nhưng vẫn
// lưu một điểm số xấp xỉ vào suggestionScore để đồng bộ cấu trúc dữ liệu
// với Inbound (Smart Allocation).
const PRIORITY_SCORE: Record<OutboundSuggestionResult['priority'], number> = {
  HIGH: 95,
  MEDIUM: 75,
  LOW: 50,
};

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotScoring: SlotScoringService,
    private readonly slotCapacity: SlotCapacityService,
    private readonly fefo: FefoService,
  ) {}

  // ===================== Smart Location Suggestion (Inbound) =====================

  // Lưu ý: form Đặt lịch nhập CÓ THỂ thu thập HSD (expiryDate) nếu nhân viên đã
  // biết trước lúc đặt lịch (không bắt buộc — hàng chưa về thì có thể chưa biết
  // chính xác). SlotScoringService cần 1 mốc "incoming expiry" để tính điểm FEFO
  // phụ (trọng số 0.3/1.0) khi so khớp với các lô cùng SKU đã có trong slot. Nếu
  // có `expiryDate` thật, dùng giá trị đó; nếu không, dùng tạm ngày nhập dự kiến
  // (scheduledDate) làm mốc xấp xỉ — đây chỉ là ước lượng ở bước lập kế hoạch khi
  // "Thực hiện lịch" (Bước 6), hệ thống sẽ chạy lại toàn bộ thuật toán với dữ
  // liệu batch/HSD thật để chốt vị trí chính thức.
  private async computeInboundSuggestion(
    productId: string,
    quantity: number,
    scheduledDate: Date,
    expiryDate?: Date,
  ): Promise<InboundSuggestionResult> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    const allocations = await this.slotScoring.findBestSlots(
      product,
      quantity,
      expiryDate ?? scheduledDate,
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

    const slotIds = allocations.map((a) => a.slot.id);
    const slotDetails = await this.prisma.slot.findMany({
      where: { id: { in: slotIds } },
      include: { level: { include: { rack: { include: { zone: true } } } } },
    });
    const slotDetailMap = new Map(slotDetails.map((s) => [s.id, s]));

    const alternativeSlots: AlternativeSlot[] = allocations.map((a) => {
      const detail = slotDetailMap.get(a.slot.id)!;
      return {
        slotId: a.slot.id,
        slotPath: formatSlotLocation({
          zoneCode: detail.level.rack.zone.code,
          rackCode: detail.level.rack.code,
          levelNumber: detail.level.levelNumber,
          slotCode: detail.code,
        }),
        allocateQty: a.allocateQty,
        score: Math.round(a.score * 100),
      };
    });

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
      alternativeSlots,
    };
  }

  // Preview: gọi khi người dùng vừa điền xong Sản phẩm/Số lượng/Ngày nhập trong
  // Modal "Đặt lịch nhập" — KHÔNG ghi gì vào DB (mục 7-9 trong yêu cầu).
  async previewInboundSuggestion(dto: InboundSuggestionPreviewDto) {
    return this.computeInboundSuggestion(
      dto.productId,
      dto.quantity,
      new Date(dto.scheduledDate),
      dto.expiryDate ? new Date(dto.expiryDate) : undefined,
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
      dto.expiryDate ? new Date(dto.expiryDate) : undefined,
    );

    const schedule = await createScheduleWithOrderCode(
      this.prisma,
      (tx, orderCode) =>
        tx.schedule.create({
          data: {
            type: ScheduleType.INBOUND,
            status: ScheduleStatus.PENDING,
            scheduledAt,
            productId: dto.productId,
            quantity: dto.quantity,
            batchCode: dto.batchCode,
            supplierId: dto.supplierId,
            note: dto.note,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
            suggestedSlotId: suggestion.slotId,
            suggestionScore: suggestion.score,
            suggestionReasons: suggestion.reasons,
            suggestedAt: new Date(),
            createdById: user.id,
            orderCode,
          },
          include: scheduleInclude,
        }),
    );

    if (suggestion.alternativeSlots.length > 0) {
      await this.prisma.scheduleAllocation.createMany({
        data: suggestion.alternativeSlots.map((s, idx) => ({
          scheduleId: schedule.id,
          kind: 'SUGGESTED' as const,
          slotId: s.slotId,
          batchId: null,
          quantity: s.allocateQty,
          sortOrder: idx,
        })),
      });
    }

    return { schedule: toScheduleView(schedule), suggestion };
  }

  // ===================== Smart Picking Suggestion (Outbound / FEFO) =====================

  private async computeOutboundSuggestion(
    productId: string,
    quantity: number,
  ): Promise<OutboundSuggestionResult> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    let pickingList: PickLine[];
    try {
      pickingList = await this.fefo.buildPickingList(productId, quantity);
    } catch (e) {
      throw new NotFoundException(
        e instanceof Error
          ? e.message
          : 'Không đủ tồn kho để đề xuất lịch xuất',
      );
    }

    // Chỉ hiển thị 1 Batch/Slot chính (đề xuất tốt nhất theo FEFO) trên Card,
    // đúng theo thiết kế UI — các route còn lại (nếu có) chỉ dùng khi thực hiện.
    const primary = pickingList[0];
    const distinctBatchIds = new Set(pickingList.map((l) => l.batchId));
    const splitRequired = pickingList.length > 1;
    const splitAcrossBatches = distinctBatchIds.size > 1;

    const availableAgg = await this.prisma.inventory.aggregate({
      where: { batchId: primary.batchId },
      _sum: { quantity: true },
    });
    const availableQuantity = availableAgg._sum.quantity ?? primary.quantity;

    const reasons: string[] = ['✓ Batch có hạn sử dụng gần nhất.'];
    if (!splitAcrossBatches) {
      reasons.push('✓ Đủ số lượng để xuất.');
    } else {
      reasons.push(
        `⚠ Batch này không đủ số lượng, hệ thống sẽ cần dùng thêm ${
          distinctBatchIds.size - 1
        } batch khác (vẫn theo FEFO) khi thực hiện.`,
      );
    }
    reasons.push('✓ Tuân thủ nguyên tắc FEFO.');
    if (!splitRequired)
      reasons.push('✓ Vị trí lấy hàng duy nhất, không cần gộp nhiều Slot.');

    const priority: OutboundSuggestionResult['priority'] = splitAcrossBatches
      ? 'LOW'
      : splitRequired
        ? 'MEDIUM'
        : 'HIGH';

    return {
      batchId: primary.batchId,
      batchCode: primary.batchCode,
      expiryDate: primary.expiryDate,
      slotId: primary.slotId,
      slotPath: primary.slotPath,
      availableQuantity,
      quantityToPick: primary.quantity,
      totalQuantity: quantity,
      priority,
      selectionMethod: 'FEFO',
      reasons,
      splitRequired,
      pickingList,
    };
  }

  // Preview: gọi khi người dùng vừa điền xong Sản phẩm/Số lượng trong Modal
  // "Đặt lịch xuất" — KHÔNG ghi gì vào DB, không giảm Inventory (mục 10-11).
  async previewOutboundSuggestion(dto: OutboundSuggestionPreviewDto) {
    return this.computeOutboundSuggestion(dto.productId, dto.quantity);
  }

  async createOutboundSchedule(dto: CreateOutboundScheduleDto, user: AuthUser) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const scheduledAt = combineDateAndTime(
      dto.scheduledDate,
      dto.scheduledTime,
    );

    const suggestion = await this.computeOutboundSuggestion(
      dto.productId,
      dto.quantity,
    );

    const schedule = await createScheduleWithOrderCode(
      this.prisma,
      (tx, orderCode) =>
        tx.schedule.create({
          data: {
            type: ScheduleType.OUTBOUND,
            status: ScheduleStatus.PENDING,
            scheduledAt,
            productId: dto.productId,
            quantity: dto.quantity,
            batchCode: dto.batchCode,
            customerId: dto.customerId,
            note: dto.note,
            suggestedSlotId: suggestion.slotId,
            suggestedBatchId: suggestion.batchId,
            suggestionScore: PRIORITY_SCORE[suggestion.priority],
            suggestionReasons: suggestion.reasons,
            suggestedAt: new Date(),
            createdById: user.id,
            orderCode,
          },
          include: scheduleInclude,
        }),
    );

    if (suggestion.pickingList.length > 0) {
      await this.prisma.scheduleAllocation.createMany({
        data: suggestion.pickingList.map((line, idx) => ({
          scheduleId: schedule.id,
          kind: 'SUGGESTED' as const,
          slotId: line.slotId,
          batchId: line.batchId,
          quantity: line.quantity,
          sortOrder: idx,
        })),
      });
    }

    return { schedule: toScheduleView(schedule), suggestion };
  }

  // ===================== Thực hiện lịch (mục 12-14) =====================

  private async getPendingScheduleOrThrow(id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status !== ScheduleStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể thao tác trên lịch đang ở trạng thái "Chờ thực hiện"',
      );
    }
    return schedule;
  }

  // Khi nhân viên bấm "Thực hiện": chạy lại toàn bộ thuật toán với dữ liệu
  // kho hiện tại (KHÔNG ghi DB) để xác nhận vị trí đề xuất trước đó còn tối
  // ưu hay không, phục vụ Dialog xác nhận (Trường hợp 1 / Trường hợp 2).
  async previewExecute(id: string) {
    const schedule = await this.getPendingScheduleOrThrow(id);

    if (schedule.type === ScheduleType.INBOUND) {
      // HSD thật vẫn chưa có ở bước này (chỉ có khi nhân viên xác nhận nhận
      // hàng) nên tiếp tục dùng scheduledAt làm mốc ước lượng, giống lúc đặt
      // lịch — đảm bảo so sánh "vẫn tối ưu hay không" là nhất quán.
      const fresh = await this.computeInboundSuggestion(
        schedule.productId,
        schedule.quantity,
        schedule.scheduledAt,
      );
      const isSameAsSuggested = fresh.slotId === schedule.suggestedSlotId;
      return {
        scheduleId: schedule.id,
        type: schedule.type,
        previousSuggestedSlotId: schedule.suggestedSlotId,
        recommended: fresh,
        isSameAsSuggested,
      };
    }

    const fresh = await this.computeOutboundSuggestion(
      schedule.productId,
      schedule.quantity,
    );
    const isSameAsSuggested =
      fresh.slotId === schedule.suggestedSlotId &&
      fresh.batchId === schedule.suggestedBatchId;
    return {
      scheduleId: schedule.id,
      type: schedule.type,
      previousSuggestedSlotId: schedule.suggestedSlotId,
      previousSuggestedBatchId: schedule.suggestedBatchId,
      recommended: fresh,
      isSameAsSuggested,
    };
  }

  // Chỉ khi nhân viên bấm "Xác nhận thực hiện" mới thật sự cập nhật dữ liệu
  // (mục 13-14): tăng/giảm Inventory, cập nhật Progress Bar của Slot, sinh
  // Transaction, chốt trạng thái Schedule = Hoàn thành.
  async executeSchedule(id: string, dto: ExecuteScheduleDto, user: AuthUser) {
    const schedule = await this.getPendingScheduleOrThrow(id);

    if (
      dto.override?.reason === ScheduleOverrideReason.OTHER &&
      !dto.override.reasonNote
    ) {
      throw new BadRequestException('Vui lòng nhập lý do khi chọn "Khác"');
    }

    return schedule.type === ScheduleType.INBOUND
      ? this.executeInboundSchedule(schedule, dto, user)
      : this.executeOutboundSchedule(schedule, dto, user);
  }

  private async executeInboundSchedule(
    schedule: Schedule,
    dto: ExecuteScheduleDto,
    user: AuthUser,
  ) {
    let slotId: string;
    let allocationMethod: AllocationMethod;
    let overrideReason: ScheduleOverrideReason | null = null;
    let overrideReasonNote: string | null = null;

    if (dto.override) {
      const slot = await this.prisma.slot.findUnique({
        where: { id: dto.override.slotId },
      });
      if (!slot) throw new NotFoundException('Slot not found');
      if (slot.availableCapacity < schedule.quantity) {
        throw new BadRequestException(
          'Slot được chọn không đủ sức chứa cho số lượng cần nhập',
        );
      }
      slotId = slot.id;
      allocationMethod = AllocationMethod.MANUAL_OVERRIDE;
      overrideReason = dto.override.reason;
      overrideReasonNote = dto.override.reasonNote ?? null;
    } else {
      const product = await this.prisma.product.findFirstOrThrow({
        where: { id: schedule.productId },
      });
      // Ưu tiên HSD thật do nhân viên xác nhận khi nhận hàng; nếu chưa có,
      // tạm dùng ngày nhập dự kiến làm mốc (giống lúc lập kế hoạch).
      const expiryProxy = dto.expiryDate
        ? new Date(dto.expiryDate)
        : schedule.scheduledAt;
      const allocations = await this.slotScoring.findBestSlots(
        product,
        schedule.quantity,
        expiryProxy,
      );
      if (
        allocations.length === 0 ||
        allocations[0].allocateQty < schedule.quantity
      ) {
        throw new BadRequestException(
          'Không tìm được 1 Slot đủ sức chứa toàn bộ số lượng. Vui lòng dùng chức năng "Thay đổi vị trí" để chọn thủ công.',
        );
      }
      slotId = allocations[0].slot.id;
      allocationMethod = AllocationMethod.SMART_ALLOCATION;
    }

    // Batch chính thức chỉ được xác định ở bước Thực hiện (form Đặt lịch
    // không thu thập NSX/HSD). Nếu nhân viên xác nhận đúng mã lô đã dự kiến
    // và mã đó đã tồn tại, gộp thêm số lượng vào Batch đó; ngược lại tạo mới.
    const batchCode =
      dto.actualBatchCode?.trim() || schedule.batchCode?.trim() || undefined;
    if (!dto.expiryDate) {
      throw new BadRequestException(
        'Vui lòng xác nhận Hạn sử dụng (HSD) thực tế của lô hàng trước khi thực hiện lịch nhập',
      );
    }
    const expiryDate = new Date(dto.expiryDate);
    const manufactureDate = dto.manufactureDate
      ? new Date(dto.manufactureDate)
      : schedule.scheduledAt;

    return this.prisma.$transaction(async (tx) => {
      let batch = batchCode
        ? await tx.batch.findUnique({ where: { batchCode } })
        : null;

      if (!batch) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: schedule.productId },
        });
        batch = await tx.batch.create({
          data: {
            productId: schedule.productId,
            batchCode: batchCode ?? `B-${product.skuCode}-${Date.now()}`,
            manufactureDate,
            expiryDate,
          },
        });
      }

      // Đọc tồn kho TRƯỚC khi cộng thêm, để ghi đúng quantityBefore — nếu đọc
      // sau upsert thì số liệu đã bị cộng dồn mất, không còn ý nghĩa "trước".
      const existingInv = await tx.inventory.findUnique({
        where: { batchId_slotId: { batchId: batch.id, slotId } },
      });
      const quantityBefore = existingInv?.quantity ?? 0;
      const quantityAfter = quantityBefore + schedule.quantity;

      await tx.inventory.upsert({
        where: { batchId_slotId: { batchId: batch.id, slotId } },
        create: { batchId: batch.id, slotId, quantity: schedule.quantity },
        update: { quantity: { increment: schedule.quantity } },
      });

      await this.slotCapacity.recalculate(slotId, tx);

      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.IMPORT,
          batchId: batch.id,
          slotToId: slotId,
          quantity: schedule.quantity,
          userId: user.id,
          note: schedule.note ?? undefined,
          quantityBefore,
          quantityAfter,
          dailySeq: await getNextDailySeq(tx),
        },
      });

      const updated = await tx.schedule.update({
        where: { id: schedule.id },
        data: {
          status: ScheduleStatus.COMPLETED,
          actualSlotId: slotId,
          actualBatchId: batch.id,
          allocationMethod,
          overrideReason,
          overrideReasonNote,
          executedById: user.id,
          executedAt: new Date(),
          transactionId: transaction.id,
        },
        include: scheduleInclude,
      });

      return { schedule: toScheduleView(updated), transactions: [transaction] };
    });
  }

  private async executeOutboundSchedule(
    schedule: Schedule,
    dto: ExecuteScheduleDto,
    user: AuthUser,
  ) {
    let pickLines: PickLine[];
    let selectionMethod: SelectionMethod;
    let overrideReason: ScheduleOverrideReason | null = null;
    let overrideReasonNote: string | null = null;

    if (dto.override) {
      const slot = await this.prisma.slot.findUnique({
        where: { id: dto.override.slotId },
        include: { level: { include: { rack: { include: { zone: true } } } } },
      });
      if (!slot) throw new NotFoundException('Slot not found');

      const inv = dto.override.batchId
        ? await this.prisma.inventory.findUnique({
            where: {
              batchId_slotId: {
                batchId: dto.override.batchId,
                slotId: slot.id,
              },
            },
            include: { batch: { include: { product: true } } },
          })
        : await this.prisma.inventory.findFirst({
            where: { slotId: slot.id, quantity: { gt: 0 } },
            orderBy: { batch: { expiryDate: 'asc' } },
            include: { batch: { include: { product: true } } },
          });

      if (!inv || inv.quantity < schedule.quantity) {
        throw new BadRequestException(
          'Slot/Batch được chọn không đủ số lượng khả dụng để xuất',
        );
      }

      pickLines = [
        {
          skuCode: inv.batch.product.skuCode,
          productName: inv.batch.product.name,
          batchId: inv.batchId,
          batchCode: inv.batch.batchCode,
          expiryDate: inv.batch.expiryDate,
          slotId: slot.id,
          slotCode: slot.code,
          slotPath: formatSlotLocation({
            zoneCode: slot.level.rack.zone.code,
            rackCode: slot.level.rack.code,
            levelNumber: slot.level.levelNumber,
            slotCode: slot.code,
          }),
          quantity: schedule.quantity,
          route: 1,
          distanceToGate: slot.distanceToGate,
        },
      ];
      selectionMethod = SelectionMethod.MANUAL_OVERRIDE;
      overrideReason = dto.override.reason;
      overrideReasonNote = dto.override.reasonNote ?? null;
    } else {
      try {
        // Chạy lại FEFO với dữ liệu tồn kho hiện tại (mục 12, 14).
        pickLines = await this.fefo.buildPickingList(
          schedule.productId,
          schedule.quantity,
        );
      } catch (e) {
        throw new BadRequestException(
          e instanceof Error ? e.message : 'Không đủ tồn kho để xuất',
        );
      }
      selectionMethod = SelectionMethod.FEFO;
    }

    return this.prisma.$transaction(async (tx) => {
      const transactions: Awaited<ReturnType<typeof tx.transaction.create>>[] =
        [];

      for (const line of pickLines) {
        const inv = await tx.inventory.findUnique({
          where: {
            batchId_slotId: { batchId: line.batchId, slotId: line.slotId },
          },
        });
        if (!inv || inv.quantity < line.quantity) {
          throw new BadRequestException('Stock changed during outbound');
        }

        // Mỗi dòng pick là 1 slot/batch riêng biệt — phải tính before/after
        // riêng cho từng dòng, không dùng chung 1 giá trị cho cả vòng lặp.
        const quantityBefore = inv.quantity;
        const quantityAfter = inv.quantity - line.quantity;

        if (inv.quantity === line.quantity) {
          await tx.inventory.delete({ where: { id: inv.id } });
        } else {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: line.quantity } },
          });
        }

        await this.slotCapacity.recalculate(line.slotId, tx);

        const txn = await tx.transaction.create({
          data: {
            type: TransactionType.EXPORT,
            batchId: line.batchId,
            slotFromId: line.slotId,
            quantity: line.quantity,
            userId: user.id,
            note: schedule.note ?? undefined,
            quantityBefore,
            quantityAfter,
            dailySeq: await getNextDailySeq(tx),
          },
        });
        transactions.push(txn);
      }

      // Schema chỉ lưu 1 vị trí/batch thực tế trên Schedule (1-1 với
      // Transaction chính) — dùng route đầu tiên (ưu tiên FEFO cao nhất) làm
      // đại diện; toàn bộ các dòng xuất thực tế vẫn có trong `transactions`.
      const primary = pickLines[0];
      const updated = await tx.schedule.update({
        where: { id: schedule.id },
        data: {
          status: ScheduleStatus.COMPLETED,
          actualSlotId: primary.slotId,
          actualBatchId: primary.batchId,
          selectionMethod,
          overrideReason,
          overrideReasonNote,
          executedById: user.id,
          executedAt: new Date(),
          transactionId: transactions[0].id,
        },
        include: scheduleInclude,
      });

      return { schedule: toScheduleView(updated), transactions };
    });
  }

  // ===================== Hủy / Sửa lịch =====================

  async cancelSchedule(id: string, dto: CancelScheduleDto) {
    await this.getPendingScheduleOrThrow(id);
    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        status: ScheduleStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: dto.reason,
      },
      include: scheduleInclude,
    });
    return toScheduleView(updated);
  }

  async updateSchedule(id: string, dto: UpdateScheduleDto) {
    const schedule = await this.getPendingScheduleOrThrow(id);

    const scheduledAt =
      dto.scheduledDate || dto.scheduledTime
        ? combineDateAndTime(
            dto.scheduledDate ??
              schedule.scheduledAt.toISOString().slice(0, 10),
            dto.scheduledTime ??
              schedule.scheduledAt.toISOString().slice(11, 16),
          )
        : schedule.scheduledAt;
    const productId = dto.productId ?? schedule.productId;
    const quantity = dto.quantity ?? schedule.quantity;

    let suggestionData: Prisma.ScheduleUncheckedUpdateInput;

    if (schedule.type === ScheduleType.INBOUND) {
      if (dto.supplierId) {
        const supplier = await this.prisma.supplier.findFirst({
          where: { id: dto.supplierId, deletedAt: null },
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
      }
      const suggestion = await this.computeInboundSuggestion(
        productId,
        quantity,
        scheduledAt,
      );
      suggestionData = {
        suggestedSlotId: suggestion.slotId,
        suggestionScore: suggestion.score,
        suggestionReasons: suggestion.reasons,
        suggestedAt: new Date(),
      };
    } else {
      if (dto.customerId) {
        const customer = await this.prisma.customer.findFirst({
          where: { id: dto.customerId, deletedAt: null },
        });
        if (!customer) throw new NotFoundException('Customer not found');
      }
      const suggestion = await this.computeOutboundSuggestion(
        productId,
        quantity,
      );
      suggestionData = {
        suggestedSlotId: suggestion.slotId,
        suggestedBatchId: suggestion.batchId,
        suggestionScore: PRIORITY_SCORE[suggestion.priority],
        suggestionReasons: suggestion.reasons,
        suggestedAt: new Date(),
      };
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        scheduledAt,
        productId,
        quantity,
        batchCode: dto.batchCode ?? schedule.batchCode,
        note: dto.note ?? schedule.note,
        supplierId: dto.supplierId ?? schedule.supplierId,
        customerId: dto.customerId ?? schedule.customerId,
        ...suggestionData,
      },
      include: scheduleInclude,
    });

    return toScheduleView(updated);
  }

  // ===================== Danh sách / Chi tiết lịch =====================

  async findByOrderCode(orderCode: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { orderCode },
      include: scheduleInclude,
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found for this order code');
    }
    return toScheduleView(schedule);
  }

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
        orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
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
    orderCode: item.orderCode,
    type: item.type,
    status: item.status,
    scheduledDate: item.scheduledAt.toISOString().slice(0, 10),
    scheduledTime: item.scheduledAt.toISOString().slice(11, 16),
    product: item.product,
    quantity: item.quantity,
    batchCode: item.batchCode,
    expiryDate: item.expiryDate,
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
