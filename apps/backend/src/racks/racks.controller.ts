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
import { RacksService } from './racks.service';
import { CreateRackDto, UpdateRackDto } from './dto/rack.dto';
import {
  ApiAuthReadErrors,
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiSuccessExample,
} from '../common/decorators/api-responses.decorator';
import { ERROR_EXAMPLES, SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiBearerAuth()
@ApiTags('Racks')
@Controller('racks')
export class RacksController {
  constructor(private readonly service: RacksService) {}

  @Get()
  @ApiSuccessExample({ success: true, data: [SUCCESS_EXAMPLES.rack.data] }, '200 OK — Danh sách rack')
  @ApiAuthReadErrors()
  findAll(@Query('zoneId') zoneId?: string) {
    return this.service.findAll(zoneId);
  }

  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.rack, '200 OK — Chi tiết rack')
  @ApiAuthReadErrors(ERROR_EXAMPLES.rackNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiCreatedExample(SUCCESS_EXAMPLES.rack, '201 Created — Tạo rack')
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateRackDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.rack, '200 OK — Cập nhật rack')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.rackNotFound })
  update(@Param('id') id: string, @Body() dto: UpdateRackDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.rack, '200 OK — Xóa rack')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.rackNotFound,
    conflict: { hasLevels: ERROR_EXAMPLES.rackHasLevels },
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
