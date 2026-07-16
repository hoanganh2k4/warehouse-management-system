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
import { LevelsService } from './levels.service';
import { CreateLevelDto, UpdateLevelDto } from './dto/level.dto';
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
@ApiTags('Levels')
@Controller('levels')
export class LevelsController {
  constructor(private readonly service: LevelsService) {}

  @Get()
  @ApiSuccessExample(
    { success: true, data: [SUCCESS_EXAMPLES.level.data] },
    '200 OK — Danh sách level',
  )
  @ApiAuthReadErrors()
  findAll(@Query('rackId') rackId?: string) {
    return this.service.findAll(rackId);
  }

  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.level, '200 OK — Chi tiết level')
  @ApiAuthReadErrors(ERROR_EXAMPLES.levelNotFound)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(MANAGER_ROLE)
  @ApiCreatedExample(SUCCESS_EXAMPLES.level, '201 Created — Tạo level')
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateLevelDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(SUCCESS_EXAMPLES.level, '200 OK — Cập nhật level')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.levelNotFound })
  update(@Param('id') id: string, @Body() dto: UpdateLevelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(SUCCESS_EXAMPLES.level, '200 OK — Xóa level')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.levelNotFound,
    conflict: { hasSlots: ERROR_EXAMPLES.levelHasSlots },
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
