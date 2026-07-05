import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  InboundDto,
  InventoryQueryDto,
  OutboundDto,
} from './dto/inventory.dto';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiPublicReadErrors,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import {
  ERROR_EXAMPLES,
  SUCCESS_EXAMPLES,
} from '../common/swagger/swagger-examples';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Public()
  @Get()
  @ApiSuccessExample(
    {
      success: true,
      data: {
        items: [SUCCESS_EXAMPLES.inventory.data],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    },
    '200 OK — Danh sách tồn kho',
  )
  @ApiValidationError()
  findAll(@Query() query: InventoryQueryDto) {
    return this.service.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.inventory, '200 OK — Chi tiết tồn kho')
  @ApiPublicReadErrors(ERROR_EXAMPLES.inventoryNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post('inbound')
  @ApiCreatedExample(
    SUCCESS_EXAMPLES.inbound,
    '201 Created — Nhập kho thành công',
  )
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.productNotFound,
    conflict: {
      noSlot: ERROR_EXAMPLES.noSlotAvailable,
      insufficientCapacity: ERROR_EXAMPLES.insufficientCapacity,
    },
  })
  inbound(@Body() dto: InboundDto, @CurrentUser() user: AuthUser) {
    return this.service.inbound(dto, user);
  }

  @ApiBearerAuth()
  @Post('outbound')
  @ApiCreatedExample(
    SUCCESS_EXAMPLES.outbound,
    '201 Created — Xuất kho thành công (FEFO + Picking List)',
  )
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.productNotFound,
    conflict: { insufficientStock: ERROR_EXAMPLES.insufficientStock },
  })
  outbound(@Body() dto: OutboundDto, @CurrentUser() user: AuthUser) {
    return this.service.outbound(dto, user);
  }
}
