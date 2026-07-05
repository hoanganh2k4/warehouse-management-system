import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
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
@ApiTags('Warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get()
  @ApiSuccessExample(SUCCESS_EXAMPLES.warehouseList, '200 OK — Danh sách kho')
  @ApiAuthReadErrors()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.warehouse, '200 OK — Chi tiết kho')
  @ApiAuthReadErrors(ERROR_EXAMPLES.warehouseNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiCreatedExample(SUCCESS_EXAMPLES.warehouse, '201 Created — Tạo kho')
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateWarehouseDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.warehouse, '200 OK — Cập nhật kho')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.warehouseNotFound })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.warehouse, '200 OK — Xóa kho')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.warehouseNotFound,
    conflict: { hasZones: ERROR_EXAMPLES.warehouseHasZones },
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
