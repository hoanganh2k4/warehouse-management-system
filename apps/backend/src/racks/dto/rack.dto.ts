import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRackDto {
  @ApiProperty()
  @IsUUID()
  zoneId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class UpdateRackDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;
}
