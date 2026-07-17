import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelScheduleDto {
  @ApiPropertyOptional({ description: 'Lý do hủy lịch' })
  @IsOptional()
  @IsString()
  reason?: string;
}
