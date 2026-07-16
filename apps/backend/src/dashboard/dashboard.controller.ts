import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @ApiSuccessExample(SUCCESS_EXAMPLES.dashboard, '200 OK — Tổng quan KPI (chỉ Quản lý)')
  @ApiAuthReadErrors()
  summary() {
    return this.service.getSummary();
  }
}
