import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
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
  @ApiSuccessExample(SUCCESS_EXAMPLES.dashboard, '200 OK — Tổng quan KPI')
  @ApiAuthReadErrors()
  summary() {
    return this.service.getSummary();
  }
}
