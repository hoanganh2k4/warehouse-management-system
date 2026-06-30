import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../../../generated/prisma/client';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  skuCode: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ProductCategory })
  category: ProductCategory;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  isHeavy: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
