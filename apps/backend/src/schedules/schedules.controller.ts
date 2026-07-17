import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  CreateInboundScheduleDto,
  InboundSuggestionPreviewDto,
} from './dto/inbound-schedule.dto';
import {
  CreateOutboundScheduleDto,
  OutboundSuggestionPreviewDto,
} from './dto/outbound-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { ExecuteScheduleDto } from './dto/execute-schedule.dto';
import { CancelScheduleDto } from './dto/cancel-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import {
  ApiAuthReadErrors,
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';

const SUGGESTION_EXAMPLE = {
  slotId: 'd4e5f6a7-b8c9-4012-defa-234567890123',
  zoneCode: 'Zone A',
  rackCode: 'Rack 02',
  levelNumber: 3,
  slotCode: 'S08',
  slotPath: 'Z-A / R02 / L03 / S08',
  capacityBefore: 100,
  capacityAfter: 180,
  maxCapacity: 200,
  score: 98,
  priority: 'HIGH',
  reasons: [
    '✓ Cùng SKU với hàng đang lưu trong slot.',
    '✓ Đủ sức chứa cho toàn bộ số lượng.',
  ],
  splitRequired: false,
};

const PICKING_SUGGESTION_EXAMPLE = {
  batchId: 'b1c2d3e4-f5a6-4789-bcde-f01234567890',
  batchCode: 'AFC-B03',
  expiryDate: '2026-08-20T00:00:00.000Z',
  slotId: 'a1b2c3d4-e5f6-4789-bcde-f01234567890',
  slotPath: 'Zone A / Rack 01 / L05 / S01',
  availableQuantity: 150,
  quantityToPick: 150,
  totalQuantity: 150,
  priority: 'HIGH',
  selectionMethod: 'FEFO',
  reasons: [
    '✓ Batch có hạn sử dụng gần nhất.',
    '✓ Đủ số lượng để xuất.',
    '✓ Tuân thủ nguyên tắc FEFO.',
    '✓ Vị trí lấy hàng duy nhất, không cần gộp nhiều Slot.',
  ],
  splitRequired: false,
};

// Không @Roles(...) tức chỉ cần đăng nhập (Quản lý hoặc Nhân viên kho đều được
// đặt/xem lịch nhập-xuất) — đúng tinh thần "Nhân viên kho: nhập/xuất/di chuyển hàng".
@ApiBearerAuth()
@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Post('inbound/preview')
  @ApiSuccessExample(
    SUGGESTION_EXAMPLE,
    '200 OK — Smart Location Suggestion (chỉ xem trước, chưa lưu)',
  )
  @ApiValidationError()
  @ApiAuthReadErrors()
  previewInbound(@Body() dto: InboundSuggestionPreviewDto) {
    return this.service.previewInboundSuggestion(dto);
  }

  @Post('inbound')
  @ApiCreatedExample(
    {
      schedule: { id: '...', type: 'INBOUND', status: 'PENDING' },
      suggestion: SUGGESTION_EXAMPLE,
    },
    '201 Created — Tạo lịch nhập kho (kèm Smart Location Suggestion)',
  )
  @ApiAuthWriteErrors()
  createInbound(
    @Body() dto: CreateInboundScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createInboundSchedule(dto, user);
  }

  @Post('outbound/preview')
  @ApiSuccessExample(
    PICKING_SUGGESTION_EXAMPLE,
    '200 OK — Smart Picking Suggestion / FEFO (chỉ xem trước, chưa lưu)',
  )
  @ApiValidationError()
  @ApiAuthReadErrors()
  previewOutbound(@Body() dto: OutboundSuggestionPreviewDto) {
    return this.service.previewOutboundSuggestion(dto);
  }

  @Post('outbound')
  @ApiCreatedExample(
    {
      schedule: { id: '...', type: 'OUTBOUND', status: 'PENDING' },
      suggestion: PICKING_SUGGESTION_EXAMPLE,
    },
    '201 Created — Tạo lịch xuất kho (kèm Smart Picking Suggestion)',
  )
  @ApiAuthWriteErrors()
  createOutbound(
    @Body() dto: CreateOutboundScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createOutboundSchedule(dto, user);
  }

  @Get()
  @ApiSuccessExample(
    { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } },
    '200 OK — Danh sách lịch nhập/xuất (tab "Lịch nhập / xuất")',
  )
  @ApiValidationError()
  @ApiAuthReadErrors()
  findAll(@Query() query: ScheduleQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiSuccessExample({}, '200 OK — Chi tiết lịch (dùng cho "Xem chi tiết")')
  @ApiAuthReadErrors()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/execute/preview')
  @ApiSuccessExample(
    {
      scheduleId: '...',
      type: 'INBOUND',
      previousSuggestedSlotId: '...',
      recommended: SUGGESTION_EXAMPLE,
      isSameAsSuggested: true,
    },
    '200 OK — Chạy lại thuật toán, dùng cho Dialog xác nhận vị trí thực tế (chưa lưu)',
  )
  @ApiAuthReadErrors()
  previewExecute(@Param('id') id: string) {
    return this.service.previewExecute(id);
  }

  @Post(':id/execute')
  @ApiSuccessExample(
    {
      schedule: { id: '...', status: 'COMPLETED' },
      transactions: [{ id: '...', type: 'IMPORT' }],
    },
    '200 OK — Xác nhận thực hiện lịch (cập nhật Inventory, Progress Bar, sinh Transaction)',
  )
  @ApiAuthWriteErrors()
  execute(
    @Param('id') id: string,
    @Body() dto: ExecuteScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.executeSchedule(id, dto, user);
  }

  @Patch(':id/cancel')
  @ApiSuccessExample(
    { id: '...', status: 'CANCELLED' },
    '200 OK — Hủy lịch (chỉ áp dụng cho lịch đang "Chờ thực hiện")',
  )
  @ApiAuthWriteErrors()
  cancel(@Param('id') id: string, @Body() dto: CancelScheduleDto) {
    return this.service.cancelSchedule(id, dto);
  }

  @Patch(':id')
  @ApiSuccessExample(
    { id: '...', status: 'PENDING' },
    '200 OK — Sửa lịch (chỉ áp dụng cho lịch đang "Chờ thực hiện", tự chạy lại Smart Suggestion)',
  )
  @ApiAuthWriteErrors()
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.service.updateSchedule(id, dto);
  }
}
