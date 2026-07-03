import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: 'Trạng thái thất bại' })
  success: false;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Mô tả lỗi',
    oneOf: [
      { type: 'string', example: 'Product not found' },
      {
        type: 'string',
        example: 'skuCode must not be empty, category must be a valid enum value',
      },
    ],
  })
  message: string;
}

export class ApiSuccessWrapperDto<T = unknown> {
  @ApiProperty({ example: true, description: 'Trạng thái thành công' })
  success: true;

  @ApiProperty({ description: 'Dữ liệu trả về' })
  data: T;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedDataDto<T = unknown> {
  @ApiProperty({ description: 'Danh sách bản ghi' })
  items: T[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
