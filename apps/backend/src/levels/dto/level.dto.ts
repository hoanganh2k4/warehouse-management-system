import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty()
  @IsUUID()
  rackId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  levelNumber: number;
}

export class UpdateLevelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  levelNumber?: number;
}
