import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ScheduleOverrideReason } from '../../../generated/prisma/client';

// Nhân viên tự chọn vị trí (Zone/Rack/Level/Slot đã được FE quy đổi thành
// slotId trước khi gửi lên) khi không đồng ý với vị trí Smart WMS đề xuất.
// - Inbound: chỉ cần slotId (lưu hàng vào Slot này).
// - Outbound: cần slotId (lấy hàng từ Slot này); batchId không bắt buộc — nếu
//   bỏ trống, hệ thống tự chọn Batch có HSD gần nhất đang nằm trong Slot đó
//   (vẫn tôn trọng FEFO trong phạm vi Slot được chọn thủ công).
export class OverrideLocationDto {
  @ApiProperty({ description: 'Slot thực tế do nhân viên chọn' })
  @IsUUID()
  slotId: string;

  @ApiPropertyOptional({
    description:
      'Chỉ dùng cho Outbound — Batch cụ thể trong Slot (nếu bỏ trống, hệ thống tự chọn Batch có HSD gần nhất trong Slot)',
  })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiProperty({ enum: ScheduleOverrideReason })
  @IsEnum(ScheduleOverrideReason)
  reason: ScheduleOverrideReason;

  @ApiPropertyOptional({ description: 'Bắt buộc khi reason = OTHER' })
  @ValidateIf(
    (o: OverrideLocationDto) => o.reason === ScheduleOverrideReason.OTHER,
  )
  @IsString()
  @IsNotEmpty()
  reasonNote?: string;
}

export class ExecuteScheduleDto {
  @ApiPropertyOptional({
    type: OverrideLocationDto,
    description:
      'Chỉ gửi khi nhân viên bấm "Thay đổi vị trí". Nếu bỏ trống, hệ thống dùng vị trí do Smart WMS chạy lại thuật toán đề xuất (Smart Allocation / FEFO).',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OverrideLocationDto)
  override?: OverrideLocationDto;

  // ---- Chỉ áp dụng cho Inbound ----
  // Tại thời điểm Đặt lịch, form không thu thập HSD (Batch chưa tồn tại
  // chính thức trong DB). Khi Thực hiện lịch — lúc hàng thực tế về kho —
  // nhân viên xác nhận lại mã lô/NSX/HSD thật để hệ thống tạo (hoặc gộp vào)
  // Batch chính thức trước khi ghi Inventory.
  @ApiPropertyOptional({
    description: 'Inbound — Mã lô hàng thực tế (nếu khác mã đã đặt lịch)',
  })
  @IsOptional()
  @IsString()
  actualBatchCode?: string;

  @ApiPropertyOptional({ description: 'Inbound — Ngày sản xuất thực tế' })
  @IsOptional()
  @IsDateString()
  manufactureDate?: string;

  @ApiPropertyOptional({ description: 'Inbound — Hạn sử dụng thực tế' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
