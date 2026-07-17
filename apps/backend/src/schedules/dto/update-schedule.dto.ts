import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

// Sửa lịch nhập/xuất — chỉ cho phép khi Schedule đang ở trạng thái "Chờ thực
// hiện" (kiểm tra ở service). Mọi trường đều optional (chỉ gửi trường cần
// đổi); mỗi khi Sản phẩm/Số lượng/Ngày thay đổi, hệ thống tự chạy lại Smart
// Location Suggestion (Inbound) hoặc Smart Picking Suggestion (Outbound) để
// cập nhật snapshot đề xuất mới.
export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: 'Ngày nhập/xuất (yyyy-mm-dd)' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Giờ nhập/xuất, định dạng HH:mm' })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'Chỉ áp dụng cho lịch nhập' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Chỉ áp dụng cho lịch xuất' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
