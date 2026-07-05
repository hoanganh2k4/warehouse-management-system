import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report.dto';
import {
  ApiAuthReadErrors,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiBearerAuth()
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('inventory')
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.reportInventory,
    '200 OK — Báo cáo tồn kho',
  )
  @ApiValidationError()
  @ApiAuthReadErrors()
  inventory(@Query() query: ReportQueryDto) {
    return this.service.inventoryReport(query);
  }

  @Get('inbound')
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.reportTransactions,
    '200 OK — Báo cáo nhập kho',
  )
  @ApiValidationError()
  @ApiAuthReadErrors()
  inbound(@Query() query: ReportQueryDto) {
    return this.service.inboundReport(query);
  }

  @Get('outbound')
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.reportTransactions,
    '200 OK — Báo cáo xuất kho',
  )
  @ApiValidationError()
  @ApiAuthReadErrors()
  outbound(@Query() query: ReportQueryDto) {
    return this.service.outboundReport(query);
  }
}
