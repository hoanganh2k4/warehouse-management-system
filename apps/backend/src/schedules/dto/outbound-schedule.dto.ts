import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

// Dùng khi người dùng vừa nhập xong Sản phẩm/Số lượng trong form "Đặt lịch
// xuất" -> gọi preview để lấy Smart Picking Suggestion (FEFO), CHƯA lưu gì.
export class OutboundSuggestionPreviewDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOutboundScheduleDto {
  @ApiProperty({ description: 'Ngày xuất (yyyy-mm-dd)' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Giờ xuất, định dạng HH:mm', example: '09:00' })
  @IsString()
  scheduledTime: string;

  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Mã lô hàng (Batch), nhập tay, không bắt buộc',
  })
  @IsOptional()
  @IsString()
  batchCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
