import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'VINA001' })
  @IsString()
  @IsNotEmpty()
  keyword: string;
}
