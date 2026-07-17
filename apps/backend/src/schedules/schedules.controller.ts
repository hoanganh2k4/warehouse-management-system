import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  CreateInboundScheduleDto,
  InboundSuggestionPreviewDto,
} from './dto/inbound-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
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
}
