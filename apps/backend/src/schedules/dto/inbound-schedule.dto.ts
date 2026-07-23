import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

// Dùng khi người dùng vừa nhập xong Sản phẩm/Số lượng/Ngày nhập trong form
// "Đặt lịch nhập" -> gọi preview để lấy Smart Location Suggestion, CHƯA lưu gì.
export class InboundSuggestionPreviewDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Ngày nhập dự kiến (yyyy-mm-dd)' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({
    description:
      'Hạn sử dụng (HSD) dự kiến của lô hàng, nếu đã biết trước khi hàng về',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class CreateInboundScheduleDto {
  @ApiProperty({ description: 'Ngày nhập (yyyy-mm-dd)' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Giờ nhập, định dạng HH:mm', example: '09:00' })
  @IsString()
  scheduledTime: string;

  @ApiProperty()
  @IsUUID()
  supplierId: string;

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

  @ApiPropertyOptional({
    description:
      'Hạn sử dụng (HSD) dự kiến của lô hàng, nếu đã biết trước khi hàng về',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
