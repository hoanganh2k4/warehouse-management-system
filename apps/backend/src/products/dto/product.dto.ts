import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  skuCode: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Danh mục đầy đủ, kèm theo khi include quan hệ category',
  })
  category?: { id: string; name: string; description?: string | null };

  @ApiProperty()
  unit: string;

  @ApiProperty()
  isHeavy: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
