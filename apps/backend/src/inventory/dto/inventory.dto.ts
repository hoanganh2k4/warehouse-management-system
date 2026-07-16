import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class InboundDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsDateString()
  manufactureDate: string;

  @ApiProperty()
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  note?: string;
}

export class OutboundDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  note?: string;
}

export class InventoryQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm theo mã SKU hoặc tên sản phẩm (không phân biệt hoa/thường, chấp nhận khớp một phần)',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Tìm theo tên kho (không phân biệt hoa/thường, chấp nhận khớp một phần)',
  })
  @IsOptional()
  @IsString()
  warehouseName?: string;

  @ApiPropertyOptional({ description: 'Lọc chính xác theo UUID của kho (dùng cho tích hợp API)' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Lọc chính xác theo UUID của sản phẩm (dùng cho tích hợp API)' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  slotId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
