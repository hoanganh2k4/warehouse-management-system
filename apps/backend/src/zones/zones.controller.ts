import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MANAGER_ROLE } from '../common/constants/roles.constant';
import { ZonesService } from './zones.service';
import { CreateZoneDto, UpdateZoneDto } from './dto/zone.dto';
import {
  ApiAuthReadErrors,
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiSuccessExample,
} from '../common/decorators/api-responses.decorator';
import {
  ERROR_EXAMPLES,
  SUCCESS_EXAMPLES,
} from '../common/swagger/swagger-examples';

@ApiBearerAuth()
@ApiTags('Zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly service: ZonesService) {}

  @Get()
  @ApiSuccessExample(
    { success: true, data: [SUCCESS_EXAMPLES.zone.data] },
    '200 OK — Danh sách zone',
  )
  @ApiAuthReadErrors()
  findAll(@Query('warehouseId') warehouseId?: string) {
    return this.service.findAll(warehouseId);
  }

  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.zone, '200 OK — Chi tiết zone')
  @ApiAuthReadErrors(ERROR_EXAMPLES.zoneNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(MANAGER_ROLE)
  @ApiCreatedExample(SUCCESS_EXAMPLES.zone, '201 Created — Tạo zone')
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateZoneDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(SUCCESS_EXAMPLES.zone, '200 OK — Cập nhật zone')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.zoneNotFound })
  update(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(SUCCESS_EXAMPLES.zone, '200 OK — Xóa zone')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.zoneNotFound,
    conflict: { hasRacks: ERROR_EXAMPLES.zoneHasRacks },
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
