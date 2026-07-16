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
import { SlotsService } from './slots.service';
import { CreateSlotDto, SlotQueryDto, UpdateSlotDto } from './dto/slot.dto';
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

@ApiTags('Slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly service: SlotsService) {}

  @Public()
  @Get()
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.slotList,
    '200 OK — Danh sách slot (phân trang)',
  )
  @ApiValidationError()
  findAll(@Query() query: SlotQueryDto) {
    return this.service.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.slot, '200 OK — Chi tiết slot')
  @ApiPublicReadErrors(ERROR_EXAMPLES.slotNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @Roles(MANAGER_ROLE)
  @ApiCreatedExample(SUCCESS_EXAMPLES.slot, '201 Created — Tạo slot')
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateSlotDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(SUCCESS_EXAMPLES.slot, '200 OK — Cập nhật slot')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.slotNotFound })
  update(@Param('id') id: string, @Body() dto: UpdateSlotDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(SUCCESS_EXAMPLES.slot, '200 OK — Xóa slot')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.slotNotFound,
    conflict: { hasInventory: ERROR_EXAMPLES.slotHasInventory },
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
