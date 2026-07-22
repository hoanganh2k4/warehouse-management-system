import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { MANAGER_ROLE } from '../common/constants/roles.constant';
import {
  ApiAuthReadErrors,
  ApiSuccessExample,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.dashboard,
    '200 OK — Tổng quan KPI (chỉ Quản lý)',
  )
  @ApiAuthReadErrors()
  summary() {
    return this.service.getSummary();
  }

  @Get('expiring-batches')
  @Roles(MANAGER_ROLE)
  @ApiAuthReadErrors()
  expiringBatches() {
    return this.service.getExpiringBatches();
  }

  @Get('chart')
  @Roles(MANAGER_ROLE)
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Số ngày gần nhất muốn xem (mặc định 14, tối đa 90)',
  })
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.dashboardChart,
    '200 OK — Số liệu nhập/xuất theo ngày (chỉ Quản lý)',
  )
  @ApiAuthReadErrors()
  chart(@Query('days') days?: string) {
    return this.service.getChart(days ? Number(days) : undefined);
  }
}
