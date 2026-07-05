import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { BatchQueryDto, CreateBatchDto } from './dto/batch.dto';
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
@ApiTags('Batches')
@Controller('batches')
export class BatchesController {
  constructor(private readonly service: BatchesService) {}

  @Get()
  @ApiSuccessExample(
    {
      success: true,
      data: {
        items: [SUCCESS_EXAMPLES.batch.data],
        meta: { page: 1, limit: 20, total: 8, totalPages: 1 },
      },
    },
    '200 OK — Danh sách batch',
  )
  @ApiAuthReadErrors()
  findAll(@Query() query: BatchQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.batch, '200 OK — Chi tiết batch')
  @ApiAuthReadErrors(ERROR_EXAMPLES.batchNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiCreatedExample(SUCCESS_EXAMPLES.batch, '201 Created — Tạo batch')
  @ApiAuthWriteErrors({
    conflict: { batchCodeExists: ERROR_EXAMPLES.batchCodeExists },
  })
  create(@Body() dto: CreateBatchDto) {
    return this.service.create(dto);
  }
}
